# Implementation Plan: Environment Rollback Sync

## Key Changes

1.  **DevOps (`Terminal`)**:
    -   `git clean -fd`: Extermina restos del futuro (`specs/`, migraciones huérfanas, etc.).
    -   `dotnet ef database drop --force`: Destruye el esquema y las tablas persistentes en SQL Server.
    -   `dotnet ef database update`: Levanta nuevamente la base de datos usando **exclusivamente** las migraciones de EF Core que existen dentro del commit `ed7d950`.
