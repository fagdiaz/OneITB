import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ChromeInstance,
  resolveChromePath,
  createRunnerCleanup,
  buildManifestObject,
  validateManifestContract,
  writeManifest
} from '../scripts/verify-cf05-ui-live.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const nodeScript = path.join(repoRoot, 'scripts', 'verify-cf05-ui-live.mjs');
const historicalOutput = path.join(repoRoot, 'docs', 'audit', 'CF05_UI_AUTOMATED_RUNNER_OUTPUT.md');
const screenshotsDir = path.join(repoRoot, 'docs', 'audit', 'screenshots');
const runsBaseDir = path.join(repoRoot, 'docs', 'audit', 'evidence', 'runs');

console.log('================================================================');
console.log('SUITE CANÓNICA DE AISLAMIENTO Y CLEANUP DE RUNNERS (CONS-03)');
console.log('================================================================');

if (!fs.existsSync(historicalOutput)) {
  console.error(`FATAL: Archivo de evidencia histórica ausente: ${historicalOutput}`);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// Baseline criptográfico de evidencia histórica y capturas antes de iniciar
// -----------------------------------------------------------------------------
const initialHistoricalHash = crypto.createHash('sha256').update(fs.readFileSync(historicalOutput)).digest('hex');

function getScreenshotInventoryHash() {
  if (!fs.existsSync(screenshotsDir)) return 'NO_SCREENSHOTS_DIR';
  const files = fs.readdirSync(screenshotsDir).sort();
  const hash = crypto.createHash('sha256');
  for (const f of files) {
    const full = path.join(screenshotsDir, f);
    if (fs.statSync(full).isFile()) {
      hash.update(f);
      hash.update(fs.readFileSync(full));
    }
  }
  return hash.digest('hex');
}
const initialScreenshotsHash = getScreenshotInventoryHash();

// Inventario previo de carpetas en docs/audit/evidence/runs
function getRunsInventory() {
  if (!fs.existsSync(runsBaseDir)) return [];
  return fs.readdirSync(runsBaseDir).filter(f => {
    try {
      return fs.statSync(path.join(runsBaseDir, f)).isDirectory();
    } catch (_) {
      return false;
    }
  });
}
const initialRunsInventory = new Set(getRunsInventory());

// Registro global de recursos efímeros para limpieza garantizada en finally
const createdRuns = new Set();
const openServers = new Set();
const tempAuditRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cons03-suite-'));

function registerRunDir(dirPath) {
  if (dirPath) {
    createdRuns.add(path.resolve(dirPath));
  }
  return dirPath;
}

function getFreeEphemeralPort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

class AssertionError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'AssertionError';
    this.details = details;
  }
}

let totalTests = 0;
let passedTests = 0;
let suiteError = null;

function assertTest(name, condition, details = {}) {
  totalTests++;
  process.stdout.write(`Ejecutando [Caso ${totalTests}]: ${name}... `);
  if (condition) {
    console.log('PASS');
    passedTests++;
  } else {
    console.log('FAIL');
    console.error('Detalles del fallo:', details);
    throw new AssertionError(`Fallo en [Caso ${totalTests}]: ${name}`, details);
  }
}

