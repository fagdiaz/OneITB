# Feature Specification: Final Query Alignment

**Feature Branch**: `097-final-query-alignment`

**Created**: 2026-06-13

**Status**: In Progress

## Requirements
- **FR-001**: Alinear la consulta GraphQL `GET_INQUIRIES` en el frontend utilizando la relación `user` pero con propiedades en español (`idUsuario`, `nombre`, `apellidos`, `alias`).
- **FR-002**: Alinear `Feed.jsx` para extraer las propiedades correctas de `post.user`.
- **FR-003**: No realizar seeding en `DbInitializer.cs`.
