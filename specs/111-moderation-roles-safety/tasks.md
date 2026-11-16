# Tasks: Moderation Roles Safety

**Input**: Design documents from `specs/111-moderation-roles-safety/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Include build validation and affected GraphQL/admin smoke where environment allows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Create feature documentation in `specs/111-moderation-roles-safety/`
- [X] T002 Update `.specify/feature.json` and `AGENTS.md` to point to this feature plan

---

## Phase 2: Foundational

- [X] T003 Add `MutedUntil` to `API Graphql/Entities/Models/User.cs`
- [X] T004 Add EF migration for `Users.MutedUntil` in `API Graphql/Data/Migrations/`
- [X] T005 Expose role/mute/metric/report fields through GraphQL object configuration in `API Graphql/OneITB/Startup.cs`

---

## Phase 3: User Story 1 - Protect Administrative Accounts (Priority: P1)

**Goal**: Administrator accounts cannot be role-edited, deactivated, or silenced.

**Independent Test**: Try admin-protection controls through UI and backend mutations.

- [X] T006 [US1] Enforce admin protection in backend user mutations/services in `API Graphql/Services/Users/`
- [X] T007 [US1] Disable admin destructive controls in `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`

---

## Phase 4: User Story 2 - Silence Users Temporarily (Priority: P1)

**Goal**: Moderators/admins can silence non-admin users and silenced users cannot post/comment.

**Independent Test**: Silence a user and verify publish/comment attempts are rejected.

- [X] T008 [US2] Add `silenceUser` mutation in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [X] T009 [US2] Block silenced users in publication/comment creation paths in `API Graphql/Services/Social/SocialService.cs`
- [X] T010 [US2] Add frontend GraphQL mutation and silence controls in admin user management files

---

## Phase 5: User Story 3 - Show Moderation Metrics (Priority: P2)

**Goal**: Admin/mod views show activity and report counters.

**Independent Test**: User management and feed display counters for users and publications.

- [X] T011 [US3] Add metrics/report count selections to frontend GraphQL query files
- [X] T012 [US3] Render short IDs, metrics, report counts, and mute status in admin/feed components

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T013 Run backend build
- [X] T014 Apply or validate migration status
- [X] T015 Run frontend build
- [X] T016 Record validation evidence in `specs/111-moderation-roles-safety/evidence.md`
- [X] T017 Insert one top entry in `docs/audit/DEVELOPMENT_LOG.md`
- [X] T018 Verify `DEVELOPMENT_LOG.md` remains newest to oldest

## Dependencies & Execution Order

- Setup before all code changes.
- Foundational database/model work before mutations and UI fields.
- US1 and US2 backend changes before frontend controls.
- Polish after all selected implementation tasks.

## Definition Of Done

- [X] All required tasks are marked `[X]`
- [X] Backend build passes
- [X] Frontend build passes
- [X] Migration exists and is applied or migration application blocker is recorded
- [X] Runtime smoke evidence is recorded or explicitly marked blocked
- [X] `DEVELOPMENT_LOG.md` has exactly one new top entry for this spec
