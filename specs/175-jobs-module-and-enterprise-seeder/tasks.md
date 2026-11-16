# Tasks: Jobs Module and Enterprise Seeder

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Build backend/frontend, generate EF migration, run GraphQL smoke if local runtime is available.

## Phase 1: Setup

- [x] T001 Create spec artifacts under `specs/175-jobs-module-and-enterprise-seeder/`.
- [x] T002 Update `.specify/feature.json` and active implementation plan pointer.

## Phase 2: Backend Jobs

- [x] T003 Add `JobOffer` entity and `User.JobOffers` navigation.
- [x] T004 Map `JobOffers` in `OneItbContext` with explicit FK and `DeleteBehavior.Restrict`.
- [x] T005 Add `IJobService`, `JobService` and `JobOfferTopics`.
- [x] T006 Register jobs service in DI.
- [x] T007 Add `jobOffers`, `createJobOffer` and `jobOfferCreated`.
- [x] T008 Add `NotificationType.JobOffer` and audit coverage.
- [x] T009 Generate EF migration `AddJobOffers`.

## Phase 3: Enterprise Seeder

- [x] T010 Replace the effective startup demo seed with `EnterpriseDemoSeeder.SeedAsync`.
- [x] T011 Seed careers/subjects/accounts/user-careers in FK-safe phases.
- [x] T012 Seed inquiries, comments, replies, reactions and notifications.
- [x] T013 Seed job offers and private messages with deterministic IDs.
- [x] T014 Ensure every phase uses `SaveChangesAsync` followed by `ChangeTracker.Clear()`.

## Phase 4: Frontend Jobs

- [x] T015 Add Apollo jobs queries/mutation/subscription.
- [x] T016 Add `/empleos` route and `JobBoard.jsx`.
- [x] T017 Add Nav link, realtime badge and badge reset on `/empleos`.
- [x] T018 Add Apollo cache type policy for `JobOffer`.
- [x] T019 Extend realtime toast icon map for job notifications.

## Phase 5: Validation and Documentation

- [x] T020 Run backend build.
- [x] T021 Run frontend build.
- [x] T022 Record validation evidence in `evidence.md`.
- [x] T023 Update `ROADMAP.md`.
- [x] T024 Insert one newest entry in `DEVELOPMENT_LOG.md`.
- [x] T025 Update `DOCUMENTATION_STATUS.md`.
