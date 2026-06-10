# Feature Specification: Router Fix & CV Layout (023)

**Feature Branch**: `023-router-fix-and-cv-layout`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Corregir el enrutamiento de React (React Router) eliminando el prefijo obsoleto /social, crear una Landing Page en el Home (/), y unificar la vista de Perfil (/profile) en un diseño estricto de dos columnas que integre los componentes de CV, eliminando sub-rutas innecesarias como /profile/edit."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public Landing & Simplified Paths (Priority: P1)

Users should land on a welcome landing page at `/` with clean login/register access points. All main app sections must run without the `/social` prefix.

**Why this priority**: Core navigation paths and first impression UX.

**Independent Test**:
Can be verified by loading `/` to see the landing page, and navigating to `/feed` and `/profile` after login.

**Acceptance Scenarios**:
1. **Given** a user navigates to `/`, **When** not authenticated, **Then** they see the Welcome Landing Page with links to login and register.
2. **Given** an authenticated user, **When** they click "Inicio" or ONEITB logo, **Then** they navigate to `/feed` and `/` respectively without `/social` prefix.

---

### User Story 2 - Integrated Profile Dual Column Layout (Priority: P2)

Users can view and edit their profile and CV details in a single dual-column screen under `/profile`.

**Why this priority**: Avoid complex sub-navigation (`/profile/edit`) and consolidate all bio/social details into a single responsive view.

**Independent Test**:
Load `/profile` and verify that the CV preview is on the left column and the editable form fields are on the right column.

**Acceptance Scenarios**:
1. **Given** a user visits `/profile`, **When** the page loads, **Then** they see the public LinkedIn-style portfolio/CV on the left, and the update form on the right.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Remove `/social` path nesting from React Router config.
- **FR-002**: Map main path to Landing page.
- **FR-003**: In Header / Nav, map "ONEITB" title link to `/` and "Inicio" to `/feed`.
- **FR-004**: Consolidate profile edit and preview under a single `/profile` path.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clean paths compiled without errors.
- **SC-002**: Direct form updates reflected reactively on the CV profile card layout.

## Assumptions

- No backend GraphQL mutations require schema changes.
