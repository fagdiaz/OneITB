import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateGatingPolicy, resolveTargetSha, validateShaFormat, fetchWorkflowRunsFromApi } from '../scripts/verify-ci-gating.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const backendWorkflowPath = path.join(repoRoot, '.github', 'workflows', 'main_oneitbapi.yml');
const frontendWorkflowPath = path.join(repoRoot, '.github', 'workflows', 'azure-static-web-apps-agreeable-moss-01ccbda10.yml');
const qualityGatesPath = path.join(repoRoot, '.github', 'workflows', 'quality-gates.yml');
const sharedScriptPath = path.join(repoRoot, 'scripts', 'verify-ci-gating.mjs');

console.log('================================================================');
console.log('SUITE DE VERIFICACION DE GATING DE CI/CD (DELTA 2 CONS-02 / 18-11-2026)');
console.log('================================================================');

let passedTests = 0;
let totalTests = 0;

function assertTest(name, condition, details = {}) {
  totalTests++;
  process.stdout.write(`Ejecutando [Caso ${totalTests}]: ${name}... `);
  if (condition) {
    console.log('PASS');
    passedTests++;
  } else {
    console.log('FAIL');
    console.error('Detalles del fallo:', details);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// SECCIÓN 1: Existencia e Integridad de Archivos de Workflow y Script
// -----------------------------------------------------------------------------
assertTest(
  'Existencia de workflows canónicos y motor de política compartido en scripts/',
  fs.existsSync(backendWorkflowPath) &&
  fs.existsSync(frontendWorkflowPath) &&
  fs.existsSync(qualityGatesPath) &&
  fs.existsSync(sharedScriptPath),
  { backendWorkflowPath, frontendWorkflowPath, qualityGatesPath, sharedScriptPath }
);

const backendContent = fs.readFileSync(backendWorkflowPath, 'utf8');
const frontendContent = fs.readFileSync(frontendWorkflowPath, 'utf8');
const qualityGatesContent = fs.readFileSync(qualityGatesPath, 'utf8');

// -----------------------------------------------------------------------------
// SECCIÓN 2: Sintaxis YAML Válida en Condición de Frontend (CI-02)
// -----------------------------------------------------------------------------
const hasRawExclamation = /^\s*if:\s*![^$]/m.test(frontendContent);
const hasWrappedCondition = /if:\s*\$\{\{\s*!\(github\.event_name == 'pull_request' && github\.event\.action == 'closed'\)\s*\}\}/.test(frontendContent);

assertTest(
  'Sintaxis YAML válida en condición de frontend (CI-02: expresión envuelta ${{ !() }})',
  !hasRawExclamation && hasWrappedCondition,
  { hasRawExclamation, hasWrappedCondition }
);

// -----------------------------------------------------------------------------
// SECCIÓN 3: Desacoplamiento de Invocación y Ausencia de Interpolación en run: (CI-01)
// -----------------------------------------------------------------------------
const backendUsesSharedScript = backendContent.includes('run: node scripts/verify-ci-gating.mjs');
const frontendUsesSharedScript = frontendContent.includes('run: node scripts/verify-ci-gating.mjs');

function extractRunBlocks(yamlContent) {
  const lines = yamlContent.split('\n');
  const runLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*run:\s*/.test(line)) {
      runLines.push(line);
    }
  }
  return runLines;
}

