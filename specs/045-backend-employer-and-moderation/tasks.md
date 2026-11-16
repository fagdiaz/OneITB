# Tasks: Backend Employer & Moderation Infrastructure (045)

## Phase 1: Setup
- [x] T001 Update AGENTS.md + .specify/feature.json → 045 plan.

## Phase 2: Entities & DB
- [x] T002 Create `CommunityReport` entity.
- [x] T003 Create `MagicLink` entity.
- [x] T004 Map entities in `OneItbContext.cs`.
- [x] T005 Run EF Core migration `AddEmployerAndModeration`.

## Phase 3: Services
- [x] T006 Implement AFIP Validation (Simulated) and Magic Link logic.
- [x] T007 Implement Moderation/Reporting logic.

## Phase 4: GraphQL
- [x] T008 Expose `RequestMagicLink` and `LoginWithMagicLink` mutations.
- [x] T009 Expose `CreateReport` mutation.

## Phase 5: QA
- [x] T010 Build backend.
- [x] T011 Update DEVELOPMENT_LOG.md.
