# Tasks: Academic Module

**Input**: Design documents from `specs/136-academic-module/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Runtime validation is mandatory. Compilation alone is insufficient for GraphQL contracts, authorization, persistence, or browser-facing behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup and Baseline

**Purpose**: Confirm clean feature context and current runnable baseline before implementation.

- [x] T001 Record `git status --short` and current branch in `specs/136-academic-module/evidence.md`
- [x] T002 Verify active feature in `.specify/feature.json`, `AGENTS.md`, `specs/136-academic-module/spec.md`, and `specs/136-academic-module/plan.md`
- [x] T003 Verify Docker SQL is healthy with `docker compose ps` and record result in `specs/136-academic-module/evidence.md`
- [x] T004 Run baseline `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result in `specs/136-academic-module/evidence.md`
- [x] T005 Run baseline `npm.cmd run build` from `FrontEnd/OneItb-FE` and record result in `specs/136-academic-module/evidence.md`

---

## Phase 2: Foundational Academic Domain

**Purpose**: Add schema-safe academic entities and service contracts shared by all stories.

- [x] T006 [P] Create `AcademicProgressStatus` enum in `API Graphql/Entities/Models/AcademicProgressStatus.cs`
- [x] T007 [P] Create `AcademicResource` entity in `API Graphql/Entities/Models/AcademicResource.cs`
- [x] T008 [P] Create `AcademicProgress` entity in `API Graphql/Entities/Models/AcademicProgress.cs`
- [x] T009 Add academic navigation collections to `API Graphql/Entities/Models/User.cs` and `API Graphql/Entities/Models/Subject.cs`
- [x] T010 Map `AcademicResource` and `AcademicProgress` in `API Graphql/Data/OneItbContext.cs` with explicit FKs, indexes, constraints and `DeleteBehavior.Restrict`
- [x] T011 Add `DbSet<AcademicResource>` and `DbSet<AcademicProgress>` in `API Graphql/Data/OneItbContext.cs`
- [x] T012 [P] Create `IAcademicService` in `API Graphql/Services/Academic/IAcademicService.cs`
- [x] T013 Create `AcademicService` in `API Graphql/Services/Academic/AcademicService.cs` with authorization, validation, no N+1 query shapes and current-user access checks
- [x] T014 Register academic service in `API Graphql/OneITB/Startup.cs`

**Checkpoint**: EF model and service contracts are ready before exposing GraphQL.

---

## Phase 3: User Story 1 - Consultar recursos por materia (Priority: P1) MVP

**Goal**: Authorized users can read active subject resources independent from the feed.

**Independent Test**: Admin creates/loads a resource, then `academicResources(subjectId)` returns it for an authorized user and rejects/filters unauthorized access.

