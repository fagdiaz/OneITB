---
name: "speckit-stabilize"
description: "Exhaustive QA audit gate, documentary normalization, transient depuration, and certified commit/push release closeout for OneITB23 specs (.NET 8 + React 18). Prioritizes pre-QA checks since last stabilization, blocks commit/push upon any defect by generating a detailed STABILIZATION_REPORT, and closes out the feature cleanly when 100% verified."
compatibility: "Requires spec-kit project structure with .specify/ directory and PowerShell runtime."
metadata:
  author: "github-spec-kit"
  source: "skills/speckit-stabilize/SKILL.md"
---

# Speckit Stabilize & Release Closeout Gate - OneITB23

Perform an exhaustive, multi-tier QA audit, documentary normalization, safe transient depuration, and certified commit/push closeout for OneITB23 (.NET 8 HotChocolate GraphQL backend + React 18 Vite frontend).

```text
                                  ┌────────────────────────┐
                                  │   speckit-stabilize    │
                                  └───────────┬────────────┘
                                              │
                                  ┌───────────▼────────────┐
                                  │ Phase 1: Preflight QA  │◄─── [.NET + React Builds & Tests]
                                  │ & Diff from Last Stable│
                                  └───────────┬────────────┘
                                              │
                                   Is QA 100% Clean & Passing?
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
               [NO: Any Blocker]                               [YES: 100% PASS]
                      │                                               │
        ┌─────────────▼──────────────┐                 ┌──────────────▼─────────────┐
        │ Block Commit & Push        │                 │ Phase 3: Doc Normalization │
        │ Generate Audit Report:     │                 │ & Safe Transient Cleanup   │
        │ STABILIZATION_REPORT_*.md  │                 └──────────────┬─────────────┘
        │ Detail Pending Items       │                                │
        └─────────────┬──────────────┘                 ┌──────────────▼─────────────┐
                      │                                │ Phase 4: Git Commit & Push │
                      ▼                                │ Feature-Scoped Remote Sync │
               Iterate Fixes                           └──────────────┬─────────────┘
                      │                                               │
                      ▼                                ┌──────────────▼─────────────┐
            Re-run speckit-stabilize                   │ Phase 5: Sync prompt.txt   │
                                                       │ & Model Handoff Protocol   │
                                                       └────────────────────────────┘
```

---

## Boundary & Scope

- **Exhaustive QA Scope**: Evaluates all .NET 8 backend code, EF Core entities/migrations, React 18 / Apollo frontend code, Vitest suite, and documentation changed since the last stabilization entry in `docs/audit/DEVELOPMENT_LOG.md`.
- **Absolute Immutability**: `docs/audit/DEVELOPMENT_LOG.md` is strictly **IMMUTABLE** against deletion or clearing. It must only receive newest-first additions.
- **Runtime Secret Protection**: `.env`, `FrontEnd/OneItb-FE/.env`, and `Credenciales Oneitb.txt` must NEVER be staged or committed.
- **Fail-Safe Gate**: If any test fails, compilation breaks, pending model changes exist, secrets leak, or tasks are left uncompleted, commit/push is **STRICTLY BLOCKED**.

---

## Phase 1: Ingestion & Dual-Stack Preflight

1. **Resolve Active Feature Context**:
   - Read `.specify/feature.json` to identify the active feature directory.
   - Read the active feature's `spec.md`, `plan.md`, `tasks.md`, and evidence.
   - Read `.specify/memory/constitution.md` and `AGENTS.md`.
   - Inspect the newest entry in `docs/audit/DEVELOPMENT_LOG.md`.

2. **Run Automated Preflight Script**:
   Execute from the repository root:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
   & ".agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1" -RunTests $true
   ```

3. **Verify the 8 Stabilization Gates**:
   - **Gate 1: `git-diff-check`**: Working tree formatting and CRLF/LF check.
   - **Gate 2: `secret-leak-and-untracked-configs`**: Zero secrets or environment files staged.
   - **Gate 3: `backend-dotnet-build`**: .NET 8 Release build with 0 errors (`dotnet build 'API Graphql/OneITB/GraphQL.csproj' -c Release`).
   - **Gate 4: `frontend-vite-build`**: React 18 production build (`npm run build` in `FrontEnd/OneItb-FE`).
   - **Gate 5: `backend-regression-suite`**: 100% PASS on xUnit/Services tests (234 tests).
   - **Gate 6: `frontend-regression-suite`**: 100% PASS on Vitest frontend tests (252 tests).
   - **Gate 7: `ef-pending-model-changes`**: Verifies no unmigrated EF Core entity changes exist.
   - **Gate 8: `speckit-dod-compliance`**: Confirms 0 open tasks in `tasks.md` and an entry in `DEVELOPMENT_LOG.md`.

---

## Phase 2: Decision Gate

### IF ANY GATES FAIL (Status: BLOCKED)
1. **STOP**: Do NOT proceed to git commit or push.
2. **Generate Stabilization Report**: Create `docs/audit/STABILIZATION_REPORT_<YYYYMMDD_HHMMSS>.md`.
3. Inform the operator of the exact blockers and iterate.

### IF ALL GATES PASS (Status: PASS / CERTIFIED)
Proceed through Phases 3 to 5:

---

## Phase 3: Normalization & Safe Depuration

1. **Documentary Normalization**:
   - Verify `docs/audit/DEVELOPMENT_LOG.md` has the newest entry.
   - Verify `docs/project_docs/ROADMAP.md` reflects updated spec state.
2. **Execute Transient Cleanup**:
   ```powershell
   & ".agents/skills/speckit-stabilize/scripts/cleanup_transients.ps1"
   ```

---

## Phase 4: Safe Git Commit & Feature-Scoped Push

1. Inspect `git status` to ensure only intended files are staged.
2. Commit with standardized semantic message: `feat/fix/docs(<scope>): <message> (Spec NNN)`.
3. Push to tracking branch.

---

## Phase 5: Handoff Protocol & `prompt.txt` Synchronization

Update `prompt.txt` with:
- Timestamp and certified spec.
- Full test metrics (Backend 234/234 PASS, Frontend 252/252 PASS).
- Recommended model for the next session.
