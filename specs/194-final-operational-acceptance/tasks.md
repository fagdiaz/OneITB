# Tasks: Final Operational Acceptance

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/acceptance-gates.md`

**Rule**: A gate is checked only after its evidence is recorded. External-provider absence is `[B]`, never an inferred pass.

## Phase 1: Planning and preflight

- [x] T001 Create Spec 194, quality checklist and active feature pointer.
- [x] T002 Produce plan, research, data model, acceptance contract and quickstart.
- [x] T003 Run cross-artifact analysis and close critical/high planning gaps.
- [x] T004 Run risk-based Speckit QA before implementation.
- [x] T005 Inventory Docker health, ports, process baseline and required configuration-key presence without values.

## Phase 2: Reproducible validation tooling

- [x] T006 [US1] Add `scripts/validate-predefense.ps1` with finite baseline gates.
- [x] T007 [US1] Add hidden temporary-host lifecycle with readiness deadline and `finally` cleanup.
- [x] T008 [US1] Add sanitized gate reporting and a bounded run-owned temporary directory.
- [x] T009 [US1] Document the one-command workflow and failure diagnostics in `docs/audit/RUNBOOK_DEV.md`.

## Phase 3: Automated baseline

- [x] T010 [US1] Execute the complete backend suite.
- [x] T011 [US1] Execute the complete frontend suite.
- [x] T012 [US1] Execute .NET Release and Vite production builds.
- [x] T013 [US1] Execute EF pending-model, Docker/compose, dependency and diff checks.
- [x] T014 [US1] Record process/fixture cleanup and baseline results in `evidence.md`.

## Phase 4: Security runtime acceptance

- [x] T015 [US2] Validate valid upload plus hostile and truncated fixtures through HTTP.
- [x] T016 [US2] Validate dedicated Magic Link request/redemption thresholds and recovery with process-only limits.
- [x] T017 [US2] Validate generic Magic Link response, Development pickup delivery, digest/replay and URL cleanup where automatable.
- [x] T018 [US2] Validate silenced publication like/unlike with zero reaction and notification delta.
- [x] T019 [US2] Scan generated logs/evidence for credential or personal-data leakage.

## Phase 5: Pagination, cancellation and authorization

- [x] T020 [US3] Validate schema absence of the unbounded social field.
- [x] T021 [US3] Validate feed pagination limit/order/deduplication and next-page behavior.
- [x] T022 [US3] Validate profile/admin server-side author filtering.
- [x] T023 [US3] Validate academic student limit/order/authorization and next page.
- [x] T024 [US3] Validate cancellation remains controlled and write-free.

## Phase 6: Browser, session and realtime acceptance

- [x] T025 [US4] Start backend/Vite as controlled processes and verify readiness.
- [x] T026 [US4] Execute role journeys for Student, Professor, Graduate, Moderator, Administrator and Employer where credentials permit. Moderator was blocked because the canonical seeder has no such identity.
- [x] T027 [US4] Execute session A -> logout -> B and verify identity/cache/message/notification isolation.
- [ ] T028 [US4] Validate chat/notification realtime behavior with two sessions where environment permits. **BLOCKED**: no isolated second browser context and Redis is not configured.
- [x] T029 [US4] Validate institutional fallback for provider/bootstrap failures through automated browser-compatible coverage.
- [x] T030 [US4] Capture application-owned console errors/warnings and record visual-only gates separately.
- [x] T031 [US4] Stop all acceptance-owned processes and verify port release.

## Phase 7: External provider gates

- [x] T032 [US2] Inspect SMTP/Redis/Cloudinary configuration-key presence without printing values.
- [ ] T033 [US2] Execute real SMTP smoke if configured; otherwise mark exact blocker. **BLOCKED**: real SMTP settings are absent.
- [ ] T034 [US4] Execute distributed Redis subscription/limiter smoke if configured; otherwise mark exact blocker. **BLOCKED**: Redis connection settings are absent.
- [ ] T035 [US2] Execute Cloudinary upload/read/delete smoke if configured; otherwise mark exact blocker. **BLOCKED**: Cloudinary URL/settings are absent.

## Phase 8: Final audit and documentation

- [x] T036 Re-run affected tests/builds after any defect corrections.
- [x] T037 Run final Speckit analysis against spec/plan/tasks and implementation evidence.
- [x] T038 Update `FINAL_AUDIT_REPORT.md` case-by-case from executed evidence.
- [x] T039 Recalculate `ROADMAP.md` without promoting blocked or unexecuted gates.
- [x] T040 Add exactly one Spec 194 entry at the top of `DEVELOPMENT_LOG.md`.
- [x] T041 Update `DOCUMENTATION_STATUS.md` and `RUNBOOK_DEV.md`.
- [x] T042 Verify chronological log order, Markdown consistency, `git diff --check` and repository hygiene.

## Definition of Done

- [x] All controllable critical/high gates are executed successfully.
- [x] Every blocked external gate names its exact missing configuration.
- [x] Backend/frontend tests and builds pass.
- [x] EF model has no pending changes.
- [x] No acceptance-owned process or fixture remains.
- [x] Canonical documents agree on `[V]`, `[I]` and `[B]`.