const allRunLines = [...extractRunBlocks(backendContent), ...extractRunBlocks(frontendContent)];
const hasInterpolationInRun = allRunLines.some(line => /\$\{\{\s*github\.event/.test(line));

assertTest(
  'Manejo seguro: ejecución desacoplada via scripts/verify-ci-gating.mjs sin interpolación en run: (CI-01)',
  backendUsesSharedScript && frontendUsesSharedScript && !hasInterpolationInRun,
  { backendUsesSharedScript, frontendUsesSharedScript, hasInterpolationInRun }
);

// -----------------------------------------------------------------------------
// SECCIÓN 4: Procedencia Confiable del Juez y Guards de Entorno (CI-01/B)
// -----------------------------------------------------------------------------
// 1. Checkout del juez fijado a ref: 'main'
const backendJudgeFromMain = /Checkout Repository for Gating Policy from Trusted Main[\s\S]*?ref:\s*'main'/.test(backendContent);
const frontendJudgeFromMain = /Checkout Repository for Gating Policy from Trusted Main[\s\S]*?ref:\s*'main'/.test(frontendContent);

// 2. Guard explícito en deploy_production que rechaza PR independientemente de outputs
const frontendProdRejectsPr = /deploy_production:[\s\S]*?github\.event_name != 'pull_request'/.test(frontendContent);
const backendDeployGuarded = /deploy:[\s\S]*?github\.event_name == 'workflow_run' \|\| \(github\.event_name == 'workflow_dispatch' && github\.ref == 'refs\/heads\/main'\)/.test(backendContent);

assertTest(
  'Procedencia del juez desde ref: main y guard explícito contra pull_request en jobs productivos (CI-01/B)',
  backendJudgeFromMain && frontendJudgeFromMain && frontendProdRejectsPr && backendDeployGuarded,
  { backendJudgeFromMain, frontendJudgeFromMain, frontendProdRejectsPr, backendDeployGuarded }
);

// -----------------------------------------------------------------------------
// SECCIÓN 5: Validación de Formato SHA-40
// -----------------------------------------------------------------------------
const malformedShas = [
  'main', 'HEAD~1', 'origin/main', 'abc; rm -rf /', '$(whoami)',
  '111111111111111111111111111111111111111Z',
  '1111', '', null, undefined,
];
const VALID_SHA = '1111111111111111111111111111111111111111';
const allMalformedRejected = malformedShas.every(s => !validateShaFormat(s));
const validShaAccepted = validateShaFormat(VALID_SHA);

assertTest(
  'Función validateShaFormat: rechazo estricto de entradas no hexadecimales o malformadas',
  allMalformedRejected && validShaAccepted,
  { allMalformedRejected, validShaAccepted }
);

// -----------------------------------------------------------------------------
// SECCIÓN 6: Repositorio Ausente, Vacío o Untrusted
// -----------------------------------------------------------------------------
const nullLogger = { log: () => {}, error: () => {}, warn: () => {} };
const TRUSTED_REPO = 'OneITB/OneITB23';

async function testMissingRepo() {
  const resEmpty = await evaluateGatingPolicy({
    env: { GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REPOSITORY: '', GITHUB_REF: 'refs/heads/main', INPUT_TARGET_SHA: VALID_SHA },
    logger: nullLogger,
  });
  const resNull = await evaluateGatingPolicy({
    env: { GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REPOSITORY: 'null', GITHUB_REF: 'refs/heads/main', INPUT_TARGET_SHA: VALID_SHA },
    logger: nullLogger,
  });
  return !resEmpty.allowed && resEmpty.reason === 'MISSING_TRUSTED_REPO' &&
         !resNull.allowed && resNull.reason === 'MISSING_TRUSTED_REPO';
}
assertTest(
  'Política estricta de procedencia: repositorio ausente, vacío o null BLOQUEA inmediatamente',
  await testMissingRepo()
);

// -----------------------------------------------------------------------------
// SECCIÓN 7: workflow_run Rechaza Repositorios Untrusted
// -----------------------------------------------------------------------------
async function testWorkflowRunRepo() {
  const resMismatch = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_run',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      WORKFLOW_RUN_HEAD_SHA: VALID_SHA,
      WORKFLOW_RUN_CONCLUSION: 'success',
      WORKFLOW_RUN_BRANCH: 'main',
      WORKFLOW_RUN_REPO: 'attacker/OneITB23',
    },
    logger: nullLogger,
  });
  const resEmptyRepo = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_run',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      WORKFLOW_RUN_HEAD_SHA: VALID_SHA,
      WORKFLOW_RUN_CONCLUSION: 'success',
      WORKFLOW_RUN_BRANCH: 'main',
      WORKFLOW_RUN_REPO: '',
    },
    logger: nullLogger,
  });
  return !resMismatch.allowed && resMismatch.reason === 'WORKFLOW_RUN_UNTRUSTED_REPO' &&
         !resEmptyRepo.allowed && resEmptyRepo.reason === 'WORKFLOW_RUN_UNTRUSTED_REPO';
}
assertTest(
  'workflow_run: repositorio vacío o distinto a GITHUB_REPOSITORY BLOQUEA Producción',
  await testWorkflowRunRepo()
);

