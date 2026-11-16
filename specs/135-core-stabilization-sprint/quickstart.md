# Quickstart: Core Stabilization Sprint

## 1. Start from a clean runtime

```powershell
git status --short
dotnet dev-certs https --check --trust
sqllocaldb info MSSQLLocalDB
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Smoke test:

```powershell
Invoke-WebRequest -Method Post -Uri "https://localhost:44397/graphql" -ContentType "application/json" -Body '{"query":"query { __typename }"}'
```

Expected:

```json
{"data":{"__typename":"Query"}}
```

## 2. Validate deferred workflows

Execute authenticated GraphQL operations for:

1. Subject creation with career, year, and prerequisites.
2. Administrator promotion with password confirmation.
3. Administrator role/status protection.
4. File upload through `/api/upload`.
5. Publication/comment creation with returned `fileUrl`.
6. Query readback for `fileUrl` and media fields.

Record requests and responses in `evidence.md`.

## 3. Implement P1 features

1. Add paginated feed contract and migrate main feed UI to it.
2. Add orphan upload cleanup service and validate referenced/unreferenced files.
3. Add moderation audit persistence, mutation instrumentation, admin query, and UI review.

## 4. Validate closeout

```powershell
dotnet ef migrations has-pending-model-changes --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run build
```

Required runtime checks:

- `inquiriesPage` returns at least two pages without duplicates.
- Cleanup deletes an old unreferenced file and preserves referenced files.
- At least three moderation actions create audit rows.
- Roadmap verification updates are backed by evidence.
