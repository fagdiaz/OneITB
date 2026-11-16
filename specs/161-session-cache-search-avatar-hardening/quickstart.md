# Quickstart: Spec 161 Validation

1. Build backend:

   ```powershell
   dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
   ```

2. Build frontend:

   ```powershell
   cd FrontEnd/OneItb-FE
   npm.cmd run build
   ```

3. Manual QA when local app is running:

   - Login as user A, open feed/chat/profile, logout, login as user B and verify no user A data flashes.
   - Search a profile by institutional email fragment.
   - Register form rejects non-`@itbeltran.com.ar` email and uses accented password labels.
   - Edit avatar with pan/zoom/rotation and verify uploaded image matches preview.