// -----------------------------------------------------------------------------
// SECCIÓN 8: workflow_run Rechaza Ramas Feature
// -----------------------------------------------------------------------------
async function testWorkflowRunFeatureBranch() {
  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_run',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      WORKFLOW_RUN_HEAD_SHA: VALID_SHA,
      WORKFLOW_RUN_CONCLUSION: 'success',
      WORKFLOW_RUN_BRANCH: 'feature/experimental',
      WORKFLOW_RUN_REPO: TRUSTED_REPO,
    },
    logger: nullLogger,
  });
  return !res.allowed && res.reason === 'WORKFLOW_RUN_NOT_MAIN';
}
assertTest(
  'workflow_run: conclusión success en rama feature/PR BLOQUEA Producción',
  await testWorkflowRunFeatureBranch()
);

// -----------------------------------------------------------------------------
// SECCIÓN 9: CRÍTICO CI-01/A — workflow_run Verifica Estado Vigente en API
// -----------------------------------------------------------------------------
// Si el payload del evento tiene success pero la API devuelve que un intento posterior falló
async function testWorkflowRunVerifiesCurrentStateFailure() {
  let fetchCalls = 0;
  const latestFailureRun = {
    id: 102,
    run_attempt: 1,
    head_sha: VALID_SHA,
    head_branch: 'main',
    status: 'completed',
    conclusion: 'failure', // Fallo posterior a run 101
    head_repository: { full_name: TRUSTED_REPO },
  };

  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_run',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      WORKFLOW_RUN_HEAD_SHA: VALID_SHA,
      WORKFLOW_RUN_CONCLUSION: 'success', // Evento stale con éxito antiguo
      WORKFLOW_RUN_BRANCH: 'main',
      WORKFLOW_RUN_REPO: TRUSTED_REPO,
    },
    fetchRuns: async () => {
      fetchCalls++;
      return [latestFailureRun];
    },
    logger: nullLogger,
  });

  return !res.allowed && res.reason === 'LATEST_RUN_NOT_SUCCESS' && res.runId === 102 && fetchCalls === 1;
}
assertTest(
  'workflow_run con éxito retrasado: consulta API vigente detecta fallo posterior (run 102) y BLOQUEA (CI-01/A)',
  await testWorkflowRunVerifiesCurrentStateFailure()
);

// -----------------------------------------------------------------------------
// SECCIÓN 10: workflow_run Verifica Estado Vigente Pending / In Progress
// -----------------------------------------------------------------------------
async function testWorkflowRunVerifiesCurrentStatePending() {
  let fetchCalls = 0;
  const latestPendingRun = {
    id: 103,
    run_attempt: 1,
    head_sha: VALID_SHA,
    head_branch: 'main',
    status: 'in_progress', // Intento en curso
    conclusion: null,
    head_repository: { full_name: TRUSTED_REPO },
  };

  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_run',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      WORKFLOW_RUN_HEAD_SHA: VALID_SHA,
      WORKFLOW_RUN_CONCLUSION: 'success',
      WORKFLOW_RUN_BRANCH: 'main',
      WORKFLOW_RUN_REPO: TRUSTED_REPO,
    },
    fetchRuns: async () => {
      fetchCalls++;
      return [latestPendingRun];
    },
    logger: nullLogger,
  });

  return !res.allowed && res.reason === 'LATEST_RUN_NOT_COMPLETED' && res.runId === 103 && fetchCalls === 1;
}
assertTest(
  'workflow_run con éxito retrasado: consulta API vigente detecta ejecución en curso (run 103) y BLOQUEA',
  await testWorkflowRunVerifiesCurrentStatePending()
);

// -----------------------------------------------------------------------------
// SECCIÓN 11: workflow_run Control Positivo Vigente
// -----------------------------------------------------------------------------
async function testWorkflowRunPositiveControl() {
  const latestSuccessRun = {
    id: 104,
    run_attempt: 1,
    head_sha: VALID_SHA,
    head_branch: 'main',
    status: 'completed',
    conclusion: 'success',
    head_repository: { full_name: TRUSTED_REPO },
  };

  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_run',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      WORKFLOW_RUN_HEAD_SHA: VALID_SHA,
      WORKFLOW_RUN_CONCLUSION: 'success',
      WORKFLOW_RUN_BRANCH: 'main',
      WORKFLOW_RUN_REPO: TRUSTED_REPO,
    },
    fetchRuns: async () => [latestSuccessRun],
    logger: nullLogger,
  });

  return res.allowed && res.deployEnv === 'Production' && res.runId === 104 && res.runAttempt === 1;
}
assertTest(
  'workflow_run control positivo: éxito vigente en API AUTORIZA Producción registrando run_id y attempt',
  await testWorkflowRunPositiveControl()
);

