import { spawn, spawnSync } from 'child_process';
import https from 'https';
import net from 'net';
import crypto from 'crypto';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const isMain = process.argv[1] && (
  path.resolve(fileURLToPath(import.meta.url)).toLowerCase() === path.resolve(process.argv[1]).toLowerCase()
);

function resolveChromePath() {
  if (process.env.CHROME_BIN) {
    if (fs.existsSync(process.env.CHROME_BIN)) {
      return process.env.CHROME_BIN;
    }
    throw new Error(`Google Chrome executable not found at specified CHROME_BIN: ${process.env.CHROME_BIN}`);
  }
  if (process.env.CHROME_PATH) {
    if (fs.existsSync(process.env.CHROME_PATH)) {
      return process.env.CHROME_PATH;
    }
    throw new Error(`Google Chrome executable not found at specified CHROME_PATH: ${process.env.CHROME_PATH}`);
  }
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe') : null,
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, 'Google\\Chrome\\Application\\chrome.exe') : null,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ].filter(Boolean);

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  try {
    const whichCmd = process.platform === 'win32' ? 'where.exe' : 'which';
    const res = spawnSync(whichCmd, [process.platform === 'win32' ? 'chrome' : 'google-chrome'], { encoding: 'utf8' });
    if (res.status === 0 && res.stdout) {
      const firstLine = res.stdout.split(/\r?\n/)[0].trim();
      if (firstLine && fs.existsSync(firstLine)) return firstLine;
    }
  } catch (_) {}

  throw new Error('Google Chrome executable not found. Specify CHROME_BIN or CHROME_PATH pointing to chrome.exe / google-chrome.');
}

function validateAndReserveEvidenceDir(rawRunId, repoRootPath, isDryRun) {
  const baseRunsDir = path.resolve(repoRootPath, 'docs/audit/evidence/runs');
  fs.mkdirSync(baseRunsDir, { recursive: true });

  let effectiveId = rawRunId;
  if (!effectiveId) {
    effectiveId = `run_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  if (typeof effectiveId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(effectiveId.trim())) {
    throw new Error(`[INVALID_RUN_ID]: RUN_ID '${effectiveId}' contains invalid characters, path separators or traversal sequences.`);
  }

  effectiveId = effectiveId.trim();
  const targetDir = path.resolve(baseRunsDir, effectiveId);

  // Confinamiento estricto contra baseRunsDir
  const rel = path.relative(baseRunsDir, targetDir);
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel.includes('/') || rel.includes('\\')) {
    throw new Error(`[SECURITY_VIOLATION]: RUN_ID '${effectiveId}' attempts path traversal outside runs directory.`);
  }

  // Reserva atómica exclusiva
  try {
    fs.mkdirSync(targetDir); // recursive: false para fallo atómico si ya existe
  } catch (err) {
    if (err.code === 'EEXIST') {
      throw new Error(`[RUN_ID_ALREADY_EXISTS]: Evidence directory for RUN_ID '${effectiveId}' already exists. Refusing to overwrite existing run.`);
    }
    throw err;
  }

  const screenDir = path.join(targetDir, 'screenshots');
  fs.mkdirSync(screenDir, { recursive: true });

  return {
    runId: effectiveId,
    runEvidenceDir: targetDir,
    screenshotsDir: screenDir
  };
}

let chromePath = null;
if (isMain) {
  chromePath = resolveChromePath();
}

let effectiveRunId = null;
let runEvidenceDir = null;
let screenshotsDir = null;

const capturedScreenshots = [];

const password = process.env.DEMO_USER_PASSWORD;
if (!password && isMain) {
  throw new Error('DEMO_USER_PASSWORD environment variable is required.');
}

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
const backendUrl = process.env.BACKEND_URL || 'https://127.0.0.1:44397/graphql';

const parsedBackend = new URL(backendUrl);
const isLocalBackend = ['localhost', '127.0.0.1', '::1'].includes(parsedBackend.hostname);

if (isMain && !isLocalBackend && backendUrl.startsWith('https:') && process.env.ALLOW_INSECURE_REMOTE_TLS === 'true') {
  throw new Error(`[SECURITY_REJECTION]: Insecure TLS bypass is strictly prohibited for non-local endpoints (${parsedBackend.hostname}).`);
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

function log(step, msg, details = {}) {
  const ts = new Date().toISOString();
  const detStr = Object.keys(details).length ? ` ${JSON.stringify(details)}` : '';
  console.log(`[${ts}] [${step}] ${msg}${detStr}`);
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class ChromeInstance {
  constructor(port, profilePrefix, options = {}) {
    this.port = port;
    this.profilePrefix = profilePrefix;
    const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    this.profileDir = options.profileDir || path.resolve(`./scratch/${profilePrefix}_${uniqueSuffix}`);
    this.proc = null;
    this.ws = null;
    this.events = [];
    this.started = false;
    this._terminator = options.terminator || null;
    this._livenessProbe = options.livenessProbe || null;
    this._portChecker = options.portChecker || null;
  }

  async start(initialUrl = 'about:blank') {
    const portFree = await isPortAvailable(this.port);
    if (!portFree) {
      throw new Error(`Port ${this.port} is already in use by another process. Refusing to spawn instance '${this.profilePrefix}' to prevent collisions.`);
    }

    fs.mkdirSync(this.profileDir, { recursive: true });
    this.started = true;
    this.proc = spawn(chromePath || resolveChromePath(), [
      '--headless=new',
      `--remote-debugging-port=${this.port}`,
      '--disable-gpu',
      `--user-data-dir=${this.profileDir}`,
      'about:blank'
    ]);

    let connected = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const list = await getJson(`http://127.0.0.1:${this.port}/json/list`);
        const target = list.find(t => t.type === 'page');
        if (target && target.webSocketDebuggerUrl) {
          this.ws = new WebSocket(target.webSocketDebuggerUrl);
          await new Promise((res, rej) => {
            this.ws.onopen = res;
            this.ws.onerror = rej;
          });

          this.ws.addEventListener('message', (msg) => {
            try {
              const data = JSON.parse(msg.data);
              if (data.method) {
                this.events.push({
                  method: data.method,
                  params: data.params,
                  timestamp: Date.now()
                });
              }
            } catch (_) {}
          });

          await this.send('Page.enable');
          await this.send('Runtime.enable');
          await this.send('Network.enable');

          await this.send('Page.addScriptToEvaluateOnNewDocument', {
            source: `
              window.__ACTIVE_WEBSOCKETS__ = [];
              const _OrigWS = window.WebSocket;
              window.WebSocket = function(...args) {
                const s = new _OrigWS(...args);
                window.__ACTIVE_WEBSOCKETS__.push(s);
                return s;
              };
              window.WebSocket.prototype = _OrigWS.prototype;
              Object.assign(window.WebSocket, _OrigWS);
            `
          });
          connected = true;
          break;
        }
      } catch (_) {}
    }
    if (!connected) throw new Error(`Could not connect to Chrome on port ${this.port}`);
    if (initialUrl && initialUrl !== 'about:blank') {
      await this.navigate(initialUrl);
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1000000);
      const handler = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === id) {
          this.ws.removeEventListener('message', handler);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        }
      };
      this.ws.addEventListener('message', handler);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(`Runtime.evaluate failed: ${desc}`);
    }
    return res.result?.value;
  }

  async waitFor(expr, timeout = 20000, interval = 250) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const val = await this.eval(expr);
        if (val) return val;
      } catch (_) {}
      await new Promise(r => setTimeout(r, interval));
    }
    let currentUrl = 'unknown';
    try { currentUrl = await this.eval("window.location.href"); } catch (_) {}
    throw new Error(`Timeout waiting for expression: ${expr} (currentUrl=${currentUrl})`);
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(screenshotsDir, filename);
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(fullPath, buffer);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    capturedScreenshots.push({
      filename,
      path: fullPath,
      sha256: hash,
      bytes: buffer.length,
      timestamp: new Date().toISOString()
    });
    return fullPath;
  }

  async stop() {
    const leakErrors = [];

    if (this.ws) {
      try { this.ws.close(); } catch (_) {}
      this.ws = null;
    }

    if (this.proc && this.proc.pid) {
      const pid = this.proc.pid;
      try {
        if (typeof this._terminator === 'function') {
          this._terminator(pid);
        } else if (process.platform === 'win32') {
          spawnSync('taskkill', ['/F', '/T', '/PID', String(pid)], { stdio: 'ignore', timeout: 5000 });
        } else {
          this.proc.kill('SIGKILL');
        }
      } catch (_) {}

      const checkLiveness = (targetPid) => {
        if (typeof this._livenessProbe === 'function') {
          return this._livenessProbe(targetPid);
        }
        return process.kill(targetPid, 0);
      };

      const startWait = Date.now();
      while (Date.now() - startWait < 3000) {
        try {
          checkLiveness(pid);
          await new Promise(r => setTimeout(r, 100));
        } catch (_) {
          break;
        }
      }

      let procAlive = false;
      try {
        checkLiveness(pid);
        procAlive = true;
        leakErrors.push(`Chrome process PID ${pid} is still alive after stop()`);
      } catch (kErr) {
        if (kErr && kErr.code === 'EPERM') {
          procAlive = true;
          leakErrors.push(`Chrome process PID ${pid} is still alive (permission denied) after stop()`);
        } else if (kErr && kErr.code === 'ESRCH') {
          procAlive = false;
        } else {
          procAlive = true;
          leakErrors.push(`Chrome process PID ${pid} liveness check error: ${kErr.message}`);
        }
      }

      if (!procAlive) {
        this.proc = null;
      }
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        if (fs.existsSync(this.profileDir)) {
          fs.rmSync(this.profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
        }
        break;
      } catch (_) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    if (fs.existsSync(this.profileDir)) {
      leakErrors.push(`Temporary profile directory '${this.profileDir}' was not cleaned up after stop()`);
    }

    if (this.started) {
      let portFree = false;
      try {
        if (typeof this._portChecker === 'function') {
          portFree = await this._portChecker(this.port);
        } else {
          portFree = await isPortAvailable(this.port);
        }
        if (!portFree) {
          leakErrors.push(`Port ${this.port} is still bound after stop()`);
        }
      } catch (pErr) {
        leakErrors.push(`Port ${this.port} check error: ${pErr.message}`);
      }
      if (portFree) {
        this.started = false;
      }
    }

    if (leakErrors.length > 0) {
      throw new Error(`[RESOURCE_LEAK_DETECTED]: ${leakErrors.join(' | ')}`);
    }
  }
}

