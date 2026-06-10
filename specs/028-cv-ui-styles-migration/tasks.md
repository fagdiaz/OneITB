# Tasks: CV UI Styles Migration (028)

**Input**: Design documents from `/specs/028-cv-ui-styles-migration/`

## Phase 1: Setup & Audit
- [x] T001 Audit the package.json and config of `_temp_cv_reference` against the main frontend app.
- [x] T002 Update `FrontEnd/OneItb-FE/package.json` to append missing package dependencies like `@tailwindcss/vite`, `tailwindcss` (v4), and `react-to-print`.

## Phase 2: Foundational Changes
- [x] T003 Configure `vite.config.js` in `FrontEnd/OneItb-FE` to load `tailwindcss` plugin.
- [x] T004 Create `index.css` inside the main frontend project with Tailwind references, Inter font, custom scrollbar utilities, and @media print settings.

## Phase 3: Alignment & Import
- [x] T005 Import `index.css` inside `main.jsx` to register the styles in the main bundle.

## Phase 4: Polish & Verification
- [x] T006 Compile production build via `npm run build` to verify there are no compilation errors.
