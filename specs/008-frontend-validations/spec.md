# Feature Specification: Frontend Validations

**Feature Branch**: `008-frontend-validations`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Implementar validaciones locales en el formulario de registro (Register.jsx) para asegurar que todos los campos requeridos por el CU-01 se envíen correctamente, y verificar el mapeo de variables."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validación Local de Campos en Registro (Priority: P1)

Como usuario que se está registrando, si intento enviar el formulario con campos vacíos o con datos inválidos (ej. email fuera del dominio corporativo o contraseña muy corta), el frontend debe interceptar el envío de forma local y alertarme sin disparar peticiones de red GraphQL innecesarias.

**Why this priority**: Mejora el rendimiento del frontend, reduce cargas de red y entrega respuestas de validación instantáneas al usuario.

**Independent Test**: Dejar campos vacíos o escribir un mail sin `@itbeltran.com.ar` y presionar "Registrate", comprobando que aparece una alerta del navegador y la mutación no se ejecuta en la consola de red.

**Acceptance Scenarios**:
1. **Given** el formulario de registro con algún campo obligatorio vacío, **When** se presiona "Registrate", **Then** se muestra un mensaje de alerta local indicando el campo faltante y no se envía la petición.
2. **Given** un correo electrónico que no finaliza en `@itbeltran.com.ar`, **When** se envía el formulario, **Then** se alerta al usuario del requisito del dominio institucional y no se envía la petición.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El componente `Register.jsx` debe validar localmente que `name`, `surname`, `alias`, `email` y `password` no estén vacíos.
- **FR-002**: El correo ingresado debe ser validado con expresión regular para asegurar que pertenezca al dominio oficial `@itbeltran.com.ar`.
- **FR-003**: El nombre de usuario (alias/name) debe tener una longitud mínima de 3 caracteres y la contraseña una longitud mínima de 8 caracteres (según especificaciones del dominio).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cero peticiones de red enviadas para registros con campos obligatorios vacíos o dominio de correo ajeno a `@itbeltran.com.ar`.
