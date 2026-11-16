# Tasks: Spec 166 Roadmap Quality Closure

## Phase 1: SDD and Audit

- [x] T001 Activate Spec 166 in `.specify/feature.json`.
- [x] T002 [P] Create SDD artifacts in `specs/166-roadmap-quality-closure/`.
- [x] T003 [P] Record initial roadmap/docs audit in `specs/166-roadmap-quality-closure/audit/initial-audit.md`.

## Phase 2: Auth Regression Tests (US1)

- [x] T004 [US1] Extend shared fixtures in `API Graphql/Tests/Services.Tests/TestSupport/ServiceTestData.cs`.
- [x] T005 [US1] Add registration and admin-protection tests in `API Graphql/Tests/Services.Tests/Auth/UsersServiceTests.cs`.
- [x] T006 [US1] Add login/JWT/inactive-account tests in `API Graphql/Tests/Services.Tests/Auth/AccountsServiceTests.cs`.

## Phase 3: Feed Regression Tests (US2)

- [x] T007 [US2] Add feed scoping and ordering tests in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`.
- [x] T008 [US2] Add publication file URL validation tests in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`.
- [x] T009 [US2] Add nested-comment and reaction toggle tests in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`.
- [x] T010 [US2] Add muted-user publish/comment rejection tests in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`.

## Phase 4: CI and Documentation (US3)

- [x] T011 [US3] Add quality gate workflow in `.github/workflows/quality-gates.yml`.
- [x] T012 [US3] Align `docs/project_docs/scope-and-requirements.md` with implemented academic resources, SIU and notifications.
- [x] T013 [US3] Align `docs/project_docs/architecture-and-design.md` with current academic resource category/version/search state and runtime limits.
- [x] T014 [US3] Update `docs/audit/RUNBOOK_DEV.md` with CI/local quality gates if needed.

## Phase 5: Validation and Closeout

- [x] T015 Run `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`.
- [x] T016 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`.
- [x] T017 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- [x] T018 Run `git diff --check`.
- [x] T019 Record final evidence in `specs/166-roadmap-quality-closure/evidence.md` and final audit in `specs/166-roadmap-quality-closure/audit/final-audit.md`.
- [x] T020 Recalculate and update `docs/project_docs/ROADMAP.md` only for evidence-backed checklist changes.
- [x] T021 Add exactly one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T022 Update `docs/audit/DOCUMENTATION_STATUS.md`.
