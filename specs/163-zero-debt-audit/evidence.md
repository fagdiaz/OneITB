# Evidence: Spec 163 Zero Debt Audit

## Commands

- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`
  - Result: PASS, 16/16 tests.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`
  - Result: PASS, 0 warnings, 0 errors.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`
  - Result: PASS, 341 modules transformed, build completed in 3.77s.

## Source Audit

- `FrontEnd/OneItb-FE/package.json` remains intentionally small. No dependency was removed because no package had strong safe-removal evidence during this sprint; `react-to-print` remains relevant to the CV print flow.
- `FrontEnd/OneItb-FE/vite.config.js` already had a deterministic `vendor` manual chunk. No further chunk split was necessary.
- `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js` now defines `keyFields` for core entities and a scoped replacement policy for `Query.academicResources` keyed by `subjectId`, `searchTerm` and `category`.
- `API Graphql/Services/Academic/AcademicService.cs` now uses explicit graph loading with `AsNoTracking()` and `AsSplitQuery()` for academic resource/progress graph materialization.

## Result

Implemented. The audit reduced observable cache and query-shaping debt without broad deletions in a dirty worktree. No dependency removals were made because the evidence did not support a safe removal.