// -----------------------------------------------------------------------------
// SECCIÓN 12: CRÍTICO CI-01/B — workflow_dispatch desde Rama Feature es BLOQUEADO
// -----------------------------------------------------------------------------
async function testDispatchFromFeatureBranchBlocked() {
  const resFeature = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_dispatch',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      GITHUB_REF: 'refs/heads/feature/example', // Disparado desde feature
      INPUT_TARGET_SHA: VALID_SHA,
    },
    fetchRuns: async () => [{
      id: 105,
      head_sha: VALID_SHA,
      head_branch: 'main',
      status: 'completed',
      conclusion: 'success',
      head_repository: { full_name: TRUSTED_REPO },
    }],
    logger: nullLogger,
  });

  const resMissingRef = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_dispatch',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      GITHUB_REF: '', // Disparado sin ref (OBS-CI-01)
      INPUT_TARGET_SHA: VALID_SHA,
    },
    fetchRuns: async () => [{
      id: 105,
      head_sha: VALID_SHA,
      head_branch: 'main',
      status: 'completed',
      conclusion: 'success',
      head_repository: { full_name: TRUSTED_REPO },
    }],
    logger: nullLogger,
  });

  return !resFeature.allowed && resFeature.reason === 'DISPATCH_REF_NOT_MAIN' &&
         !resMissingRef.allowed && resMissingRef.reason === 'DISPATCH_REF_NOT_MAIN';
}
assertTest(
  'workflow_dispatch ejecutado desde rama feature es BLOQUEADO (exige GITHUB_REF refs/heads/main) (CI-01/B)',
  await testDispatchFromFeatureBranchBlocked()
);

// -----------------------------------------------------------------------------
// SECCIÓN 13: workflow_dispatch Precedencia del Intento Más Reciente
// -----------------------------------------------------------------------------
async function testDispatchPrecedence() {
  const runsFixture = [
    { id: 106, head_sha: VALID_SHA, head_branch: 'main', status: 'completed', conclusion: 'failure', head_repository: { full_name: TRUSTED_REPO } },
    { id: 101, head_sha: VALID_SHA, head_branch: 'main', status: 'completed', conclusion: 'success', head_repository: { full_name: TRUSTED_REPO } },
  ];

  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_dispatch',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      GITHUB_REF: 'refs/heads/main',
      INPUT_TARGET_SHA: VALID_SHA,
    },
    fetchRuns: async () => runsFixture,
    logger: nullLogger,
  });

  return !res.allowed && res.reason === 'LATEST_RUN_NOT_SUCCESS' && res.runId === 106;
}
assertTest(
  'workflow_dispatch: fallo posterior en main (run 106) BLOQUEA éxito antiguo (run 101)',
  await testDispatchPrecedence()
);

// -----------------------------------------------------------------------------
// SECCIÓN 14: CRÍTICO CI-01/C — Timeout HTTP Real con AbortSignal
// -----------------------------------------------------------------------------
async function testHttpRequestAbortSignalAndTimeout() {
  let suppliedSignal = false;
  let signalAborted = false;

  // Mock fetch que valida que se le pasa signal y simula una conexión detenida/lenta
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (url, options) => {
    suppliedSignal = !!options?.signal;
    return new Promise((resolve, reject) => {
      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          signalAborted = true;
          const err = new Error('HTTP request timed out after 50ms');
          err.name = 'AbortError';
          reject(err);
        });
      }
    });
  };

  let timedOut = false;
  try {
    await fetchWorkflowRunsFromApi(TRUSTED_REPO, VALID_SHA, '', { requestTimeoutMs: 50 });
  } catch (err) {
    if (err.message.includes('timed out') || err.name === 'AbortError') {
      timedOut = true;
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  return suppliedSignal && signalAborted && timedOut;
}
assertTest(
  'Capa HTTP con AbortSignal: fetch pasa signal y aborta peticiones detenidas dentro del plazo (CI-01/C)',
  await testHttpRequestAbortSignalAndTimeout()
);

// -----------------------------------------------------------------------------
// SECCIÓN 15: Error de API GitHub BLOQUEA con Diagnóstico Auditable
// -----------------------------------------------------------------------------
async function testApiErrorHandling() {
  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'workflow_dispatch',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      GITHUB_REF: 'refs/heads/main',
      INPUT_TARGET_SHA: VALID_SHA,
    },
    fetchRuns: async () => { throw new Error('HTTP 500 Internal Server Error'); },
    logger: nullLogger,
  });
  return !res.allowed && res.reason === 'API_QUERY_ERROR';
}
assertTest(
  'Manejo de errores: fallo HTTP 500 / red en consulta de API BLOQUEA de forma segura',
  await testApiErrorHandling()
);

