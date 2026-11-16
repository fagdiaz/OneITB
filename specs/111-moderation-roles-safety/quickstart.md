# Quickstart: Moderation Roles Safety

## Validation Steps

1. Build backend:

   ```powershell
   dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
   ```

2. Apply database migration:

   ```powershell
   dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
   ```

3. Build frontend:

   ```powershell
   cd FrontEnd/OneItb-FE
   npm.cmd run build
   ```

4. Runtime smoke when SQL Server and app are available:
   - Login as moderator/admin.
   - Open the admin user panel.
   - Verify administrator rows have disabled role/status/silence controls.
   - Silence a non-admin user for 24 hours.
   - Verify that user cannot create a publication or comment until `MutedUntil` expires.
