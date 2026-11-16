# Tasks: Responsive Header and Registration Normalization

## Phase 1: Setup and QA

- [x] T001 Point active feature metadata to `specs/177-responsive-header-and-normalization`
- [x] T002 Run Speckit QA preflight with builds for HIGH-risk mixed startup/frontend changes

## Phase 2: Frontend Header and Router

- [x] T003 [US1] Add responsive hamburger/mobile navigation state and close behavior in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- [x] T004 [US1] Harden header container spacing in `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- [x] T005 [US2] Enable React Router future flags in `FrontEnd/OneItb-FE/src/router/Routing.jsx`

## Phase 3: Registration Normalization

- [x] T006 [US3] Lowercase email before register mutation in `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
- [x] T007 [US3] Add backend email normalization helper in `API Graphql/Services/Users/UsersService.cs`
- [x] T008 [US3] Update registration normalization tests in `API Graphql/Tests/Services.Tests/Auth/UsersServiceTests.cs`

## Phase 4: Static File Headers

- [x] T009 [US4] Add static file response headers in `API Graphql/OneITB/Startup.cs`

## Phase 5: Validation and Documentation

- [x] T010 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`
- [x] T011 Run `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`
- [x] T012 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`
- [x] T013 Run `git -c core.autocrlf=false diff --check`
- [x] T014 Record evidence in `specs/177-responsive-header-and-normalization/evidence.md`
- [x] T015 Add one top entry to `docs/audit/DEVELOPMENT_LOG.md`

## Definition of Done

- [x] All tasks marked `[x]`
- [x] Backend build passes
- [x] Services tests pass
- [x] Frontend build passes
- [x] Diff check passes
- [x] Development log has one top Spec 177 entry
