# Spec 222: Runbook de Operación Segura y Aislamiento de Reset Destructivo

**ID:** Spec 222  
**Tipo:** Operación y Procedimientos Seguros  
**Hallazgos Abordados:** ORG-03, ORG-07  
**Estado:** CERRADA Y RATIFICADA (100% PASS)  

## 1. Resumen Ejecutivo
Reestructuración de `docs/audit/RUNBOOK_DEV.md` para garantizar un flujo de arranque diario no destructivo sobre base de datos existente en Docker SQL (`oneitb23-sql`). Se eliminaron ramas obsoletas (`codex/199...`), se aisló la ejecución de `reset-demo-database.ps1 -ConfirmDatabaseReset` exclusivamente a la sección de Troubleshooting/Recuperación con respaldos obligatorios, y se eliminaron contraseñas en texto plano sustituyéndolas por la directiva de consulta a `dotnet user-secrets`.
