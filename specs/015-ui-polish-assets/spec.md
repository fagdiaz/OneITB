# Feature Specification: UI Polish and Assets Fix (015)

**Feature Branch**: `015-ui-polish-assets`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Solucionar los errores de carga de recursos estáticos (imagen 404 y fuentes corruptas) y realizar un refactor visual (UI/UX) inicial en los componentes de autenticación y el layout principal, mejorando la usabilidad general del frontend."

## User Scenarios & Testing

### User Story 1 - Clean Icon rendering (Priority: P1)
As a user, all icons on the dashboard and menus should render correctly without console errors or warnings about corrupt font files.

### User Story 2 - Dynamic User Avatars (Priority: P2)
As a logged in user, my sidebar should display a clean avatar matching my name using a dynamic avatar generator API.

## Requirements

### Functional Requirements
- **FR-001**: Load FontAwesome from cdnjs and disable local font imports to avoid corruption errors.
- **FR-002**: Replace static user avatar path in `SideBar.jsx` with ui-avatars.com dynamic service.
- **FR-003**: Apply visual CSS upgrades for forms and layouts.
