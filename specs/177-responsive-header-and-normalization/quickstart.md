# Quickstart: Spec 177

## Automated checks

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
cd FrontEnd/OneItb-FE
npm.cmd run build
cd ../..
git -c core.autocrlf=false diff --check
```

## Manual checks

1. Open the app at `http://localhost:5173`.
2. Resize viewport below `lg`.
3. Confirm header does not create horizontal scroll.
4. Confirm hamburger opens route options and closes on route change/outside click.
5. Confirm React Router future warnings are gone.
6. Register a user with mixed-case email and lowercase names; verify persisted normalized values.
7. Load a local `/uploads/*.jpg` avatar and verify no `OpaqueResponseBlocking` warning.
