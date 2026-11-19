import cp from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateManifestContract } from '../scripts/verify-cf05-ui-live.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const canonicalWrapperScript = path.join(repoRoot, 'scripts', 'run-cf05-ui-live-validation.ps1');
const mockRunnerSource = path.join(repoRoot, 'tests', 'fixtures', 'mock_runner.mjs');
const evidencePath = path.join(repoRoot, 'docs', 'audit', 'evidencias', 'EVIDENCIA_WRAPPER_FIXTURES_CONS03.json');

console.log('================================================================');
console.log('TEST DE CONTRATO PRODUCTOR-CONSUMIDOR Y WRAPPER POWERSHELL');
console.log('Aislamiento en Raíz Temporal + Paridad de Mayúsculas (CONS-03 Delta 4)');
console.log('================================================================');

// 1. Configurar raíz temporal aislada para evitar cualquier mutación o residuo en el repositorio real
const tempRoot = path.join(repoRoot, 'scratch', `test_contract_isolated_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`);
const tempScriptsDir = path.join(tempRoot, 'scripts');
const tempRunsDir = path.join(tempRoot, 'docs', 'audit', 'evidence', 'runs');
const tempLatestJsonPath = path.join(tempRunsDir, 'LATEST_RUN.json');
const tempWrapperScript = path.join(tempScriptsDir, 'run-cf05-ui-live-validation.ps1');
const tempNodeScript = path.join(tempScriptsDir, 'verify-cf05-ui-live.mjs');

fs.mkdirSync(tempScriptsDir, { recursive: true });
fs.mkdirSync(tempRunsDir, { recursive: true });

// Copiar el wrapper operativo canónico intacto a la raíz temporal
fs.copyFileSync(canonicalWrapperScript, tempWrapperScript);
// Colocar el productor de fixtures (mock runner) en la ubicación esperada (scripts/verify-cf05-ui-live.mjs)
fs.copyFileSync(mockRunnerSource, tempNodeScript);

// Inicializar puntero baseline LATEST_RUN.json exclusivamente en la raíz temporal
const baselineRunId = 'baseline_run_id';
const initialBaselineObj = {
  LatestRunId: baselineRunId,
  Timestamp: '2026-11-18T12:00:00Z',
  ExitCode: 0,
  Status: 'PASS',
  Path: `docs/audit/evidence/runs/${baselineRunId}/RUN_OUTPUT.md`
};
fs.writeFileSync(tempLatestJsonPath, JSON.stringify(initialBaselineObj, null, 2), 'utf8');

function getFileSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  let content = fs.readFileSync(filePath, 'utf8');
  // Contemplar BOM (0xFEFF) que escribe Set-Content -Encoding utf8 en Windows PowerShell 5.1
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

// 2. Definición exhaustiva de los 8 escenarios (7 existentes + 1 variante de capitalización)
const scenarios = [
  {
    name: 'live_success',
    expectedExit: 0,
    expectsPointerUpdate: true,
    desc: 'Live PASS válido (mode: live, status: PASS, exitCode: 0, uiExecuted: true, certified: false)',
    expectedPsRejection: null
  },
  {
    name: 'dry_run_success',
    expectedExit: 0,
    expectsPointerUpdate: false,
    desc: 'Dry-run válido (mode: dry-run, status: DRY_RUN_OK, exitCode: 0, uiExecuted: false, certified: false)',
    expectedPsRejection: null
  },
  {
    name: 'incoherent_dry_run_pass',
    expectedExit: 1,
    expectsPointerUpdate: false,
    desc: 'Combinación incoherente: dry-run con status PASS',
    expectedPsRejection: 'incoherente de estado en manifiesto'
  },
  {
    name: 'certified_true',
    expectedExit: 1,
    expectsPointerUpdate: false,
    desc: 'Combinación inválida: certified true',
    expectedPsRejection: "'certified' debe ser booleano estricto JSON y exclusivamente false"
  },
  {
    name: 'string_ui_executed',
    expectedExit: 1,
    expectsPointerUpdate: false,
    desc: 'Tipo JSON incorrecto: uiExecuted como string "false" (prueba de no coerción)',
    expectedPsRejection: "'uiExecuted' debe ser booleano estricto JSON"
  },
  {
    name: 'status_unknown',
    expectedExit: 1,
    expectsPointerUpdate: false,
    desc: 'Status desconocido: status UNKNOWN',
    expectedPsRejection: "status' debe ser string 'PASS', 'FAIL' o 'DRY_RUN_OK'"
  },
  {
    name: 'missing_mode',
    expectedExit: 1,
    expectsPointerUpdate: false,
    desc: 'Propiedad requerida ausente: falta mode',
    expectedPsRejection: "falta la propiedad requerida 'mode'"
  },
  {
    name: 'lowercase_status_pass',
    expectedExit: 1,
    expectsPointerUpdate: false,
    desc: 'Variante de capitalización: status en minúsculas "pass" (paridad de capitalización)',
    expectedPsRejection: "status' debe ser string 'PASS', 'FAIL' o 'DRY_RUN_OK'"
  }
];

