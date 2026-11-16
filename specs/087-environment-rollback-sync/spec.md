# Feature Specification: Environment Rollback Sync

**Feature Branch**: `087-environment-rollback-sync`

**Created**: 2026-06-13

**Status**: Completed

## Requirements
- **FR-001**: Limpiar archivos y carpetas no rastreados generados post-commit tras un `git reset --hard` hacia `ed7d950`.
- **FR-002**: Purgar y recrear el esquema de la base de datos SQL Server (`OneItb`) mediante Entity Framework Core para igualar las migraciones locales históricas vigentes en este commit específico.
