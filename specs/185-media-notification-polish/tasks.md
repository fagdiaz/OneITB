# Tasks: Media and Notification Polish

## Phase 1 - Baseline and contracts

- [x] T001 Record branch, baseline status and prompt hardening decisions in `specs/185-media-notification-polish/evidence.md`
- [x] T002 Cross-check spec, plan, contracts and tasks against `.specify/memory/constitution.md`
- [x] T003 Run risk-based Speckit QA preflight with builds and EF check

## Phase 2 - Media parsing and server validation

- [x] T004 [P] [US2] Add parser tests for ordered zero-to-three YouTube URLs in `FrontEnd/OneItb-FE/src/utils/mediaParser.test.js`
- [x] T005 [P] [US2] Add create/edit server limit tests in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`
- [x] T006 [US2] Extend ordered YouTube parsing compatibly in `FrontEnd/OneItb-FE/src/utils/mediaParser.js`
- [x] T007 [US2] Add two-link composer feedback and submit/edit guards in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [x] T008 [US2] Enforce bounded two-link validation in `API Graphql/Services/Social/SocialService.cs`

## Phase 3 - Dynamic media layout

- [x] T009 [P] [US1] Add landscape/portrait/overflow regression tests in `FrontEnd/OneItb-FE/src/Components/publication/MediaGrid.test.jsx`
- [x] T010 [P] [US1] Add two-video and PDF presentation tests in `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.test.jsx` and `PdfFirstPageThumbnail.test.jsx`
- [x] T011 [US1] Report intrinsic primary image dimensions in `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
- [x] T012 [US1] Implement full-width landscape cover and bounded secondary rows in `FrontEnd/OneItb-FE/src/Components/publication/MediaGrid.jsx`
- [x] T013 [US1] Render both accepted YouTube items and preserve cover ordering in `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
- [x] T014 [US1] Replace PDF overlay card with page-one crop/name/actions in `MediaAttachment.jsx` and `PdfFirstPageThumbnail.jsx`
- [x] T015 [US1] Constrain YouTube tile/viewer aspect and viewport bounds in `MediaAttachment.jsx` and `MediaViewerModal.jsx`

## Phase 4 - Theme and visual legibility

- [x] T016 [P] [US3] Add dark-logo and theme-transition lifecycle tests in `BrandLogo.test.jsx` and `ThemeContext.test.jsx`
- [x] T017 [US3] Add dark-only logo edge treatment in `FrontEnd/OneItb-FE/src/Components/branding/BrandLogo.jsx`
- [x] T018 [US3] Add readable dark role colors without changing comment mentions in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [x] T019 [US3] Implement bounded 800 ms theme transition with reduced-motion cleanup in `ThemeContext.jsx` and `index.css`
- [x] T020 [US3] Repair global texture stacking/visibility and print exclusion in `FrontEnd/OneItb-FE/src/index.css`

## Phase 5 - Notification portal and unread semantics

- [x] T021 [P] [US4] Extend preferences tests for body portal and dismissal in `NotificationPreferencesModal.test.jsx`
- [x] T022 [P] [US4] Add badge-vs-aggregate regression test in `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.test.jsx`
- [x] T023 [P] [US4] Add grouped read/reopen unread-count test in `NotificationServiceTests.cs`
- [x] T024 [US4] Portal preferences outside Header and preserve focus/pending lifecycle in `NotificationPreferencesModal.jsx`
- [x] T025 [US4] Update unread cache immediately from read state and reconcile server count in `NotificationBell.jsx`

## Phase 6 - Verification and documentation

- [x] T026 Run focused and full frontend/backend tests
- [x] T027 Run Release/Vite builds, EF drift, npm audit, source scans and `git diff --check`
- [x] T028 Execute affected GraphQL runtime operations and browser flow where available; record blockers honestly
- [x] T029 Update ROADMAP only from evidence and add one newest-first Spec 185 entry to DEVELOPMENT_LOG
- [x] T030 Update DOCUMENTATION_STATUS/FINAL_AUDIT_REPORT when canonical audit status changes

## Dependencies

- US2 parser contract precedes US1 multi-video rendering.
- US1, US3 and US4 are otherwise independently implementable after preflight.
- Documentation follows all validation gates.

## Definition Of Done

- [x] All tasks and checklist items are complete or explicitly blocked.
- [x] No new dependency or EF migration is introduced.
- [x] Backend/frontend tests and builds pass.
- [x] Runtime evidence distinguishes implemented from manually verified behavior.
- [x] Canonical documentation remains evidence-based and newest-first.
