# Tasks: Full Profile & CV Schema Normalization

**Input**: Design documents from `specs/145-profile-cv-schema-normalization/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup

- [x] T001 Activate `specs/145-profile-cv-schema-normalization` in `.specify/feature.json`
- [x] T002 Update active implementation plan in `AGENTS.md`

## Phase 2: Foundational Backend Contract

- [x] T003 Add `CvDataJson` to `API Graphql/Entities/Models/User.cs`
- [x] T004 Map `CvDataJson` in `API Graphql/Data/OneItbContext.cs`
- [x] T005 Add `CvDataJson` to `UpdateProfileInput` and `PublicProfileSummary` in `API Graphql/Services/DTOs.cs`
- [x] T006 Validate and persist `CvDataJson` in `API Graphql/Services/Users/UsersService.cs`
- [x] T007 Expose `cvDataJson` on GraphQL user/public profile in `API Graphql/OneITB/Startup.cs` and `API Graphql/OneITB/GraphQL/Query.cs`

## Phase 3: User Story 1 - Unified Profile/CV Save (P1)

- [x] T008 [US1] Update `GET_USER_PROFILE` in `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
- [x] T009 [US1] Update `UPDATE_PROFILE` payload usage in `FrontEnd/OneItb-FE/src/data/graphql/mutations/updateProfile.js`
- [x] T010 [US1] Refactor `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx` to remove `PersonalForm` and save one consolidated payload
- [x] T011 [US1] Ensure `ResumePreview` derives personal data from profile state and extended sections from persisted CV state

## Phase 4: User Story 2 - Persistence Validation (P2)

- [x] T012 [US2] Generate EF migration `AddUserCvDataJson`
- [x] T013 [US2] Validate backend build
- [x] T014 [US2] Validate frontend build

## Phase 5: Polish & Documentation

- [x] T015 Record validation evidence in `specs/145-profile-cv-schema-normalization/evidence.md`
- [x] T016 Update `docs/project_docs/ROADMAP.md`
- [x] T017 Insert one top entry in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T018 Update `docs/audit/DOCUMENTATION_STATUS.md`

## Dependencies & Execution Order

- Phase 1 before all implementation.
- Backend contract before frontend query/mutation changes.
- Migration after model mapping.
- Documentation after validation.

## Definition Of Done

- [x] All tasks are marked complete.
- [x] Backend and frontend builds pass.
- [x] Migration exists for SQL persistence.
- [x] `/profile/edit` no longer renders duplicated personal/profile forms.
- [x] Runtime GraphQL persistence is verified; visual browser inspection remains a separate manual check.
