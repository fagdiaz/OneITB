# Tasks: SIU Sync and Notifications

**Input**: Design documents from `specs/137-siu-notifications/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Runtime validation is mandatory. Compilation alone is insufficient for GraphQL authorization, WebSocket delivery, notification persistence or SIU sync idempotency.

**Roadmap targets**: Module 7 items `Adaptador o simulador desacoplado para SIU Guarani` and `Preferencias de notificacion por materia`.

## Phase 1: Setup and Baseline

**Purpose**: Confirm active feature, clean baseline and existing subscription infrastructure.

- [x] T001 Record branch, `.specify/feature.json`, `git status --short`, and Docker SQL state in `specs/137-siu-notifications/evidence.md`
- [x] T002 Verify checklist status in `specs/137-siu-notifications/checklists/requirements.md`
- [x] T003 Run baseline `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result in `specs/137-siu-notifications/evidence.md`
- [x] T004 Run baseline `npm.cmd run build` from `FrontEnd/OneItb-FE` and record result in `specs/137-siu-notifications/evidence.md`

---

## Phase 2: Foundational Notification Domain

**Purpose**: Add persistent notification model and preferences before GraphQL fan-out.

- [x] T005 [P] Create `NotificationType` enum in `API Graphql/Entities/Models/NotificationType.cs`
- [x] T006 [P] Create `Notification` entity in `API Graphql/Entities/Models/Notification.cs`
- [x] T007 [P] Create `NotificationPreference` entity in `API Graphql/Entities/Models/NotificationPreference.cs`
- [x] T008 Add notification navigation collections to `API Graphql/Entities/Models/User.cs`
- [x] T009 Add `Notifications` and `NotificationPreferences` DbSets to `API Graphql/Data/OneItbContext.cs`
- [x] T010 Map notifications and preferences in `API Graphql/Data/OneItbContext.cs` with explicit restrictive FKs, enum conversion, indexes and unique preference key
- [x] T011 [P] Create notification topics/constants in `API Graphql/OneITB/GraphQL/Subscription.cs`
- [x] T012 [P] Create `INotificationService` in `API Graphql/Services/Notifications/INotificationService.cs`
- [x] T013 Create `NotificationService` in `API Graphql/Services/Notifications/NotificationService.cs`
- [x] T014 Register `INotificationService` in `API Graphql/OneITB/Startup.cs`

---

## Phase 3: User Story 1 - Synchronize institutional grades (Priority: P1)

**Goal**: Admin can run idempotent SIU grade synchronization for a subject.

**Independent Test**: Admin `syncSiuGrades(subjectId)` creates/updates progress records; student attempt is rejected; repeated run does not duplicate progress.

- [x] T015 [P] [US1] Create SIU DTOs in `API Graphql/Services/Siu/SiuGradeRecord.cs` and `API Graphql/Services/Siu/SiuSyncResult.cs`
- [x] T016 [P] [US1] Create `ISiuIntegrationService` in `API Graphql/Services/Siu/ISiuIntegrationService.cs`
- [x] T017 [US1] Create `MockSiuIntegrationService` in `API Graphql/Services/Siu/MockSiuIntegrationService.cs`
- [x] T018 [US1] Extend `IAcademicService` in `API Graphql/Services/Academic/IAcademicService.cs` with SIU sync operation
- [x] T019 [US1] Implement SIU sync in `API Graphql/Services/Academic/AcademicService.cs` using idempotent `AcademicProgress` upsert and skip summary
- [x] T020 [US1] Register `ISiuIntegrationService` in `API Graphql/OneITB/Startup.cs`
- [x] T021 [US1] Add admin-only `SyncSiuGrades` mutation in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [x] T022 [US1] Execute live admin and student-negative `syncSiuGrades` operations and record results in `specs/137-siu-notifications/evidence.md`

---

## Phase 4: User Story 2 - Receive academic notifications (Priority: P2)

**Goal**: Users receive persisted and live academic notifications for resource and progress events.

**Independent Test**: Creating a resource/progress event creates unread notifications and emits a private subscription event for affected users.

