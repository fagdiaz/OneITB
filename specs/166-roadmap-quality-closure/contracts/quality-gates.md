# Quality Gate Contract: Spec 166

## Local Commands

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
pushd FrontEnd/OneItb-FE; npm.cmd run build; popd
git diff --check
```

## CI Contract

The repository workflow MUST:

- Run on pull request and push.
- Use .NET 8.
- Restore and test `API Graphql/Tests/Services.Tests/Services.Tests.csproj`.
- Build `API Graphql/OneITB/GraphQL.csproj` in Release.
- Use Node.js 20 or newer.
- Run `npm ci` when a lockfile exists, otherwise `npm install`.
- Run `npm run build` in `FrontEnd/OneItb-FE`.
- Avoid plaintext secrets.

## Roadmap Contract

- Auth/feed automated tests may be promoted when test evidence passes.
- CI pipeline may be promoted when workflow exists and local equivalent gates pass.
- SQL Server integration tests remain pending unless a SQL-backed test harness is implemented.
