# Tasks: Social and Administration Ecosystem

**Input**: Design documents from `/specs/099-social-admin-ecosystem/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/graphql.md`, `quickstart.md`

## Phase 1: Setup and contract guardrails

- [x] T001 Verify active feature artifacts and completed requirements checklist in `specs/099-social-admin-ecosystem/`
- [x] T002 [P] Record the current GraphQL and database baseline in `specs/099-social-admin-ecosystem/evidence.md`
- [x] T003 [P] Verify ignore rules cover backend and frontend generated output in `.gitignore`

## Phase 2: Foundational backend

- [x] T004 [P] Create `Comment` and `Reaction` entities and evolve `CommunityReport` in `API Graphql/Entities/Models/`
- [x] T005 Extend `Inquiry` navigation collections in `API Graphql/Entities/Models/Inquiry.cs`
- [x] T006 Configure all social properties, indexes and explicit restricted relationships in `API Graphql/Data/OneItbContext.cs`
- [x] T007 Add social service contracts and payloads in `API Graphql/Services/Social/`
- [x] T008 Implement authenticated inquiry, comment and reaction persistence in `API Graphql/Services/Social/SocialService.cs`
- [x] T009 Refactor publication reporting to explicit inquiry reports in `API Graphql/Services/Moderation/`
- [x] T010 Refactor `API Graphql/OneITB/GraphQL/Mutation.cs` to JWT-derived actors and service delegation
- [x] T011 Expose projected social and protected moderation graphs in `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T012 Register services, secure JWT lifetime validation and configured CORS in `API Graphql/OneITB/Startup.cs`
- [x] T013 Build `API Graphql/OneITB/GraphQL.csproj` with zero errors before migration

## Phase 3: User Story 2 - Deterministic demonstration data (Priority: P1)

**Goal**: Empty or partial local databases receive stable realistic data.

**Independent Test**: Run initialization twice and compare managed record counts.

- [x] T014 [US2] Replace the all-or-nothing initializer with per-dataset idempotent seeding in `API Graphql/Data/DbInitializer.cs`
- [x] T015 [US2] Seed at least five subjects and ten BCrypt-backed role-diverse users in `API Graphql/Data/DbInitializer.cs`
- [x] T016 [US2] Seed three inquiries per managed user in `API Graphql/Data/DbInitializer.cs`
- [x] T017 [US2] Seed stable reactions, top-level comments, replies and at least two reports in `API Graphql/Data/DbInitializer.cs`
- [x] T018 [US2] Generate `AddSocialEcosystem` under `API Graphql/Data/Migrations/`
- [x] T019 [US2] Apply the migration and record schema/update evidence in `specs/099-social-admin-ecosystem/evidence.md`
- [x] T020 [US2] Start initialization twice and record stable database counts in `specs/099-social-admin-ecosystem/evidence.md`

## Phase 4: User Story 1 - Feed interactions (Priority: P1)

**Goal**: Authenticated users can publish, react, discuss and report.

**Independent Test**: Execute every mutation, reload, and query the resulting graph.

- [x] T021 [P] [US1] Align feed query and social mutations in `FrontEnd/OneItb-FE/src/data/graphql/`
- [x] T022 [P] [US1] Create recursive comment presentation components in `FrontEnd/OneItb-FE/src/Components/publication/`
- [x] T023 [US1] Refactor `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` for cache-aware publication, reactions and discussions
- [x] T024 [US1] Refactor `FrontEnd/OneItb-FE/src/Components/moderation/ReportModal.jsx` to use authenticated inquiry reporting
- [x] T025 [US1] Execute authenticated GraphQL create, toggle, comment, reply and report operations and record persistence evidence in `specs/099-social-admin-ecosystem/evidence.md`

## Phase 5: User Story 3 - Administration dashboard (Priority: P2)

**Goal**: Authorized staff can navigate users, subjects and reports from one dashboard.

**Independent Test**: Switch all tabs, inspect live data and verify role rejection.

- [x] T026 [P] [US3] Extract administration GraphQL operations into `FrontEnd/OneItb-FE/src/data/graphql/`
- [x] T027 [P] [US3] Stabilize user management hooks and feedback in `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`
- [x] T028 [P] [US3] Create subject and moderation views in `FrontEnd/OneItb-FE/src/Components/admin/`
- [x] T029 [US3] Create the tabbed `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`
- [x] T030 [US3] Route and link the dashboard through `FrontEnd/OneItb-FE/src/router/Routing.jsx` and `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- [x] T031 [US3] Verify authorized and unauthorized administration GraphQL behavior and record it in `specs/099-social-admin-ecosystem/evidence.md`

## Phase 6: Validation and documentation closure

- [x] T032 Build `API Graphql/OneITB/GraphQL.csproj` in Release with zero errors
- [x] T033 Build `FrontEnd/OneItb-FE` with `npm.cmd run build`
- [x] T034 Run applicable checks from `docs/audit/RUNBOOK_DEV.md` and record exact outcomes in `specs/099-social-admin-ecosystem/evidence.md`
- [x] T035 Verify the feed and administration workflows in a browser and record runtime evidence in `specs/099-social-admin-ecosystem/evidence.md`
- [x] T036 Recalculate `docs/project_docs/ROADMAP.md` from its checklists
- [x] T037 Insert exactly one `099-social-admin-ecosystem` entry at the top of `docs/audit/DEVELOPMENT_LOG.md`
- [x] T038 Verify all entries in `docs/audit/DEVELOPMENT_LOG.md` remain newest to oldest
- [x] T039 Update `docs/audit/DOCUMENTATION_STATUS.md` with canonical feature status and evidence
- [x] T040 Mark completed tasks in `specs/099-social-admin-ecosystem/tasks.md` only when supported by evidence

## Dependencies and execution order

- Phase 2 blocks migration, seeding and all frontend contract work.
- Phase 3 must pass before frontend implementation so the UI can be tested against realistic data.
- Phase 4 and Phase 5 share GraphQL contracts but can otherwise progress independently after Phase 3.
- Phase 6 requires all intended stories and runtime checks.

## QA corrections applied

- Acting user identifiers are derived from JWT claims instead of client arguments.
- New resolvers delegate to services.
- Reactions have a database uniqueness invariant.
- Reports use a real `Inquiry` FK and reject duplicate pending reports.
- Comment parents must belong to the same inquiry.
- Seed data is deterministic, partial-database safe and BCrypt-backed.
- Feed reads use projections and no field resolver performs per-row database access.
- React hooks remain above all conditional returns.
- Runtime GraphQL, persistence, authorization and browser evidence is mandatory.

## Definition of Done

- [x] All required tasks are marked `[X]`.
- [x] Backend and frontend builds pass.
- [x] Migration and repeatable seed are verified.
- [x] GraphQL writes, reads and authorization are verified at runtime.
- [x] Browser feed and administration workflows are verified.
- [x] Roadmap, development log and documentation status reflect only verified outcomes.

