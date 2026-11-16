# Feature Specification: Force Mount CV UI (026)

**Feature Branch**: `026-force-mount-cv-ui`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Montar y renderizar forzosamente los componentes de CV del usuario (ej. ResumePreview, Editor) dentro de la vista UserProfile.jsx utilizando un layout básico de dos columnas. Cero lógica de backend, cero base de datos. Solo integración visual (Frontend Only)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mount CV UI Side-by-Side (Priority: P1)

A logged-in user visiting the profile path `/profile` must see the complete CV Resume layout on the left, and the curriculum forms editor panel on the right.

**Why this priority**: Immediate integration and visual layout validation.

**Independent Test**:
Load the `/profile` page and confirm that the `<ResumePreview />` and `<PersonalForm />` are rendering side-by-side.

**Acceptance Scenarios**:
1. **Given** a user is logged in, **When** they load `/profile`, **Then** the page renders a two-column grid displaying the Live Resume preview on the left and the editor on the right.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mount `<ResumePreview />` on the left column.
- **FR-002**: Mount `<PersonalForm />` on the right column.
- **FR-003**: Provide stable props/mocks to avoid component crashes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clean page load on `/profile` with both components visible.
- **SC-002**: Build compiles cleanly using standard React packaging.
