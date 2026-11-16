# Tasks: Demo Database Rebaseline

## Phase 1: Baseline and safety

- [x] T001 Record Git state and preserve unrelated changes
- [x] T002 Verify Docker target, database name, published port, secrets presence, and migration state
- [x] T003 Execute baseline backend tests/build and frontend tests/build
- [x] T004 Add ignored `backups/local-demo/` path

## Phase 2: Canonical seed

- [x] T005 [US1] Extend `EnterpriseDemoSeeder.cs` with academic resources/progress
- [x] T006 [US1] Add CV, preferences, social interactions, and report seed phases
- [x] T007 [US1] Preserve stable IDs, password semantics, cancellation, and tracker clearing
- [x] T008 [US1] Expand `EnterpriseDemoSeederTests.cs` for complete graph and double-seed stability

## Phase 3: Operational automation

- [x] T009 [US1] Add guarded `scripts/reset-demo-database.ps1`
- [x] T010 [US1] Add finite sanitized `scripts/validate-demo-database.ps1`
- [x] T011 [US1] Create and verify timestamped backup before destructive work
- [x] T012 [US1] Stop only identified local API/Vite processes holding the environment
- [x] T013 [US1] Drop only `OneItb`, apply migrations, and seed from non-versioned configuration
- [x] T014 [US1] Execute the seed twice and compare inventories

## Phase 4: Integrity and runtime acceptance

- [x] T015 [US1] Verify FK integrity, duplicate keys, attachment XOR, and comment depth
- [x] T016 [US2] Authenticate one canonical identity per six roles
- [x] T017 [US2] Smoke feed, academic, chat, notifications, jobs, and admin/moderation contracts
- [x] T018 [US2] Verify upload and logout/session replacement
- [x] T019 [US2] Ensure all temporary processes terminate or intentionally leave audited local services available

## Phase 5: Documentation reconciliation

- [x] T020 [US3] Update `RUNBOOK_DEV.md` with rebaseline/reset/recovery guidance
- [x] T021 [US3] Reconcile architecture, requirements, academic diagrams, and final document
- [x] T022 [US3] Update Roadmap, final audit, documentation status, and one top development-log entry

## Phase 6: Final quality gates

- [x] T023 Run backend tests and Release build
- [x] T024 Run frontend tests and Vite build
- [x] T025 Verify EF migrations and zero pending model changes
- [x] T026 Run `git diff --check` and secret/backup hygiene checks
- [x] T027 Complete `evidence.md` with sanitized actual results
- [x] T028 Run cross-artifact analysis and resolve all critical/high findings

## Definition Of Done

- [x] Backup exists, passed `RESTORE VERIFYONLY`, and has a recorded checksum
- [x] Database was rebuilt from migrations only
- [x] Second seed produced identical inventory counts
- [x] Six of six role logins returned the expected role
- [x] Integrity audit returned zero violations
- [x] EF reports no model drift
- [x] Backend and frontend tests/builds pass
- [x] Canonical documentation and diagrams match the runtime model
- [x] No secret, backup, upload, or runtime log is tracked
- [x] All tasks are marked complete and evidence reflects commands actually executed
