# Quickstart: Demo Database Rebaseline

## 1. Configure local secrets

```powershell
dotnet user-secrets set "Seed:DemoPassword" "<demo-password>" `
  --project "API Graphql/OneITB/GraphQL.csproj"
```

Do not place the value in `.env`, documentation, scripts, or Git.

## 2. Run baseline

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations has-pending-model-changes --configuration Release `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

## 3. Execute guarded rebaseline

```powershell
powershell -ExecutionPolicy Bypass -File scripts/reset-demo-database.ps1 `
  -ConfirmDatabaseReset
```

## 4. Run finite acceptance

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-demo-database.ps1
```

## 5. Review evidence

- `specs/196-demo-database-rebaseline/evidence.md`
- ignored backup under `backups/local-demo/`
- canonical documentation diff

Never proceed if the script reports a destination mismatch or unverified backup.
