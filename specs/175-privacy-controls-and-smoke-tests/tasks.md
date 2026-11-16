# Tasks: Privacy Controls and SMTP Smoke Tests

**Input**: Design documents from `specs/175-privacy-controls-and-smoke-tests/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Include build, EF, GraphQL and browser/runtime attempts. Compilation alone is insufficient.

## Phase 1: Setup and QA

- [X] T001 Point `.specify/feature.json` and `AGENTS.md` to `specs/175-privacy-controls-and-smoke-tests/plan.md`
- [X] T002 Run Speckit QA preflight for high-risk authorization/schema changes

## Phase 2: Backend Privacy Foundation

- [X] T003 [US1] Add `IsPublicProfile` default true to `API Graphql/Entities/Models/User.cs`
- [X] T004 [US1] Configure `IsPublicProfile` in `API Graphql/Data/OneItbContext.cs`
- [X] T005 [US1] Generate EF migration `AddUserProfilePrivacy`
- [X] T006 [US1] Add profile privacy fields to DTOs in `API Graphql/Services/DTOs.cs`
- [X] T007 [US1] Add user profile privacy update service method in `API Graphql/Services/Users/UsersService.cs`
- [X] T008 [US1] Add `toggleProfilePrivacy` mutation in `API Graphql/OneITB/GraphQL/Mutation.cs`

## Phase 3: Backend Privacy Enforcement

- [X] T009 [US2] Enforce profile masking in `GetPublicProfile` in `API Graphql/OneITB/GraphQL/Query.cs`
- [X] T010 [US2] Enforce private-profile search masking in `SearchPublicProfiles` in `API Graphql/OneITB/GraphQL/Query.cs`
- [X] T011 [US2] Expose `isPublicProfile` on GraphQL `User` type in `API Graphql/OneITB/Startup.cs`

## Phase 4: SMTP Smoke Test

- [X] T012 [US3] Add admin-only `testSmtpConnection` GraphQL operation in `API Graphql/OneITB/GraphQL/Query.cs`
- [X] T013 [US3] Validate email input and return controlled errors without leaking secrets

## Phase 5: Frontend

- [X] T014 [US1] Update Apollo profile queries/mutations in `FrontEnd/OneItb-FE/src/data/graphql/`
- [X] T015 [US1] Add privacy switch to `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [X] T016 [US2] Add private-profile notice to `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`

## Phase 6: Documentation and Validation

- [X] T017 Update `docs/project_docs/ROADMAP.md`, `docs/audit/DEVELOPMENT_LOG.md`, `docs/audit/DOCUMENTATION_STATUS.md`, and audit docs
- [X] T018 Run backend build, backend tests, EF pending-model check, frontend build and `git diff --check`
- [X] T019 Attempt runtime GraphQL/browser smoke; record executed checks and blockers in `specs/175-privacy-controls-and-smoke-tests/evidence.md`
- [X] T020 Stage and commit the completed feature without committing ignored agent/tooling artifacts

## Dependencies & Execution Order

- T001-T002 precede source edits.
- T003-T008 precede T009-T013.
- T014-T016 depend on backend GraphQL contract.
- T017-T020 close the feature.

## Definition Of Done

- [X] All required tasks are marked `[X]`
- [X] EF migration exists and model has no pending changes
- [X] Backend and frontend builds pass
- [X] Privacy is enforced backend-side
- [X] SMTP smoke test is admin-only
- [X] Documentation and commit are complete
