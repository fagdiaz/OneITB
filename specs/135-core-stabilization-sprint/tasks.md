# Tasks: Core Stabilization Sprint

**Input**: Design documents from `specs/135-core-stabilization-sprint/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Runtime validation is mandatory. Compilation alone is insufficient for GraphQL contracts, upload persistence, authorization, or browser-facing behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup and Baseline

**Purpose**: Confirm runtime baseline and capture evidence before changing behavior.

- [x] T001 Record `git status --short` in `specs/135-core-stabilization-sprint/evidence.md`
- [x] T002 Verify active feature context in `.specify/feature.json`, `AGENTS.md`, and `specs/135-core-stabilization-sprint/plan.md`
- [x] T003 Verify `.gitignore` continues excluding `specs/`, runtime uploads, logs, build output, and local secrets in `.gitignore`
- [x] T004 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result in `specs/135-core-stabilization-sprint/evidence.md`
- [x] T005 Run `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"` and record result
- [x] T006 Start backend with `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB` and record Kestrel endpoints
- [x] T007 Execute GraphQL smoke test `query { __typename }` against `https://localhost:44397/graphql` and record result

---

## Phase 2: Runtime Validation of Deferred Features (US1)

**Goal**: Convert specs 118, 119, 121, and 122 from compile-only confidence to runtime evidence.

**Independent Test**: Authenticated live GraphQL/REST operations prove subjects, superadmin security, uploads, and rich media readback work.

- [x] T008 [US1] Inspect seeded credentials and auth mutation names in `API Graphql/Data/DbInitializer.cs`, `API Graphql/OneITB/GraphQL/Mutation.cs`, and `FrontEnd/OneItb-FE/src/data/graphql/mutations/authenticateUser.js`
- [x] T009 [US1] Authenticate as an administrator through live GraphQL and record JWT acquisition in `specs/135-core-stabilization-sprint/evidence.md`
- [x] T010 [US1] Execute live subjects query for `id`, `name`, `code`, `year`, `career`, and `prerequisites` and record result
- [x] T011 [US1] Execute live `addSubject` mutation with career, year, and prerequisites and record persisted readback
- [x] T012 [US1] Execute live admin promotion with correct password and record success without exposing the password in evidence
- [x] T013 [US1] Execute live role/status mutation against an administrator target and record backend rejection
- [x] T014 [US1] Execute authenticated `POST /api/upload` with a small temporary file and record returned `/uploads/` URL
- [x] T015 [US1] Execute live `addInquiry` mutation using uploaded `fileUrl` and record persisted readback
- [x] T016 [US1] Execute live `addComment` mutation using uploaded `fileUrl` and record persisted readback
- [x] T017 [US1] Fix any runtime contract or CORS bug found in affected backend/frontend files before continuing
- [x] T018 [US1] Re-run affected live operations after any fix and record final PASS/BLOCKED state

---

## Phase 3: Feed Pagination (US2)

**Goal**: Add bounded, deterministic feed pagination without breaking existing feed consumers.

**Independent Test**: Three consecutive page requests return no duplicates and preserve filters/social visibility.