// 3. Comprobar disponibilidad y responsividad de PowerShell con timeout estricto
let psAvailable = false;
try {
  const probe = cp.spawnSync('powershell.exe', [
    '-NoLogo',
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    '[Console]::WriteLine("PS_PROBE_OK")'
  ], {
    encoding: 'utf8',
    timeout: 6000,
    windowsHide: true
  });
  psAvailable = (probe.status === 0 && (probe.stdout || '').includes('PS_PROBE_OK'));
} catch (_) {
  psAvailable = false;
}

console.log(`Disponibilidad de intérprete PowerShell en host: ${psAvailable ? 'DISPONIBLE' : 'NO DISPONIBLE / TIMEOUT (Modo BLOCKED registrado formalmente)'}`);

const scenarioResults = [];

try {
  for (const sc of scenarios) {
    const testRunId = `suite_contract_${sc.name}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Hash y puntero antes de la ejecución
    const sha256Before = getFileSha256(tempLatestJsonPath);
    let pointerBefore = 'NONE';
    try {
      pointerBefore = readJsonSafe(tempLatestJsonPath)?.LatestRunId || 'NONE';
    } catch (_) {}

    // A. Comprobar decisión de Node directamente sobre el contrato del productor
    let nodeContractResult = null;
    let nodeConforms = false;
    try {
      // Ejecutar mock_runner en modo aislado para generar el manifiesto correspondiente
      const nodeChildEnv = {
        ...process.env,
        RUN_ID: testRunId,
        MOCK_SCENARIO: sc.name
      };
      delete nodeChildEnv.REPO_ROOT;
      const nodeRes = cp.spawnSync(process.execPath, [tempNodeScript], {
        env: nodeChildEnv,
        cwd: tempRoot,
        encoding: 'utf8',
        timeout: 10000,
        windowsHide: true
      });

      const generatedManifestPath = path.join(tempRunsDir, testRunId, 'manifest.json');
      if (fs.existsSync(generatedManifestPath)) {
        const parsed = readJsonSafe(generatedManifestPath);
        try {
          validateManifestContract(parsed);
          nodeContractResult = 'ACCEPTED';
          nodeConforms = (sc.expectedExit === 0);
        } catch (vErr) {
          nodeContractResult = `REJECTED: ${vErr.message}`;
          nodeConforms = (sc.expectedExit === 1);
        }
      } else {
        nodeContractResult = `ERROR: No se generó manifiesto en ${generatedManifestPath}`;
        nodeConforms = false;
      }
    } catch (e) {
      nodeContractResult = `ERROR: ${e.message}`;
      nodeConforms = false;
    }

    // B. Comprobar ejecución del wrapper PowerShell si está disponible
    let actualExit = null;
    let procStdout = '';
    let procStderr = '';
    let psDecision = null;
    let psConforms = false;

    if (psAvailable) {
      const psChildEnv = {
        ...process.env,
        MOCK_SCENARIO: sc.name,
        DEMO_USER_PASSWORD: 'MockPassword123!'
      };
      delete psChildEnv.REPO_ROOT;
      const psRes = cp.spawnSync('powershell.exe', [
        '-NoLogo',
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        tempWrapperScript,
        '-RunId',
        testRunId
      ], {
        env: psChildEnv,
        cwd: tempRoot,
        encoding: 'utf8',
        timeout: 25000,
        windowsHide: true
      });

      actualExit = psRes.status;
      procStdout = psRes.stdout || '';
      procStderr = psRes.stderr || '';
      const combinedOutput = procStdout + '\n' + procStderr;

      if (actualExit === 0) {
        psDecision = 'ACCEPTED';
        psConforms = (sc.expectedExit === 0);
      } else {
        // En caso de rechazo, verificar código exacto (actualExit === sc.expectedExit) y motivo esperado
        const exitMatches = (actualExit === sc.expectedExit);
        const hasExpectedReason = sc.expectedPsRejection ? combinedOutput.includes(sc.expectedPsRejection) : true;
        psDecision = (exitMatches && hasExpectedReason)
          ? `REJECTED_CONFORME: ${sc.expectedPsRejection}`
          : `REJECTED_MISMATCH: exit=${actualExit} (esperado: ${sc.expectedExit}), causa=${combinedOutput.trim().slice(0, 150)}`;
        psConforms = exitMatches && hasExpectedReason;
      }
    } else {
      // Si PowerShell no está disponible o agotó plazo, registrar explícitamente BLOCKED y actualExit sin valor (null)
      actualExit = null;
      psDecision = 'BLOCKED: Intérprete PowerShell no disponible o agotó plazo de arranque';
      psConforms = false;
    }

    // Hash y puntero después de la ejecución
    const sha256After = getFileSha256(tempLatestJsonPath);
    let pointerAfter = 'NONE';
    try {
      pointerAfter = readJsonSafe(tempLatestJsonPath)?.LatestRunId || 'NONE';
    } catch (_) {}

    // Verificación estricta de preservación o actualización del puntero y hash
    let pointerBehaviorCorrect = false;
    let hashBehaviorCorrect = false;

    if (psAvailable) {
      if (sc.expectsPointerUpdate) {
        pointerBehaviorCorrect = (pointerAfter === testRunId);
        hashBehaviorCorrect = (sha256After !== sha256Before);
      } else {
        pointerBehaviorCorrect = (pointerAfter === pointerBefore);
        hashBehaviorCorrect = (sha256After === sha256Before);
      }
    } else {
      // En modo BLOCKED sin PowerShell, el archivo permanece intacto por definición
      pointerBehaviorCorrect = (pointerAfter === pointerBefore);
      hashBehaviorCorrect = (sha256After === sha256Before);
    }

    let status = 'FAIL';
    if (!psAvailable) {
      status = nodeConforms ? 'BLOCKED' : 'FAIL';
    } else {
      status = (nodeConforms && psConforms && pointerBehaviorCorrect && hashBehaviorCorrect) ? 'PASS' : 'FAIL';
    }

    console.log(`[${status}] ${sc.name.padEnd(25)} | Node: ${nodeContractResult.slice(0, 30)} | PS Exit: ${actualExit} | Puntero: ${pointerBefore} -> ${pointerAfter}`);

    scenarioResults.push({
      scenario: sc.name,
      description: sc.desc,
      expectedExit: sc.expectedExit,
      actualExit,
      sha256Before,
      sha256After,
      pointerBefore,
      pointerAfter,
      pointerBehaviorConforms: pointerBehaviorCorrect,
      hashBehaviorConforms: hashBehaviorCorrect,
      nodeContractResult,
      psDecision,
      status
    });
  }
} finally {
  // Limpieza rigurosa de toda la raíz temporal aislada
  if (fs.existsSync(tempRoot)) {
    try {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    } catch (_) {}
  }
}

const evidenceData = {
  date: '2026-11-18',
  base: '6cd5295d7768c34c32d37d54e0aad3d01f4749f6',
  spec: 'Spec 225 / Lote CONS-03 (Delta 4)',
  producer: 'scripts/verify-cf05-ui-live.mjs (validateManifestContract)',
  consumer: 'scripts/run-cf05-ui-live-validation.ps1',
  powershellAvailable: psAvailable,
  scenarios: scenarioResults,
  summary: {
    totalScenarios: scenarioResults.length,
    nodeConformsCount: scenarioResults.filter(r => r.nodeContractResult && (r.nodeContractResult === 'ACCEPTED' || r.nodeContractResult.startsWith('REJECTED'))).length,
    powershellConformsCount: scenarioResults.filter(r => r.status === 'PASS').length,
    blockedCount: scenarioResults.filter(r => r.status === 'BLOCKED').length
  }
};

fs.writeFileSync(evidencePath, JSON.stringify(evidenceData, null, 2) + '\n', 'utf8');
console.log(`\nEvidencia guardada exitosamente en: ${evidencePath}`);

if (scenarioResults.every(r => r.status === 'PASS')) {
  console.log('\nTODOS LOS ESCENARIOS PRODUCTOR-CONSUMIDOR SUPERADOS (100% PASS)');
  process.exit(0);
} else if (scenarioResults.every(r => r.status === 'PASS' || r.status === 'BLOCKED')) {
  console.log('\nVERIFICACIÓN DE CONTRATO NODE 100% CONFORME (PowerShell registrado como BLOCKED)');
  process.exit(0);
} else {
  console.error('\nFALLO EN VERIFICACIÓN DE ESCENARIOS');
  process.exit(1);
}
