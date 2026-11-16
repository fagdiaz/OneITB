# Tasks: Spec 164 Academic Hub Resources

## Phase 1: Backend Domain and EF Core

- [x] T001 Add `AcademicResourceCategory` enum.
- [x] T002 Add `Category` and `Version` to `AcademicResource`.
- [x] T003 Map category/version, check constraint and filtering index in `OneItbContext`.
- [x] T004 Generate EF Core migration for the schema extension.

## Phase 2: GraphQL and Services

- [x] T005 Extend `IAcademicService` and `AcademicService` for search/category filters.
- [x] T006 Add category/version creation parameters and validation.
- [x] T007 Add soft-delete `DeleteResourceAsync` semantics.
- [x] T008 Expose `uploadAcademicResource` and `deleteResource` mutations while preserving existing mutations.
- [x] T009 Add unit tests for access, filtering and version/category persistence.

## Phase 3: Frontend Academic Hub

- [x] T010 Update Apollo academic queries/mutations for search, category and version.
- [x] T011 Add Apollo cache policy for `AcademicResource` and `academicResources`.
- [x] T012 Upgrade `/academic` resource UI with search, category filter, version display and upload metadata.
- [x] T013 Keep upload flow on authenticated `/api/upload`.

## Phase 4: Validation and Documentation

- [x] T014 Run targeted backend tests.
- [x] T015 Run backend Release build.
- [x] T016 Run frontend production build.
- [x] T017 Record evidence in `specs/164-academic-hub-resources/evidence.md`.
- [x] T018 Update `docs/project_docs/ROADMAP.md`.
- [x] T019 Add newest-first entries to `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T020 Update `docs/audit/DOCUMENTATION_STATUS.md`.
