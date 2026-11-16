# Quickstart: Final Release Candidate Audit

## Commands

```powershell
git status --short
git diff --check
docker compose ps
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-build
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run test -- --run --configLoader runner
npm.cmd run build
```

## Optional Runtime/Browser Checks

- Start backend with the documented local profile.
- Execute `{ __typename }`, login, `me`, feed, notifications, academic and jobs smoke operations.
- Start Vite and inspect `/login`, `/feed`, `/profile`, `/academic`, `/empleos`, `/admin`.
