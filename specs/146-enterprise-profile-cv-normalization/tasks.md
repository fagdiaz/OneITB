# Tasks: Enterprise Profile CV Normalization

## Phase 1: Setup

- [x] T001 Activate spec 146 in `.specify/feature.json` and `AGENTS.md`
- [x] T002 Document normalized Profile/CV contract in `specs/146-enterprise-profile-cv-normalization/`

## Phase 2: Backend Persistence

- [x] T003 [P] Add normalized CV entities in `API Graphql/Entities/Models/`
- [x] T004 Map CV DbSets and Fluent API in `API Graphql/Data/OneItbContext.cs`
- [x] T005 Replace JSON DTO contract with normalized inputs/DTOs in `API Graphql/Services/DTOs.cs`
- [x] T006 Refactor `API Graphql/Services/Users/UsersService.cs` to save normalized CV sections
- [x] T007 Expose normalized CV collections in `API Graphql/OneITB/Startup.cs` and `API Graphql/OneITB/GraphQL/Query.cs`

## Phase 3: Migration

- [x] T008 Generate EF migration `NormalizeUserCvTables`
- [x] T009 Edit migration to migrate `CvDataJson` into normalized tables before dropping the column
- [x] T010 Apply migration to the local SQL Server database

## Phase 4: Frontend

- [x] T011 Update Apollo profile queries in `FrontEnd/OneItb-FE/src/data/graphql/queries/`
- [x] T012 Refactor `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx` to use normalized collections and one mutation
- [x] T013 Ensure public profile reads normalized CV data without JSON/localStorage coupling

## Phase 5: Validation & Documentation

- [x] T014 Run backend Release build
- [x] T015 Run frontend production build
- [x] T016 Run runtime GraphQL normalized CV save/readback validation
- [x] T017 Update `docs/project_docs/ROADMAP.md`, `docs/audit/DEVELOPMENT_LOG.md`, and `docs/audit/DOCUMENTATION_STATUS.md`
