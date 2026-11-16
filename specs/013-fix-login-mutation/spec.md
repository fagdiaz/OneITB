# Feature Specification: Fix Login Mutation Alignment (013)

**Feature Branch**: `013-fix-login-mutation`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Auditoría Backend (Specify & Plan): Ejecuta $speckit-specify para abrir un fix (ej. 013-fix-login-mutation). Lee Mutation.cs y DTOs.cs. Identifica cómo se llama exactamente el método (ej. Login), qué parámetros recibe y qué devuelve (ej. AuthPayload con campos Token y User)."

## User Scenarios & Testing

### User Story 1 - Match Frontend Query fields (Priority: P1)
As a user logging in, the client should query `token`, `username`, and `isAuthenticated` from the `login` mutation successfully.

**Independent Test**: Run query verification on HotChocolate endpoint using Apollo Client query signatures.

## Requirements

### Functional Requirements
- **FR-001**: Review `Mutation.cs` to confirm method name is `Login`.
- **FR-002**: Confirm it receives `LoginInput` and returns `AuthPayload`.
- **FR-003**: Verify returned properties match exactly.
