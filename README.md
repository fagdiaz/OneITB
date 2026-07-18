# OneITB23

Red social academica full-stack para estudiantes, profesores, egresados y gestion institucional.

## Estado actual

- Avance detallado: **98% (97/99 items)**; core funcional Feature Complete.
- Nucleo social, mensajeria, administracion, perfiles/CV, privacidad y modulo academico: implementados por etapas.
- Prioridad P0: cerrar regresion visual del panel admin y ampliar cobertura automatizada frontend/GraphQL SQL.
- Recursos, notas, SIU mock y notificaciones academicas: implementados a nivel `[I]`; requieren regresion autenticada de navegador para elevarse a `[V]`.
- Over-delivery 2026-07-06: Audit Trail EF, constancias academicas, credenciales publicas aprobadas y toasts globales implementados; Google SSO queda bloqueado hasta tener credenciales OAuth institucionales reales.
- Code Freeze 2026-07-06: Error Boundary global, filtro central de errores GraphQL y baselines de pruebas frontend/GraphQL implementados.
- Cloud/DevOps 2026-07-07: Docker productivo API/Web, Redis Pub/Sub condicional, Cloudinary opcional, rate limiting, security headers y npm audit productivo en cero vulnerabilidades conocidas.
- Security/Seeding 2026-07-07: profundidad maxima GraphQL, lockout de cuenta por fuerza bruta y seeding demo/productivo configurable sin secretos versionados.
- Privacy/SMTP Smoke 2026-07-08: perfiles privados con masking backend-side y prueba SMTP admin-only implementados.

Consultar el [roadmap unico](docs/project_docs/ROADMAP.md) para estado, evidencia y prioridades.

## Stack

- Backend: .NET 8, HotChocolate 14.2.0 y Entity Framework Core 8.0.6.
- Base de datos: SQL Server.
- Frontend: React 18, Apollo Client 3.7, Vite 8 y Tailwind CSS 4.
- Contratos: GraphQL HTTP/WebSocket; REST solo para upload binario desacoplado.

## Estructura del repositorio

```text
API Graphql/             backend, dominio, servicios y migraciones
FrontEnd/OneItb-FE/      cliente React
docs/academic/           entregables academicos resumidos
docs/entrega_final/      memoria tecnica final para la practica profesionalizante
docs/project_docs/       alcance, arquitectura y roadmap
docs/audit/              runbook, estado, historial y auditoria consolidada
```

Las carpetas de trabajo de agentes (`specs/`, `.specify/`, `.agents/`, `core-web/`) quedan fuera del repositorio profesional mediante `.gitignore`. La evidencia consolidada que debe viajar con el proyecto vive en `docs/`.

## Documentacion

| Documento | Uso |
|---|---|
| [Documento base de Practica Profesionalizante III](docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md) | Memoria tecnica integral lista para conversion a Word/PDF |
| [Roadmap](docs/project_docs/ROADMAP.md) | Unica fuente de avance, pendientes y prioridades |
| [Alcance y requerimientos](docs/project_docs/scope-and-requirements.md) | Capacidades y roles |
| [Arquitectura](docs/project_docs/architecture-and-design.md) | Stack, dominio y flujos |
| [Runbook](docs/audit/RUNBOOK_DEV.md) | Ejecucion y validacion local |
| [Estado documental](docs/audit/DOCUMENTATION_STATUS.md) | Fuentes canonicas y brechas |
| [Development log](docs/audit/DEVELOPMENT_LOG.md) | Historial inverso de implementaciones |
| [Reporte final de auditoria](docs/audit/FINAL_AUDIT_REPORT.md) | Cierre tecnico vigente para evaluacion academica |
| [Auditorias historicas](docs/audit/HISTORICAL_AUDITS.md) | Resumen de auditorias supersedidas; no reemplaza el reporte final |

## Flujo de trabajo

1. Consultar `docs/project_docs/ROADMAP.md` como fuente unica de avance.
2. Implementar y registrar evidencia real.
3. Ejecutar los gates aplicables del runbook.
4. Actualizar roadmap, log y estado documental.
5. Mantener fuera del commit los artefactos locales de agentes, specs y logs temporales.

Compilar es necesario, pero no demuestra que GraphQL, autenticacion, cache o persistencia funcionen.

## Comandos principales

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```
