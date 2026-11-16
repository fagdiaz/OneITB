# Tasks: Master Quality & Interconnectivity Fixes

**Input**: `spec.md`, `plan.md`, `docs/project_docs/ROADMAP.md`

## Phase 1: Setup & Route Audit

- [x] T001 Document routed profile components in `specs/152-master-quality-interconnectivity-fixes/evidence.md`
- [x] T002 Remove unused ghost profile component `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`

## Phase 2: Profile Contract Foundation

- [x] T003 Add `TotalComments` to `PublicProfileSummary` in `API Graphql/Services/DTOs.cs`
- [x] T004 Count profile comments in `GetPublicProfile` in `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T005 Request `totalComments` in `FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js`

## Phase 3: User Story 2 - Safe Profile Editing Escape (P1)

- [x] T006 [US2] Add clean cancel navigation to `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`

## Phase 4: User Story 3 - Defensive Avatar Rendering (P1)

- [x] T007 [US3] Cache failed avatar URLs and render initials fallback in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

## Phase 5: User Story 4 - Profile Metrics And Print Quality (P1)

- [x] T008 [US4] Replace profile counters with community contributions and approved subjects in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- [x] T009 [US4] Replace `CVPrintTemplate.tsx` with a pure A4 print component in `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx`
- [x] T010 [US4] Add print-specific A4 safeguards to `FrontEnd/OneItb-FE/src/index.css`

## Phase 6: User Story 5 - Header Spotlight Polish (P2)

- [x] T011 [US5] Verify and minimally polish spotlight classes in `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- [x] T012 [US5] Verify and minimally polish hover lift classes in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

## Phase 7: Validation & Documentation

- [x] T013 Run backend build for GraphQL contract changes
- [x] T014 Run frontend Vite build
- [x] T015 Record validation evidence in `specs/152-master-quality-interconnectivity-fixes/evidence.md`
- [x] T016 Update `docs/audit/DEVELOPMENT_LOG.md`
- [x] T017 Update `docs/audit/DOCUMENTATION_STATUS.md`
- [x] T018 Update `docs/project_docs/ROADMAP.md` consistency notes if status changed
- [x] T019 [US4] Route `/profile/edit` print action to pure `CVPrintTemplate` in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [x] T020 [US5] Restore header dropdown visibility and restyle notification/user menus in `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`, `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`, and `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- [x] T021 [US5] Apply dark/glass visual system to `/chat` and the floating chat widget in `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`, `ChatSidebar.jsx`, `ChatWindow.jsx`, and `MiniChatWidget.jsx`
