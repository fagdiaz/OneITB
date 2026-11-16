# Tasks: Profile Hydration and Avatar Storage

**Input**: Design documents from `specs/205-profile-hydration-avatar-storage/`

## Phase 1: Setup

- [x] T001 Audit initialization/reset/upload effects in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx` and `FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.jsx`
- [x] T002 Finalize the state and persistence contract in `specs/205-profile-hydration-avatar-storage/contracts/profile-editor-state.md`

## Phase 2: Foundational

- [x] T003 Extract profile/session normalization into `FrontEnd/OneItb-FE/src/Components/profile/profileEditorState.ts`
- [x] T004 Add a reusable full-editor loading state in `FrontEnd/OneItb-FE/src/Components/profile/ProfileEditorSkeleton.tsx`
- [x] T005 Run the Apollo/session/upload QA gate and record it in `specs/205-profile-hydration-avatar-storage/evidence/evidence.md`

## Phase 3: User Story 1 - Stable profile editing (P1)

**Independent Test**: Delayed and repeated profile responses produce one canonical
hydration and never overwrite a dirty draft.

- [x] T006 [P] [US1] Add hydration, mismatch and dirty-refetch tests in `FrontEnd/OneItb-FE/src/Components/profile/profileEditorState.test.ts`
- [x] T007 [P] [US1] Add slow-query editor scenarios in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.lifecycle.test.tsx`
- [x] T008 [US1] Remove provisional auth hydration and apply the session-keyed state machine in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [x] T009 [US1] Add loading, mismatch, retry and non-destructive error surfaces in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [x] T010 [US1] Integrate the Student career rule from Spec 204 in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`

## Phase 4: User Story 2 - Persist an avatar safely (P1)

**Independent Test**: Success survives refresh; upload/save failures and no-new-image save
all retain the previous avatar.

- [x] T011 [P] [US2] Add upload lifecycle and preservation tests in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.lifecycle.test.tsx`
- [x] T012 [P] [US2] Add cancellation and object-URL cleanup tests in `FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.test.jsx`
- [x] T013 [US2] Add cancelable upload and staged status handling in `FrontEnd/OneItb-FE/src/utils/uploadFile.js` and `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [x] T014 [US2] Preserve the prior URL through upload/profile/refetch failure in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [x] T015 [US2] Revoke temporary resources and abort in-flight work in `FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.jsx`

## Phase 5: User Story 3 - Storage-mode evidence (P2)

**Independent Test**: Local mode is identified and works without credentials; cloud mode
is claimed only after its separate configured smoke.

- [x] T016 [P] [US3] Add storage selection tests in `API Graphql/Tests/Services.Tests/Uploads/FileStorageRegistrationTests.cs`
- [x] T017 [US3] Centralize safe storage registration diagnostics in `API Graphql/OneITB/Startup.cs`
- [x] T018 [US3] Preserve authenticated upload and controlled failures in `API Graphql/OneITB/Controllers/UploadController.cs`
- [x] T019 [US3] Document local and Cloudinary acceptance separately in `docs/audit/RUNBOOK_DEV.md`

## Phase 6: Validation and Closeout

- [x] T020 Run backend/frontend tests, builds and secret scan and record them in `specs/205-profile-hydration-avatar-storage/evidence/evidence.md`
- [ ] T021 **BLOCKED - manual acceptance**: Execute throttled-network and avatar-refresh scenarios from `specs/205-profile-hydration-avatar-storage/quickstart.md`
- [x] T022 Update the Spec 205 status in `docs/project_docs/ROADMAP.md`
- [x] T023 Add exactly one completed Spec 205 entry in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T024 Update `docs/audit/DOCUMENTATION_STATUS.md` with the actually verified storage mode

## Dependencies & Execution Order

Spec 204 must establish final Student career semantics. Then `T001-T005 -> US1 -> US2`;
US3 tests/documentation can proceed in parallel with US2 after the upload contract review.

## Definition Of Done

- [x] No provisional profile values or dirty-state overwrite remain in code and automated coverage.
- [ ] Avatar success and all failure paths are covered automatically but still require browser acceptance.
- [x] Local/cloud evidence is accurate and secret-free.
- [x] Complete tests/builds pass and canonical documents reflect actual evidence.