try {
  // ===========================================================================
  // SECCIÓN 1: Confinamiento de RUN_ID y Prevención de Sobreescritura (RUN-01)
  // ===========================================================================

  // Caso 1: Rechazo de path traversal (../escaped) sin escribir fuera de runs
  const res1 = spawnSync(process.execPath, [nodeScript], {
    env: {
      ...process.env,
      DEMO_USER_PASSWORD: 'TestPassword123!',
      RUNNER_DRY_RUN: 'true',
      RUN_ID: '../escaped'
    },
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true
  });
  const escapedDir = path.join(repoRoot, 'docs', 'audit', 'evidence', 'escaped');
  const traversalBlocked = res1.status !== 0 &&
                           !fs.existsSync(escapedDir) &&
                           ((res1.stderr || '').includes('[INVALID_RUN_ID]') || (res1.stdout || '').includes('[INVALID_RUN_ID]'));
  assertTest(
    'RUN-01: Rechazo estricto de RUN_ID con path traversal (../escaped)',
    traversalBlocked,
    { status: res1.status, stdout: res1.stdout, stderr: res1.stderr, escapedExists: fs.existsSync(escapedDir) }
  );

  // Caso 2: Rechazo de RUN_ID con separadores absolutos o caracteres prohibidos
  const res2 = spawnSync(process.execPath, [nodeScript], {
    env: {
      ...process.env,
      DEMO_USER_PASSWORD: 'TestPassword123!',
      RUNNER_DRY_RUN: 'true',
      RUN_ID: 'invalid/id:with*chars'
    },
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true
  });
  const invalidBlocked = res2.status !== 0 &&
                         ((res2.stderr || '').includes('[INVALID_RUN_ID]') || (res2.stdout || '').includes('[INVALID_RUN_ID]'));
  assertTest(
    'RUN-01: Rechazo estricto de RUN_ID con caracteres inválidos o separadores',
    invalidBlocked,
    { status: res2.status, stderr: res2.stderr }
  );

  // Caso 3: Reserva atómica de RUN_ID: una segunda corrida con el mismo RUN_ID no sobrescribe
  const uniqueRunIdA = `suite_iso_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const runDirA = registerRunDir(path.join(repoRoot, 'docs', 'audit', 'evidence', 'runs', uniqueRunIdA));

  const res3A = spawnSync(process.execPath, [nodeScript], {
    env: {
      ...process.env,
      DEMO_USER_PASSWORD: 'TestPassword123!',
      RUNNER_DRY_RUN: 'true',
      RUN_ID: uniqueRunIdA
    },
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true
  });

  const manifestPathA = path.join(runDirA, 'manifest.json');
  const manifestExistsA = fs.existsSync(manifestPathA);
  let sentinelPreserved = false;
  let res3BStatus = null;
  let res3BStderr = '';

  if (manifestExistsA && res3A.status === 0) {
    // Escribir centinela en el manifiesto de la primera corrida
    fs.writeFileSync(manifestPathA, 'SENTINEL: AUDIT EVIDENCE PRESERVED', 'utf8');

    // Intentar segunda corrida con exactamente el mismo RUN_ID
    const res3B = spawnSync(process.execPath, [nodeScript], {
      env: {
        ...process.env,
        DEMO_USER_PASSWORD: 'TestPassword123!',
        RUNNER_DRY_RUN: 'true',
        RUN_ID: uniqueRunIdA
      },
      encoding: 'utf8',
      timeout: 10000,
      windowsHide: true
    });
    res3BStatus = res3B.status;
    res3BStderr = (res3B.stderr || '') + (res3B.stdout || '');
    sentinelPreserved = fs.readFileSync(manifestPathA, 'utf8') === 'SENTINEL: AUDIT EVIDENCE PRESERVED';
  }

  assertTest(
    'RUN-01: Reserva atómica exclusiva: RUN_ID duplicado se rechaza y no sobrescribe evidencia',
    res3A.status === 0 && res3BStatus !== 0 && res3BStderr.includes('[RUN_ID_ALREADY_EXISTS]') && sentinelPreserved,
    { res3A: res3A.status, res3B: res3BStatus, sentinelPreserved, res3BStderr }
  );

  // ===========================================================================
  // SECCIÓN 2: Dry-Run Machine-Readable y Diferenciación de Instrumento (RUN-03)
  // ===========================================================================

  // Caso 4: Manifiesto de Dry-Run contiene mode dry-run, DRY_RUN_OK y no certifica UI
  const uniqueRunIdB = `suite_dry_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const runDirB = registerRunDir(path.join(repoRoot, 'docs', 'audit', 'evidence', 'runs', uniqueRunIdB));

  const res4 = spawnSync(process.execPath, [nodeScript], {
    env: {
      ...process.env,
      DEMO_USER_PASSWORD: 'TestPassword123!',
      RUNNER_DRY_RUN: 'true',
      RUN_ID: uniqueRunIdB
    },
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true
  });

  const manifestPathB = path.join(runDirB, 'manifest.json');
  let dryRunManifestConforms = false;
  if (fs.existsSync(manifestPathB)) {
    const jsonB = JSON.parse(fs.readFileSync(manifestPathB, 'utf8'));
    dryRunManifestConforms = jsonB.mode === 'dry-run' &&
                             jsonB.status === 'DRY_RUN_OK' &&
                             jsonB.uiExecuted === false &&
                             jsonB.certified === false &&
                             jsonB.exitCode === 0;
  }

  assertTest(
    'RUN-03: Dry-run registra mode: dry-run, status: DRY_RUN_OK y uiExecuted: false en manifiesto',
    res4.status === 0 && dryRunManifestConforms,
    { res4Status: res4.status, dryRunManifestConforms }
  );

  // ===========================================================================
  // SECCIÓN 3: Cleanup Exhaustivo y Agregación de Errores (RUN-02)
  // ===========================================================================

  // Caso 5: Invocación directa de createRunnerCleanup real: memoización concurrente y fallo en una no cancela restantes
  const stoppedCalls = [];
  const mockA = { profilePrefix: 'ui_profile_a', stop: async () => { stoppedCalls.push('a'); throw new Error('[RESOURCE_LEAK_DETECTED]: mock leak on a'); } };
  const mockB = { profilePrefix: 'ui_profile_b', stop: async () => { stoppedCalls.push('b'); } };
  const mockC = { profilePrefix: 'ui_profile_c', stop: async () => { stoppedCalls.push('c'); } };
  const mockProbe = { profilePrefix: 'ui_profile_probe', stop: async () => { stoppedCalls.push('probe'); } };

  const runnerCleanup = createRunnerCleanup([mockA, mockB, mockC, mockProbe]);

  // Validar memoización idempotente: llamadas simultáneas comparten la misma promesa
  const p1 = runnerCleanup();
  const p2 = runnerCleanup();
  const memoizedShared = (p1 === p2);

  let aggregateErrorCaught = false;
  try {
    await p1;
  } catch (err) {
    if (err.message.includes('[AGGREGATE_CLEANUP_FAILURE]') && err.message.includes('mock leak on a')) {
      aggregateErrorCaught = true;
    }
  }

  const allInstancesReceivedStop = stoppedCalls.includes('a') &&
                                   stoppedCalls.includes('b') &&
                                   stoppedCalls.includes('c') &&
                                   stoppedCalls.includes('probe');

  assertTest(
    'RUN-02: Cleanup exhaustivo (createRunnerCleanup): memoización idempotente y fallo en una instancia no cancela el stop() de las restantes',
    memoizedShared && aggregateErrorCaught && allInstancesReceivedStop,
    { memoizedShared, aggregateErrorCaught, stoppedCalls }
  );

  // Caso 6: Detección determinista de fugas, retención de ownership y seguridad (cero auto-taskkill)
  // 6.1 Fuga de puerto CDP retenido e idempotencia de error
  const leakPort = await getFreeEphemeralPort();
  const leakServer = net.createServer();
  openServers.add(leakServer);
  await new Promise(r => leakServer.listen(leakPort, '127.0.0.1', r));

  const instPort = new ChromeInstance(leakPort, 'unit_port_leak', {
    profileDir: path.join(tempAuditRoot, 'port_profile')
  });
  instPort.started = true;

  let portFirstCallFailed = false;
  let portSecondCallFailed = false;
  let portThirdCallPassed = false;

  // Llamada 1: Debe fallar con RESOURCE_LEAK_DETECTED y retener started = true
  try {
    await instPort.stop();
  } catch (err) {
    if (err.message.includes('[RESOURCE_LEAK_DETECTED]') && err.message.includes('still bound after stop()')) {
      portFirstCallFailed = true;
    }
  }
  const portRetainedAfterFirst = (instPort.started === true);

  // Llamada 2: Repetición debe VOLVER a fallar (no falso PASS) mientras el puerto siga retenido
  try {
    await instPort.stop();
  } catch (err) {
    if (err.message.includes('[RESOURCE_LEAK_DETECTED]') && err.message.includes('still bound after stop()')) {
      portSecondCallFailed = true;
    }
  }

  // Liberar el puerto retenido
  await new Promise(r => leakServer.close(r));
  openServers.delete(leakServer);

  // Llamada 3: Una vez liberado el puerto, stop() confirma la liberación y devuelve PASS
  try {
    await instPort.stop();
    portThirdCallPassed = (instPort.started === false);
  } catch (_) {
    portThirdCallPassed = false;
  }

  // 6.2 Fuga de proceso Chrome con interceptor de liveness (seguro: sin ejecutar taskkill real contra el suite)
  const terminationAttempts = [];
  let procSimulatedAlive = true;

  const instProc = new ChromeInstance(0, 'unit_proc_leak', {
    profileDir: path.join(tempAuditRoot, 'proc_profile'),
    terminator: (pid) => {
      terminationAttempts.push(pid);
    },
    livenessProbe: (pid) => {
      if (procSimulatedAlive) {
        const e = new Error('synthetic liveness EPERM');
        e.code = 'EPERM';
        throw e;
      }
      const e = new Error('synthetic ESRCH');
      e.code = 'ESRCH';
      throw e;
    }
  });

  const dummyPid = 987654;
  instProc.proc = { pid: dummyPid };

  let procFirstCallFailed = false;
  let procSecondCallFailed = false;
  let procThirdCallPassed = false;

  // Llamada 1: Falla con EPERM y retiene this.proc
  try {
    await instProc.stop();
  } catch (err) {
    if (err.message.includes('[RESOURCE_LEAK_DETECTED]') && err.message.includes('still alive (permission denied)')) {
      procFirstCallFailed = true;
    }
  }
  const procRetainedAfterFirst = !!(instProc.proc && instProc.proc.pid === dummyPid);

  // Llamada 2: Repetición vuelve a fallar con error retenido (cero falso PASS)
  try {
    await instProc.stop();
  } catch (err) {
    if (err.message.includes('[RESOURCE_LEAK_DETECTED]') && err.message.includes('still alive (permission denied)')) {
      procSecondCallFailed = true;
    }
  }

  // Simular terminación del proceso (ESRCH)
  procSimulatedAlive = false;

  // Llamada 3: Una vez muerto el proceso, stop() confirma la desaparición y limpia this.proc
  try {
    await instProc.stop();
    procThirdCallPassed = (instProc.proc === null);
  } catch (_) {
    procThirdCallPassed = false;
  }

  const noSelfTaskkillExecuted = !terminationAttempts.includes(process.pid);

  assertTest(
    'RUN-02: Detección de fugas, retención de ownership (dos fallos consecutivos) y liberación confirmada sin auto-taskkill',
    portFirstCallFailed && portRetainedAfterFirst && portSecondCallFailed && portThirdCallPassed &&
    procFirstCallFailed && procRetainedAfterFirst && procSecondCallFailed && procThirdCallPassed &&
    noSelfTaskkillExecuted,
    {
      portFirstCallFailed,
      portRetainedAfterFirst,
      portSecondCallFailed,
      portThirdCallPassed,
      procFirstCallFailed,
      procRetainedAfterFirst,
      procSecondCallFailed,
      procThirdCallPassed,
      noSelfTaskkillExecuted,
      terminationAttempts
    }
  );

  // ===========================================================================
  // SECCIÓN 4: Precondiciones y Manejo Robusto de CHROME_BIN / TLS (RUN-04)
  // ===========================================================================

  // Caso 7: CHROME_BIN explícito inexistente DEBE ser rechazado y no caer a Chrome instalado
  let explicitChromeRejected = false;
  try {
    process.env.CHROME_BIN = path.join(tempAuditRoot, 'nonexistent-chrome.exe');
    delete process.env.CHROME_PATH;
    resolveChromePath();
  } catch (err) {
    if (err.message.includes('Google Chrome executable not found at specified CHROME_BIN')) {
      explicitChromeRejected = true;
    }
  } finally {
    delete process.env.CHROME_BIN;
  }

  assertTest(
    'RUN-04: CHROME_BIN explícito inexistente se rechaza sin recurrir a Chrome instalado',
    explicitChromeRejected,
    { explicitChromeRejected }
  );

  // Caso 8: Precondición de DEMO_USER_PASSWORD ausente
  const envNoPass = { ...process.env };
  delete envNoPass.DEMO_USER_PASSWORD;
  const res8 = spawnSync(process.execPath, [nodeScript], {
    env: envNoPass,
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true
  });
  const out8 = (res8.stdout || '') + (res8.stderr || '');
  assertTest(
    'RUN-04: Precondición estricta: rechazo ante ausencia de DEMO_USER_PASSWORD',
    res8.status !== 0 && out8.includes('DEMO_USER_PASSWORD environment variable is required'),
    { status: res8.status, out8 }
  );

  // Caso 9: Bloqueo de seguridad ante bypass TLS en endpoint no local
  const res9 = spawnSync(process.execPath, [nodeScript], {
    env: {
      ...process.env,
      DEMO_USER_PASSWORD: 'TestPassword123!',
      BACKEND_URL: 'https://untrusted-external-domain.com/graphql',
      ALLOW_INSECURE_REMOTE_TLS: 'true'
    },
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true
  });
  const out9 = (res9.stdout || '') + (res9.stderr || '');
  assertTest(
    'RUN-04: Seguridad: bloqueo inmediato [SECURITY_REJECTION] ante TLS bypass no local',
    res9.status !== 0 && out9.includes('SECURITY_REJECTION'),
    { status: res9.status, out9 }
  );

  // Caso 10: Colisión de puerto por proceso ajeno en puerto efímero preservando el listener Y registrando RUN_ID
  const collisionPort = await getFreeEphemeralPort();
  const collisionListener = net.createServer();
  openServers.add(collisionListener);
  await new Promise(r => collisionListener.listen(collisionPort, '127.0.0.1', r));

  const runId10 = `suite_collision_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const runDir10 = registerRunDir(path.join(repoRoot, 'docs', 'audit', 'evidence', 'runs', runId10));

  let res10 = null;
  let listenerStillAlive = false;
  try {
    res10 = spawnSync(process.execPath, [nodeScript], {
      env: {
        ...process.env,
        DEMO_USER_PASSWORD: 'TestPassword123!',
        BASE_CDP_PORT: String(collisionPort),
        RUN_ID: runId10
      },
      encoding: 'utf8',
      timeout: 10000,
      windowsHide: true
    });
    listenerStillAlive = collisionListener.listening;
  } finally {
    await new Promise(r => collisionListener.close(r));
    openServers.delete(collisionListener);
  }

  const out10 = (res10?.stdout || '') + (res10?.stderr || '');
  assertTest(
    'RUN-04: Colisión de puerto CDP: rechazo seguro en puerto efímero preservando el proceso ajeno preexistente y registrando RUN_ID',
    res10?.status !== 0 && out10.includes(`Port ${collisionPort} is already in use`) && listenerStillAlive,
    { status: res10?.status, listenerStillAlive, out10, runId10 }
  );

  // Caso 11: Aislamiento Multi-Run sin solapamiento (dos corridas independientes)
  const runAlpha = `suite_alpha_${Date.now()}`;
  const runBeta = `suite_beta_${Date.now()}`;
  const dirAlpha = registerRunDir(path.join(repoRoot, 'docs', 'audit', 'evidence', 'runs', runAlpha));
  const dirBeta = registerRunDir(path.join(repoRoot, 'docs', 'audit', 'evidence', 'runs', runBeta));

  const resAlpha = spawnSync(process.execPath, [nodeScript], {
    env: { ...process.env, DEMO_USER_PASSWORD: 'TestPassword123!', RUNNER_DRY_RUN: 'true', RUN_ID: runAlpha },
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true
  });

  const resBeta = spawnSync(process.execPath, [nodeScript], {
    env: { ...process.env, DEMO_USER_PASSWORD: 'TestPassword123!', RUNNER_DRY_RUN: 'true', RUN_ID: runBeta },
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true
  });

  const manifestAlpha = path.join(dirAlpha, 'manifest.json');
  const manifestBeta = path.join(dirBeta, 'manifest.json');
  let multiRunConforms = false;

  if (fs.existsSync(manifestAlpha) && fs.existsSync(manifestBeta)) {
    const jsonA = JSON.parse(fs.readFileSync(manifestAlpha, 'utf8'));
    const jsonB = JSON.parse(fs.readFileSync(manifestBeta, 'utf8'));

    multiRunConforms = jsonA.runId === runAlpha &&
                       jsonB.runId === runBeta &&
                       jsonA.status === 'DRY_RUN_OK' &&
                       jsonB.status === 'DRY_RUN_OK' &&
                       dirAlpha !== dirBeta;
  }

  assertTest(
    'Aislamiento multi-run: dos ejecuciones independientes conservan artefactos exclusivos sin cruce',
    resAlpha.status === 0 && resBeta.status === 0 && multiRunConforms,
    { resAlpha: resAlpha.status, resBeta: resBeta.status, multiRunConforms }
  );

  // Caso 12: Integridad criptográfica SHA-256 de CF05_UI_AUTOMATED_RUNNER_OUTPUT.md
  const currentHistoricalBytes = fs.readFileSync(historicalOutput);
  const currentHistoricalHash = crypto.createHash('sha256').update(currentHistoricalBytes).digest('hex');
  const histContent = currentHistoricalBytes.toString('utf8');

  assertTest(
    'Integridad criptográfica SHA-256 de CF05_UI_AUTOMATED_RUNNER_OUTPUT.md y marcas canónicas',
    currentHistoricalHash === initialHistoricalHash &&
    histContent.includes('2026-11-15T22:12:21') &&
    histContent.includes('100% PASS'),
    { initialHistoricalHash, currentHistoricalHash }
  );

  // ===========================================================================
  // SECCIÓN 5: Contrato Productor-Consumidor del Manifiesto (RUN-03 / FIX DELTA 3)
  // ===========================================================================

  // Caso 13: Validación exhaustiva del contrato del manifiesto: matriz exacta de estados y tipos
  const livePassObj = buildManifestObject('PASS', 0, null, { mode: 'live', uiExecuted: true, certified: false }, { runId: 'suite_contract_live' });
  const livePassValid = validateManifestContract(livePassObj);

  const dryRunObj = buildManifestObject('DRY_RUN_OK', 0, null, { mode: 'dry-run', uiExecuted: false, certified: false }, { runId: 'suite_contract_dry' });
  const dryRunValid = validateManifestContract(dryRunObj);

  const failObj = buildManifestObject('FAIL', 1, new Error('synthetic fail'), { mode: 'live', uiExecuted: false, certified: false }, { runId: 'suite_contract_fail' });
  const failValid = validateManifestContract(failObj);

  // 1. Rechazo de dry-run con status PASS
  let dryRunPassRejected = false;
  try {
    const bad = { ...dryRunObj, status: 'PASS' };
    validateManifestContract(bad);
  } catch (err) {
    dryRunPassRejected = err.message.includes("dry-run mode cannot have status 'PASS'");
  }

  // 2. Rechazo de status UNKNOWN
  let statusUnknownRejected = false;
  try {
    const bad = { ...livePassObj, status: 'UNKNOWN' };
    validateManifestContract(bad);
  } catch (err) {
    statusUnknownRejected = err.message.includes("status must be 'PASS', 'FAIL', or 'DRY_RUN_OK'");
  }

  // 3. Rechazo de certified true
  let certifiedTrueRejected = false;
  try {
    const bad = { ...livePassObj, certified: true };
    validateManifestContract(bad);
  } catch (err) {
    certifiedTrueRejected = err.message.includes('certified must be boolean false');
  }

  // 4. Rechazo de uiExecuted como string "false"
  let stringUiExecutedRejected = false;
  try {
    const bad = { ...dryRunObj, uiExecuted: 'false' };
    validateManifestContract(bad);
  } catch (err) {
    stringUiExecutedRejected = err.message.includes('uiExecuted must be a boolean');
  }

  // 5. Rechazo de exitCode como string "0"
  let stringExitCodeRejected = false;
  try {
    const bad = { ...livePassObj, exitCode: '0' };
    validateManifestContract(bad);
  } catch (err) {
    stringExitCodeRejected = err.message.includes('exitCode must be an integer');
  }

  // 6. Rechazo de campo mode faltante
  let missingModeRejected = false;
  try {
    const bad = { ...livePassObj };
    delete bad.mode;
    validateManifestContract(bad);
  } catch (err) {
    missingModeRejected = err.message.includes("Missing required manifest field 'mode'");
  }

  // 7. Rechazo de campo uiExecuted faltante
  let missingUiExecutedRejected = false;
  try {
    const bad = { ...livePassObj };
    delete bad.uiExecuted;
    validateManifestContract(bad);
  } catch (err) {
    missingUiExecutedRejected = err.message.includes("Missing required manifest field 'uiExecuted'");
  }

  // 8. Rechazo de live PASS con exitCode distinto de 0
  let invalidLiveExitCodeRejected = false;
  try {
    const bad = { ...livePassObj, exitCode: 1 };
    validateManifestContract(bad);
  } catch (err) {
    invalidLiveExitCodeRejected = err.message.includes('live PASS manifest requires exitCode 0');
  }

  // 9. Rechazo de live PASS con uiExecuted falso
  let livePassUiFalseRejected = false;
  try {
    const bad = { ...livePassObj, uiExecuted: false };
    validateManifestContract(bad);
  } catch (err) {
    livePassUiFalseRejected = err.message.includes('live PASS manifest requires uiExecuted === true');
  }

  // 10. Rechazo de modo desconocido
  let invalidModeRejected = false;
  try {
    const bad = { ...livePassObj, mode: 'unknown_mode' };
    validateManifestContract(bad);
  } catch (err) {
    invalidModeRejected = err.message.includes("mode must be 'live' or 'dry-run'");
  }

  // 11. Rechazo de FAIL con exitCode 0
  let failZeroExitRejected = false;
  try {
    const bad = { ...failObj, exitCode: 0 };
    validateManifestContract(bad);
  } catch (err) {
    failZeroExitRejected = err.message.includes('FAIL status requires non-zero exitCode');
  }

  // 12. Rechazo de FAIL con uiExecuted true
  let failUiTrueRejected = false;
  try {
    const bad = { ...failObj, uiExecuted: true };
    validateManifestContract(bad);
  } catch (err) {
    failUiTrueRejected = err.message.includes('FAIL status requires uiExecuted === false');
  }

  // 13. Rechazo de status en minúsculas 'pass' (paridad de capitalización)
  let lowercaseStatusRejected = false;
  try {
    const bad = { ...livePassObj, status: 'pass' };
    validateManifestContract(bad);
  } catch (err) {
    lowercaseStatusRejected = err.message.includes("status must be 'PASS', 'FAIL', or 'DRY_RUN_OK'");
  }

  assertTest(
    'RUN-03: Contrato estricto del manifiesto (matriz de estados válidos, rechazo de dry-run PASS, certified true, status UNKNOWN, minúsculas pass y coerción de tipos)',
    livePassValid && dryRunValid && failValid &&
    dryRunPassRejected && statusUnknownRejected && certifiedTrueRejected &&
    stringUiExecutedRejected && stringExitCodeRejected && missingModeRejected &&
    missingUiExecutedRejected && invalidLiveExitCodeRejected && livePassUiFalseRejected &&
    invalidModeRejected && failZeroExitRejected && failUiTrueRejected && lowercaseStatusRejected,
    {
      livePassValid, dryRunValid, failValid,
      dryRunPassRejected, statusUnknownRejected, certifiedTrueRejected,
      stringUiExecutedRejected, stringExitCodeRejected, missingModeRejected,
      missingUiExecutedRejected, invalidLiveExitCodeRejected, livePassUiFalseRejected,
      invalidModeRejected, failZeroExitRejected, failUiTrueRejected, lowercaseStatusRejected
    }
  );

} catch (err) {
  suiteError = err;
  console.error('\n[SUITE_ERROR]: Intercepción controlada de fallo en suite:', err.message);
} finally {
  const cleanupErrors = [];

  // 1. Cerrar servidores abiertos que pudieran haber quedado colgados
  for (const srv of openServers) {
    try {
      srv.close();
    } catch (err) {
      cleanupErrors.push(new Error(`Error cerrando servidor listener: ${err.message}`));
    }
  }

  // 2. Limpieza exhaustiva de todos los directorios de corrida registrados
  for (const dir of createdRuns) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      }
    } catch (err) {
      cleanupErrors.push(new Error(`Fallo al eliminar directorio propio registrado '${dir}': ${err.message}`));
    }
    if (fs.existsSync(dir)) {
      cleanupErrors.push(new Error(`Directorio de corrida propio '${dir}' aún persiste tras rmSync.`));
    }
  }

  // 3. Limpieza del sandbox temporal exclusivo de auditoría
  if (fs.existsSync(tempAuditRoot)) {
    try {
      fs.rmSync(tempAuditRoot, { recursive: true, force: true });
    } catch (err) {
      cleanupErrors.push(new Error(`Fallo al limpiar tempAuditRoot: ${err.message}`));
    }
  }

  // 4. Verificación de cero residuos de corridas de la suite en docs/audit/evidence/runs
  const currentRuns = getRunsInventory();
  const suiteResiduals = currentRuns.filter(r => !initialRunsInventory.has(r) && r.startsWith('suite_'));
  if (suiteResiduals.length > 0) {
    cleanupErrors.push(new Error(`Residuo no registrado detectado en docs/audit/evidence/runs: ${suiteResiduals.join(', ')}`));
  }

  // 5. Verificación post-suite de integridad de evidencia y capturas históricas
  const finalHistoricalHash = crypto.createHash('sha256').update(fs.readFileSync(historicalOutput)).digest('hex');
  const finalScreenshotsHash = getScreenshotInventoryHash();

  let integrityError = null;
  if (finalHistoricalHash !== initialHistoricalHash) {
    integrityError = new Error(`FATAL: CF05_UI_AUTOMATED_RUNNER_OUTPUT.md fue mutado durante la suite! (inicial=${initialHistoricalHash}, final=${finalHistoricalHash})`);
    console.error(integrityError.message);
  }

  if (finalScreenshotsHash !== initialScreenshotsHash) {
    integrityError = new Error(`FATAL: Las capturas históricas en docs/audit/screenshots fueron alteradas durante la suite!`);
    console.error(integrityError.message);
  }

  if (suiteError || integrityError || cleanupErrors.length > 0) {
    console.error('================================================================');
    console.error(`SUITE FINALIZADA CON ERROR: ${passedTests} / ${totalTests} ASERCIONES EN VERDE`);
    if (suiteError) console.error('Error en prueba:', suiteError.message);
    if (integrityError) console.error('Error de integridad:', integrityError.message);
    for (const cErr of cleanupErrors) {
      console.error('Error de limpieza/residuo:', cErr.message);
    }
    console.error('================================================================');
    process.exit(1);
  }
}

console.log('================================================================');
console.log(`RESULTADO FINAL: ${passedTests} / ${totalTests} ASERCIONES EN VERDE (100% PASS)`);
console.log('================================================================');
process.exit(0);
