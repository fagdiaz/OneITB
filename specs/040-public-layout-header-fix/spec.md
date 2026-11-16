# Feature Specification: Public Layout Header Fix (040)

**Feature Branch**: `040-public-layout-header-fix`
**Created**: 2026-06-10
**Scope**: Frontend Only

## Problem Statement
The Header component is currently only rendered inside `PrivateLayout`. As a result, public views like Login, Register, and Home are missing the top navigation bar. When the Header is added to public routes, it will crash or display incorrectly if there is no authenticated user.

## Proposed Solution
1. Add conditional rendering to `Header.jsx` to show login/register buttons when unauthenticated.
2. Inject `Header` into `PublicLayout.jsx` with proper layout wrappers (flex column, min-height).

## Success Criteria
- SC-001: Header is visible on public routes.
- SC-002: Header displays Login/Register buttons when no auth token is present.
- SC-003: No errors are thrown when unauthenticated.
