# Tasks: Total Frontend Refactor – Layout & Profile (034)

**Input**: Design documents from `/specs/034-total-frontend-refactor/`

## Phase 1: Setup
- [x] T001 Update AGENTS.md to point plan reference to `specs/034-total-frontend-refactor/plan.md`

## Phase 2: Foundational Changes (P1 blocker)
- [x] T002 Neutralize legacy `.layout` grid rules in `FrontEnd/OneItb-FE/src/assets/css/styles.css` — comment out `display: grid`, `grid-template-areas`, `grid-template-rows`, `grid-template-columns` on `.layout`, `.layout__content`, and `.layout__aside`.

## Phase 3: Global Layout Refactor (P1 — US1)
- [x] T003 [US1] Rewrite `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx` — replace `.layout` div with `flex flex-col min-h-screen bg-slate-50`, replace `.layout__content` section with `<main className="flex-1 overflow-y-auto">`, relocate or remove SideBar from grid flow.
- [x] T004 [US1] Rewrite `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx` — replace all BEM layout class names with Tailwind equivalents, preserve avatar/stats/form UI.
- [x] T005 [US1] Rewrite `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx` — replace `.layout__navbar` class with Tailwind `w-full bg-slate-900 flex items-center h-14 px-4` to remove dependency on legacy navbar styles.

## Phase 4: Profile Two-Column CV Workspace (P2 — US2)
- [x] T006 [US2] Verify `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx` renders correctly once legacy CSS is removed — confirmed `grid grid-cols-1 lg:grid-cols-2` layout is intact and `ResumePreview` receives the full `cvDataMock` object.
- [x] T007 [US2] Ensure `UserProfile.jsx` header uses Tailwind only — removed `content__header` and `content__title` class references, replaced with Tailwind heading row with blue accent bar.

## Phase 5: CSS Legacy Purge (P3 — US3)
- [x] T008 [US3] Mark `FrontEnd/OneItb-FE/src/assets/css/responsive.css` responsive overrides for `.layout` as deprecated with explanatory comment header.

## Phase 6: Polish & Verification
- [x] T009 Build validation: `npm run build` completed successfully with 0 errors (293 modules transformed, built in 507ms).
- [x] T010 Update `AGENTS.md` plan reference to point to `specs/034-total-frontend-refactor/plan.md`.
