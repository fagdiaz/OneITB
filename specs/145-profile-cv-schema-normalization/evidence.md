# Evidence: Full Profile & CV Schema Normalization

## Executed Validation

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errors.
- `dotnet ef migrations add AddUserCvDataJson --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- `dotnet ef database update --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS. Vite built successfully; the existing `vite:react-babel` deprecation warning remains.
- `rg -n "PersonalForm|localStorage|cvDataJson|Guardar perfil y CV" "FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx" "FrontEnd/OneItb-FE/src/data/graphql"`: PASS for target checks. `CvEditorProfile.tsx` contains no `PersonalForm` or `localStorage`; `GraphqlProvider.js` still uses `localStorage` for JWT, which is unrelated session handling.
- `specs/145-profile-cv-schema-normalization/runtime-validation.ps1`: PASS. Temporary backend on `http://127.0.0.1:5123/graphql`, seeded admin login, `updateProfile` with `cvDataJson`, and `me.cvDataJson` readback all succeeded.

## Runtime Notes

- Runtime GraphQL persistence is verified.
- Visual browser inspection of `/profile/edit` was not executed in this pass.
- Debug build and default EF build were blocked by Visual Studio/IIS Express locking Debug binaries. Release build and EF commands with `--configuration Release` passed.
