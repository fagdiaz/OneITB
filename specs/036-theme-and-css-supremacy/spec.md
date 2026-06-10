# Feature Specification: Theme & CSS Supremacy (036)

**Feature Branch**: `036-theme-and-css-supremacy`
**Created**: 2026-06-10
**Status**: Ready

**Input**: "Erradicar definitivamente cualquier hoja de estilos heredada y establecer el sistema de diseño de _temp_cv_reference como única fuente de verdad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — App renders with correct Inter typography and clean slate-based palette (Priority: P1)

All pages render using Inter font and the Tailwind slate/white design tokens, with no browser-default serif fonts or old legacy color overrides.

**Acceptance Scenarios**:
1. **Given** the app loads, **When** any page is displayed, **Then** body text uses Inter (sans-serif), background is #f8fafc (slate-50), and there are no blue/purple legacy accent colors from the old `:root` block.
2. **Given** `npm run build` runs, **Then** it completes with 0 errors.

### User Story 2 — No legacy CSS files are imported at the entry point (Priority: P2)

`main.jsx` only imports `./index.css`. No `styles.css`, `normalize.css`, or `responsive.css` imports remain.

**Acceptance Scenarios**:
1. **Given** the app entry point, **When** a developer reads `main.jsx`, **Then** only `import './index.css'` is present for stylesheets.

## Requirements *(mandatory)*

- **FR-001**: `src/index.css` MUST be overwritten with the exact content of `_temp_cv_reference/index.css`.
- **FR-002**: `src/main.jsx` MUST have `styles.css`, `normalize.css`, and `responsive.css` imports removed.
- **FR-003**: `src/assets/css/styles.css` and `responsive.css` MUST be emptied to prevent accidental re-import.
- **FR-004**: `index.html` Google Fonts `<link>` for Inter MUST remain intact.
- **FR-005**: No backend or GraphQL files may be modified.

## Success Criteria *(mandatory)*

- **SC-001**: `npm run build` → 0 errors.
- **SC-002**: `main.jsx` contains exactly 1 CSS import: `./index.css`.
- **SC-003**: `assets/css/styles.css` and `responsive.css` are empty or contain only a deprecation comment.
