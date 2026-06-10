# Feature Specification: Header UX & CV Profile (022)

**Feature Branch**: `022-header-ux-cv-profile`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Refactorizar la navegación global (Header/Nav) e integrar los componentes personalizados de CV en la vista de Perfil."

## User Scenarios & Testing

### User Story 1 - Header Navigation Links & Logo (Priority: P1)
As a logged-in user, I want the "ONEITB" title in the navbar to navigate to the default page and the "Inicio" link to point directly to `/social/feed`.

**Acceptance Scenarios**:
1. **Given** a user is logged in, **When** they click "ONEITB", **Then** they are navigated to `/social`.
2. **Given** a user is logged in, **When** they click "Inicio", **Then** they are navigated to `/social/feed`.

---

### User Story 2 - Public Profile Layout with CV Details (Priority: P2)
As a user, I want my profile page to load dynamic contact options, social media connections, and personal biographies cleanly.

**Acceptance Scenarios**:
1. **Given** a user views their profile, **When** they read the layout, **Then** all details are loaded.

## Requirements

### Functional Requirements
- **FR-001**: Clean up old navigation links.
- **FR-002**: Map "ONEITB" logo link to the dashboard view.
- **FR-003**: Ensure layout of `UserProfile.jsx` follows PascalCase guidelines.

## Success Criteria
- Navigation links updated correctly without broken anchors.
- Profile page successfully renders dual-column layout.
- Frontend builds cleanly via production compilation.

