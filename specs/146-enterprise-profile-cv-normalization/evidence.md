# Evidence: Enterprise Profile CV Normalization

## Commands Executed

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errors.
- `dotnet ef migrations add NormalizeUserCvTables --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- Manual migration review/edit: PASS. `CvDataJson` data is transformed into normalized CV section tables with `OPENJSON` before the legacy column is dropped.
- `dotnet ef database update --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS. Vite build succeeds; existing `vite:react-babel` deprecation warning remains unrelated.
- `specs/146-enterprise-profile-cv-normalization/runtime-validation.ps1`: PASS. Temporary backend on `http://127.0.0.1:5126/graphql`, admin login, normalized `updateProfile`, `me` readback, and `publicProfile` readback succeeded.

## Runtime Coverage

- Authenticated user can save profile basics and all CV sections in one mutation.
- GraphQL `me` returns normalized `cvExperiences`, `cvEducations`, `cvProjects`, `cvSkills`, and `cvLanguages`.
- GraphQL `publicProfile` returns normalized public CV sections for UI rendering.
- Legacy JSON persistence is removed from runtime code and retained only in historical migrations/spec evidence.

## Notes

- The migration `NormalizeUserCvTables` supersedes the previous MVP persistence approach from spec 145.
- Browser visual inspection of `/profile/edit` is still useful, but the backend contract, migration, and frontend build are verified.
