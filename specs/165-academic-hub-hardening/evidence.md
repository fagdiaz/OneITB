# Evidence: Spec 165 Academic Hub Hardening

## Commands

- `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & ".specify/scripts/powershell/check-prerequisites.ps1" -Json -RequireTasks -IncludeTasks`: PASS. Active feature resolved to `specs/165-academic-hub-hardening`; required artifacts present.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS. 16/16 tests passed.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS. 0 warnings, 0 errors.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS. 341 modules transformed, build in 715ms after the final frontend hardening.
- Temporary GraphQL schema smoke on `http://localhost:5444/graphql`: PASS. Introspection confirmed `academicResources` and `resourcesBySubject` on `Query`.
- `git diff --check`: PASS. Exit code 0.
- `rg -n "resourcesBySubject|visibleResources|isResourceModalOpen|AsSplitQuery|ThenInclude\\(comment => comment\\.Replies\\)" ...`: PASS. Backend and frontend hardening points present.

## Final Audit

See `audit/final-audit.md`.

## Runtime Boundary

No authenticated browser session was available during this pass, so `/academic` remains implemented and build/schema validated but not promoted to `[V]` in the roadmap.
