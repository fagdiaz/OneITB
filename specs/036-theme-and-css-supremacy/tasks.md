# Tasks: Theme & CSS Supremacy (036)

## Phase 1: Setup
- [x] T001 Update AGENTS.md + .specify/feature.json to point to `specs/036-theme-and-css-supremacy/plan.md`

## Phase 2: CSS Supremacy
- [x] T002 Overwrite `src/index.css` with exact content of `_temp_cv_reference/index.css` — removed old shadcn-style :root variables block, kept Tailwind @theme + @utility + print rules.
- [x] T003 Remove legacy imports (`normalize.css`, `styles.css`, `responsive.css`) from `src/main.jsx` — only `./index.css` remains.
- [x] T004 Empty `src/assets/css/styles.css` — tombstone comment only.
- [x] T005 Empty `src/assets/css/responsive.css` — tombstone comment only.
- [x] T006 Empty `src/assets/css/normalize.css` — tombstone comment only (Tailwind Preflight handles normalization).

## Phase 3: Verification
- [x] T007 `npm run build` → 0 errors, 294 modules, 517ms. CSS bundle: 45.40 kB → 35.15 kB (−10KB freed). ✅
- [x] T008 Update DEVELOPMENT_LOG.md
