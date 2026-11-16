# Quickstart: Full Profile & CV Schema Normalization

1. Apply migration `AddUserCvDataJson`.
2. Start backend and frontend.
3. Login as a non-admin user.
4. Open `/profile/edit`.
5. Confirm there is one native block for biography/contact/social data.
6. Add one work experience and one education record in the extended CV sections.
7. Press `Guardar perfil y CV`.
8. Refresh `/profile/edit`.
9. Confirm native fields and extended CV sections reload from the backend.

## Validation Commands

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
cd FrontEnd/OneItb-FE
npm.cmd run build
```
