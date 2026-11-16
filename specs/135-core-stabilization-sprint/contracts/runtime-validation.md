# Runtime Validation Contract: Core Stabilization Sprint

## Required local startup

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Expected:

- HTTPS listens on `https://localhost:44397`.
- GraphQL accepts `query { __typename }` with HTTP 200.
- No Event Log, SQL SSPI, or HTTPS certificate crash.

## Required build gates

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run build
```

## Required persistence gates

- EF database is updated after new migration.
- `dotnet ef migrations has-pending-model-changes` reports no pending model changes after migration.

## Required evidence

`specs/135-core-stabilization-sprint/evidence.md` must record:

- commands executed
- GraphQL operations tested
- upload request outcome
- migration/build results
- bugs found and fixes applied
- roadmap items moved from `[I]` or `[P]/[B]` to `[V]`
