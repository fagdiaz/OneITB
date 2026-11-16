# Tasks: Candidate Freeze and Pre-Defense Gate

## Phase 1 - Setup

- [x] T001 Activate `specs/218-candidate-freeze-predefense-gate` in `.specify/feature.json`
- [x] T002 Create the validated release specification in `specs/218-candidate-freeze-predefense-gate/spec.md`
- [x] T003 Create the evidence contract and bounded execution guide in `specs/218-candidate-freeze-predefense-gate/contracts/release-candidate-evidence-contract.md` and `quickstart.md`
- [x] T004 Capture branch, remotes, status, tool versions, and baseline identity in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`

## Phase 2 - Foundational Candidate Hygiene

- [x] T005 Classify every modified and untracked path in `specs/218-candidate-freeze-predefense-gate/evidence/candidate-manifest.md`
- [x] T006 Audit intended tracked content for credentials, generated logs, uploads, patches, and unintended binaries and record redacted results in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T007 Verify ignored local prerequisites are represented in `docs/audit/RUNBOOK_DEV.md` without exposing values
- [x] T008 Resolve or explicitly block every unexplained path before candidate freeze in `specs/218-candidate-freeze-predefense-gate/evidence/candidate-manifest.md`

## Phase 3 - User Story 1: Unambiguous Candidate Content (P1)

- [x] T009 [US1] Run `git diff --check` and repository residue checks and store results in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T010 [US1] Confirm production and acceptance Compose files parse without secret expansion in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T011 [US1] Review migration, package-lock, and generated-asset changes for ownership and reproducibility in `specs/218-candidate-freeze-predefense-gate/evidence/candidate-manifest.md`
- [x] T012 [US1] Record whether CF-01 and CF-02 are PASS, FAIL, or BLOCKED in `docs/project_docs/ROADMAP.md`

## Phase 4 - User Story 2: Reproducible Automated Gate (P1)

- [x] T013 [P] [US2] Run the backend Release build and full >=234 test suite and record exact counts in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T014 [P] [US2] Run the frontend production build and full >=252 test suite and record exact counts in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T015 [US2] Run EF pending-model-change validation and record the result in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T016 [US2] Run runtime dependency audit and classify each finding in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T017 [US2] Execute guarded Redis/Mailpit local acceptance with cleanup and record the result in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T018 [US2] Execute guarded demo database, canonical login, GraphQL, and upload validation without reset and record the result in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T019 [US2] Verify no temporary process, port, container, file, or environment mutation leaked after automation in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T020 [US2] Record CF-03 status only from the complete same-content gate in `docs/project_docs/ROADMAP.md`

## Phase 5 - User Story 3: Defense-Critical Journeys (P2)

- [x] T021 [US3] Execute public plus six-role allow/deny browser matrix and record results in `specs/218-candidate-freeze-predefense-gate/evidence/manual-role-matrix.md`
- [ ] T022 [US3] Execute two isolated-session chat, notification, logout, replacement, and reconnect matrix in `specs/218-candidate-freeze-predefense-gate/evidence/manual-realtime-matrix.md`
- [ ] T023 [US3] Validate loading, empty, error, keyboard, responsive, theme, print, and console states for defense-critical journeys in `specs/218-candidate-freeze-predefense-gate/evidence/manual-role-matrix.md`
- [x] T024 [US3] Re-run all automation invalidated by any accepted release-blocking fix and append same-candidate evidence in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [ ] T025 [US3] Update CF-04 and CF-05 only from completed manual matrices in `docs/project_docs/ROADMAP.md`

## Phase 6 - User Story 4: Honest Candidate Freeze (P3)

- [ ] T026 [US4] Verify the worktree is clean and all mandatory evidence references one full SHA in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T027 [US4] Obtain explicit user approval for any commit, push, PR, or tag; record only resulting identifiers in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`
- [x] T028 [US4] Produce the offline recovery and defense snapshot inventory in `specs/218-candidate-freeze-predefense-gate/evidence/recovery-inventory.md`
- [x] T029 [US4] Synchronize release recommendation and residual external gates in `docs/audit/FINAL_AUDIT_REPORT.md`
- [ ] T030 [US4] Mark CF-06 and the Spec 218 state only when the freeze predicate passes in `docs/project_docs/ROADMAP.md` and this `tasks.md`

## Phase 7 - Documentation Closeout

- [x] T031 Add one evidence-backed Spec 218 entry below the introduction in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T032 Synchronize canonical document status in `docs/audit/DOCUMENTATION_STATUS.md`
- [x] T033 Validate Markdown links, Mermaid fences, terminology, metrics, and `git diff --check`
- [x] T034 State all unrun and blocked gates with owners and next actions in `specs/218-candidate-freeze-predefense-gate/evidence/evidence.md`

## Dependencies

- T001-T004 precede all other tasks.
- T005-T008 block candidate freeze and precede T026.
- T013-T020 may run on an unfrozen worktree as preflight, but must be rerun or bound to
  the final SHA before T026.
- T021-T025 require a stable runtime candidate and precede T026.
- T026-T030 require explicit user-controlled Git integration.
- T031-T034 close only after actual evidence status is known.

## Parallel Opportunities

- T013 and T014 may execute concurrently when host capacity is sufficient.
- Candidate manifest classification and script review may proceed in parallel, but neither
  can bypass unresolved path ownership.
- Manual role rows may be divided by role; the two-session matrix remains coordinated.

## Implementation Strategy

The first increment is a non-destructive preflight: candidate inventory plus automated
gates. Manual browser evidence follows after the source content stabilizes. Git freeze is
the final explicitly authorized operation, never a setup step.
