# Tasks: Presentation Runtime Baseline

**Input**: Design documents from `specs/130-presentation-runtime-baseline/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Runtime evidence is required. Compilation alone is insufficient.

## Phase 1: Setup and Evidence Baseline

- [x] T001 Record current git status and active feature in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T002 Classify every recurring entry from `Errores.txt` and `errores.txt` in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T003 Verify whether the active frontend bundle references stale link-preview REST endpoints in `FrontEnd/OneItb-FE/src/`
- [x] T004 Verify documented startup prerequisites in `docs/audit/RUNBOOK_DEV.md`

## Phase 2: User Story 1 - Reproducible Startup (Priority: P1)

**Goal**: Backend and frontend start through documented steps.

**Independent Test**: Start both apps from clean terminals and reach the authenticated feed.

- [x] T005 [US1] Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record output in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T006 [US1] Run `npm.cmd run build` from `FrontEnd/OneItb-FE` and record output in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T007 [US1] Start the backend with repository configuration and record startup result in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T008 [US1] Start the frontend with repository configuration and record startup result in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T009 [US1] Fix repository-owned startup blockers only after evidence identifies them in `API Graphql/OneITB/` or `FrontEnd/OneItb-FE/`
- [x] T010 [US1] Update `docs/audit/RUNBOOK_DEV.md` when startup remediation is confirmed

## Phase 3: User Story 2 - Console Ownership Classification (Priority: P1)

**Goal**: All current console entries are classified and app-owned findings are fixed.

**Independent Test**: Load the authenticated feed in a clean browser profile and compare console output before and after fixes.

- [x] T011 [US2] Capture clean-browser console output for login and feed in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T012 [US2] Fix application-owned console findings in the exact source files identified by T002 and T011
- [x] T013 [US2] Verify CORS behavior for documented local origins and record the result in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T014 [US2] Verify the active app no longer calls removed preview endpoints and record the result in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T015 [US2] Record external browser, extension, and third-party embed findings without suppressing them locally

## Phase 4: User Story 3 - Presentation Evidence Gate (Priority: P2)

**Goal**: Presentation-critical flows are verified or explicitly blocked.

**Independent Test**: Review `evidence.md` and confirm no item is silently assumed complete.

- [x] T016 [US3] Validate mini chat collapsed and chat open behavior in browser and record result in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T017 [US3] Validate YouTube/embed/media behavior in browser and record result in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T018 [US3] Validate upload/rich media display path when data is available and record result in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T019 [US3] Create follow-up spec activation notes for `131-media-embed-console-contract` and `132-realtime-chat-console-contract` when evidence proves remaining app-owned work

## Phase 5: Quality and Documentation

- [x] T020 Run the applicable QA preflight and record result in `specs/130-presentation-runtime-baseline/evidence.md`
- [x] T021 Update `docs/project_docs/ROADMAP.md` only from verified evidence
- [x] T022 Add exactly one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`
- [x] T023 Update `docs/audit/DOCUMENTATION_STATUS.md` if canonical status changes
- [x] T024 Verify `DEVELOPMENT_LOG.md` remains ordered newest to oldest

## Dependencies

- T001-T004 must complete before code changes.
- T005-T010 and T011-T015 can proceed after baseline classification.
- T016-T019 depend on startup and browser access.
- T020-T024 depend on validation evidence.

## Definition Of Done

- [x] All required tasks are checked.
- [ ] No application-owned console errors remain in login and authenticated feed on a clean browser profile. Blocked by SQL SSPI and HTTPS certificate in this environment.
- [x] Any external warnings are classified and not hidden by local suppression.
- [x] Backend and frontend build checks pass or blockers are documented.
- [x] Roadmap, development log, and documentation status reflect only verified evidence.