- [x] T023 [US2] Extend `Subscription` in `API Graphql/OneITB/GraphQL/Subscription.cs` with private `notificationReceived`
- [x] T024 [US2] Add `MyNotifications` and `UnreadNotificationCount` queries in `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T025 [US2] Add `MarkNotificationRead` and `MarkAllNotificationsRead` mutations in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [x] T026 [US2] Emit notifications from `AcademicService.AddAcademicResourceAsync` for enrolled students with enabled preferences
- [x] T027 [US2] Emit notifications from manual `UpsertAcademicProgressAsync` and SIU sync updates for affected students
- [x] T028 [US2] Execute live notification persistence/read-count/read-state GraphQL operations and record results in `specs/137-siu-notifications/evidence.md`
- [x] T029 [US2] Execute live WebSocket `notificationReceived` subscription validation and record result in `specs/137-siu-notifications/evidence.md`

---

## Phase 5: User Story 3 - Manage notification preferences (Priority: P3)

**Goal**: Users can manage academic notification preferences and disabled categories suppress future notifications.

**Independent Test**: Disable resource preference, create resource event, verify no new resource notification; grade preference remains independent.

- [x] T030 [US3] Add `MyNotificationPreferences` query in `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T031 [US3] Add `UpdateNotificationPreference` mutation in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [x] T032 [US3] Implement preference defaulting and update logic in `API Graphql/Services/Notifications/NotificationService.cs`
- [x] T033 [US3] Execute live preference suppression case and record result in `specs/137-siu-notifications/evidence.md`

---

## Phase 6: Frontend Integration

**Purpose**: Expose SIU sync in the academic dashboard and notifications globally.

- [x] T034 [P] Add notification Apollo queries/mutations/subscription in `FrontEnd/OneItb-FE/src/data/graphql/notifications.js`
- [x] T035 [P] Add SIU sync Apollo mutation in `FrontEnd/OneItb-FE/src/data/graphql/mutations/academic.js`
- [x] T036 Add admin-only `Sincronizar SIU` button and summary panel to `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
- [x] T037 Create `NotificationBell.jsx` in `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
- [x] T038 Integrate `NotificationBell` into `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- [x] T039 Verify Apollo cache/state updates do not violate React Rules of Hooks in academic dashboard and notification bell

---

## Phase 7: Migration and Quality Gates

**Purpose**: Persist schema and verify backend/frontend correctness.

- [x] T040 Generate EF migration `AddNotificationsAndSiuSync` with `dotnet ef migrations add AddNotificationsAndSiuSync --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`
- [x] T041 Review generated migration in `API Graphql/Data/Migrations/*AddNotificationsAndSiuSync*.cs` for explicit restrictive FKs and no shadow properties
- [x] T042 Apply migration to Docker SQL with `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`
- [x] T043 Run `dotnet ef migrations has-pending-model-changes --configuration Release --no-build --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"` and record result
- [x] T044 Run final `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result
- [x] T045 Run final `npm.cmd run build` from `FrontEnd/OneItb-FE` and record result
- [x] T046 Run `git diff --check`, `git status --short`, and secret scan over changed tracked files

---

## Phase 8: Documentation and Closure

**Purpose**: Synchronize canonical project status from evidence.

- [x] T047 Update `docs/project_docs/ROADMAP.md` moving SIU and notifications to `[x] [I]` only if implementation and validations support it
- [x] T048 Update `docs/project_docs/architecture-and-design.md` with SIU adapter and notification model
- [x] T049 Insert exactly one newest-first entry for spec 137 in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T050 Update `docs/audit/DOCUMENTATION_STATUS.md` with spec 137 status and remaining P2 gap
- [x] T051 Verify `DEVELOPMENT_LOG.md` order and that spec 137 is the first entry
- [x] T052 Mark all tasks complete and update `specs/137-siu-notifications/evidence.md` with final results

## Dependencies & Execution Order

- Phase 1 blocks all work.
- Phase 2 blocks backend notification and preference operations.
- US1 can be implemented after Phase 2 and is MVP for SIU.
- US2 depends on Phase 2 and academic service hooks.
- US3 depends on NotificationService.
- Frontend depends on GraphQL contracts from US1-US3.
- Migration must be generated after all EF model changes and before runtime validation.
- Documentation updates depend on build, migration and runtime evidence.

## Parallel Opportunities

- T005-T007 can run in parallel.
- T011-T012 can run in parallel.
- T015-T016 can run in parallel.
- T034-T035 can run in parallel after backend contracts are stable.

## Definition Of Done

- [x] All required tasks are marked `[x]`.
- [x] SIU mock sync is admin-only, idempotent and runtime-validated.
- [x] Notifications persist and private subscription delivery is runtime-validated or explicitly blocked.
- [x] Preferences suppress disabled notification categories.
- [x] Backend and frontend builds pass.
- [x] EF migration is applied and snapshot has no pending changes.
- [x] Roadmap, development log, documentation status and architecture docs are synchronized from evidence.
- [x] No secrets, logs, runtime uploads or local-only artifacts are tracked.
