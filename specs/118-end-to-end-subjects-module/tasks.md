# Tasks: End-to-End Subjects Module

## Phase 1: Setup

- [X] T001 Create and validate spec artifacts in `specs/118-end-to-end-subjects-module/`
- [X] T002 Update `.specify/feature.json` and `AGENTS.md`

## Phase 2: Domain And Persistence

- [X] T003 Replace subject-career N:M with required `CareerId`/`Career` in `API Graphql/Entities/Models/Subject.cs`
- [X] T004 Add explicit `SubjectPrerequisite` entity in `API Graphql/Entities/Models/SubjectPrerequisite.cs`
- [X] T005 Update `Career.Subjects` and remove obsolete `SubjectCareers` navigation
- [X] T006 Configure subject career/year and prerequisite relationships with `DeleteBehavior.Restrict` in `API Graphql/Data/OneItbContext.cs`
- [X] T007 Update seed ownership in `API Graphql/Data/DbInitializer.cs`
- [X] T008 Update subject filtering in `API Graphql/Services/Social/SocialService.cs`

## Phase 3: GraphQL

- [X] T009 Update `GetSubjects` career filter in `API Graphql/OneITB/GraphQL/Query.cs`
- [X] T010 Implement validated academic `AddSubject` and `UpdateSubject` in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [X] T011 Validate backend build before migration

## Phase 4: Database Migration

- [X] T012 Generate `AddAcademicRulesToSubjects` migration
- [X] T013 Review migration for data backfill and restricted FKs
- [X] T014 Apply migration and verify migration list

## Phase 5: Frontend

- [X] T015 Update Apollo subject query/mutations
- [X] T016 Refactor subject form with career, year, and integer prerequisite IDs
- [X] T017 Update subject table with career/year/prerequisites
- [X] T018 Run frontend build

## Phase 6: Evidence And Documentation

- [X] T019 Attempt GraphQL/browser runtime validation or record blocker
- [X] T020 Record evidence in `specs/118-end-to-end-subjects-module/evidence.md`
- [X] T021 Add exactly one top entry to `docs/audit/DEVELOPMENT_LOG.md`
- [X] T022 Verify log ordering and `git diff --check`

## Definition Of Done

- [X] Domain and GraphQL contracts compile
- [X] Migration is applied with restricted FKs
- [X] Frontend build passes
- [X] Runtime evidence is recorded or explicitly blocked
- [X] Documentation closure is complete