- [x] T019 [US2] Inspect current feed resolver/service/query usage in `API Graphql/Services/Social/SocialService.cs`, `API Graphql/OneITB/GraphQL/Query.cs`, and `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [x] T020 [US2] Add feed page DTO/model in `API Graphql/OneITB/GraphQL` or `API Graphql/Entities/Models` following existing GraphQL patterns
- [x] T021 [US2] Add paginated social service contract in `API Graphql/Services/Social/ISocialService.cs`
- [x] T022 [US2] Implement deterministic cursor-like pagination in `API Graphql/Services/Social/SocialService.cs` preserving search, career, subject, follow, mute, and block rules
- [x] T023 [US2] Expose `inquiriesPage` query in `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T024 [US2] Add Apollo query for paginated feed in `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
- [x] T025 [US2] Update `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` to use paginated feed and `fetchMore`/load-more UI
- [x] T026 [US2] Execute live `inquiriesPage` requests for at least three pages and record duplicate check in evidence
- [x] T027 [US2] Execute live `inquiriesPage` with search/career/subject filters and record result

---

## Phase 4: Orphan Upload Cleanup (US3)

**Goal**: Delete old unreferenced physical uploads while preserving files linked by publications/comments.

**Independent Test**: Cleanup removes one old unreferenced file and preserves one referenced file.

- [x] T028 [US3] Inspect upload storage paths and validation in `API Graphql/OneITB/Controllers/UploadController.cs`, `API Graphql/OneITB/Startup.cs`, and `docs/audit/RUNBOOK_DEV.md`
- [x] T029 [US3] Add upload cleanup options/service interfaces in `API Graphql/Services/Uploads/`
- [x] T030 [US3] Implement orphan upload cleanup service in `API Graphql/Services/Uploads/` checking `Inquiry.FileUrl` and `Comment.FileUrl`
- [x] T031 [US3] Add hosted cleanup scheduler registration in `API Graphql/OneITB/Startup.cs`
- [x] T032 [US3] Add safe cleanup configuration defaults in `API Graphql/OneITB/appsettings.json` and Development override if needed
- [x] T033 [US3] Execute cleanup validation with one old unreferenced file and one referenced file, recording deleted/preserved outcomes

---

## Phase 5: Persistent Moderation Audit (US4)

**Goal**: Persist and expose successful moderation/admin action history.

**Independent Test**: At least three moderation action types create administrator-visible audit entries.

- [x] T034 [US4] Add `ModerationAudit` entity in `API Graphql/Entities/Models/ModerationAudit.cs`
- [x] T035 [US4] Map `ModerationAudit` with explicit restricted FKs in `API Graphql/Data/OneItbContext.cs`
- [x] T036 [US4] Add moderation audit service contract and implementation in `API Graphql/Services/Moderation/`
- [x] T037 [US4] Register moderation audit service in `API Graphql/OneITB/Startup.cs`
- [x] T038 [US4] Instrument successful user role/status/silence operations in `API Graphql/OneITB/GraphQL/Mutation.cs` or service layer
- [x] T039 [US4] Instrument successful inquiry/comment/report moderation operations in `API Graphql/OneITB/GraphQL/Mutation.cs` or service layer
- [x] T040 [US4] Expose administrator-only moderation audit query in `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T041 [US4] Add Apollo admin audit query in `FrontEnd/OneItb-FE/src/data/graphql/queries/admin.js`
- [x] T042 [US4] Add moderation audit tab or section in `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`
- [x] T043 [US4] Generate EF migration for moderation audit and any pagination indexes with `dotnet ef migrations add AddModerationAuditAndFeedPagination --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`
- [x] T044 [US4] Apply migration with `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`
- [x] T045 [US4] Execute at least three moderation actions and verify audit rows through live GraphQL

---

## Phase 6: Quality Gates and Documentation

**Purpose**: Prove the sprint and update canonical status only from evidence.

- [x] T046 Run `dotnet ef migrations has-pending-model-changes --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"` and record result
- [x] T047 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result
- [x] T048 Run `npm.cmd run build` from `FrontEnd/OneItb-FE` and record result
- [x] T049 Run applicable `speckit-qa` preflight and record result
- [x] T050 Verify backend process cleanup and no lingering `dotnet run` process for `GraphQL.csproj`
- [x] T051 Update `docs/project_docs/ROADMAP.md` from evidence, moving only verified items to `[V]` or completed `[x]`
- [x] T052 Add exactly one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`
- [x] T053 Update `docs/audit/DOCUMENTATION_STATUS.md` with new verified status and remaining gaps
- [x] T054 Verify `docs/audit/DEVELOPMENT_LOG.md` remains newest-to-oldest and this spec is the first entry
- [x] T055 Final `git status --short` review to ensure no secrets, runtime uploads, logs, or unwanted artifacts are tracked

## Dependencies & Execution Order

- Phase 1 blocks all runtime work.
- Phase 2 must complete before roadmap verification of specs 118, 119, 121, and 122.
- Phase 3 and Phase 4 can proceed after Phase 2; Phase 5 can proceed after Phase 1 but must complete before final admin runtime validation.
- Phase 6 depends on selected implementation phases and all required runtime checks.

## Definition Of Done

- [x] All required tasks are marked `[X]`.
- [x] Deferred workflows are runtime-verified or explicitly recorded as blocked with reproduction steps.
- [x] Feed pagination returns stable pages without duplicates.
- [x] Upload cleanup deletes unreferenced old files and preserves referenced files.
- [x] Moderation audit persists and is queryable by administrators.
- [x] Backend and frontend builds pass.
- [x] EF migrations are applied and model snapshot has no pending changes.
- [x] `ROADMAP.md`, `DEVELOPMENT_LOG.md`, and `DOCUMENTATION_STATUS.md` are synchronized from evidence.
- [x] No secrets, runtime uploads, or local-only trash are staged/tracked.


