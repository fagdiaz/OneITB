# Quickstart: Spec 165 Academic Hub Hardening

## Validation Commands

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
npm.cmd run build
```

Run the frontend build from `FrontEnd/OneItb-FE`.

## Runtime Smoke

Start the backend on an available local HTTP port and execute:

```graphql
{
  __type(name: "Query") {
    fields {
      name
    }
  }
}
```

Expected: `resourcesBySubject` and `academicResources` are both exposed.

## Manual Browser QA

1. Login with a user enrolled in at least one career.
2. Open `/academic`.
3. Select career and subject.
4. Open "Nuevo recurso".
5. Upload a file or add a URL, choose category/version, save.
6. Confirm the card appears without page reload.
7. Type in the search field and confirm cards filter instantly.
8. Delete the created resource and confirm it disappears.
