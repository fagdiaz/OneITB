# Feature Specification: Frontend Tracing

**Feature Branch**: `010-frontend-tracing`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Sincronizar el mapeo de variables entre el estado local del formulario React y el esquema de la mutación GraphQL en Register.jsx, e implementar trazabilidad por consola para el campo 'Apellidos' (CU-01)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trazabilidad del Campo Apellidos en Consola (Priority: P1)

Como desarrollador, al revisar las herramientas de desarrollo del navegador durante el registro de usuarios, veo logs claros que trazan el valor del campo "Apellidos" (`form.surname`) antes de enviar la petición de GraphQL, permitiendo diagnosticar problemas de variables.

**Why this priority**: Facilita la depuración del flujo de registro y el diagnóstico de errores de mapeo en el frontend.

**Independent Test**: Completar el formulario, presionar "Registrate" y verificar en la consola del navegador que se imprime el log trazando el valor del apellido.

**Acceptance Scenarios**:
1. **Given** el formulario de registro con datos de entrada, **When** el usuario presiona "Registrate", **Then** se imprime en la consola del navegador un log detallando el valor del apellido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El método `saveUser` en `Register.jsx` debe incluir un `console.log` trazando el valor de `form.surname` (Apellidos) antes del envío.
- **FR-002**: Las variables del hook `useMutation` deben estar perfectamente sincronizadas con el estado local del formulario React.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Presencia de logs de trazabilidad en consola para el apellido al enviar el formulario.
