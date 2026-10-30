---
name: "speckit-db-audit"
description: "Specialized database, EF Core, and Seeder deep-audit engine. Inspects DbContext, entities, relationships, foreign keys, cascade rules (DeleteBehavior.Restrict), migrations, and test/demo seeders (EnterpriseDemoSeeder.cs). Ensures 100% data coverage for all system roles and zero broken relational references."
compatibility: "Cross-platform (.NET 8 EF Core, SQL Server, Postgres, SQLite, Prisma, TypeORM). Operates strictly read-only on persistence code and schemas."
metadata:
  author: "github-spec-kit"
  version: "1.0.0"
  type: "db-auditor"
---

# Speckit DB Audit - Database, Seeder & EF Core Engine

A dedicated audit engine to verify persistence layer integrity, EF Core configuration, migration alignment, and demo/test data coverage.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      SPECKIT DB & SEEDER AUDIT                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 1. Schema & DbContext Inspection                              │
    │    - Foreign Keys, Indexes, Restrict DeleteBehaviors          │
    │    - Shadow properties check, Concurrency tokens              │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 2. Migration Drift & Sync Check                               │
    │    - Run `dotnet ef migrations has-pending-model-changes`     │
    │    - Inspect recent migrations for non-idempotent scripts     │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 3. Deep Seeder Audit (EnterpriseDemoSeeder.cs)                │
    │    - Role coverage: 6 roles represented with valid test data  │
    │    - Password hashes: BCrypt format, cost factor, salt        │
    │    - Relational integrity: No orphaned UserCareers/Inquiries │
    │    - Academic data: Careers, Subjects, Prerequisites loaded   │
    │    - Employment data: JobOffers, Applications, Curriculums    │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 4. Output Generation & State Update                           │
    │    Writes `docs/audit/full_audit/MODULE_08_DATABASE_SEEDER.md`│
    │    Updates `audit_state.json`                                 │
    └───────────────────────────────────────────────────────────────┘
```

## Audit Dimensions

### 1. Model Configuration & Integrity
- **Restricción de Borrado:** Verificar que las entidades utilicen `DeleteBehavior.Restrict` para evitar borrados accidentales en cascada en relaciones críticas (ej. usuarios, carreras, materias).
- **Índices y Búsquedas:** Comprobar que existan índices únicos en emails, CUITs, slugs o nombres de usuario.
- **Tipado y Longitudes:** Verificar que campos sensibles como contraseñas sean `char(60)` para BCrypt, y que las cadenas no queden como `nvarchar(max)` innecesario.

### 2. Seeder Audit (`EnterpriseDemoSeeder.cs`)
- **Cobertura de los 6 Roles:**
  * `Administrador`: ¿Tiene cuenta demo operativa?
  * `Moderador`: ¿Tiene cuenta demo operativa?
  * `Profesor`: ¿Tiene vinculación a carreras en `UserCareers` y materias asignadas para probar el panel docente?
  * `Estudiante`: ¿Tiene cursadas, calificaciones y correlativas para probar el avance académico?
  * `Egresado`: ¿Tiene carrera completada y perfil de búsqueda laboral activo?
  * `Empleador`: ¿Tiene empresa asociada, CUIT válido (Módulo 11) y ofertas publicadas?
- **Consistencia Criptográfica:** Contraseñas de prueba con hashes BCrypt válidos (coste 11 o 12) que coincidan con las credenciales documentadas en el runbook.
- **Consistencia Temporal:** Fechas UTC consistentes en publicaciones, comentarios y postulaciones.

### 3. Report Output
Escribir el reporte en `docs/audit/full_audit/MODULE_08_DATABASE_SEEDER.md` detallando:
- Entidades auditadas y estado de sus relaciones.
- Análisis del Seeder tabla por tabla.
- Matriz de cobertura de los 6 roles.
- Gaps o datos faltantes para la defensa.
