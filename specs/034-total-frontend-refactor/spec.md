# Feature Specification: Total Frontend Refactor – Layout & Profile (034)

**Feature Branch**: `034-total-frontend-refactor`

**Created**: 2026-06-10

**Status**: Ready

**Input**: User description: "Ejecutar una refactorización estructural completa del layout global del frontend y la vista de Perfil (/profile). El objetivo es erradicar las dependencias de CSS legacy (grillas rotas) y adoptar nativamente Tailwind CSS v4 para lograr la integración perfecta y estética de los nuevos componentes de CV, asegurando el cumplimiento del RNF-004 (Usabilidad y Adaptabilidad)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global Layout renders without legacy grid collisions (Priority: P1)

Authenticated users navigating any private route see a stable, two-zone layout (top navigation bar + main content area) that does not exhibit broken grid artefacts caused by the old `.layout` CSS class hierarchy.

**Why this priority**: The layout is the shell wrapping all pages. Any breakage here is universal and blocks all other stories.

**Independent Test**: Navigate to `/feed` as a logged-in user and verify the page renders a full-width content area with no horizontal overflow or overlapping sidebar.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they visit `/feed`, **Then** the page renders with a top navbar and the feed content filling available width without horizontal scroll or visual overlap.
2. **Given** a logged-in user, **When** they resize the browser to mobile width (≤768px), **Then** the layout collapses gracefully into a single column without broken grid areas.

---

### User Story 2 - Profile page shows two-column CV workspace (Priority: P2)

Authenticated users visiting `/profile` see a polished two-column workspace: a live A4 document preview on the left and an editable form panel on the right, both rendering full mock data.

**Why this priority**: This is the primary deliverable of the refactor. Without the profile workspace the CV builder feature has no visible entry point.

**Independent Test**: Navigate to `/profile` and verify both columns are visible with `ResumePreview` showing populated data and `PersonalForm` rendered inside the editor panel.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they visit `/profile`, **Then** a two-column grid appears with the CV preview occupying the left column and the editor form occupying the right column.
2. **Given** a logged-in user on a narrow viewport (≤1024px), **When** the screen is below the breakpoint, **Then** the two columns stack vertically with the preview above the editor.

---

### User Story 3 - Legacy CSS removed, Tailwind is sole layout authority (Priority: P3)

After the refactor, no page depends on `.layout`, `.layout__content`, or `.layout__aside` CSS classes for structural positioning. The `PrivateLayout` and `SideBar` components use only Tailwind utility classes.

**Why this priority**: Without eliminating legacy CSS, future changes to the CV components will continue to conflict with the global grid.

**Independent Test**: Verify that `PrivateLayout.jsx` and `SideBar.jsx` contain no legacy BEM class names used for layout positioning.

**Acceptance Scenarios**:

1. **Given** the refactored codebase, **When** a developer inspects `PrivateLayout.jsx`, **Then** no references to `.layout`, `.layout__content`, or `.layout__aside` exist as structural layout containers.
2. **Given** the refactored codebase, **When** `npm run build` is executed, **Then** it completes with zero errors.

---

### Edge Cases

- What happens when the user is not authenticated and accesses `/profile`? The existing `<Navigate to="/login">` guard remains untouched.
- What happens if the sidebar content overflows on small screens? The sidebar becomes a compact strip below the navbar on mobile.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The global layout shell MUST be restructured using Tailwind flex/grid utilities instead of the legacy `.layout` CSS grid.
- **FR-002**: The `.layout`, `.layout__content`, and `.layout__aside` CSS rules in `styles.css` MUST be neutralized.
- **FR-003**: `PrivateLayout.jsx` MUST use exclusively Tailwind utility classes for structural containers.
- **FR-004**: `SideBar.jsx` MUST be refactored to use Tailwind utility classes, preserving all existing data display.
- **FR-005**: `UserProfile.jsx` MUST render a `grid grid-cols-1 lg:grid-cols-2` two-column layout with `ResumePreview` and `PersonalForm` visible and data-fed.
- **FR-006**: `index.css` MUST retain `@import "tailwindcss"` and all CV-compatible global styles.
- **FR-007**: The authentication guard logic inside `PrivateLayout` MUST remain intact.
- **FR-008**: No C# backend code or GraphQL files MUST be modified.

### Key Entities

- **PrivateLayout**: Shell component wrapping all authenticated routes.
- **SideBar**: Right-rail contextual panel. Must adapt to the new flex layout.
- **UserProfile**: The `/profile` page component. Owns the two-column CV workspace.
- **index.css / styles.css**: Global stylesheet pair.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `/feed` and `/profile` render without horizontal overflow on any viewport ≥320px.
- **SC-002**: `npm run build` completes with zero errors after the refactor.
- **SC-003**: `PrivateLayout.jsx` contains zero references to `.layout`, `.layout__content`, or `.layout__aside`.
- **SC-004**: The profile page two-column grid stacks vertically on viewports below 1024px.
- **SC-005**: `ResumePreview` renders with the full mock data object visible on screen.

## Assumptions

- Tailwind CSS v4 is already installed and `@import "tailwindcss"` is already present in `index.css`.
- Font Awesome icons are loaded via CDN in `index.html` and do not need changes.
- The `ResumePreview.tsx` and editor form components are stable and should not be modified.
- The `AuthContext`, `Login`, `Register`, and `Logout` components are out of scope.
