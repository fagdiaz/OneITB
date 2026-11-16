# Evidence: Local Backend Runtime Unblock

## Status

Completed and runtime-validated on 2026-06-23.

## Baseline Findings

- `API Graphql/OneITB/appsettings.json` keeps strict default SQL encryption with `Encrypt=True;TrustServerCertificate=False`.
- `API Graphql/OneITB/appsettings.Development.json` now uses the local-only fallback `Server=(localdb)\MSSQLLocalDB;Database=OneItb;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True;`.
- `API Graphql/OneITB/Program.cs` clears logging providers and registers Console/Debug, so Windows Event Log is not currently configured by host code.
- `API Graphql/OneITB/Properties/launchSettings.json` sets profile `OneITB` to `ASPNETCORE_ENVIRONMENT=Development` and `https://localhost:44397;http://localhost:5000`.

## Important Distinction

- SQL TLS/certificate failures can be mitigated locally with `TrustServerCertificate=True` in Development.
- `Failed to generate SSPI context` is Windows Integrated Security/Kerberos/SPN and is not fixed by `TrustServerCertificate=True`; local fallback requires LocalDB or SQL Auth via uncommitted environment variable.

## Commands Executed

### Baseline

```powershell
git status --short
```

Result before implementation:

```text
 M .specify/feature.json
```

### HTTPS development certificate recovery

```powershell
dotnet dev-certs https --check
dotnet dev-certs https --clean
dotnet dev-certs https --trust
dotnet dev-certs https --check --trust
```

Final result:

```text
A trusted certificate was found: 57AC1F354BF9B1A8C8B9ED7C765F3A77CEE3E801 - CN=localhost - Valid from 2026-06-23 19:25:41Z to 2027-06-23 19:25:41Z - IsHttpsDevelopmentCertificate: true - IsExportable: true
```

### LocalDB fallback

```powershell
sqllocaldb create MSSQLLocalDB
sqllocaldb start MSSQLLocalDB
sqllocaldb info MSSQLLocalDB
```

Result:

```text
LocalDB instance "MSSQLLocalDB" created with version 15.0.4382.1.
LocalDB instance "MSSQLLocalDB" started.
State: Running
```

### Build

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

Result:

```text
Build succeeded.
16 Warning(s)
0 Error(s)
```

Warnings are existing nullable annotation warnings in `Mutation.cs`, `Query.cs`, `UnitOfWork.cs`, `AccountsService.cs`, and `EntityModel.cs`; no new source code was changed by this spec.

### Runtime startup

Initial `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB` attempted a Debug build and was blocked by an existing IIS Express process holding backend DLLs:

```text
The process cannot access the file ... because it is being used by another process.
The file has been locked by: "IIS Express Worker Process (29124)"
```

IIS Express was stopped and the backend was first validated against the already verified Release build:

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB -c Release --no-build
```

Startup output:

```text
Now listening on: https://localhost:44397
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
Hosting environment: Development
Content root path: F:\React\OneITB23\API Graphql\OneITB
```

The final runtime validation was repeated after setting Development SQL to `Encrypt=True;TrustServerCertificate=True`; startup remained successful with the same Kestrel endpoints and no stderr output.

The exact requested command was then repeated successfully:

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Result:

```text
Now listening on: https://localhost:44397
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
Hosting environment: Development
```

### GraphQL HTTPS smoke test

```powershell
Invoke-WebRequest -Method Post -Uri "https://localhost:44397/graphql" -ContentType "application/json" -Body '{"query":"query { __typename }"}'
```

Result:

```text
HTTPS_STATUS=200
{"data":{"__typename":"Query"}}
```

HTTP diagnostic probe also returned 200 on `http://localhost:5000/graphql`.

### QA

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& ".agents/skills/speckit-qa/scripts/preflight.ps1" -RunBuilds
```

Result:

```json
{"Status":"PASS","FeatureDir":"F:\\React\\OneITB23\\specs\\134-local-backend-runtime-unblock","MissingRequiredFiles":[],"Checklist":{"Total":12,"Open":0},"Scope":{"Backend":true,"Frontend":false,"Data":true,"Security":true,"Realtime":false},"DirtyPathCount":6,"Gates":[{"Name":"git-diff-check","Status":"PASS","ExitCode":0,"Summary":""},{"Name":"backend-release-build","Status":"PASS","ExitCode":0,"Summary":"Compilacion correcta.\n0 Advertencia(s)\n0 Errores"}]}
```

## Blockers Resolved

- SSPI/local SQL dependency: Development no longer depends on `localhost\SQLEXPRESS` with Windows Integrated Security. It uses per-user LocalDB with no committed secrets.
- SQL TLS local development: Development keeps encryption enabled but trusts the local server certificate with `TrustServerCertificate=True`. The strict default config remains unchanged.
- HTTPS certificate: dev certificate was cleaned, recreated, trusted, and verified.
- Windows Event Log: `Program.cs` uses Console/Debug logging and does not register Event Log.
- Port/runtime conflict: an existing IIS Express process was holding backend binaries and interfering with local startup; it was stopped for validation.

## Files Changed

- `API Graphql/OneITB/appsettings.Development.json`
- `docs/audit/RUNBOOK_DEV.md`
- `docs/project_docs/ROADMAP.md`
- `docs/audit/DEVELOPMENT_LOG.md`
- `docs/audit/DOCUMENTATION_STATUS.md`
- `specs/134-local-backend-runtime-unblock/tasks.md`
- `specs/134-local-backend-runtime-unblock/evidence.md`

No GraphQL resolver, EF migration, entity, service, or production/default appsettings file was changed.
