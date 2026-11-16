# Tasks: P2 Closure QA

**Input**: Design documents from `specs/138-p2-closure-qa/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required. This spec exists to add unit tests and prove documentation quality.

**Roadmap targets**: Module 8 item `Pruebas unitarias del backend` and academic documentation closeout.

## Phase 1: Setup and Baseline

**Purpose**: Confirm active feature, baseline health and current architecture before modifying docs/tests.

- [x] T001 Record active feature, branch decision, dirty worktree baseline and Docker-free test strategy in `specs/138-p2-closure-qa/evidence.md`
- [x] T002 Verify requirement checklist in `specs/138-p2-closure-qa/checklists/requirements.md`
- [x] T003 Run baseline `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result
- [x] T004 Run baseline `npm.cmd run build` from `FrontEnd/OneItb-FE` and record result
- [x] T005 Inspect current entity/service graph named by this spec before editing `docs/academic/04-design-diagrams.md`

---

## Phase 2: User Story 1 - Arquitectura P2 documentada (Priority: P1)

**Goal**: Replace `04-design-diagrams.md` with current Mermaid diagrams for ER, SIU sync and notifications Pub/Sub.

**Independent Test**: Markdown contains syntactically valid Mermaid blocks for the three requested diagrams and matches current code entities/services.

- [x] T006 [US1] Overwrite `docs/academic/04-design-diagrams.md` with complete ER Mermaid diagram
- [x] T007 [US1] Add `syncSiuGrades` sequence Mermaid diagram to `docs/academic/04-design-diagrams.md`
- [x] T008 [US1] Add notification Pub/Sub architecture Mermaid diagram to `docs/academic/04-design-diagrams.md`
- [x] T009 [US1] Validate Mermaid block fences and entity names in `docs/academic/04-design-diagrams.md`

---

## Phase 3: User Story 2 - Servicios academicos protegidos por tests (Priority: P2)

**Goal**: Add xUnit tests for `AcademicService` authorization, ownership, SIU upsert and notifications.

**Independent Test**: `dotnet test "API Graphql/OneITB/OneITB.sln" -c Release` executes and passes AcademicService tests without SQL Server Docker.

- [x] T010 [US2] Create xUnit test project `API Graphql/Tests/Services.Tests/Services.Tests.csproj`
- [x] T011 [US2] Add `API Graphql/Tests/Services.Tests/Services.Tests.csproj` to `API Graphql/OneITB/OneITB.sln`
- [x] T012 [US2] Create EF Core InMemory and seed helpers in `API Graphql/Tests/Services.Tests/TestSupport/ServiceTestData.cs`
- [x] T013 [US2] Seed academic and notification graphs in `API Graphql/Tests/Services.Tests/TestSupport/ServiceTestData.cs`
- [x] T014 [US2] Add `AcademicServiceTests` in `API Graphql/Tests/Services.Tests/Academic/AcademicServiceTests.cs`
- [x] T015 [US2] Cover non-manager rejection before saving progress in `AcademicServiceTests`
- [x] T016 [US2] Cover non-student and outside-career rejection in `AcademicServiceTests`
- [x] T017 [US2] Cover manager progress upsert and notification call in `AcademicServiceTests`
- [x] T018 [US2] Cover admin-only SIU sync, skip summary and idempotent upsert in `AcademicServiceTests`

---

## Phase 4: User Story 3 - Notificaciones protegidas por tests (Priority: P3)

**Goal**: Add xUnit tests for `NotificationService` preferences, read state, owner scoping and Pub/Sub fault tolerance.

**Independent Test**: `dotnet test "API Graphql/OneITB/OneITB.sln" -c Release` executes and passes NotificationService tests without SQL Server Docker.

- [x] T019 [US3] Add `NotificationServiceTests` in `API Graphql/Tests/Services.Tests/Notifications/NotificationServiceTests.cs`
- [x] T020 [US3] Cover default preference creation for every `NotificationType`
- [x] T021 [US3] Cover disabled preference suppression and active-user filtering
- [x] T022 [US3] Cover owner-scoped `MarkReadAsync` and `MarkAllReadAsync`
- [x] T023 [US3] Cover persistence survives `ITopicEventSender.SendAsync` failure

---

## Phase 5: Validation and Documentation Closeout

**Purpose**: Prove tests and docs, then synchronize canonical project state.

- [x] T024 Run `dotnet test "API Graphql/OneITB/OneITB.sln" -c Release` and record result
- [x] T025 Run final `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result
- [x] T026 Run final `npm.cmd run build` from `FrontEnd/OneItb-FE` and record result
- [x] T027 Run `git diff --check`, no-pending-task scan, and secret scan over changed/new non-spec files
- [x] T028 Update `docs/project_docs/ROADMAP.md` to mark backend unit tests as started/implemented only if `dotnet test` passes
- [x] T029 Update `docs/audit/DOCUMENTATION_STATUS.md` with spec 138 evidence
- [x] T030 Insert exactly one newest-first entry for spec 138 in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T031 Update `specs/138-p2-closure-qa/evidence.md` with commands, outputs and residual risk
- [x] T032 Mark all tasks complete and verify spec 138 is the first `DEVELOPMENT_LOG.md` entry

## Dependencies & Execution Order

- Phase 1 blocks all implementation.
- Phase 2 can complete independently before tests.
- Phase 3 test project setup blocks Phase 4.
- Phase 5 requires diagrams and tests completed.

## Definition Of Done

- [x] All required tasks are marked `[x]`.
- [x] `04-design-diagrams.md` contains Mermaid ER, SIU sequence and Pub/Sub diagrams.
- [x] Backend unit tests for `AcademicService` and `NotificationService` pass.
- [x] Tests do not require Docker SQL or secrets.
- [x] Backend and frontend builds pass.
- [x] Roadmap, development log and documentation status are synchronized from evidence.
- [x] No secrets, runtime logs or generated artifacts outside source/test/docs are tracked.
