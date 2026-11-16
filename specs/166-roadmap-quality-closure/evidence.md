# Evidence: Spec 166 Roadmap Quality Closure

## Commands

- `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & ".agents/skills/speckit-qa/scripts/preflight.ps1" -RunBuilds`: initially FAIL on `git diff --check` due trailing whitespace in `useForm.jsx`; backend/frontend builds passed.
- `git diff --check`: PASS after whitespace cleanup.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS after implementation. 34/34 tests passed.
- `dotnet ef migrations has-pending-model-changes --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: BLOCKED. Build/restore path failed with NU1301 because NuGet access is blocked in the execution environment.
- `dotnet restore "API Graphql/OneITB/GraphQL.csproj" --ignore-failed-sources`: BLOCKED. Local package restore could not regenerate assets without NuGet access; packages were not available from the visible offline sources.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: BLOCKED after the failed restore attempt because local `obj/project.assets.json` contains NU1301 restore errors.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS. 341 modules transformed, build in 798ms.
- `rg -n "69%|52/75|continuan planificados|siguen planificados|\\.NET 6|net6|Mobile/OneItb-App/src|Busqueda, categorias..." README.md docs .github/workflows AGENTS.md`: PASS for current docs. Remaining matches are historical log entries or intentionally pending items.

## Final Audit

See `audit/final-audit.md`.
