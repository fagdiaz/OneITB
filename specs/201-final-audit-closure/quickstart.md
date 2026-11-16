# Validation Quickstart

All commands are finite and return control to the terminal.

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --no-build

Push-Location "FrontEnd/OneItb-FE"
npm.cmd run build
npm.cmd test -- --run
Pop-Location

git diff --check
```

Do not run `dotnet run`, `npm run dev` or foreground containers as part of this specification.

## Manual gates

- Render and inspect all selected Mermaid diagrams.
- Generate DOCX/PDF, inspect every page and approve printing.
- Validate real Microsoft Entra tenant, SMTP, Cloudinary and central observability only with authorized credentials.
- After an explicit commit, repeat the combined gate on that exact SHA before release tagging.
