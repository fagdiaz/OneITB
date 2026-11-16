# Quickstart: P2 Closure QA

1. Restore/build backend:

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

2. Run backend tests:

```powershell
dotnet test "API Graphql/OneITB/OneITB.sln" -c Release
```

3. Run frontend build to ensure documentation-only frontend unaffected:

```powershell
npm.cmd run build
```

from `FrontEnd/OneItb-FE`.

4. Review `docs/academic/04-design-diagrams.md` in Markdown preview and confirm Mermaid renders.
