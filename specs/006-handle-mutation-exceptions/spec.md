# Feature Specification: Handle Mutation Exceptions

**Feature Branch**: `006-handle-mutation-exceptions`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Capturar y manejar la excepción System.ArgumentException en la capa de entidades (Entities.dll) durante el registro de usuario (CU-01), evitando que el servidor devuelva un Error 500."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recepción de Errores de Validación Legibles (Priority: P1)

Como desarrollador/cliente frontend, al enviar una mutación de registro con datos de entrada inválidos (ej. formato de email erróneo o nombre vacío), recibo una respuesta controlada con `success = false` y el mensaje de error correspondiente, evitando excepciones de servidor y errores 500.

**Why this priority**: Evita la degradación del servicio ante datos inválidos y permite retroalimentación clara al usuario.

**Independent Test**: Enviar una mutación de registro con campos vacíos y validar que retorna `success: false` con el mensaje descriptivo en el payload de GraphQL.

**Acceptance Scenarios**:
1. **Given** datos de registro inválidos que disparan `ArgumentException` en el backend, **When** se ejecuta la mutación `registerUser`, **Then** el sistema retorna un `UserPayload` con `success: false` y el mensaje de error de validación descriptivo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La mutación `RegisterUserAsync` en `Mutation.cs` debe capturar `System.ArgumentException`.
- **FR-002**: Al capturar la excepción, debe retornar una instancia de `UserPayload` con `Success = false` y `Message` igual al mensaje de la excepción.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ningún registro inválido produce un error de servidor (HTTP 500) en GraphQL.
- **SC-002**: Las excepciones de argumentos se traducen a respuestas `success = false`.
