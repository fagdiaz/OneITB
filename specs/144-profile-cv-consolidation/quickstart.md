# Quickstart: Profile/CV Consolidation & Cleanup

1. Start backend and frontend.
2. Login as a non-admin user.
3. Navigate to `/profile`, then click `Editar CV`.
4. Confirm `/profile/edit` loads without querying `users`.
5. Edit biography, phone or social links and save.
6. Confirm the public profile reflects the persisted data.

## Validation Commands

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
cd FrontEnd/OneItb-FE
npm.cmd run build
rg "_temp_cv_reference" "FrontEnd/OneItb-FE/src" --glob "!**/node_modules/**"
```
