# Feature Specification: Fix Profile GraphQL 400 (027)

**Feature Branch**: `027-fix-profile-graphql-400`

**Created**: 2026-06-09

**Status**: Ready

**Input**: User description: "Solucionar el error HTTP 400 (Bad Request) en la ruta /profile alineando la consulta de Apollo Client (useQuery) con el esquema exacto de HotChocolate del backend y garantizando el envío correcto de variables y contexto de sesión."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean Profile Query Load (Priority: P1)

Authenticated users loading `/profile` should see their data fetched from the database successfully without HTTP 400 errors.

**Why this priority**: Core user data retrieval and layout stability.

**Independent Test**:
Render the `/profile` component and verify that user profile statistics load successfully.

**Acceptance Scenarios**:
1. **Given** a user is logged in, **When** they access `/profile`, **Then** the network response returns HTTP 200 and the profile details load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Align query fields inside `getUserProfile.js` with the backend `ObjectType<User>` schema declaration.
- **FR-002**: Remove unused query parameters in Apollo query definition causing HTTP 400.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clean GraphQL introspected queries execution.
- **SC-002**: Production build compiles with zero errors.
