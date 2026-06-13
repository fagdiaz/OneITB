# Feature Specification: Professional Seed Users

**Feature Branch**: `088-professional-seed-users`

**Created**: 2026-06-13

**Status**: Completed

## Requirements
- **FR-001**: Implementar `DbInitializer.cs` para inyectar 5 usuarios base (Administrador, Estudiante, Profesor, Moderador, Empleador) con la contraseña `Test1234!` cifrada en BCrypt.
- **FR-002**: Utilizar GUIDs constantes válidos e inmutables para garantizar que la recreación repetitiva de la base de datos no rompa la integridad referencial (`Error 547`) provocada por tokens JWT en caché del frontend que apuntan a IDs de una versión pasada.
