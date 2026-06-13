# OneITB23

Aplicacion web academica con frontend React y backend GraphQL.

## Stack vigente

- Backend: .NET 8, HotChocolate 14.2.0, Entity Framework Core 8.0.6.
- Base de datos: SQL Server.
- Frontend: React 18, Apollo Client 3.7, Vite 8 y Tailwind CSS 4.
- Integracion de negocio: endpoint unico `/graphql`.

## Estructura

- `API Graphql/`: solucion backend y migraciones.
- `FrontEnd/OneItb-FE/`: aplicacion web.
- `specs/`: especificaciones, planes y tareas por feature.
- `docs/audit/`: runbook, estado, auditorias y registro de desarrollo.
- `docs/project_docs/`: arquitectura, requerimientos y roadmap funcional.

## Gobernanza

Antes de implementar:

1. Leer `AGENTS.md`.
2. Leer `.specify/feature.json`.
3. Leer la spec, el plan y las tareas de la feature activa.
4. Leer `.specify/memory/constitution.md`.

Una feature no se considera completa solo porque compila. Los contratos
GraphQL, la persistencia, la autenticacion y los flujos de navegador deben
validarse en runtime cuando sean afectados.

## Comandos principales

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

```powershell
Set-Location FrontEnd/OneItb-FE
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```

Consultar:

- `docs/audit/RUNBOOK_DEV.md`
- `docs/audit/fix-roadmap-13-06-2026.md`
- `docs/audit/DEVELOPMENT_LOG.md`
