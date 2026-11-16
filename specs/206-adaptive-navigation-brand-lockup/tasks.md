# Tasks: Adaptive Navigation and Brand Lockup

**Input**: Design documents from `specs/206-adaptive-navigation-brand-lockup/`

## Phase 1: Setup

- [x] T001 Inventory route, role, badge and priority behavior in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- [x] T002 Inventory logo usages under `FrontEnd/OneItb-FE/src/Components/` and finalize `specs/206-adaptive-navigation-brand-lockup/contracts/navigation-brand.md`

## Phase 2: Foundational

- [x] T003 Extract navigation descriptors into `FrontEnd/OneItb-FE/src/Components/layout/private/navigationItems.js`
- [x] T004 Create bounded overflow calculation in `FrontEnd/OneItb-FE/src/Components/layout/private/useProgressiveNavigation.js`
- [x] T005 Run layout/state/accessibility QA and record it in `specs/206-adaptive-navigation-brand-lockup/evidence/evidence.md`

## Phase 3: User Story 1 - Use all navigation space (P1)

**Independent Test**: Student links move progressively across wide, split and mobile
widths without overlap or state loss.

- [x] T006 [P] [US1] Add deterministic width-calculation tests in `FrontEnd/OneItb-FE/src/Components/layout/private/useProgressiveNavigation.test.js`
- [x] T007 [P] [US1] Add Student/Employer/Admin responsive scenarios in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.test.jsx`
- [x] T008 [US1] Implement observed container measurement and cleanup in `FrontEnd/OneItb-FE/src/Components/layout/private/useProgressiveNavigation.js`
- [x] T009 [US1] Render direct and overflow descriptors from one source in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- [x] T010 [US1] Reserve search/notification/user control space in `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`

## Phase 4: User Story 2 - Consistent OneITB identity (P1)

**Independent Test**: Header, Hero, identity and footer display one aligned symbol/text
lockup in light/dark mode with no bloom.

- [x] T011 [P] [US2] Add semantic variant tests in `FrontEnd/OneItb-FE/src/Components/branding/BrandLockup.test.jsx`
- [x] T012 [US2] Implement the atomic lockup in `FrontEnd/OneItb-FE/src/Components/branding/BrandLockup.jsx`
- [x] T013 [US2] Remove default dark bloom from `FrontEnd/OneItb-FE/src/Components/branding/BrandLogo.jsx`
- [x] T014 [P] [US2] Replace the private footer usage in `FrontEnd/OneItb-FE/src/Components/layout/Footer.jsx`
- [x] T015 [P] [US2] Replace public Hero and identity usages in `FrontEnd/OneItb-FE/src/Components/user/Landing.jsx`
- [x] T016 [US2] Apply compact linked branding in `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`

## Phase 5: User Story 3 - Accessible navigation (P2)

**Independent Test**: Keyboard, Escape, focus restoration, route close and reduced motion
work at desktop, split and mobile widths.

- [x] T017 [P] [US3] Add keyboard/focus tests in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.test.jsx`
- [x] T018 [US3] Implement overflow focus, Escape, outside-click and route cleanup in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- [x] T019 [US3] Preserve header auto-hide accessibility in `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`

## Phase 6: Validation and Closeout

- [x] T020 Run the complete frontend suite/build and record results in `specs/206-adaptive-navigation-brand-lockup/evidence/evidence.md`
- [ ] T021 Execute the role/width/theme matrix from `specs/206-adaptive-navigation-brand-lockup/quickstart.md`
- [x] T022 Update the Spec 206 status in `docs/project_docs/ROADMAP.md`
- [x] T023 Add exactly one completed Spec 206 entry in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T024 Update `docs/audit/DOCUMENTATION_STATUS.md` with browser evidence

## Dependencies & Execution Order

`T001-T005 -> US1`; US2 can proceed in parallel after the inventory. US3 follows the
final overflow structure. Execute final width acceptance together with Spec 207.

## Definition Of Done

- [ ] Progressive overflow is stable for all role/width scenarios.
- [ ] Keyboard and reduced-motion acceptance pass.
- [x] One brand lockup replaces inconsistent dark-mode raster usages.
- [ ] Complete frontend tests/build and browser matrix are evidenced.
