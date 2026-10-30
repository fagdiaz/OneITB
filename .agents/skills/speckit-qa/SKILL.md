---
name: "speckit-qa"
description: "Risk-based pre-implementation quality gate for OneITB23 specs. Use after plan/tasks and before speckit-implement to catch contract mismatches, security/authorization gaps, unsafe EF migrations, React/Apollo state risks, missing tests, and broken baseline builds without performing an exhaustive audit for low-risk changes."
---

# Speckit QA

Review and improve the active feature before implementation. Be strict on security and contracts, proportional on cost, and surgical on scope.

## Boundary

- Inspect the plan, tasks, and only the source contracts they affect.
- Patch `tasks.md` and, only when contradictory, `plan.md` or `spec.md`.
- Do not implement production code.
- Do not promise zero defects. Return evidence and residual risk.
- Do not refactor unrelated debt.

## 1. Load Minimal Context

Read:

1. `.specify/feature.json`.
2. Active `spec.md`, `plan.md`, `tasks.md`, and requirement checklists.
3. `.specify/memory/constitution.md`.
4. `docs/project_docs/ROADMAP.md`, focusing on the current closure gate and the matching module or gap.

Use `rg` to inspect only paths, types, operations, and interfaces named by the feature. Do not read the full development log, generated migration designers, `bin`, `obj`, `dist`, or `node_modules`.

## 2. Classify Risk

Use the highest applicable level:

- **LOW**: documentation, copy, isolated styling, no contract or state change.
- **MEDIUM**: local React behavior, shared component, query selection, non-sensitive service logic.
- **HIGH**: authentication, authorization, privacy, admin/moderation, GraphQL schema, EF model/migration, uploads, secrets, external identity/adapters, background workers, WebSockets, Apollo cache/shared state, dependencies, startup/configuration.

Escalate when blast radius is unclear.

## 3. Run Deterministic Preflight

Run from repository root:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& ".agents/skills/speckit-qa/scripts/preflight.ps1"
```

Add `-RunBuilds` for MEDIUM/HIGH changes affecting source. Add `-CheckEf` only for entities, context, relationships, or migrations.

Reuse a build result from the current turn only if no affected source changed afterward. Do not run duplicate builds.

## 4. Apply Relevant Gates

Always verify task IDs, exact paths, dependency order, contract naming/nullability, reuse, configuration, negative paths, runtime evidence, and documentation closeout.

For MEDIUM or HIGH risk, read [risk-gates.md](references/risk-gates.md) and apply only the relevant headings. Do not load it for LOW risk.

## 5. Optimize Tasks

Patch only missing or unsafe steps. Prefer adding concise tasks over rewriting the file.

Required closeout for affected features:

- Targeted tests before or with implementation.
- Backend/frontend build commands as applicable.
- EF and GraphQL runtime checks as applicable.
- Browser verification for user-facing changes.
- Exact evidence recording, including blockers.
- Evidence-backed Roadmap status update and one top `DEVELOPMENT_LOG.md` entry at spec completion.
- `DOCUMENTATION_STATUS.md` update only when canonical status changes.

Do not paste the complete optimized `tasks.md` in the response; report changed task IDs.

## 6. Decision Rules

- **PASS**: no actionable gap; implementation may start.
- **FIXED**: tasks/artifacts were patched and all critical gates now pass.
- **BLOCKED**: stop before implementation when a requirement checklist is incomplete, baseline build is broken in affected scope, a HIGH-risk contract is ambiguous, or a critical security/data issue lacks a safe task.

Warnings outside the feature do not block unless they invalidate the baseline or increase its risk.

## Output (Concise)

```text
QA: PASS | FIXED | BLOCKED
Risk: LOW | MEDIUM | HIGH - reason
Preflight: checklist, diff, builds/EF actually run
Findings: only actionable P0/P1/P2 items with file references
Tasks changed: IDs or "none"
Residual risk: one short line
Proceed: yes/no
```

Keep the response under 25 lines unless blocked findings require detail.

## Token Discipline

- Prefer one `rg` query over broad file reads.
- Read relevant line windows, not whole large files.
- Use preflight JSON instead of narrating command output.
- Stop after one authoritative signal proves a gate.
- Skip backend, frontend, EF, browser, or security gates when the risk classification makes them irrelevant.
