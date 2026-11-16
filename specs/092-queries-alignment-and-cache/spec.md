# Feature Specification: Queries Alignment and Cache

**Feature Branch**: `092-queries-alignment-and-cache`

**Created**: 2026-06-13

**Status**: In Progress

## Requirements
- **FR-001**: Alinear los nombres de los endpoints GraphQL en el cliente (`getSubjects` y `getInquiries`) con el esquema de HotChocolate.
- **FR-002**: Deshabilitar la caché de Apollo para las consultas `GET_SUBJECTS` y `GET_INQUIRIES` usando `fetchPolicy: 'network-only'`.
- **FR-003**: Implementar el renderizado dinámico de las publicaciones del muro consumiendo `GET_INQUIRIES` y descartando los Mocks.