- [x] T015 [US1] Add `GetAcademicResources` query in `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T016 [US1] Add Apollo `GET_ACADEMIC_RESOURCES` query in `FrontEnd/OneItb-FE/src/data/graphql/queries/academic.js`
- [x] T017 [US1] Create `AcademicDashboard.jsx` resource list and career/subject selectors in `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
- [x] T018 [US1] Add private `/academic` route in `FrontEnd/OneItb-FE/src/router/Routing.jsx`
- [x] T019 [US1] Add navigation link to academic module in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx` or `SideBar.jsx`
- [x] T020 [US1] Execute live `academicResources(subjectId)` query against Docker SQL and record result in `specs/136-academic-module/evidence.md`

---

## Phase 4: User Story 2 - Publicar y retirar recursos académicos (Priority: P2)

**Goal**: Teachers and administrators can create and deactivate resources; students cannot.

**Independent Test**: Admin/professor creates a resource with file/link and sees it; student creation fails; deactivated resource disappears from normal list.

- [x] T021 [US2] Add `AddAcademicResource` and `ToggleAcademicResourceStatus` mutations in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [x] T022 [US2] Add Apollo `ADD_ACADEMIC_RESOURCE` and `TOGGLE_ACADEMIC_RESOURCE_STATUS` mutations in `FrontEnd/OneItb-FE/src/data/graphql/mutations/academic.js`
- [x] T023 [US2] Add resource creation form and optional upload flow to `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
- [x] T024 [US2] Add resource deactivate action for teacher/admin roles in `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
- [x] T025 [US2] Execute live create/deactivate resource GraphQL operations as admin/professor and record result in `specs/136-academic-module/evidence.md`
- [x] T026 [US2] Execute live negative student create resource case and record backend rejection in `specs/136-academic-module/evidence.md`

---

## Phase 5: User Story 3 - Consultar progreso y notas (Priority: P3)

**Goal**: Students see only their own progress; teachers/admins assign or update current progress records.

**Independent Test**: Admin/professor upserts progress for a student/subject; the student sees own progress; another student cannot read it; admin can read by user.

- [x] T027 [US3] Add `GetMyAcademicProgress`, `GetAcademicProgressForUser`, and `GetAcademicStudents` queries in `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T028 [US3] Add `UpsertAcademicProgress` mutation in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [x] T029 [US3] Add Apollo progress queries and mutation in `FrontEnd/OneItb-FE/src/data/graphql/queries/academic.js` and `FrontEnd/OneItb-FE/src/data/graphql/mutations/academic.js`
- [x] T030 [US3] Add progress list and teacher/admin assignment form in `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
- [x] T031 [US3] Execute live `upsertAcademicProgress`, `myAcademicProgress`, and `academicProgressForUser` operations and record results in `specs/136-academic-module/evidence.md`
- [x] T032 [US3] Execute live negative student read-other-progress case and record backend rejection in `specs/136-academic-module/evidence.md`

---

## Phase 6: Migration and Integration

**Purpose**: Persist schema in Docker SQL and ensure model snapshot is clean.

- [x] T033 Generate EF migration `AddAcademicModule` with `dotnet ef migrations add AddAcademicModule --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`
- [x] T034 Review generated migration in `API Graphql/Data/Migrations/*AddAcademicModule*.cs` for explicit restrictive FKs and no shadow properties
- [x] T035 Apply migration to Docker SQL with `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`
- [x] T036 Run `dotnet ef migrations has-pending-model-changes --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"` and record result

---

## Phase 7: Quality Gates and Documentation

**Purpose**: Validate and synchronize canonical project state.

- [x] T037 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result
- [x] T038 Run `npm.cmd run build` from `FrontEnd/OneItb-FE` and record result
- [x] T039 Run GraphQL schema smoke test `query { __typename }` against the running backend and record result
- [x] T040 Run `git diff --check` and `git status --short` and record result
- [x] T041 Update `docs/project_docs/ROADMAP.md` moving resources and progress/grades to `[x] [I]` only if implementation and validations support it
- [x] T042 Insert exactly one newest-first entry for spec 136 in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T043 Update `docs/audit/DOCUMENTATION_STATUS.md` with spec 136 status and remaining P2 gaps
- [x] T044 Verify `docs/audit/DEVELOPMENT_LOG.md` is newest-to-oldest and spec 136 is the first entry
- [x] T045 Final review that no secrets, runtime uploads, logs or unwanted artifacts are tracked

## Dependencies & Execution Order

- Phase 1 blocks all work.
- Phase 2 blocks GraphQL and frontend work.
- US1 is MVP and should complete before US2/US3 UI integration.
- US2 and US3 can be implemented after Phase 2, but final UX should share the same `AcademicDashboard`.
- Migration must be generated after all entity/DbContext changes and before runtime validation.
- Documentation updates depend on runtime/build evidence.

## Definition Of Done

- [x] All required tasks are marked `[X]`.
- [x] Academic resources are implemented and verified or explicitly recorded as blocked.
- [x] Academic progress/grades are implemented and verified or explicitly recorded as blocked.
- [x] Backend and frontend builds pass.
- [x] EF migration is applied to Docker SQL and model snapshot has no pending changes.
- [x] GraphQL authorization positive and negative cases are executed.
- [x] `ROADMAP.md`, `DEVELOPMENT_LOG.md`, and `DOCUMENTATION_STATUS.md` are synchronized from evidence.
- [x] No secrets, runtime uploads, logs or local-only trash are tracked.
