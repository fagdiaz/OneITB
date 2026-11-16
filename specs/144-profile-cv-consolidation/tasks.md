# Tasks: Profile/CV Consolidation & Cleanup

## Phase 1 - Backend Contract

- [x] T001 Add authenticated `me` query in `API Graphql/OneITB/GraphQL/Query.cs`.
- [x] T002 Protect `updateProfile` in `API Graphql/OneITB/GraphQL/Mutation.cs` with owner/admin authorization.

## Phase 2 - Frontend Consolidation

- [x] T003 Update `GET_USER_PROFILE` to use `me` instead of `users`.
- [x] T004 Update legacy `EditProfile.jsx` to consume `me`.
- [x] T005 Update `CvEditorProfile.tsx` to save persisted CV/profile fields and stop reading `users`.
- [x] T006 Remove the `_temp_cv_reference` comment/reference from canonical CV types.

## Phase 3 - Cleanup

- [x] T007 Delete `FrontEnd/OneItb-FE/src/_temp_cv_reference`.
- [x] T008 Verify there are no references to `_temp_cv_reference`.

## Phase 4 - Validation and Documentation

- [x] T009 Run backend Release build.
- [x] T010 Run frontend Vite build.
- [x] T011 Record evidence.
- [x] T012 Update `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T013 Update `docs/audit/DOCUMENTATION_STATUS.md`.
