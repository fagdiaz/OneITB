---
name: "speckit-stabilize"
description: "Exhaustive QA audit gate, documentary normalization, transient depuration, and certified release closeout for OneITB23 specs (.NET 8 + React 18). Blocks certification upon any defect by generating a detailed STABILIZATION_REPORT, and closes out the feature cleanly when 100% verified."
compatibility: "Requires spec-kit project structure with .specify/ directory and PowerShell runtime."
metadata:
  author: "github-spec-kit"
  source: "skills/speckit-stabilize/SKILL.md"
---

# Speckit Stabilize & Release Closeout Gate - OneITB23

Perform an exhaustive, multi-tier QA audit, documentary normalization, safe transient depuration, and certified release closeout for OneITB23 (.NET 8 HotChocolate GraphQL backend + React 18 Vite frontend).

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
        │ Block Certification        │                 │ Phase 3: Doc Normalization │
        │ Generate Audit Report:     │                 │ & Safe Transient Cleanup   │
        │ STABILIZATION_REPORT_*.md  │                 └──────────────┬─────────────┘
        │ Detail Pending Items       │                                │
        └─────────────┬──────────────┘                 ┌──────────────▼─────────────┐
                      │                                │ Phase 4: Presentation Gate │
                      ▼                                │ (User Git Authorization)   │
               Iterate Fixes                           └──────────────┬─────────────┘
                      │                                               │
                      ▼                                ┌──────────────▼─────────────┐
            Re-run speckit-stabilize                   │ Phase 5: Sync prompt.txt   │
                                                       │ & Model Handoff Protocol   │
                                                       └────────────────────────────┘
```

---

## 1. Boundary & Scope

- **Exhaustive QA Scope**: Evaluates all .NET 8 backend code, EF Core entities/migrations, React 18 / Apollo frontend code, Vitest suite, oxlint static analysis, and documentation changed since the last stabilization entry in `docs/audit/DEVELOPMENT_LOG.md`.
- **Absolute Immutability**: `docs/audit/DEVELOPMENT_LOG.md` is strictly **IMMUTABLE** against deletion or clearing. It must only receive newest-first additions.
- **Runtime Secret Protection**: `.env`, `FrontEnd/OneItb-FE/.env`, and `Credenciales Oneitb.txt` must NEVER be staged or committed.
- **Fail-Safe Gate**: If any test fails, compilation breaks, pending model changes exist, secrets leak, or tasks are left uncompleted, certification is **STRICTLY BLOCKED**.
- **No Automatic Commits or Pushes**: Only the USER can authorize or execute a commit or push. The stabilization process ends with a certified report.

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
   & ".agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1" -RunTests $true -Certify
   ```

3. **Verify the 9 Stabilization Gates**:
   - **Gate 1: `git-diff-check`**: Working tree formatting and CRLF/LF check.
   - **Gate 2: `secret-leak-and-untracked-configs`**: Zero secrets or environment files staged.
   - **Gate 3: `backend-dotnet-build`**: .NET 8 Release build with 0 errors (`dotnet build 'API Graphql/OneITB/GraphQL.csproj' -c Release`).
   - **Gate 4: `frontend-vite-build`**: React 18 production build (`npm run build` in `FrontEnd/OneItb-FE`).
   - **Gate 5: `backend-regression-suite`**: 100% PASS on xUnit/Services tests (234 tests, compiled with `--no-restore`).
   - **Gate 6: `frontend-regression-suite`**: 100% PASS on Vitest frontend tests (258 tests).
   - **Gate 7: `frontend-oxlint-check`**: Zero errors and zero warnings across frontend files.
   - **Gate 8: `ef-pending-model-changes`**: Verifies no unmigrated EF Core entity changes exist.
   - **Gate 9: `speckit-dod-compliance`**: Validates feature directory exists, 0 open tasks in `tasks.md`, and entry in `DEVELOPMENT_LOG.md`.

---

## Phase 2: Decision Gate

### IF ANY GATES FAIL OR ARE SKIPPED (Status: BLOCKED)
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

## Phase 4: Presentation & Authorization Gate (No Automatic Git Operations)

1. Inspect `git status` to ensure only intended files are in index/worktree.
2. Present the certified preflight evidence and stabilization status to the USER.
3. **DO NOT** commit or push automatically. The USER retains exclusive authority to approve or execute a Git commit and push.

---

## Phase 5: Handoff Protocol & `prompt.txt` Synchronization

Update `prompt.txt` with:
- Timestamp and certified spec.
- Full test metrics (Backend 234/234 PASS, Frontend 258/258 PASS, 0 oxlint warnings).
- Current checked-out Git branch and commit SHA.
- Recommended model and reasoning level for the next session.
