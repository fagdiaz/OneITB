# Quickstart: Production Readiness Hardening

## Backend validation

```powershell
dotnet restore "API Graphql/OneITB/GraphQL.csproj"
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

## Correlation smoke

```powershell
Invoke-WebRequest `
  -Uri "https://localhost:44397/graphql" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "X-Correlation-ID" = "audit-smoke-167" } `
  -Body '{"query":"{ __typename }"}'
```

Expected:

- HTTP response includes `X-Correlation-ID: audit-smoke-167`.
- Backend console log includes the same correlation identifier.

## GraphQL metric smoke

Execute a query that selects list metrics:

```graphql
query AdminMetricSmoke {
  users {
    id
    totalPosts
    totalComments
    totalLikesReceived
    totalReportsReceived
  }
}
```

Expected:

- Query succeeds for an administrator.
- Metric counts are correct.
- DataLoaders batch count loading rather than counting once per returned user.

## Documentation closeout

- Record command outputs and blockers in `evidence.md`.
- Update `ROADMAP.md` only if the executed evidence closes an item.
- Insert one top entry in `DEVELOPMENT_LOG.md`.
