# Quickstart: Privacy Controls and SMTP Smoke Tests

## Backend validation

1. Generate and apply EF migration:
   ```powershell
   dotnet ef migrations add AddUserProfilePrivacy --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
   dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
   ```
2. Build backend:
   ```powershell
   dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
   ```
3. Run smoke GraphQL operations:
   - `toggleProfilePrivacy(isPublic: false)`
   - `publicProfile(userId: ...)` as owner and unrelated viewer
   - `testSmtpConnection(targetEmail: "...")` as admin

## Frontend validation

1. Build frontend:
   ```powershell
   cd FrontEnd/OneItb-FE
   npm.cmd run build
   ```
2. Browser smoke:
   - Visit `/profile/edit`, toggle privacy, save.
   - Visit `/profile/{id}` as another user and confirm sensitive data is hidden.
   - Confirm owner still sees full profile.
