# Quickstart: QA Master Polish and Layout

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run test -- --run --configLoader runner
npm.cmd run build
```

Manual smoke: anonymous desktop auth links, authenticated header hide/reveal, 320 px composer, mixed cover/YouTube grid, carousel arrows, both themes, notification drawer, directed mention and job notification deep link.

