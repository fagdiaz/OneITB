# Feature Specification: Refactor and Clean Up Login/JWT (CU-04)

**Feature Branch**: `012-login-jwt-feature`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Auditar la base de código actual para detectar lógica preexistente del Caso de Uso 04 (Login/JWT), limpiarla/refactorizarla al inglés si existe, o implementarla de forma óptima para evitar duplicación de código, aplicando el protocolo estricto con QA."

## User Scenarios & Testing

### User Story 1 - Clean and Standardized English JWT Login (Priority: P1)
As a user, I want to log in using my email and password to receive a valid JWT token signed in English configuration.

**Independent Test**: Execute the `Login` GraphQL mutation and check that a cryptographically signed token is returned instead of a placeholder.

## Requirements

### Functional Requirements
- **FR-001**: Audit the codebase for Spanish methods or redundant JWT logic (None found; everything was already structured in English interfaces like `IAccountService.cs`).
- **FR-002**: Replace the placeholder `"token_generado_aqui"` in `AccountsService.cs` with an actual cryptographic JWT signed with `Jwt:Key` and `Jwt:Issuer`.
- **FR-003**: The generated JWT token must contain claims for user ID, username, and role.
