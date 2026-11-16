# Quickstart: Feed Gamification UX

## Validation Steps

1. Build backend:

   ```powershell
   dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
   ```

2. Build frontend:

   ```powershell
   cd FrontEnd/OneItb-FE
   npm.cmd run build
   ```

3. Runtime smoke when local app is available:
   - Login.
   - Open `/feed`.
   - Click a publication author name and verify `/profile/{id}` opens.
   - Click inline follow on another user.
   - Open admin publication/comment tabs and verify preview modals.
