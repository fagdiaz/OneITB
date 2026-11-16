# Feature Specification: Navigation & Profile Revamp (022)

**Feature Branch**: `022-navigation-profile-revamp`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Refactorizar la navegación global (Header/Nav) eliminando enlaces obsoletos y creando un menú de usuario dinámico. Además, analizar e integrar los componentes personalizados de CV (editor, resume, ui) en la vista de Perfil, invirtiendo su layout para que funcione como el perfil público de la red social."

## User Scenarios & Testing

### User Story 1 - Dynamic Navbar & User Menu (Priority: P1)
As a logged-in user, I want a dynamic menu in the navigation bar showing my avatar and alias, with clean working routes to my feed and profile, and a clean logout option.

**Acceptance Scenarios**:
1. **Given** a user is logged in, **When** they click their username in the navbar, **Then** they are navigated to their UserProfile view.

---

### User Story 2 - CV Integration in Public User Profile (Priority: P2)
As a user, when I view a profile, I want it to act as a public CV dashboard that renders contact details, bio, and social connections cleanly in a LinkedIn-style public CV layout.

**Acceptance Scenarios**:
1. **Given** a user is viewing `/social/profile`, **When** they read the layout, **Then** they see their biography, contacts, and networks in a clear, public resume layout.

## Requirements

### Functional Requirements
- **FR-001**: Remove obsolete navigation hooks and routes.
- **FR-002**: Standardize routing connections using proper NavLinks.
- **FR-003**: Format the `UserProfile.jsx` view to render a public CV/resume board.
