# Tasks: Student Enrollment Onboarding

**Input**: Design documents from `specs/204-student-enrollment-onboarding/`

## Phase 1: Setup

- [x] T001 Audit all career-association writers in `API Graphql/OneITB/GraphQL/Mutation.cs`, `FrontEnd/OneItb-FE/src/Components/onboarding/AcademicOnboarding.jsx`, and `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [x] T001A Close the public-registration bypass in `API Graphql/Services/Users/UsersService.cs` and `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
- [x] T002 Finalize the compatibility contract in `specs/204-student-enrollment-onboarding/contracts/academic-enrollment.md`

## Phase 2: Foundational

- [x] T003 Create the enrollment service boundary in `API Graphql/Services/Academic/IStudentEnrollmentService.cs` and `API Graphql/Services/Academic/StudentEnrollmentService.cs`
- [x] T004 Register the service and explicit provider mode in `API Graphql/OneITB/Startup.cs`
- [x] T005 Run the risk-based authorization, EF and state preflight and record it in `specs/204-student-enrollment-onboarding/evidence/evidence.md`

## Phase 3: User Story 1 - Confirm one active career (P1)

**Independent Test**: A zero-career Student cancels once, confirms once and reaches the
private area only after the current profile returns exactly one association.

- [x] T006 [P] [US1] Add cardinality and atomicity tests in `API Graphql/Tests/Services.Tests/Academic/StudentEnrollmentServiceTests.cs`
- [x] T007 [US1] Implement current-actor, active-career and one-selection enforcement in `API Graphql/Services/Academic/StudentEnrollmentService.cs`
- [x] T008 [US1] Expose the role-aware confirmation operation in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [x] T009 [P] [US1] Add selection and confirmation tests in `FrontEnd/OneItb-FE/src/Components/onboarding/AcademicOnboarding.test.jsx`
- [x] T010 [US1] Implement the accessible single-selection and confirmation flow in `FrontEnd/OneItb-FE/src/Components/onboarding/AcademicOnboarding.jsx`
- [x] T011 [US1] Require a matching canonical profile before navigation in `FrontEnd/OneItb-FE/src/Components/onboarding/academicOnboardingState.js`
- [x] T012 [US1] Keep the Microsoft-to-onboarding handoff in a non-interactive loading state in `FrontEnd/OneItb-FE/src/Components/user/Login.jsx` and `FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectCallback.jsx`

## Phase 4: User Story 2 - Reconcile over-scoped Students (P1)

**Independent Test**: A Student with three careers is blocked, explicitly chooses one and
retains all three if persistence fails.

- [x] T013 [P] [US2] Add legacy multi-career guard tests in `FrontEnd/OneItb-FE/src/Components/onboarding/RequireAcademicOnboarding.test.jsx`
- [x] T014 [US2] Route zero- and multi-career Students to reconciliation through `FrontEnd/OneItb-FE/src/Components/onboarding/academicOnboardingState.js`, consumed by `RequireAcademicOnboarding.jsx`
- [x] T015 [P] [US2] Add Student versus non-Student editor tests in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.test.tsx`
- [x] T016 [US2] Enforce role-aware career selection in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [x] T017 [US2] Keep the legacy list mutation fail-closed for Student bypass attempts in `API Graphql/OneITB/GraphQL/Mutation.cs`

## Phase 5: User Story 3 - Institutional provider extension point (P2)

**Independent Test**: Manual mode succeeds locally; unavailable provider mode returns an
explicit non-success result and never fabricates enrollment.

- [x] T018 [P] [US3] Add provider contract tests in `API Graphql/Tests/Services.Tests/Academic/InstitutionalEnrollmentProviderTests.cs`
- [x] T019 [US3] Add normalized provider types in `API Graphql/Services/Academic/InstitutionalEnrollmentModels.cs`
- [x] T020 [US3] Implement the explicit manual/unavailable provider in `API Graphql/Services/Academic/ManualInstitutionalEnrollmentProvider.cs`
- [x] T021 [US3] Document the future authoritative flow in `docs/project_docs/architecture-and-design.md` and `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`

## Phase 6: Validation and Closeout

- [x] T022 Run backend tests/build and EF drift check and record commands in `specs/204-student-enrollment-onboarding/evidence/evidence.md`
- [x] T023 Run frontend tests/build and record commands in `specs/204-student-enrollment-onboarding/evidence/evidence.md`
- [ ] T024 **BLOCKED - manual acceptance**: execute the institutional Student browser scenarios from `specs/204-student-enrollment-onboarding/quickstart.md` after restarting the runtime with this build
- [x] T025 Update the Spec 204 status in `docs/project_docs/ROADMAP.md`
- [x] T026 Replace the planning entry with one completed Spec 204 entry in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T027 Update `docs/audit/DOCUMENTATION_STATUS.md` and final evidence without claiming a real ITB/SIU provider

## Dependencies & Execution Order

`T001-T005 -> US1 -> US2 -> US3 -> T022-T027`. US3 model/test work can run in parallel
with the frontend portion of US2 after the service boundary exists.

## Definition Of Done

- [ ] Every required task is complete and evidenced; T024 remains a user-controlled browser gate.
- [x] Student cardinality is enforced in backend and both frontend entry points.
- [x] Failure and concurrent/idempotent cases preserve the previous associations.
- [x] Builds, tests and EF drift gate pass.
- [ ] Browser acceptance confirms one career from onboarding through profile/feed.
- [x] External provider status is described honestly.
