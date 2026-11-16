# Feature Specification: Align GraphQL Mutation

**Feature Branch**: `005-align-graphql-mutation`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Solucionar el Error 400 (Bad Request) de GraphQL alineando la declaración de la mutación de registro en el frontend (Register.jsx) con el esquema de HotChocolate en el backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro Exitoso de Usuario desde el Frontend (Priority: P1)

Como nuevo usuario de OneITB, completo el formulario de registro en la interfaz de usuario de React y envío los datos, logrando un registro exitoso sin errores de red o Bad Request.

**Why this priority**: Es el flujo fundamental de admisión de usuarios en el sistema.

**Independent Test**: Completar el formulario en la página de registro y comprobar que la llamada de red GraphQL retorna con éxito.

**Acceptance Scenarios**:
1. **Given** el formulario de registro en el frontend React, **When** el usuario ingresa sus datos válidos y envía el formulario, **Then** la mutación `registerUser` se envía con la estructura `input: { username, email, password }` y el usuario se registra con éxito.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La mutación de GraphQL en el frontend debe llamarse `registerUser` y coincidir exactamente con el esquema del backend.
- **FR-002**: Los argumentos enviados en el input de la mutación deben ser `username`, `email` y `password`.
- **FR-003**: El componente `Register.jsx` debe consumir e iniciar la mutación con los parámetros correctos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las peticiones de registro no arrojan errores 400.
- **SC-002**: El payload de retorno recupera el `id`, `success` y `message` de la mutación.
