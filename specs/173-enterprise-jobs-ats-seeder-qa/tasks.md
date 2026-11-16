# Tasks: Enterprise Jobs ATS Seeder QA

## Phase 1: Setup and Contracts

- [x] T001 Create Spec 173 artifacts and set active feature pointer.
- [x] T002 Update agent active implementation plan to Spec 173.

## Phase 2: Backend ATS

- [x] T003 Add `JobApplicationStatus` and `JobApplication` entities.
- [x] T004 Extend `JobOffer` and `User` navigations for applications.
- [x] T005 Map `JobApplications` in `OneItbContext` with restrict FKs and unique applicant/offer index.
- [x] T006 Extend `IJobService` and `JobService` with application, owner query and status update logic.
- [x] T007 Add GraphQL queries/mutations for `applyToJob`, `updateApplicationStatus` and `myJobOffers`.
- [x] T008 Add audit coverage for `JobApplication`.
- [x] T009 Generate/apply EF migration `AddJobApplications`.

## Phase 3: Frontend ATS

- [x] T010 Extend Apollo jobs documents with applications, current-user application and ATS mutations.
- [x] T011 Refactor `/empleos` for student/graduate application flow.
- [x] T012 Add `/empleos/mis-ofertas` Mini-ATS with applicant filter and CV modal.
- [x] T013 Add route and Nav link for employer ATS.
- [x] T014 Extend Apollo type policies for `JobApplication` and `myJobOffers`.

## Phase 4: Seeder and QA

- [x] T015 Seed deterministic job applications for students/egresados.
- [x] T016 Add job application notifications and keep phase SaveChanges/Clear.
- [x] T017 Run backend build, EF pending-model check and tests.
- [x] T018 Run frontend build and available frontend tests.
- [x] T019 Run GraphQL smoke for jobs/ATS if runtime is available.

## Phase 5: Documentation

- [x] T020 Record evidence in `evidence.md`.
- [x] T021 Update `ROADMAP.md` to Modulo 7 - Empleos y ATS.
- [x] T022 Insert one newest Spec 173 entry in `DEVELOPMENT_LOG.md`.
- [x] T023 Update `DOCUMENTATION_STATUS.md`.
