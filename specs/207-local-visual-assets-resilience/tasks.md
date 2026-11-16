# Tasks: Local Visual Asset Resilience

**Input**: Design documents from `specs/207-local-visual-assets-resilience/`

## Phase 1: Setup

- [x] T001 Inventory external visual requests in `FrontEnd/OneItb-FE/index.html` and `FrontEnd/OneItb-FE/src/index.css`
- [x] T002 Inventory active `fa-*` classes under `FrontEnd/OneItb-FE/src/` and compare them with `FrontEnd/OneItb-FE/src/assets/fonts/fontawesome-free-6.1.2-web/metadata/icons.json`
- [x] T003 Finalize allowed sources in `specs/207-local-visual-assets-resilience/contracts/local-assets.md`

## Phase 2: Foundational

- [x] T004 Select and document the local/system typography stack in `specs/207-local-visual-assets-resilience/research.md`
- [x] T005 Create an automated external-font source guard in `FrontEnd/OneItb-FE/src/visualAssets.test.js`
- [x] T006 Run global CSS, accessibility and bundle QA and record it in `specs/207-local-visual-assets-resilience/evidence/evidence.md`

## Phase 3: User Story 1 - Offline visual resilience (P1)

**Independent Test**: Principal routes retain readable text and essential icons with
external network access blocked.

- [x] T007 [P] [US1] Add active-icon compatibility assertions in `FrontEnd/OneItb-FE/src/visualAssets.test.js`
- [x] T008 [US1] Remove external font/icon links from `FrontEnd/OneItb-FE/index.html`
- [x] T009 [US1] Remove duplicate remote typography and configure the final stack in `FrontEnd/OneItb-FE/src/index.css`
- [x] T010 [US1] Import the reviewed local Font Awesome CSS through `FrontEnd/OneItb-FE/src/main.jsx`
- [x] T011 [US1] Replace unsupported active icon classes in the exact components reported by `FrontEnd/OneItb-FE/src/visualAssets.test.js`

## Phase 4: User Story 2 - Metadata and print readability (P2)

**Independent Test**: Root metadata identifies OneITB in Spanish and the CV remains
readable in print preview with the final fallback stack.

- [x] T012 [P] [US2] Add metadata assertions in `FrontEnd/OneItb-FE/src/visualAssets.test.js`
- [x] T013 [US2] Set Spanish language, OneITB title and local favicon in `FrontEnd/OneItb-FE/index.html`
- [x] T014 [US2] Verify and adjust print fallback fonts in `FrontEnd/OneItb-FE/src/index.css` and `FrontEnd/OneItb-FE/src/Components/academic/CertificateExport.jsx`

## Phase 5: Validation and Closeout

- [x] T015 Run complete frontend tests/build and inspect generated font URLs in `FrontEnd/OneItb-FE/dist/`
- [ ] T016 Execute the offline route and print matrix from `specs/207-local-visual-assets-resilience/quickstart.md`
- [ ] T017 Execute final responsive navigation acceptance jointly with `specs/206-adaptive-navigation-brand-lockup/quickstart.md`
- [x] T018 Update the Spec 207 status in `docs/project_docs/ROADMAP.md`
- [x] T019 Add exactly one completed Spec 207 entry in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T020 Update `docs/audit/DOCUMENTATION_STATUS.md` and `docs/audit/RUNBOOK_DEV.md`

## Dependencies & Execution Order

`T001-T006 -> US1 -> US2 -> T015-T020`. Inventory and compatibility tests must precede
removal of CDN assets. Final browser acceptance is paired with Spec 206.

## Definition Of Done

- [x] No external core font/icon request remains.
- [x] Every active essential icon has a compatible local rendering and accessible label.
- [ ] Production build assets, offline routes and CV print pass.
- [ ] Spec 206 responsive matrix passes with final font metrics.
