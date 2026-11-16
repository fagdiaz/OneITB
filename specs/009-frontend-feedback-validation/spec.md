# Feature Specification: Frontend Feedback Validation

**Feature Branch**: `009-frontend-feedback-validation`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Implementar validaciones locales en el formulario de registro (Register.jsx) con feedback amigable en la interfaz en vez de alerts, previniendo enviar campos vacíos del CU-01."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Feedback Visual de Error en la UI (Priority: P1)

Como usuario que comete un error al llenar el formulario de registro (por ejemplo, omitir el apellido o ingresar un correo no institucional), veo un mensaje de error descriptivo rojo en la misma pantalla en lugar de alertas emergentes que interrumpen mi navegación.

**Why this priority**: Mejora sustancialmente la experiencia de usuario (UX) del formulario.

**Independent Test**: Dejar vacío el apellido, presionar "Registrate" y verificar que el texto "El campo Apellidos es obligatorio" se renderiza en la UI.

**Acceptance Scenarios**:
1. **Given** el formulario de registro con campos vacíos o email inválido, **When** el usuario presiona "Registrate", **Then** el formulario no se envía y se muestra una etiqueta de error amigable en la UI.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El componente `Register.jsx` debe manejar un estado local `errorMessage` para capturar errores de validación.
- **FR-002**: Las validaciones del formulario de registro deben mostrar el mensaje correspondiente en el estado `errorMessage` y renderizarlo en la UI.
- **FR-003**: Se debe validar obligatoriamente Nombre, Apellidos, Alias, Email y Contraseña.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los errores de validación local se renderizan directamente en la UI.
