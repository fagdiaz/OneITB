# Quickstart: Spec 166 Roadmap Quality Closure

1. Run backend service tests:

   ```powershell
   dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
   ```

2. Run backend build:

   ```powershell
   dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
   ```

3. Run frontend build:

   ```powershell
   Push-Location "FrontEnd/OneItb-FE"
   npm.cmd run build
   Pop-Location
   ```

4. Check diff hygiene:

   ```powershell
   git diff --check
   ```

5. Review documentation:

   - `docs/project_docs/ROADMAP.md`
   - `docs/project_docs/scope-and-requirements.md`
   - `docs/project_docs/architecture-and-design.md`
   - `docs/audit/DOCUMENTATION_STATUS.md`
   - `docs/audit/DEVELOPMENT_LOG.md`
