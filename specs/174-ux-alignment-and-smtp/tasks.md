# Tasks: UX Alignment and SMTP

**Input**: Design documents from `/specs/174-ux-alignment-and-smtp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Backend and frontend builds are required. Runtime SMTP smoke is configuration-dependent and must be recorded as executed or blocked.

## Phase 1: Setup and Contracts

- [x] T001 Create Spec 174 artifacts under `specs/174-ux-alignment-and-smtp/`.
- [x] T002 Update `.specify/feature.json` to point at `specs/174-ux-alignment-and-smtp`.

## Phase 2: Backend Email Infrastructure

- [x] T003 [P] Create `IEmailSender` and SMTP settings under `API Graphql/OneITB/Services/Email/`.
- [x] T004 [P] Create `ConsoleEmailService` fallback under `API Graphql/OneITB/Services/Email/`.
- [x] T005 [P] Create `SmtpEmailService` under `API Graphql/OneITB/Services/Email/` using configuration only, with no hardcoded secrets.
- [x] T006 Register SMTP-or-console email sender in `API Graphql/OneITB/Startup.cs`.

## Phase 3: Job Application Notification

- [x] T007 Modify `API Graphql/OneITB/GraphQL/Mutation.cs` so `UpdateApplicationStatus` sends email on `Reviewed` and `Rejected` after persistence.
- [x] T008 Ensure SMTP delivery failures are logged without rolling back successful application status updates.

## Phase 4: UX Alignment

- [x] T009 Replace visible ATS wording in `FrontEnd/OneItb-FE/src/Components/jobs/EmployerJobOffers.jsx`.
- [x] T010 Replace the Nav employer route label in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`.
- [x] T011 Add immediate hover/active/disabled visual feedback to status buttons in `EmployerJobOffers.jsx`.

## Phase 5: Validation and Documentation

- [x] T012 Run backend build for `API Graphql/OneITB/GraphQL.csproj`.
- [x] T013 Run backend service tests when available.
- [x] T014 Run frontend build from `FrontEnd/OneItb-FE`.
- [x] T015 Run frontend tests if the environment permits and record blockers if not.
- [x] T016 Record command evidence in `specs/174-ux-alignment-and-smtp/evidence.md`.
- [x] T017 Insert one Spec 174 entry at the top of `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T018 Update `docs/audit/FINAL_AUDIT_REPORT.md` with the ephemeral jobs badge limitation.
- [x] T019 Update `docs/audit/DOCUMENTATION_STATUS.md` with Spec 174 evidence.
- [x] T020 Verify no tracked file contains real SMTP secrets.

## Dependencies & Execution Order

- T001-T002 before all implementation tasks.
- T003-T006 before T007-T008.
- T009-T011 can run in parallel with backend tasks.
- T012-T020 after implementation.

## Definition Of Done

- [x] All required tasks are marked `[x]`.
- [x] Backend build passes.
- [x] Frontend build passes.
- [x] No EF migration is generated.
- [x] Email behavior is documented with fallback and SMTP configuration path.
- [x] Development log remains newest-first.
