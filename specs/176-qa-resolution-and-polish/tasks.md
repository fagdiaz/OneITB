# Tasks: QA Resolution and UX Polish

## Phase 1: Setup and QA

- [x] T001 Point active feature metadata to `specs/176-qa-resolution-and-polish`
- [x] T002 Run Speckit QA preflight for mixed backend/frontend polish risk

## Phase 2: Backend

- [x] T003 [US1] Tune GraphQL limits in `API Graphql/OneITB/Startup.cs`
- [x] T004 [US1] Add GraphQL limit configuration keys in `API Graphql/OneITB/appsettings.json`
- [x] T005 [US2] Remove user-facing Alias dependency from registration contract usage in backend tests if required

## Phase 3: Frontend Registration and Profile

- [x] T006 [US2] Remove Alias field and validations from `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
- [x] T007 [US4] Add password-toggle `onMouseDown` focus guard in `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
- [x] T008 [US4] Add password-toggle `onMouseDown` focus guard in `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
- [x] T009 [US4] Redirect to `/profile` after successful profile save in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`

## Phase 4: Frontend Layout and Chat

- [x] T010 [US3] Fix header/nav overflow in `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx` and `Nav.jsx`
- [x] T011 [US3] Add layout horizontal overflow guards in `PublicLayout.jsx` and `PrivateLayout.jsx`
- [x] T012 [US3] Improve selected career/subject filter contrast in `GlobalSearch.jsx`
- [x] T013 [US3] Close chat widget on route change and outside click in `MiniChatWidget.jsx`

## Phase 5: Documentation and Validation

- [x] T014 Update `docs/audit/DEVELOPMENT_LOG.md`
- [x] T015 Run backend build, frontend build and diff check
- [x] T016 Record evidence in `specs/176-qa-resolution-and-polish/evidence.md`
- [x] T017 Commit versionable changes without ignored specs/tooling

## Definition of Done

- [x] All tasks marked `[X]`
- [x] Backend build passes
- [x] Frontend build passes
- [x] `git diff --check` passes
- [x] Development log has exactly one new Spec 176 entry at the top
