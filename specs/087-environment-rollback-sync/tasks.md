# Tasks: Environment Rollback Sync

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: DevOps & Git Cleanup

- [x] T001 Ejecutar `git clean -fd` para eliminar todos los archivos no rastreados del entorno local.
- [x] T002 Ejecutar `dotnet ef database drop --force` para limpiar el SQL Server.
- [x] T003 Ejecutar `dotnet ef database update` para aplicar el esquema puro del commit actual y verificar "Done.".
