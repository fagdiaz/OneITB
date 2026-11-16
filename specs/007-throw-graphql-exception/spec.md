# Feature Specification: Throw GraphQL Exception

**Feature Branch**: `007-throw-graphql-exception`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Lanzar una GraphQLException (de HotChocolate) pasando el mensaje exacto de la entidad cuando se capture ArgumentException durante el registro de usuario."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recepción de GraphQLException en el Cliente (Priority: P1)

Como desarrollador/cliente frontend, al intentar registrar un usuario con campos inválidos (por ejemplo, violando el formato de email o ReDoS), recibo una respuesta estándar de GraphQL con un objeto `errors` conteniendo el mensaje exacto de la excepción de dominio, en lugar de un error de infraestructura 500.

**Why this priority**: Permite que las librerías de clientes de GraphQL (como Apollo Client) intercepten y manejen las fallas de validación usando el bloque `error` estándar del cliente.

**Independent Test**: Disparar una petición de registro inválido y verificar que la respuesta HTTP es 200 pero contiene la sección `errors` en la respuesta JSON con el mensaje adecuado.

**Acceptance Scenarios**:
1. **Given** datos de registro inválidos que disparan `ArgumentException`, **When** se ejecuta la mutación `registerUser`, **Then** la mutación arroja una `GraphQLException` de HotChocolate con el mensaje descriptivo del error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La mutación `RegisterUserAsync` en `Mutation.cs` debe capturar `System.ArgumentException`.
- **FR-002**: Al atrapar la excepción, debe lanzar `new GraphQLException(ex.Message)`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El cliente recibe los errores en el array `errors` estándar de GraphQL.
- **SC-002**: No se generan respuestas de servidor con estado HTTP 500 por ArgumentException.
