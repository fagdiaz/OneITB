# Implementation Plan: Local Backend Runtime Unblock

**Branch**: `134-local-backend-runtime-unblock` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/134-local-backend-runtime-unblock/spec.md`

## Summary

Unblock local backend runtime by isolating all insecure/development-only mitigations to `Development`: SQL Server certificate trust only in `appsettings.Development.json`, exact `dotnet dev-certs` recovery commands, and logging providers that avoid Windows Event Log. The plan also distinguishes SQL TLS certificate failures from Windows Integrated Security SSPI/Kerberos failures, because they have different fixes.

## Technical Context

**Language/Version**: .NET 8 backend.

**Primary Dependencies**: ASP.NET Core hosting, EF Core 8.0.6, SQL Server provider, HotChocolate 14.2.0.

**Storage**: SQL Server local database `OneItb`.

**Testing**: `dotnet build`, `dotnet run`, GraphQL HTTP probe, SQL connection probe.

**Target Platform**: Windows developer workstation.

**Project Type**: Backend web service consumed by React frontend.

**Performance Goals**: Backend local startup completes without environment exceptions; GraphQL health query responds within seconds.

**Constraints**:

- No GraphQL resolver/service changes.
- No EF model or migration changes.
- No production connection-string weakening.
- No secrets committed.
- Development-only certificate and SQL trust exceptions must remain scoped to `appsettings.Development.json` or local environment variables.

**Scale/Scope**: Single local development machine.

## Current Findings

- `API Graphql/OneITB/appsettings.json` keeps strict SQL encryption: `Encrypt=True;TrustServerCertificate=False`.
- `API Graphql/OneITB/appsettings.Development.json` already contains a development override: `Encrypt=False;TrustServerCertificate=True`.
- `API Graphql/OneITB/Program.cs` already clears default logging providers and uses Console/Debug, which should avoid Windows Event Log.
- `API Graphql/OneITB/Properties/launchSettings.json` sets `ASPNETCORE_ENVIRONMENT=Development` for `OneITB` and listens on `https://localhost:44397;http://localhost:5000`.
- Remaining risk is runtime environment drift: wrong launch profile, environment variable override, broken ASP.NET dev certificate, or SSPI failure from `Trusted_Connection=True`.

## Constitution Check

- **Decoupled Application Contracts**: PASS. No business REST endpoint or GraphQL contract changes.
- **Strict Security and Password Hashing**: PASS. No auth logic or password handling changes.
- **Input Validation and ReDoS Protection**: PASS. No external input parsing changes.
- **Relational Integrity and Soft Delete**: PASS. No EF model or migration changes.
- **Secure Session and Token Management**: PASS. JWT/CORS/session logic unchanged.
- **Evidence-Based Completion**: PASS with condition. Runtime must be executed and blockers recorded; build alone is insufficient.

## Technical Plan

### 1. SQL Server local connection policy

Keep production strict:

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=OneItb;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=False;"
```

Use Development-only local override:

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=OneItb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
```

If SQL Server local enforces encryption and rejects `Encrypt=False`, use this Development-only alternative:

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=OneItb;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True;"
```

If the exact error is `Failed to generate SSPI context`, do not treat it as TLS. That is Windows Integrated Security/Kerberos/SPN. Development fallback options:

1. Use LocalDB if available:

```powershell
$env:ConnectionStrings__DefaultConnection='Server=(localdb)\MSSQLLocalDB;Database=OneItb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;'
```

2. Use SQL Auth via local environment variable, not committed:

```powershell
$env:ConnectionStrings__DefaultConnection='Server=localhost\SQLEXPRESS;Database=OneItb;User Id=oneitb_dev;Password=<local-password>;Encrypt=True;TrustServerCertificate=True;'
```

### 2. ASP.NET HTTPS development certificate recovery

Commands to document and execute locally:

```powershell
dotnet dev-certs https --check
dotnet dev-certs https --clean
dotnet dev-certs https --trust
dotnet dev-certs https --check --trust
```

Then restart terminal/IDE and rerun:

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

### 3. Windows Event Log avoidance in Development

Current `Program.cs` already uses:

```csharp
logging.ClearProviders();
logging.AddConsole();
logging.AddDebug();
```

Plan validation must confirm no `AddEventLog()` is present and no `EventLog` provider is configured by `appsettings.Development.json`.

If EventLog reappears, restrict the fix to Development configuration or host logging setup. Do not change business code.

### 4. Runtime validation

Build:

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

Run:

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

GraphQL probe:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "https://localhost:44397/graphql" `
  -ContentType "application/json" `
  -Body '{"query":"query { __typename }"}'
```

Expected:

```json
{ "data": { "__typename": "Query" } }
```

## Project Structure

### Documentation (this feature)

```text
specs/134-local-backend-runtime-unblock/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code Scope

```text
API Graphql/OneITB/
├── appsettings.Development.json
├── appsettings.json
├── Program.cs
├── Startup.cs
└── Properties/launchSettings.json

docs/audit/RUNBOOK_DEV.md
```

**Structure Decision**: Implementation, if needed later, should touch only local development configuration and runbook documentation. No GraphQL, EF migrations, services, or frontend files.

## Complexity Tracking

No constitution violations required.

## Missing Planning Inputs

- `docs/project_docs/REQUERIMIENTOS.md`: not present in this repository snapshot.
- `docs/project_docs/PLAN_DE_MITIGACION_EVALUACION.md`: not present in this repository snapshot.

Planning therefore uses `.specify/memory/constitution.md`, `docs/project_docs/ROADMAP.md`, current backend configuration, and `docs/audit/RUNBOOK_DEV.md`.