// -----------------------------------------------------------------------------
// SECCIÓN 16: PR Preview Polling Lifecycle (queued -> in_progress -> success)
// -----------------------------------------------------------------------------
async function testPrPollingSuccess() {
  let callCount = 0;
  const pollTimeline = [
    [{ id: 201, head_sha: VALID_SHA, status: 'queued', conclusion: null, head_repository: { full_name: TRUSTED_REPO } }],
    [{ id: 201, head_sha: VALID_SHA, status: 'in_progress', conclusion: null, head_repository: { full_name: TRUSTED_REPO } }],
    [{ id: 201, head_sha: VALID_SHA, status: 'completed', conclusion: 'success', head_repository: { full_name: TRUSTED_REPO } }],
  ];

  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'pull_request',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      PR_HEAD_SHA: VALID_SHA,
      PR_HEAD_REPO: TRUSTED_REPO,
    },
    fetchRuns: async () => {
      const current = pollTimeline[Math.min(callCount, pollTimeline.length - 1)];
      callCount++;
      return current;
    },
    sleep: async () => {},
    maxAttempts: 10,
    intervalMs: 10,
    logger: nullLogger,
  });

  return res.allowed && res.deployEnv === 'Preview' && res.runId === 201 && callCount === 3;
}
assertTest(
  'PR Preview: ciclo de vida con polling (queued -> in_progress -> success) AUTORIZA Preview en intento 3',
  await testPrPollingSuccess()
);

// -----------------------------------------------------------------------------
// SECCIÓN 17: PR Preview Fork Externo BLOQUEA
// -----------------------------------------------------------------------------
async function testPrExternalFork() {
  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'pull_request',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      PR_HEAD_SHA: VALID_SHA,
      PR_HEAD_REPO: 'external-fork/OneITB23',
    },
    logger: nullLogger,
  });
  return !res.allowed && res.reason === 'PR_EXTERNAL_FORK_BLOCKED';
}
assertTest(
  'PR Preview: pull request originado en fork externo es BLOQUEADO para aislamiento estricto de secretos',
  await testPrExternalFork()
);

// -----------------------------------------------------------------------------
// SECCIÓN 18: PR Preview Timeout BLOQUEA
// -----------------------------------------------------------------------------
async function testPrPollingTimeout() {
  const res = await evaluateGatingPolicy({
    env: {
      GITHUB_EVENT_NAME: 'pull_request',
      GITHUB_REPOSITORY: TRUSTED_REPO,
      PR_HEAD_SHA: VALID_SHA,
      PR_HEAD_REPO: TRUSTED_REPO,
    },
    fetchRuns: async () => [{ id: 205, head_sha: VALID_SHA, status: 'in_progress', conclusion: null, head_repository: { full_name: TRUSTED_REPO } }],
    sleep: async () => {},
    maxAttempts: 3,
    intervalMs: 10,
    logger: nullLogger,
  });
  return !res.allowed && res.reason === 'PR_QG_TIMEOUT';
}
assertTest(
  'PR Preview: timeout tras agotar intentos máximos sin conclusión de QG BLOQUEA el despliegue',
  await testPrPollingTimeout()
);

console.log('================================================================');
console.log(`RESULTADO DE GATING CI/CD: ${passedTests} / ${totalTests} pruebas superadas (100% PASS)`);
console.log('================================================================');
process.exit(0);
