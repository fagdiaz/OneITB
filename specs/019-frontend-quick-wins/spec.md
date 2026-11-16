# Feature Specification: Frontend Quick Wins (019)

**Feature Branch**: `019-frontend-quick-wins`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Aplicar los 'Quick Wins' (mejoras rápidas de alto valor) identificados en el FRONTEND_AUDIT_REPORT.md: arreglar el CSS Grid del Layout, activar los enlaces de navegación, e implementar la nomenclatura estándar en el frontend de React."

## User Scenarios & Testing

### User Story 1 - Clean Grid Layout Rendering (Priority: P1)
As a logged-in user, I want the sidebar and main feed content columns to render correctly aligned in a 70% / 30% grid split instead of breaking below the feed layout.

**Acceptance Scenarios**:
1. **Given** a user is logged in, **When** they view the dashboard, **Then** the main feed column and SideBar side column align perfectly next to each other.

---

### User Story 2 - Navigation Active Links (Priority: P2)
As a logged-in user, I want the navbar links (Inicio, Timeline, Logout) to act as proper React Router SPA navigators instead of dead hashes.

**Acceptance Scenarios**:
1. **Given** a user is viewing `/social`, **When** they click "Cerrar sesión", **Then** they are logged out and navigated to `/login` without page reloads.

## Requirements

### Functional Requirements
- **FR-001**: Move `.layout` container wrapping logic to layout files (`PrivateLayout.jsx`, `PublicLayout.jsx`) to keep grid structural direct descendants intact.
- **FR-002**: Replace dead `href="#"` links in `Nav.jsx` with `<NavLink>` components pointing to `/social/feed` and standard routes.
- **FR-003**: Rename `feed.jsx` component to camelcase standard `Feed.jsx` and adjust imports.
