import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Derivar la raíz estrictamente de la copia física en disco (aislamiento de fixtures sin heredar REPO_ROOT)
const repoRoot = path.basename(__dirname) === 'scripts'
  ? path.resolve(__dirname, '..')
  : path.resolve(__dirname, '..', '..');

const runId = process.env.RUN_ID || 'mock_run_default';
const scenario = process.env.MOCK_SCENARIO || 'live_success';

const runsBaseDir = path.resolve(repoRoot, 'docs/audit/evidence/runs');
fs.mkdirSync(runsBaseDir, { recursive: true });

const targetDir = path.join(runsBaseDir, runId);
fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(path.join(targetDir, 'screenshots'), { recursive: true });

let manifestObj = {
  runId,
  timestamp: new Date().toISOString(),
  baseUrl: 'http://localhost:5173',
  backendUrl: 'https://127.0.0.1:44397/graphql',
  nodeVersion: process.version,
  platform: process.platform,
  chromePath: 'C:\\Mock\\chrome.exe',
  mode: 'live',
  uiExecuted: true,
  certified: false,
  exitCode: 0,
  status: 'PASS',
  error: null,
  screenshots: []
};

let exitCodeToReturn = 0;

switch (scenario) {
  case 'live_success':
    manifestObj.mode = 'live';
    manifestObj.uiExecuted = true;
    manifestObj.certified = false;
    manifestObj.status = 'PASS';
    manifestObj.exitCode = 0;
    exitCodeToReturn = 0;
    break;

  case 'dry_run_success':
    manifestObj.mode = 'dry-run';
    manifestObj.uiExecuted = false;
    manifestObj.certified = false;
    manifestObj.status = 'DRY_RUN_OK';
    manifestObj.exitCode = 0;
    exitCodeToReturn = 0;
    break;

  case 'incoherent_dry_run_pass':
    // Incoherente: dry-run con status PASS
    manifestObj.mode = 'dry-run';
    manifestObj.uiExecuted = false;
    manifestObj.certified = false;
    manifestObj.status = 'PASS';
    manifestObj.exitCode = 0;
    exitCodeToReturn = 0;
    break;

  case 'certified_true':
    // Incoherente: certified true
    manifestObj.mode = 'live';
    manifestObj.uiExecuted = true;
    manifestObj.certified = true;
    manifestObj.status = 'PASS';
    manifestObj.exitCode = 0;
    exitCodeToReturn = 0;
    break;

  case 'string_ui_executed':
    // Tipo incorrecto: uiExecuted como string "false"
    manifestObj.mode = 'live';
    manifestObj.uiExecuted = 'false';
    manifestObj.certified = false;
    manifestObj.status = 'PASS';
    manifestObj.exitCode = 0;
    exitCodeToReturn = 0;
    break;

  case 'status_unknown':
    // Status no permitido
    manifestObj.mode = 'live';
    manifestObj.uiExecuted = true;
    manifestObj.certified = false;
    manifestObj.status = 'UNKNOWN';
    manifestObj.exitCode = 0;
    exitCodeToReturn = 0;
    break;

  case 'missing_mode':
    delete manifestObj.mode;
    exitCodeToReturn = 0;
    break;

  case 'lowercase_status_pass':
    // Variante de capitalización: status en minúsculas 'pass'
    manifestObj.mode = 'live';
    manifestObj.uiExecuted = true;
    manifestObj.certified = false;
    manifestObj.status = 'pass';
    manifestObj.exitCode = 0;
    exitCodeToReturn = 0;
    break;

  case 'failure_conforme':
    manifestObj.mode = 'live';
    manifestObj.uiExecuted = false;
    manifestObj.certified = false;
    manifestObj.status = 'FAIL';
    manifestObj.exitCode = 1;
    manifestObj.error = 'Synthetic test failure';
    exitCodeToReturn = 1;
    break;

  default:
    manifestObj.mode = 'unknown';
    exitCodeToReturn = 1;
}

const manifestPath = path.join(targetDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifestObj, null, 2), 'utf8');

// Generar RUN_OUTPUT.md en dry_run para cumplir con el contrato del runner
if (manifestObj.mode === 'dry-run') {
  fs.writeFileSync(path.join(targetDir, 'RUN_OUTPUT.md'), '# Mock Dry Run Output\n', 'utf8');
}

console.log(`[INIT] Mock runner scenario: ${scenario}`);
console.log(`[MANIFEST] Run manifest written to ${manifestPath}`);

process.exit(exitCodeToReturn);
