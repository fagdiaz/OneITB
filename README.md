# OneITB23

Red social academica full-stack para estudiantes, profesores, egresados y gestion institucional.

## Estado actual

- Avance detallado: **69% (52/75 items)**.
- Nucleo social, mensajeria y administracion: implementados por etapas.
- Prioridad P0: recuperar runtime local y revalidar features recientes.
- Recursos, notas, SIU y notificaciones academicas: pendientes.

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
specs/                   especificaciones y evidencia por feature
docs/academic/           entregables academicos resumidos
docs/project_docs/       alcance, arquitectura y roadmap
docs/audit/              runbook, estado, historial y auditoria consolidada
```

## Documentacion

| Documento | Uso |
|---|---|
| [Roadmap](docs/project_docs/ROADMAP.md) | Unica fuente de avance, pendientes y prioridades |
| [Alcance y requerimientos](docs/project_docs/scope-and-requirements.md) | Capacidades y roles |
| [Arquitectura](docs/project_docs/architecture-and-design.md) | Stack, dominio y flujos |
| [Runbook](docs/audit/RUNBOOK_DEV.md) | Ejecucion y validacion local |
| [Estado documental](docs/audit/DOCUMENTATION_STATUS.md) | Fuentes canonicas y brechas |
| [Development log](docs/audit/DEVELOPMENT_LOG.md) | Historial inverso de implementaciones |
| [Auditorias historicas](docs/audit/HISTORICAL_AUDITS.md) | Resumen de auditorias supersedidas |

## Flujo de trabajo

1. Leer `AGENTS.md` y `.specify/memory/constitution.md`.
2. Consultar `.specify/feature.json` y la feature activa.
3. Implementar y registrar evidencia real.
4. Ejecutar los gates aplicables del runbook.
5. Actualizar roadmap, log y estado documental.

Compilar es necesario, pero no demuestra que GraphQL, autenticacion, cache o persistencia funcionen.

## Comandos principales

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```
