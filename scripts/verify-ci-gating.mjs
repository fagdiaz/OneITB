#!/usr/bin/env node
import fs from 'node:fs';

/**
 * Shared CI/CD Deployment Gating Policy Engine (Spec 224 / CONS-02)
 * Guardian of production gating, branch origin, latest-attempt integrity,
 * and PR staging isolation for both Backend and Frontend workflows.
 */

export function resolveTargetSha(env = process.env) {
  const eventName = env.GITHUB_EVENT_NAME || '';
  let targetSha = '';

  if (eventName === 'pull_request') {
    targetSha = env.PR_HEAD_SHA || '';
  } else if (eventName === 'workflow_run') {
    targetSha = env.WORKFLOW_RUN_HEAD_SHA || '';
  } else if (env.INPUT_TARGET_SHA && env.INPUT_TARGET_SHA.trim() !== '') {
    targetSha = env.INPUT_TARGET_SHA.trim();
  } else {
    targetSha = env.DEFAULT_SHA || '';
  }

  return targetSha;
}

export function validateShaFormat(sha) {
  if (typeof sha !== 'string') return false;
  return /^[0-9a-fA-F]{40}$/.test(sha.trim());
}

export async function fetchWorkflowRunsFromApi(repo, targetSha, token, options = {}) {
  const requestTimeoutMs = options.requestTimeoutMs || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`HTTP request timed out after ${requestTimeoutMs}ms`));
  }, requestTimeoutMs);

  const url = `https://api.github.com/repos/${repo}/actions/workflows/quality-gates.yml/runs?head_sha=${targetSha}&per_page=30`;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'OneITB23-Gating-Verifier',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) {
      throw new Error(`GitHub API HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return data.workflow_runs || [];
  } catch (err) {
    if (err.name === 'AbortError' || controller.signal.aborted) {
      throw new Error(`GitHub API request timed out after ${requestTimeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function evaluateGatingPolicy(options = {}) {
  const env = options.env || process.env;
  const logger = options.logger || console;
  const requestTimeoutMs = options.requestTimeoutMs || 10000;
  const fetchRuns = options.fetchRuns || ((repo, sha, opts) => fetchWorkflowRunsFromApi(repo, sha, env.GH_TOKEN, opts || { requestTimeoutMs }));
  const sleep = options.sleep || ((ms) => new Promise(resolve => setTimeout(resolve, ms)));

  const eventName = env.GITHUB_EVENT_NAME || '';
  const trustedRepo = (env.GITHUB_REPOSITORY || '').trim();

  // 1. Strict Trusted Repository Validation (identidad ausente/vacía BLOQUEA)
  if (!trustedRepo || trustedRepo === 'null' || trustedRepo === 'undefined') {
    logger.error('::error::Trusted repository (GITHUB_REPOSITORY) is missing, empty, or undefined. Gating BLOCKED.');
    return { allowed: false, exitCode: 1, reason: 'MISSING_TRUSTED_REPO' };
  }

  // 2. Resolve and Validate Target Commit SHA
  const targetSha = resolveTargetSha(env);
  if (!validateShaFormat(targetSha)) {
    logger.error(`::error::Invalid target SHA: '${targetSha}'. Must be exactly 40 hexadecimal characters.`);
    return { allowed: false, exitCode: 1, reason: 'INVALID_SHA_FORMAT', targetSha };
  }

  // Determine deploy environment
  const deployEnv = eventName === 'pull_request' ? 'Preview' : 'Production';

  logger.log(`[CI-GATING] Evaluating ${eventName} for target SHA ${targetSha} -> Environment: ${deployEnv} (Trusted Repo: ${trustedRepo})`);

  // 3. Case A: workflow_run (Automated production deployment triggered by main Quality Gates)
  if (eventName === 'workflow_run') {
    const runConclusion = env.WORKFLOW_RUN_CONCLUSION;
    const runBranch = env.WORKFLOW_RUN_BRANCH;
    const runRepo = (env.WORKFLOW_RUN_REPO || '').trim();

    // Initial event payload check
    if (runConclusion !== 'success') {
      logger.error(`::error::Quality Gates workflow_run payload completed with conclusion '${runConclusion}'. Production deployment strictly blocked.`);
      return { allowed: false, exitCode: 1, reason: 'WORKFLOW_RUN_NOT_SUCCESS', conclusion: runConclusion };
    }

    if (runBranch !== 'main') {
      logger.error(`::error::Quality Gates workflow_run payload ran on branch '${runBranch}' (expected 'main'). Production deployment strictly blocked.`);
      return { allowed: false, exitCode: 1, reason: 'WORKFLOW_RUN_NOT_MAIN', branch: runBranch };
    }

    if (!runRepo || runRepo !== trustedRepo) {
      logger.error(`::error::Quality Gates workflow_run repository '${runRepo}' does not strictly match trusted repository '${trustedRepo}'. Production deployment blocked.`);
      return { allowed: false, exitCode: 1, reason: 'WORKFLOW_RUN_UNTRUSTED_REPO', repo: runRepo };
    }

    // Verify current state against API to guarantee that a subsequent attempt didn't fail or is pending
    logger.log(`[CI-GATING] Verifying current state of Quality Gates runs for SHA ${targetSha} on main...`);
    let runs;
    try {
      runs = await fetchRuns(trustedRepo, targetSha, { requestTimeoutMs });
    } catch (err) {
      logger.error(`::error::Failed to query GitHub API for current Quality Gates status: ${err.message}`);
      return { allowed: false, exitCode: 1, reason: 'API_QUERY_ERROR', error: err.message };
    }

    const mainRuns = (Array.isArray(runs) ? runs : []).filter(r => {
      const repoName = r.head_repository?.full_name || '';
      return r.head_sha === targetSha && r.head_branch === 'main' && repoName === trustedRepo;
    });

    if (mainRuns.length === 0) {
      logger.error(`::error::No verified Quality Gates runs found on main for SHA ${targetSha} in '${trustedRepo}'. Production deployment blocked.`);
      return { allowed: false, exitCode: 1, reason: 'NO_RUNS_ON_MAIN', targetSha };
    }

    mainRuns.sort((a, b) => (b.id || 0) - (a.id || 0));
    const latestRun = mainRuns[0];

    if (latestRun.status !== 'completed') {
      logger.error(`::error::Latest Quality Gates run #${latestRun.id} for SHA ${targetSha} on main is '${latestRun.status}' (not completed). Stale event rejected. Production deployment blocked.`);
      return { allowed: false, exitCode: 1, reason: 'LATEST_RUN_NOT_COMPLETED', runId: latestRun.id, status: latestRun.status };
    }

    if (latestRun.conclusion !== 'success') {
      logger.error(`::error::Latest Quality Gates run #${latestRun.id} for SHA ${targetSha} on main concluded with '${latestRun.conclusion}' (not success). Stale event rejected. Production deployment blocked.`);
      return { allowed: false, exitCode: 1, reason: 'LATEST_RUN_NOT_SUCCESS', runId: latestRun.id, conclusion: latestRun.conclusion };
    }

    logger.log(`[CI-GATING] PASS: Verified: Quality Gates run #${latestRun.id} (attempt ${latestRun.run_attempt || 1}) completed with success on main for SHA ${targetSha}.`);
    return {
      allowed: true,
      exitCode: 0,
      targetSha,
      deployEnv: 'Production',
      mode: 'workflow_run',
      runId: latestRun.id,
      runAttempt: latestRun.run_attempt || 1,
    };
  }

  // 4. Case B: workflow_dispatch (Manual dispatch to Production)
  if (eventName === 'workflow_dispatch') {
    const githubRef = (env.GITHUB_REF || '').trim();

    // Production manual dispatch must be executed strictly from 'refs/heads/main' (OBS-CI-01)
    if (!githubRef || githubRef !== 'refs/heads/main') {
      logger.error(`::error::Manual dispatch for Production must be triggered from 'refs/heads/main' (found GITHUB_REF: '${githubRef}'). Deployment blocked.`);
      return { allowed: false, exitCode: 1, reason: 'DISPATCH_REF_NOT_MAIN', ref: githubRef };
    }

    logger.log(`[CI-GATING] Manual dispatch to Production. Verifying latest Quality Gates run on main for SHA ${targetSha}...`);

    let runs;
    try {
      runs = await fetchRuns(trustedRepo, targetSha, { requestTimeoutMs });
    } catch (err) {
      logger.error(`::error::Failed to query GitHub API for Quality Gates runs: ${err.message}`);
      return { allowed: false, exitCode: 1, reason: 'API_QUERY_ERROR', error: err.message };
    }

    if (!Array.isArray(runs) || runs.length === 0) {
      logger.error(`::error::No Quality Gates runs found for SHA ${targetSha} in repository '${trustedRepo}'. Manual dispatch blocked.`);
      return { allowed: false, exitCode: 1, reason: 'NO_RUNS_FOUND', targetSha };
    }

    const mainRuns = runs.filter(r => {
      const runRepo = r.head_repository?.full_name || '';
      return r.head_sha === targetSha && r.head_branch === 'main' && runRepo === trustedRepo;
    });

    if (mainRuns.length === 0) {
      logger.error(`::error::No Quality Gates run found on branch 'main' in trusted repository for SHA ${targetSha}. Manual dispatch blocked.`);
      return { allowed: false, exitCode: 1, reason: 'NO_RUNS_ON_MAIN', targetSha };
    }

    mainRuns.sort((a, b) => (b.id || 0) - (a.id || 0));
    const latestRun = mainRuns[0];

    logger.log(`[CI-GATING] Selected most recent main run #${latestRun.id} (attempt ${latestRun.run_attempt || 1}, status: '${latestRun.status}', conclusion: '${latestRun.conclusion}')`);

    if (latestRun.status !== 'completed') {
      logger.error(`::error::Latest Quality Gates run #${latestRun.id} for SHA ${targetSha} on main is '${latestRun.status}' (not completed). Production deployment blocked.`);
      return { allowed: false, exitCode: 1, reason: 'LATEST_RUN_NOT_COMPLETED', runId: latestRun.id, status: latestRun.status };
    }

    if (latestRun.conclusion !== 'success') {
      logger.error(`::error::Latest Quality Gates run #${latestRun.id} for SHA ${targetSha} on main concluded with '${latestRun.conclusion}' (not success). Production deployment blocked.`);
      return { allowed: false, exitCode: 1, reason: 'LATEST_RUN_NOT_SUCCESS', runId: latestRun.id, conclusion: latestRun.conclusion };
    }

    logger.log(`[CI-GATING] PASS: Verified via GitHub API: Latest Quality Gates run #${latestRun.id} completed with conclusion 'success' on branch 'main' for SHA ${targetSha}.`);
    return {
      allowed: true,
      exitCode: 0,
      targetSha,
      deployEnv: 'Production',
      mode: 'workflow_dispatch',
      runId: latestRun.id,
      runAttempt: latestRun.run_attempt || 1,
    };
  }

  // 5. Case C: pull_request (PR Preview Staging Deployment)
  if (eventName === 'pull_request') {
    const prHeadRepo = (env.PR_HEAD_REPO || '').trim();

    if (!prHeadRepo || prHeadRepo !== trustedRepo) {
      logger.error(`::error::Pull Request originates from untrusted/external repository '${prHeadRepo}'. Preview deployment is strictly blocked for secret isolation.`);
      return { allowed: false, exitCode: 1, reason: 'PR_EXTERNAL_FORK_BLOCKED', prHeadRepo };
    }

    logger.log(`[CI-GATING] Pull Request preview deployment. Polling Quality Gates for SHA ${targetSha}...`);

    const maxAttempts = options.maxAttempts || 40;
    const intervalMs = options.intervalMs || 15000;
    let attempt = 1;

    while (attempt <= maxAttempts) {
      let runs;
      try {
        runs = await fetchRuns(trustedRepo, targetSha, { requestTimeoutMs });
      } catch (err) {
        logger.error(`::warning::API poll error on attempt ${attempt}: ${err.message}`);
        runs = [];
      }

      const matchingRuns = (Array.isArray(runs) ? runs : []).filter(r => {
        const runRepo = r.head_repository?.full_name || '';
        return r.head_sha === targetSha && runRepo === trustedRepo;
      });

      if (matchingRuns.length > 0) {
        matchingRuns.sort((a, b) => (b.id || 0) - (a.id || 0));
        const latestRun = matchingRuns[0];

        if (latestRun.status === 'completed') {
          if (latestRun.conclusion === 'success') {
            logger.log(`[CI-GATING] PASS: Quality Gates run #${latestRun.id} completed with success for SHA ${targetSha}.`);
            return {
              allowed: true,
              exitCode: 0,
              targetSha,
              deployEnv: 'Preview',
              mode: 'pull_request',
              runId: latestRun.id,
            };
          } else {
            logger.error(`::error::Quality Gates run #${latestRun.id} completed with '${latestRun.conclusion}'. Preview deployment blocked.`);
            return { allowed: false, exitCode: 1, reason: 'PR_QG_FAILED', runId: latestRun.id, conclusion: latestRun.conclusion };
          }
        } else {
          logger.log(`[CI-GATING] Quality Gates run #${latestRun.id} status is '${latestRun.status}' (attempt ${attempt}/${maxAttempts}). Waiting...`);
        }
      } else {
        logger.log(`[CI-GATING] Quality Gates run not yet registered for ${targetSha} (attempt ${attempt}/${maxAttempts}). Waiting...`);
      }

      await sleep(intervalMs);
      attempt++;
    }

    logger.error(`::error::Timed out after ${maxAttempts} attempts waiting for Quality Gates to pass for SHA ${targetSha}.`);
    return { allowed: false, exitCode: 1, reason: 'PR_QG_TIMEOUT', targetSha };
  }

  logger.error(`::error::Unhandled GitHub event: '${eventName}'. Gating blocked.`);
  return { allowed: false, exitCode: 1, reason: 'UNHANDLED_EVENT', eventName };
}

// CLI Execution Entry Point
if (process.argv[1] && process.argv[1].endsWith('verify-ci-gating.mjs')) {
  evaluateGatingPolicy()
    .then(result => {
      if (result.allowed) {
        if (process.env.GITHUB_OUTPUT) {
          fs.appendFileSync(process.env.GITHUB_OUTPUT, `target_sha=${result.targetSha}\n`);
          fs.appendFileSync(process.env.GITHUB_OUTPUT, `deploy_env=${result.deployEnv}\n`);
        }
        process.exit(0);
      } else {
        process.exit(result.exitCode || 1);
      }
    })
    .catch(err => {
      console.error('::error::Fatal unexpected error in gating policy:', err);
      process.exit(1);
    });
}
