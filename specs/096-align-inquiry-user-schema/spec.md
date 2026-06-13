# Feature Specification: Align Inquiry and User Schema

**Feature Branch**: `096-align-inquiry-user-schema`

**Created**: 2026-06-13

**Status**: In Progress

## Requirements
- **FR-001**: Alinear la consulta GraphQL `GET_INQUIRIES` en el frontend para que coincida con las propiedades expuestas por el esquema del backend (Error 400).
- **FR-002**: Solicitar los campos en español del tipo `User` expuestos por HotChocolate (`nombre`, `apellidos`, etc.) en lugar de `firstName` y `lastName`.
- **FR-003**: Adaptar la UI (`Feed.jsx`) para renderizar correctamente los datos basados en la nueva estructura de respuesta GraphQL.
