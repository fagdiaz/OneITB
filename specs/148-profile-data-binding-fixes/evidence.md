# Evidence: Profile Data Binding Fixes

## Commands Executed

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errors.
- `dotnet ef migrations add AddAvatarUrlAndNormalizeIdentity --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- Manual migration review/edit: PASS. Added SQL normalization for existing `Users.FirstName`, `Users.LastName`, and `Accounts.Email`.
- `dotnet ef database update --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS. Existing `vite:react-babel` deprecation warning remains unrelated.
- `specs/148-profile-data-binding-fixes/runtime-validation.ps1`: PASS. Temporary backend on `http://127.0.0.1:5128`, admin login, REST `/api/upload`, `updateProfile(avatarUrl, careerIds)`, `me`, `publicProfile`, and user `11111111@itbeltran.com.ar` identity casing validation succeeded.

## Runtime Coverage

- Avatar image upload uses authenticated REST multipart upload and returns `/uploads/...`.
- Returned avatar URL persists through `updateProfile` and is visible in `me` and `publicProfile`.
- Career IDs persist through `updateProfile` into `UserCareer` and are visible in profile reads.
- Existing user identity casing is normalized through migration; registration and entity setters normalize future writes.

## Notes

- `linkUserToCareers` remains for backward compatibility, but `/profile/edit` now saves careers through `updateProfile`.
- Email lookup remains case-insensitive so display casing does not break login.