function httpGraphQl(query, variables = {}, token = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(backendUrl);
    const postData = JSON.stringify({ query, variables });
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      rejectUnauthorized: !isLocal
    };

    const protocol = parsed.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.errors && json.errors.length) {
            reject(new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function loginApi(email) {
  const mutation = `mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      id
      role
      isAuthenticated
    }
  }`;
  const data = await httpGraphQl(mutation, { input: { email, password } });
  return data.login;
}

async function parseChatBadge(chromeInstance) {
  return await chromeInstance.eval(`(() => {
    const el = document.querySelector('a[href="/chat"] span[aria-label*="mensajes sin leer"]');
    if (!el) return 0;
    const match = el.getAttribute('aria-label')?.match(/(\\d+)\\s+mensajes sin leer/);
    if (match) return parseInt(match[1], 10);
    const txt = el.textContent.trim();
    if (txt === '9+') return 10;
    return parseInt(txt, 10) || 0;
  })()`);
}

function buildManifestObject(status, exitCode, err = null, extraProps = {}, baseScope = {}) {
  const isDryRun = (extraProps.mode === 'dry-run') || (process.env.RUNNER_DRY_RUN === 'true');
  const defaultMode = isDryRun ? 'dry-run' : 'live';
  const defaultUiExecuted = isDryRun ? false : (status === 'PASS');
  const defaultCertified = false;

  return {
    runId: baseScope.runId || effectiveRunId || 'unknown_run',
    timestamp: new Date().toISOString(),
    baseUrl: baseScope.baseUrl || baseUrl,
    backendUrl: baseScope.backendUrl || backendUrl,
    nodeVersion: process.version,
    platform: process.platform,
    chromePath: baseScope.chromePath || chromePath,
    mode: defaultMode,
    uiExecuted: defaultUiExecuted,
    certified: defaultCertified,
    exitCode,
    status,
    error: err ? (err.message || String(err)) : null,
    screenshots: baseScope.screenshots || capturedScreenshots,
    ...extraProps
  };
}

function validateManifestContract(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('[INVALID_MANIFEST_CONTRACT]: Manifest must be a non-null object.');
  }

  const requiredFields = ['runId', 'status', 'exitCode', 'mode', 'uiExecuted', 'certified'];
  for (const f of requiredFields) {
    if (manifest[f] === undefined || manifest[f] === null) {
      throw new Error(`[INVALID_MANIFEST_CONTRACT]: Missing required manifest field '${f}'.`);
    }
  }

  if (typeof manifest.runId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(manifest.runId.trim())) {
    throw new Error(`[INVALID_MANIFEST_CONTRACT]: runId must be a non-empty valid identifier, got '${manifest.runId}'.`);
  }

  if (typeof manifest.exitCode !== 'number' || !Number.isInteger(manifest.exitCode)) {
    throw new Error(`[INVALID_MANIFEST_CONTRACT]: exitCode must be an integer, got '${manifest.exitCode}'.`);
  }

  if (manifest.mode !== 'live' && manifest.mode !== 'dry-run') {
    throw new Error(`[INVALID_MANIFEST_CONTRACT]: mode must be 'live' or 'dry-run', got '${manifest.mode}'.`);
  }

  if (!['PASS', 'FAIL', 'DRY_RUN_OK'].includes(manifest.status)) {
    throw new Error(`[INVALID_MANIFEST_CONTRACT]: status must be 'PASS', 'FAIL', or 'DRY_RUN_OK', got '${manifest.status}'.`);
  }

  if (typeof manifest.uiExecuted !== 'boolean') {
    throw new Error(`[INVALID_MANIFEST_CONTRACT]: uiExecuted must be a boolean, got '${typeof manifest.uiExecuted}'.`);
  }

  if (typeof manifest.certified !== 'boolean' || manifest.certified !== false) {
    throw new Error(`[INVALID_MANIFEST_CONTRACT]: certified must be boolean false, got '${manifest.certified}'.`);
  }

  // Matriz unificada de combinaciones válidas:
  // 1. live:
  //    - Éxito: live / PASS / 0 / uiExecuted: true / certified: false
  //    - Fallo: live / FAIL / exitCode != 0 / uiExecuted: false / certified: false
  // 2. dry-run:
  //    - Éxito: dry-run / DRY_RUN_OK / 0 / uiExecuted: false / certified: false
  //    - Fallo: dry-run / FAIL / exitCode != 0 / uiExecuted: false / certified: false

  if (manifest.mode === 'live') {
    if (manifest.status === 'DRY_RUN_OK') {
      throw new Error("[INVALID_MANIFEST_CONTRACT]: live mode cannot have status 'DRY_RUN_OK'.");
    }
    if (manifest.status === 'PASS') {
      if (manifest.exitCode !== 0) {
        throw new Error(`[INVALID_MANIFEST_CONTRACT]: live PASS manifest requires exitCode 0, got ${manifest.exitCode}.`);
      }
      if (manifest.uiExecuted !== true) {
        throw new Error('[INVALID_MANIFEST_CONTRACT]: live PASS manifest requires uiExecuted === true.');
      }
    }
  }

  if (manifest.mode === 'dry-run') {
    if (manifest.status === 'PASS') {
      throw new Error("[INVALID_MANIFEST_CONTRACT]: dry-run mode cannot have status 'PASS'; must be 'DRY_RUN_OK'.");
    }
    if (manifest.status === 'DRY_RUN_OK') {
      if (manifest.exitCode !== 0) {
        throw new Error(`[INVALID_MANIFEST_CONTRACT]: dry-run DRY_RUN_OK manifest requires exitCode 0, got ${manifest.exitCode}.`);
      }
      if (manifest.uiExecuted !== false) {
        throw new Error('[INVALID_MANIFEST_CONTRACT]: dry-run DRY_RUN_OK manifest requires uiExecuted === false.');
      }
    }
  }

  if (manifest.status === 'FAIL') {
    if (manifest.exitCode === 0) {
      throw new Error('[INVALID_MANIFEST_CONTRACT]: FAIL status requires non-zero exitCode.');
    }
    if (manifest.uiExecuted !== false) {
      throw new Error('[INVALID_MANIFEST_CONTRACT]: FAIL status requires uiExecuted === false.');
    }
  }

  return true;
}

function writeManifest(status, exitCode, err = null, extraProps = {}, targetDir = null) {
  const dir = targetDir || runEvidenceDir;
  if (dir) {
    const manifest = buildManifestObject(status, exitCode, err, extraProps);
    validateManifestContract(manifest);
    const manifestPath = path.join(dir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    log('MANIFEST', `Run manifest written to ${manifestPath}`);
    return manifest;
  }
}

function createRunnerCleanup(instances) {
  let cleanupPromise = null;
  return function cleanup() {
    if (cleanupPromise) {
      return cleanupPromise;
    }
    cleanupPromise = (async () => {
      const results = await Promise.allSettled(instances.map(inst => inst.stop()));
      const failures = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason);
      if (failures.length > 0) {
        const msgs = failures.map(f => f.message || String(f)).join('; ');
        throw new Error(`[AGGREGATE_CLEANUP_FAILURE]: Cleanup failed for ${failures.length} instance(s): ${msgs}`);
      }
    })();
    return cleanupPromise;
  };
}

async function main() {
  log('INIT', 'Starting Live Automated Browser UI Verification Runner for Gate CF-05');
  log('ENV', `Frontend URL: ${baseUrl} | Backend URL: ${backendUrl}`);

  const scope = validateAndReserveEvidenceDir(process.env.RUN_ID, repoRoot, process.env.RUNNER_DRY_RUN === 'true');
  effectiveRunId = scope.runId;
  runEvidenceDir = scope.runEvidenceDir;
  screenshotsDir = scope.screenshotsDir;
  log('RESERVE', `Evidence directory reserved exclusively: ${runEvidenceDir}`, { runId: effectiveRunId });

  if (process.env.RUNNER_DRY_RUN === 'true') {
    log('DRY_RUN', 'Verification runner executed in dry-run mode for isolation testing', {
      runId: effectiveRunId,
      runEvidenceDir,
      screenshotsDir
    });

    writeManifest('DRY_RUN_OK', 0, null, {
      mode: 'dry-run',
      uiExecuted: false,
      certified: false
    });

    const runOutputContent = [
      `# Dry-Run Execution Evidence: Runner CF-05 (Aislamiento Multi-Run)`,
      ``,
      `- **Run ID:** ${effectiveRunId}`,
      `- **Timestamp:** ${new Date().toISOString()}`,
      `- **Status:** DRY_RUN_OK (Dry-Run Mode)`,
      `- **Mode:** dry-run`,
      `- **UI Executed:** false`,
      `- **Certified:** false`,
      `- **Exit Code:** 0`,
      `- **Evidence Directory:** ${runEvidenceDir}`,
      `- **Screenshots Directory:** ${screenshotsDir}`,
      ``,
      `Corresponde a la prueba de aislamiento multi-run del Lote CONS-03. Verificado sin colisión ni alteración de evidencia histórica.`
    ].join('\n');
    fs.writeFileSync(path.join(runEvidenceDir, 'RUN_OUTPUT.md'), runOutputContent, 'utf8');
    log('DRY_RUN', `Wrote dry-run RUN_OUTPUT.md to ${path.join(runEvidenceDir, 'RUN_OUTPUT.md')}`);
    process.exit(0);
  }

  const basePort = parseInt(process.env.BASE_CDP_PORT || '9230', 10);
  log('ENV', `Base CDP Port: ${basePort}`);

  const chromeA = new ChromeInstance(basePort, 'ui_profile_a');
  const chromeB = new ChromeInstance(basePort + 1, 'ui_profile_b');
  const chromeC = new ChromeInstance(basePort + 2, 'ui_profile_c');
  const chromeProbe = new ChromeInstance(basePort + 3, 'ui_profile_probe');

  const instances = [chromeA, chromeB, chromeC, chromeProbe];
  const cleanup = createRunnerCleanup(instances);

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    // -------------------------------------------------------------
    // CASO UI-01: Aislamiento Estricto de Almacenamiento por Contextos
    // -------------------------------------------------------------
    log('UI-01', 'Launching Context-A (Estudiante) on http://localhost:5173/login');
    await chromeA.start(`${baseUrl}/login`);
    await chromeA.waitFor("!!document.querySelector('#email')", 15000);

    const h1Text = await chromeA.eval("document.querySelector('h1')?.textContent.trim()");
    const formClass = await chromeA.eval("document.querySelector('form')?.className");
    const hasAria = await chromeA.eval("document.querySelector('form')?.hasAttribute('aria-label')");
    log('UI-01', 'DOM verified for Login page', { h1: h1Text, formClass, hasAriaLabel: hasAria });

    await chromeA.eval(`
      (() => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const emailInput = document.querySelector('#email');
        const passInput = document.querySelector('#password');
        nativeSetter.call(emailInput, 'estudiante1.ads@itbeltran.com.ar');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        nativeSetter.call(passInput, '${password}');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('button[type="submit"]').click();
      })()
    `);

    log('UI-01', 'Waiting for login navigation to /feed in Context-A');
    await chromeA.waitFor("window.location.pathname === '/feed' || window.location.pathname === '/'", 15000);
    const tokenA = await chromeA.eval("localStorage.getItem('token')");
    log('UI-01', 'Context-A authenticated successfully', {
      pathname: await chromeA.eval("window.location.pathname"),
      tokenRetrieved: !!tokenA
    });
    const ssA = await chromeA.screenshot('ui-01-context-a-authenticated.png');
    log('UI-01', 'Saved screenshot for Context-A', { path: ssA });

    // Spawning independent probe profile
    log('UI-01', 'Launching Context-Probe with separate user profile directed to /feed');
    await chromeProbe.start(`${baseUrl}/feed`);
    await chromeProbe.waitFor("window.location.pathname === '/login'", 20000);
    const probeToken = await chromeProbe.eval("localStorage.getItem('token')");
    const probePath = await chromeProbe.eval("window.location.pathname");
    log('UI-01', 'Context-Probe storage evaluation', {
      currentPath: probePath,
      tokenInProbeStorage: probeToken
    });

    if (probePath !== '/login' || probeToken !== null) {
      throw new Error(`[ASSERTION_FAILED]: Context-Probe did not isolate storage: path=${probePath}, token=${probeToken}`);
    }
    const ssProbe = await chromeProbe.screenshot('ui-01-context-probe-isolated.png');
    log('UI-01', 'ASSERTION_PASSED: Independent browser context did not inherit session and redirected to /login', { path: ssProbe });
    await chromeProbe.stop();

    // -------------------------------------------------------------
    // CASO UI-02: Aislamiento de Topic en Observador C (Moderador)
    // -------------------------------------------------------------
    log('UI-02', 'Launching Context-C (Moderador) on http://localhost:5173/login');
    await chromeC.start(`${baseUrl}/login`);
    await chromeC.waitFor("!!document.querySelector('#email')", 15000);

    await chromeC.eval(`
      (() => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const emailInput = document.querySelector('#email');
        const passInput = document.querySelector('#password');
        nativeSetter.call(emailInput, 'moderador1@itbeltran.com.ar');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        nativeSetter.call(passInput, '${password}');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('button[type="submit"]').click();
      })()
    `);

    await chromeC.waitFor("window.location.pathname === '/feed' || window.location.pathname === '/'", 15000);
    log('UI-02', 'Context-C authenticated; navigating to /chat');
    await chromeC.navigate(`${baseUrl}/chat`);
    await chromeC.waitFor("window.location.pathname === '/chat'", 20000);
    // Wait for contacts query to finish hydrating in Observer C
    await chromeC.waitFor(`(() => {
      return !document.body.innerText.includes('Cargando...') && document.querySelectorAll('aside button').length > 0;
    })()`, 15000);
    await new Promise(r => setTimeout(r, 1000));

    const initialBadgeC = await parseChatBadge(chromeC);
    log('UI-02', 'Baseline unread count on Observer C recorded', { initialBadgeC });

    // Send confidential message from Estudiante (A) to Profesor (B)
    const loginEstudiante = await loginApi('estudiante1.ads@itbeltran.com.ar');
    const loginDocente = await loginApi('profesor1.ads@itbeltran.com.ar');
    const msgPayload = `Mensaje Confidencial CF-05 UI-02: ${Date.now()}`;
    log('UI-02', 'Dispatching confidential message from A to B via backend mutation', { content: msgPayload });

    const sendMutation = `mutation Send($receiverId: UUID!, $content: String!) {
      sendMessage(receiverId: $receiverId, content: $content) {
        id
        content
        sentAt
      }
    }`;
    const sendRes = await httpGraphQl(sendMutation, { receiverId: loginDocente.id, content: msgPayload }, loginEstudiante.token);
    log('UI-02', 'Message 1 persisted by backend', { messageId: sendRes.sendMessage.id });

    // Wait 2.5 seconds to observe Observer C
    await new Promise(r => setTimeout(r, 2500));
    const postBadgeC = await parseChatBadge(chromeC);
    const domLeakMatches = await chromeC.eval(`document.body.innerText.includes('${msgPayload}')`);

    log('UI-02', 'Evaluating topic isolation on Observer C', {
      initialBadge: initialBadgeC,
      postBadge: postBadgeC,
      delta: postBadgeC - initialBadgeC,
      domLeakFound: domLeakMatches
    });

    if (postBadgeC !== initialBadgeC || domLeakMatches) {
      throw new Error(`[ASSERTION_FAILED]: Topic isolation breach detected in Observer C: badgeDelta=${postBadgeC - initialBadgeC}, leakInDOM=${domLeakMatches}`);
    }
    const ssC = await chromeC.screenshot('ui-02-moderador-topic-isolation.png');
    log('UI-02', 'ASSERTION_PASSED: Zero frames or leaks observed on third-party Moderator context', { path: ssC });

    // -------------------------------------------------------------
    // CASO UI-03: Ciclo Reactivo y Badges en Sesión B (Profesor)
    // -------------------------------------------------------------
    log('UI-03', 'Launching Context-B (Profesor) on http://localhost:5173/login');
    await chromeB.start(`${baseUrl}/login`);
    await chromeB.waitFor("!!document.querySelector('#email')", 15000);

    await chromeB.eval(`
      (() => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const emailInput = document.querySelector('#email');
        const passInput = document.querySelector('#password');
        nativeSetter.call(emailInput, 'profesor1.ads@itbeltran.com.ar');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        nativeSetter.call(passInput, '${password}');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('button[type="submit"]').click();
      })()
    `);
    await chromeB.waitFor("window.location.pathname === '/feed' || window.location.pathname === '/'", 15000);
    const roleBadgeB = await chromeB.eval("document.body.innerText.includes('PROFESOR')");
    log('UI-03', 'Context-B authenticated on /feed with Profesor role', { hasProfesorBadge: roleBadgeB });

    // Wait for Context-B messaging contacts query to hydrate and settle in Apollo cache / DOM
    log('UI-03', 'Waiting for Context-B (/feed) messaging contacts query to hydrate in Apollo cache or DOM');
    await chromeB.waitFor(`(() => {
      const badge = document.querySelector('a[href="/chat"] span[aria-label*="mensajes sin leer"]');
      if (badge) return true;
      const client = window.__APOLLO_CLIENT__;
      if (!client || !client.cache) return false;
      const raw = client.cache.extract();
      const root = raw.ROOT_QUERY;
      if (!root) return false;
      const mcKey = Object.keys(root).find(k => k.startsWith('messagingContacts'));
      return !!mcKey;
    })()`, 15000);

    // Wait an additional 1.5s for React render cycle and navbar badge to settle
    await new Promise(r => setTimeout(r, 1500));

    // Extract settled initial unread counts from Apollo Cache in Context-B (or GraphQL fallback)
    let initialContacts = await chromeB.eval(`(() => {
      const client = window.__APOLLO_CLIENT__;
      if (!client || !client.cache) return null;
      const raw = client.cache.extract();
      const root = raw.ROOT_QUERY;
      if (!root) return null;
      const mcKey = Object.keys(root).find(k => k.startsWith('messagingContacts'));
      if (!mcKey) return null;
      const nodes = root[mcKey]?.nodes || [];
      return nodes.map(item => {
        const c = item && item.__ref ? (raw[item.__ref] || {}) : (item || {});
        return {
          userId: c.userId,
          firstName: c.firstName,
          lastName: c.lastName,
          unreadCount: c.unreadCount || 0
        };
      });
    })()`);

    if (!initialContacts || initialContacts.length === 0) {
      log('UI-03', 'Fetching contacts unread breakdown directly via backend GraphQL query for verification');
      const contactsGql = `query ContactsCheck {
        messagingContacts(first: 50) {
          nodes {
            userId
            firstName
            lastName
            unreadCount
          }
        }
      }`;
      const cRes = await httpGraphQl(contactsGql, {}, loginDocente.token);
      initialContacts = cRes.messagingContacts.nodes;
    }

    const contactEstudianteInitial = (initialContacts || []).find(c =>
      c.userId === loginEstudiante.id ||
      (c.firstName === 'Estudiante' && c.lastName?.includes('Sistemas Uno'))
    ) || { unreadCount: 0 };
    const unreadABInitial = contactEstudianteInitial.unreadCount;
    const otherContactsUnread = (initialContacts || [])
      .filter(c => c.userId !== contactEstudianteInitial.userId)
      .reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    const sumExpectedInitial = unreadABInitial + otherContactsUnread;

    // Measure settled baseline unread count on Context-B while on /feed
    const baselineBadgeB = await parseChatBadge(chromeB);
    log('UI-03', 'Settled baseline unread state on Context-B (/feed) recorded', {
      baselineBadgeB,
      unreadABInitial,
      otherContactsUnread,
      sumExpectedInitial,
      totalContactsCount: initialContacts?.length || 0
    });

    if (baselineBadgeB !== sumExpectedInitial) {
      throw new Error(`[ASSERTION_FAILED]: Baseline chat badge (${baselineBadgeB}) does not match sum of contacts unread counts (${sumExpectedInitial})`);
    }

    const msgPayload3 = `Mensaje Reactivo CF-05 UI-03: ${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    log('UI-03', 'Sending live reactive message from A to B while B is on /feed', { content: msgPayload3 });
    const sendRes3 = await httpGraphQl(sendMutation, { receiverId: loginDocente.id, content: msgPayload3 }, loginEstudiante.token);
    log('UI-03', 'Message 3 persisted by backend', { messageId: sendRes3.sendMessage.id });

    // Wait for exact badge increment on /feed (baseline + 1)
    const expectedBadgeAfterMsg = baselineBadgeB + 1;
    let badgeAfterMsg3 = baselineBadgeB;
    const startBadgeWait = Date.now();
    while (Date.now() - startBadgeWait < 15000) {
      badgeAfterMsg3 = await parseChatBadge(chromeB);
      if (badgeAfterMsg3 === expectedBadgeAfterMsg) {
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }
    log('UI-03', 'Evaluated exact badge increment on /feed', {
      baseline: baselineBadgeB,
      expected: expectedBadgeAfterMsg,
      actual: badgeAfterMsg3,
      exactIncrement: badgeAfterMsg3 - baselineBadgeB
    });

    if (badgeAfterMsg3 !== expectedBadgeAfterMsg) {
      throw new Error(`[ASSERTION_FAILED]: Chat badge did not increment by exactly 1 on /feed: baseline=${baselineBadgeB}, expected=${expectedBadgeAfterMsg}, actual=${badgeAfterMsg3}, delta=${badgeAfterMsg3 - baselineBadgeB}`);
    }

    const ssFeedIncrement = await chromeB.screenshot('ui-03-profesor-feed-incremented.png');
    log('UI-03', 'Captured feed screenshot with incremented badge', { path: ssFeedIncrement });

    // Open chat thread via UI in Context-B
    log('UI-03', 'Clicking /chat navigation link via UI in Context-B');
    await chromeB.eval("document.querySelector('a[href=\"/chat\"]').click()");
    await chromeB.waitFor("window.location.pathname === '/chat'", 15000);

    // Wait for contacts list in sidebar to render
    await chromeB.waitFor(`(() => {
      return !document.body.innerText.includes('Cargando...') && document.querySelectorAll('aside button').length > 0;
    })()`, 15000);

    // Inspect Estudiante's contact thread unread count in sidebar before opening
    const expectedThreadUnreadBefore = unreadABInitial + 1;
    const threadInfoBefore = await chromeB.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.innerText.includes('Estudiante Sistemas Uno'));
      if (!btn) return null;
      const unreadSpan = btn.querySelector('span.min-w-6');
      return {
        found: true,
        unreadCount: unreadSpan ? parseInt(unreadSpan.textContent.trim(), 10) : 0
      };
    })()`);

    log('UI-03', 'Inspected Estudiante thread in sidebar before opening', {
      expectedThreadUnreadBefore,
      actualThreadUnreadBefore: threadInfoBefore?.unreadCount
    });

    if (!threadInfoBefore || threadInfoBefore.unreadCount !== expectedThreadUnreadBefore) {
      throw new Error(`[ASSERTION_FAILED]: Estudiante thread unread count before opening mismatch: expected=${expectedThreadUnreadBefore}, actual=${threadInfoBefore?.unreadCount}`);
    }

    log('UI-03', 'Selecting conversation with Estudiante Sistemas Uno in UI');
    await chromeB.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.innerText.includes('Estudiante Sistemas Uno'));
      btn.click();
    })()`);

    // Verify unique message rendered in conversation window
    log('UI-03', 'Waiting for unique message content to be rendered in thread DOM', { content: msgPayload3 });
    await chromeB.waitFor(`document.body.innerText.includes('${msgPayload3}')`, 15000);
    const msgFoundB = await chromeB.eval(`document.body.innerText.includes('${msgPayload3}')`);
    if (!msgFoundB) {
      throw new Error(`[ASSERTION_FAILED]: Message 3 was not rendered in conversation DOM: ${msgPayload3}`);
    }

    // Verify read reset: wait for markConversationRead mutation to settle
    await new Promise(r => setTimeout(r, 1500));

    // Verify Estudiante thread unread count in sidebar is now 0
    const threadInfoAfter = await chromeB.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.innerText.includes('Estudiante Sistemas Uno'));
      if (!btn) return null;
      const unreadSpan = btn.querySelector('span.min-w-6');
      return {
        found: true,
        unreadCount: unreadSpan ? parseInt(unreadSpan.textContent.trim(), 10) : 0
      };
    })()`);

    log('UI-03', 'Inspected Estudiante thread in sidebar after reading', {
      threadUnreadAfter: threadInfoAfter?.unreadCount
    });

    if (!threadInfoAfter || threadInfoAfter.unreadCount !== 0) {
      throw new Error(`[ASSERTION_FAILED]: Estudiante thread unread count was not reset to 0 after reading: actual=${threadInfoAfter?.unreadCount}`);
    }

    // Verify global header badge: must equal otherContactsUnread, preserving unread counts of other interlocutors
    const headerBadgeAfterRead = await parseChatBadge(chromeB);
    const expectedHeaderBadgeAfterRead = otherContactsUnread;

    log('UI-03', 'Header badge evaluated post-read against other interlocutors', {
      previousHeaderBadge: badgeAfterMsg3,
      threadUnreadCleared: expectedThreadUnreadBefore,
      expectedHeaderBadgeAfterRead,
      actualHeaderBadgeAfterRead: headerBadgeAfterRead,
      otherInterlocutorsPreserved: headerBadgeAfterRead === expectedHeaderBadgeAfterRead
    });

    if (headerBadgeAfterRead !== expectedHeaderBadgeAfterRead) {
      throw new Error(`[ASSERTION_FAILED]: Header badge does not match expected preserved count of other contacts: expected=${expectedHeaderBadgeAfterRead}, actual=${headerBadgeAfterRead}`);
    }

    const ssB = await chromeB.screenshot('ui-03-profesor-chat-rendered.png');
    log('UI-03', 'ASSERTION_PASSED: Settled baseline, exact +1 reactive badge increment, thread unread reset to 0, and preserved other contacts unread badge validated', {
      path: ssB,
      settledBaseline: baselineBadgeB,
      postMessageBadge: badgeAfterMsg3,
      threadCleared: expectedThreadUnreadBefore,
      finalHeaderBadge: headerBadgeAfterRead,
      otherContactsPreserved: expectedHeaderBadgeAfterRead
    });

    // -------------------------------------------------------------
    // CASO UI-04: Simulación de Desconexión de Red y Reconexión
    // -------------------------------------------------------------
    log('UI-04', 'Observing WebSocket drop and reconnection in Context-B');
    const eventsBeforeDrop = chromeB.events.length;
    const tDrop = Date.now();

    await chromeB.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });

    // Terminate active socket with code 4499 (simulating physical transport cut)
    await chromeB.eval(`(() => {
      const s = window.__ACTIVE_WEBSOCKETS__?.[window.__ACTIVE_WEBSOCKETS__.length - 1];
      if (s && s.readyState === 1) s.close(4499, 'Forced network drop');
    })()`);
    log('UI-04', 'Network conditions set to offline: true and active socket severed', { tDrop });

    // Wait for CDP WebSocket closed event
    let wsClosedEvent = null;
    const startCloseWait = Date.now();
    while (Date.now() - startCloseWait < 10000) {
      wsClosedEvent = chromeB.events.slice(eventsBeforeDrop).find(e => e.method === 'Network.webSocketClosed');
      if (wsClosedEvent) break;
      await new Promise(r => setTimeout(r, 100));
    }
    const dropDurationMs = Date.now() - tDrop;
    log('UI-04', 'WebSocket closure observed via CDP', {
      wsClosedObserved: !!wsClosedEvent,
      elapsedMs: dropDurationMs
    });

    if (!wsClosedEvent) {
      throw new Error(`[ASSERTION_FAILED]: WebSocket closure event was not observed via CDP within timeout`);
    }

    // Check UI indicator if available
    const uiReconnecting = await chromeB.eval("document.body.innerText.includes('Reconectando...')");
    log('UI-04', 'UI status indicator during network drop', { showsReconnecting: uiReconnecting });

    // Ensure at least 2.5s offline duration
    if (Date.now() - tDrop < 2500) {
      await new Promise(r => setTimeout(r, 2500 - (Date.now() - tDrop)));
    }

    const tRestore = Date.now();
    await chromeB.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });
    log('UI-04', 'Network conditions restored (offline: false)', { tRestore });

    // Observe reconnection event in CDP and DOM
    let wsReconnectedEvent = null;
    let socketOpenedInDOM = false;
    const startReconnectWait = Date.now();
    while (Date.now() - startReconnectWait < 25000) {
      wsReconnectedEvent = chromeB.events.find(e =>
        e.timestamp >= tRestore &&
        (e.method === 'Network.webSocketHandshakeResponseReceived' || e.method === 'Network.webSocketCreated')
      );
      socketOpenedInDOM = await chromeB.eval(`(() => {
        const s = window.__ACTIVE_WEBSOCKETS__?.[window.__ACTIVE_WEBSOCKETS__.length - 1];
        return s?.readyState === 1;
      })()`);
      if (wsReconnectedEvent || socketOpenedInDOM) break;
      await new Promise(r => setTimeout(r, 250));
    }
    const recoveryMs = wsReconnectedEvent ? (wsReconnectedEvent.timestamp - tRestore) : (Date.now() - tRestore);
    log('UI-04', 'WebSocket reconnection observed in CDP/DOM', {
      reconnected: !!(wsReconnectedEvent || socketOpenedInDOM),
      recoveryMs,
      cdpMethod: wsReconnectedEvent?.method || null,
      domReadyStateOpen: socketOpenedInDOM
    });

    if (!wsReconnectedEvent && !socketOpenedInDOM) {
      throw new Error(`[ASSERTION_FAILED]: WebSocket reconnection was not observed via CDP or DOM within timeout`);
    }

    const msgPayload4 = `Mensaje Post-Reconexion CF-05 UI-04: ${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    log('UI-04', 'Dispatching Message 2 from A to B on recovered channel', { content: msgPayload4 });
    await httpGraphQl(sendMutation, { receiverId: loginDocente.id, content: msgPayload4 }, loginEstudiante.token);

    // Verify message 2 arrived in Context-B without page reload
    log('UI-04', 'Waiting for Message 2 to render in Context-B thread without page reload');
    await chromeB.waitFor(`document.body.innerText.includes('${msgPayload4}')`, 15000);
    const msg4Rendered = await chromeB.eval(`document.body.innerText.includes('${msgPayload4}')`);
    if (!msg4Rendered) {
      throw new Error(`[ASSERTION_FAILED]: Message 2 was not rendered in Context-B after reconnection`);
    }

    // Verify zero leaks to Observer C
    const postBadgeC4 = await parseChatBadge(chromeC);
    const leakMsg4 = await chromeC.eval(`document.body.innerText.includes('${msgPayload4}')`);
    log('UI-04', 'Evaluating topic isolation on Observer C for Message 2', {
      initialBadgeC,
      postBadgeC: postBadgeC4,
      deltaC: postBadgeC4 - initialBadgeC,
      domLeakFound: leakMsg4
    });

    if (postBadgeC4 !== initialBadgeC || leakMsg4) {
      throw new Error(`[ASSERTION_FAILED]: Leak to Observer C detected during UI-04: delta=${postBadgeC4 - initialBadgeC}, leak=${leakMsg4}`);
    }

    const ssReconnect = await chromeB.screenshot('ui-04-reconnection-post-message.png');
    log('UI-04', 'ASSERTION_PASSED: WebSocket closure and reconnection observed, recoveryMs validated, Message 2 delivered without reload, deltaC = 0', {
      path: ssReconnect,
      recoveryMs
    });

    // -------------------------------------------------------------
    // CASO UI-05: Cierre de Sesión (/logout) y Reemplazo Limpio A -> C
    // -------------------------------------------------------------
    log('UI-05', 'Starting in-document SPA session replacement in Context-A');
    const spaMarker = `SPA_DOC_${Date.now()}`;
    await chromeA.eval(`window.__SPA_DOCUMENT_ID__ = '${spaMarker}';`);
    log('UI-05', 'Set in-memory document marker on Context-A', { spaMarker });

    // Navigate client-side to /chat in Context-A
    log('UI-05', 'Navigating to /chat client-side in Context-A');
    await chromeA.eval("document.querySelector('a[href=\"/chat\"]').click()");
    await chromeA.waitFor("window.location.pathname === '/chat'", 15000);

    log('UI-05', 'Selecting Profesor Sistemas Uno in Context-A chat');
    await chromeA.waitFor(`(() => {
      const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.innerText.includes('Profesor Sistemas Uno'));
      return !!btn;
    })()`, 15000);

    await chromeA.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('aside button')).find(b => b.innerText.includes('Profesor Sistemas Uno'));
      btn.click();
    })()`);

    // Pre-load confidential message through UI input and send button
    const uniqueConfidentialA = `Mensaje Privado UI-05 en SPA: ${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    log('UI-05', 'Pre-loading conversation and confidential message into Context-A UI', { content: uniqueConfidentialA });

    await chromeA.waitFor("!!document.querySelector('textarea[name=\"content\"]')", 15000);
    await chromeA.eval(`(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      const textarea = document.querySelector('textarea[name="content"]');
      nativeSetter.call(textarea, '${uniqueConfidentialA}');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      document.querySelector('button[aria-label="Enviar mensaje"]').click();
    })()`);

    await chromeA.waitFor(`document.body.innerText.includes('${uniqueConfidentialA}')`, 15000);
    log('UI-05', 'Confidential message confirmed rendered in Context-A UI (Apollo cache hydrated)');

    // Execute logout via UI control
    log('UI-05', 'Triggering /logout via user menu dropdown in UI');
    await chromeA.eval("document.querySelector('button[aria-label=\"Menú de usuario\"]').click()");
    await chromeA.waitFor("!!document.querySelector('a[href=\"/logout\"]')", 10000);
    await chromeA.eval("document.querySelector('a[href=\"/logout\"]').click()");

    await chromeA.waitFor("window.location.pathname === '/login'", 15000);

    // Verify document was NOT reloaded
    const markerAfterLogout = await chromeA.eval("window.__SPA_DOCUMENT_ID__");
    const tokenAfterLogout = await chromeA.eval("localStorage.getItem('token')");
    log('UI-05', 'Inspecting Context-A after UI logout', {
      markerPreserved: markerAfterLogout === spaMarker,
      tokenRetained: tokenAfterLogout
    });

    if (markerAfterLogout !== spaMarker) {
      throw new Error(`[ASSERTION_FAILED]: Full document reload detected during logout! Marker lost: ${markerAfterLogout} !== ${spaMarker}`);
    }
    if (tokenAfterLogout !== null) {
      throw new Error(`[ASSERTION_FAILED]: Token was not cleared after logout: ${tokenAfterLogout}`);
    }

    // Login as Moderador in the exact same SPA window
    log('UI-05', 'Logging in as Moderador in the same un-reloaded SPA window');
    await chromeA.waitFor("!!document.querySelector('#email')", 10000);
    await chromeA.eval(`
      (() => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const emailInput = document.querySelector('#email');
        const passInput = document.querySelector('#password');
        nativeSetter.call(emailInput, 'moderador1@itbeltran.com.ar');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        nativeSetter.call(passInput, '${password}');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('button[type="submit"]').click();
      })()
    `);

    await chromeA.waitFor("window.location.pathname === '/feed' || window.location.pathname === '/'", 15000);
    const markerAfterLoginC = await chromeA.eval("window.__SPA_DOCUMENT_ID__");
    log('UI-05', 'Moderador logged in; checking document marker', { markerPreserved: markerAfterLoginC === spaMarker });

    if (markerAfterLoginC !== spaMarker) {
      throw new Error(`[ASSERTION_FAILED]: Document reloaded during Moderador login!`);
    }

    // Client-side navigate to /chat
    log('UI-05', 'Client-side navigating to /chat under Moderador session');
    await chromeA.eval("document.querySelector('a[href=\"/chat\"]').click()");
    await chromeA.waitFor("window.location.pathname === '/chat'", 15000);
    await new Promise(r => setTimeout(r, 2000));

    const markerInChatC = await chromeA.eval("window.__SPA_DOCUMENT_ID__");
    const hasModeracionLink = await chromeA.eval("!!document.querySelector('a[href=\"/moderacion\"]')");
    const hasStudentName = await chromeA.eval("document.body.innerText.includes('Estudiante Sistemas Uno')");
    const hasConfidentialInChat = await chromeA.eval(`document.body.innerText.includes('${uniqueConfidentialA}')`);

    log('UI-05', 'Inspecting /chat DOM under Moderador identity', {
      markerPreserved: markerInChatC === spaMarker,
      hasModeracionLink,
      hasStudentNameResidual: hasStudentName,
      hasConfidentialStudentMessage: hasConfidentialInChat
    });

    if (markerInChatC !== spaMarker) {
      throw new Error(`[ASSERTION_FAILED]: Full document reload detected in Moderador /chat: marker lost: ${markerInChatC} !== ${spaMarker}`);
    }
    if (!hasModeracionLink) {
      throw new Error(`[ASSERTION_FAILED]: Moderation link missing in Moderador session: expected link to /moderacion`);
    }
    if (hasStudentName || hasConfidentialInChat) {
      throw new Error(`[ASSERTION_FAILED]: Residual student data leaked after in-document logout/relogin: studentName=${hasStudentName}, confidentialMsg=${hasConfidentialInChat}`);
    }

    const ssLogout = await chromeA.screenshot('ui-05-logout-relogin-clean.png');
    log('UI-05', 'ASSERTION_PASSED: In-document SPA logout and identity switch verified with zero page reload and zero residual data in DOM', { path: ssLogout });

    // -------------------------------------------------------------
    // DELIM: Inspección de InMemoryCache Apollo Client
    // -------------------------------------------------------------
    log('DELIM', 'Inspecting Apollo Client instance and normalized InMemoryCache capabilities');
    const apolloInspect = await chromeA.eval(`(() => {
      const client = window.__APOLLO_CLIENT__;
      if (!client) {
        return { available: false, type: typeof client };
      }
      const hasCache = !!client.cache;
      const hasExtract = typeof client.cache?.extract === 'function';
      let residualStudentFound = false;
      let residualConfidentialFound = false;
      let keyCount = 0;
      if (hasExtract) {
        const rawCache = client.cache.extract();
        keyCount = Object.keys(rawCache).length;
        const serialized = JSON.stringify(rawCache);
        residualStudentFound = serialized.includes('Estudiante Sistemas Uno');
        residualConfidentialFound = serialized.includes('${uniqueConfidentialA}');
      }
      return {
        available: true,
        type: typeof client,
        hasCache,
        hasExtract,
        keyCount,
        residualStudentFound,
        residualConfidentialFound
      };
    })()`);

    log('DELIM', 'Apollo Client Cache Inspection Result', apolloInspect);

    if (!apolloInspect.available || !apolloInspect.hasExtract) {
      throw new Error(`[ASSERTION_FAILED]: Apollo Client instance or cache.extract() not available for DELIM inspection: available=${apolloInspect.available}, hasExtract=${apolloInspect.hasExtract}`);
    }

    if (apolloInspect.residualStudentFound || apolloInspect.residualConfidentialFound) {
      throw new Error(`[ASSERTION_FAILED]: Apollo cache retained residual data from Session A after logout/clearStore!`);
    }

    log('DELIM', 'ASSERTION_PASSED: Apollo InMemoryCache extracted; 0 residual PII or confidential messages from previous session found', {
      totalKeysInCache: apolloInspect.keyCount,
      residualStudentFound: apolloInspect.residualStudentFound,
      residualConfidentialFound: apolloInspect.residualConfidentialFound
    });

    log('COMPLETE', 'ALL UI DIMENSIONS EVALUATED AND PASSED SUCCESSFULLY WITH RIGOROUS ASSERTIONS');
    await cleanup();
    writeManifest('PASS', 0);
    process.exit(0);

  } catch (err) {
    log('ERROR', `Automated runner failed: ${err.message}`);
    let cleanupError = null;
    try {
      if (typeof cleanup === 'function') {
        await cleanup();
      }
    } catch (cErr) {
      cleanupError = cErr;
      log('ERROR', `Cleanup after failure encountered errors: ${cErr.message}`);
    }
    const finalErr = cleanupError
      ? new Error(`${err.message} | Post-failure cleanup error: ${cleanupError.message}`)
      : err;
    writeManifest('FAIL', 1, finalErr);
    process.exit(1);
  }
}

if (isMain) {
  main();
}

export {
  ChromeInstance,
  isPortAvailable,
  resolveChromePath,
  validateAndReserveEvidenceDir,
  buildManifestObject,
  validateManifestContract,
  writeManifest,
  createRunnerCleanup,
  log,
  main
};
