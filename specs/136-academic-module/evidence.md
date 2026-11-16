# Evidence: Academic Module

## Status

Implemented and runtime-validated against Docker SQL.

## Commands and Results

- Branch: `136-academic-module`.
- Active feature: `specs/136-academic-module`.
- Checklist `requirements.md`: PASS, 16/16 items complete.
- Initial `git status --short`: only `.specify/feature.json` modified for active feature switch.
- `docker compose ps`: PASS, `oneitb23-sql` healthy on `localhost:1433`.
- Baseline `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errors, 19 pre-existing warnings.
- Baseline `npm.cmd run build`: PASS, Vite build completed; existing warnings for deprecated `vite:react-babel` esbuild option and chunk size.

## Implementation Evidence

- Created EF entities:
  - `AcademicResource`
  - `AcademicProgress`
  - `AcademicProgressStatus`
- Updated `User` and `Subject` navigation collections for academic resources and progress records.
- Updated `OneItbContext` with:
  - `DbSet<AcademicResource>`
  - `DbSet<AcademicProgress>`
  - explicit restrictive FKs to `Subject`, `User` uploader, progress owner and assigning user.
  - check constraints for academic resource content and score range.
  - unique current progress per `(UserId, SubjectId)`.
  - global filter for active academic resources.
- Added `IAcademicService` and `AcademicService` with authorization and explicit Include graphs to avoid N+1 in returned payloads.
- Added GraphQL operations:
  - `academicResources(subjectId)`
  - `academicStudents(subjectId)`
  - `myAcademicProgress`
  - `academicProgressForUser(userId)`
  - `addAcademicResource`
  - `toggleAcademicResourceStatus`
  - `upsertAcademicProgress`
- Added Apollo academic query/mutation documents and `AcademicDashboard.jsx`.
- Added `/academic` route and authenticated nav link.

## Migration Evidence

- `dotnet ef migrations add AddAcademicModule --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- Migration generated:
  - `API Graphql/Data/Migrations/20260625030305_AddAcademicModule.cs`
  - `API Graphql/Data/Migrations/20260625030305_AddAcademicModule.Designer.cs`
- Migration review: PASS. Foreign keys use `ReferentialAction.Restrict`; no shadow FK columns observed.
- `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS against Docker SQL.
- First `dotnet ef migrations has-pending-model-changes` attempts without `--no-build`: BLOCKED by local NuGet repository-signature lookup to `api.nuget.org`, not by the EF model.
- `$env:ASPNETCORE_ENVIRONMENT='Development'; dotnet ef migrations has-pending-model-changes --configuration Release --no-build --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS, `No changes have been made to the model since the last migration.`

## Runtime Evidence

Executed `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & "specs/136-academic-module/runtime-validation.ps1"`.

Result: PASS.

- Backend responded to GraphQL smoke test.
- Admin login returned valid token.
- Student login returned valid token.
- Admin can list active careers.
- Subjects query returned active subjects for selected career.
- Admin can create academic resource.
- Admin can query academic resources with subject/uploader graph.
- Student enrolled in career can query academic resources.
- Student academic resource creation rejected with GraphQL error.
- Admin can list academic students for subject career.
- Admin can upsert academic progress.
- Student can read own academic progress.
- Student querying `academicProgressForUser` rejected with GraphQL error.
- Admin can soft-toggle academic resource status.

Runtime note: validation used HTTP `ASPNETCORE_URLS=http://localhost:5000`, so ASP.NET Core logged the expected development warning `Failed to determine the https port for redirect`. This does not affect the GraphQL contract validation.

## Final Quality Gates

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errors, 19 existing warnings.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS, existing warnings for deprecated Vite React Babel esbuild option and chunk size.
- `git diff --check`: PASS; only CRLF normalization warnings from Git.
- `rg -n "^- \[ \]" "specs/136-academic-module/tasks.md"`: PASS, no unchecked tasks remain.
- Final `git status --short`: expected tracked source/docs/migration changes only; `specs/` runtime scripts/logs remain ignored and are not staged/tracked.
