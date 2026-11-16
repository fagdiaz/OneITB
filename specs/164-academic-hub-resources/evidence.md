# Evidence: Spec 164 Academic Hub Resources

## Commands

- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`
  - Result: PASS, 16/16 tests.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`
  - Result: PASS, 0 warnings, 0 errors.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`
  - Result: PASS, 341 modules transformed, build completed in 3.77s.
- `dotnet ef migrations add AddAcademicResourceCategoryVersion --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`
  - Result: PASS. Initial EF sentinel warning was resolved by making `AcademicResourceCategory.Otro` the CLR default value.
- `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`
  - Result: PASS.
- Temporary GraphQL smoke:
  - Started Release backend on `http://localhost:5443` via PowerShell job.
  - `{ __typename }`: PASS, returned `Query`.
  - Introspection with aliases for `AcademicResource` and `AcademicResourceCategory`: PASS, exposed `category`, `version` and enum values `OTRO`, `LIBRO`, `APUNTE`, `EXAMEN`.

## Runtime/Build Evidence

- Backend Release build and service tests passed after schema/service changes.
- Frontend Vite build passed after Apollo document and `/academic` UI updates.
- EF migration was applied to the configured local SQL Server database.
- Direct authenticated `academicResources` operation was not executed because no user token was available in this non-browser validation context. The schema was executed successfully and the UI/backend builds are clean.

## Notes

- Debug build/migration generation was blocked by Visual Studio/IIS Express holding Debug binaries. The EF migration was generated with `--configuration Release`, which matches the successful backend build and avoids the external Debug lock.
- HTTPS runtime on a temporary port is still blocked by the local development certificate state, so the smoke used HTTP on a temporary local port.
- Existing `addAcademicResource` remains available for manager workflows; new `uploadAcademicResource` supports the hub flow and keeps binary upload decoupled through `/api/upload`.
