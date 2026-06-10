# Feature Specification: 028-cv-ui-styles-migration

**Feature Branch**: `028-cv-ui-styles-migration`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Migrar las dependencias de UI, la configuración de Tailwind CSS y las variables globales de estilo desde el proyecto de referencia (_temp_cv_reference) hacia el proyecto principal (FrontEnd/OneItb-FE/) para restaurar la apariencia visual exacta de los componentes del CV en la ruta /profile."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exact styling of CV layout (Priority: P1)

Users browsing to `/profile` should see the CV preview and configuration forms styled with the exact colors, layout, fonts, and scrollbars as the reference CV builder project.

**Why this priority**: Core presentation goal for UI migration.

**Independent Test**:
Run local Vite server or run production build check to ensure all styles, scrollbars, and print stylesheets compile and display correctly.

**Acceptance Scenarios**:

1. **Given** a user loads `/profile`, **When** looking at the UI, **Then** all CV components are visual matches to the reference template, containing Inter font and Tailwind CSS utilities.

---

### User Story 2 - Print layout fidelity (Priority: P2)

When user prints or exports the CV page, the print styles (@media print) should correctly format A4 boundaries, hide the editor chrome, and set margin safety.

**Why this priority**: Crucial feature to allow high quality export to PDF.

**Independent Test**:
Verify that printing rules hide `.no-print` classes and enforce absolute A4 sizing.

**Acceptance Scenarios**:

1. **Given** a user triggers print on `/profile`, **When** print preview loads, **Then** the page has size A4, zero margin, and `.no-print` elements are invisible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Incorporate `react-to-print` to package dependencies in the main project.
- **FR-002**: Enable Tailwind CSS v4 in the project configuration via Vite plugin integration.
- **FR-003**: Port the index.css contents from reference project containing global scrollbars, fonts, and page rules.

### Key Entities

- **Style Assets**: The CSS files and package dependencies defining UI rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No compilation errors on `npm run build` with Tailwind CSS v4 and `react-to-print` installed.
- **SC-002**: Proper styling of A4 pages when printing.

## Assumptions

- Tailwind CSS version used is v4.
- Target browser supports standard Flexbox, CSS Grid, and custom scrollbars.
