# Evidence: Moderation Roles Safety

**Date**: 2026-06-17

## Implemented

- Added `User.MutedUntil` and EF mapping for nullable temporary silence.
- Generated and applied migration `20260617015425_AddUserMutedUntil`.
- Added backend protections against role/status/silence actions on administrator accounts.
- Added `silenceUser(userId, hours)` for administrators and moderators.
- Blocked silenced users from creating publications and comments in `SocialService`.
- Exposed GraphQL fields:
  - `User.mutedUntil`
  - `User.totalPosts`
  - `User.totalComments`
  - `User.totalLikesReceived`
  - `User.totalReportsReceived`
  - `Inquiry.reportCount`
  - `Comment.reportCount`
- Updated admin user management with role `Egresado`, short IDs, activity metrics, report counts, silence status, and protected admin controls.
- Added report counters to feed, publication management, and comment management surfaces.

## Validation Commands

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

Result: Passed with 0 warnings and 0 errors.

```powershell
dotnet ef migrations add AddUserMutedUntil --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

Result: Passed after repairing the previous model snapshot typing issue.

```powershell
dotnet ef database update --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

Result: Passed.

```powershell
dotnet ef migrations list --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

Result: `20260617015425_AddUserMutedUntil` appears as the latest applied migration.

```powershell
npm.cmd run build
```

Result: Passed. Vite emitted only the existing `vite:react-babel` deprecation/plugin timing warning.

## Runtime Smoke

Blocked.

- `https://localhost:44397/graphql` and `http://localhost:44397/graphql` both terminated the connection unexpectedly from this shell.
- Attempting to start a temporary Release backend on `http://localhost:5111` failed because PowerShell `Start-Process` raised a duplicate environment key error for `Path`/`PATH`.
- Therefore the GraphQL runtime schema and browser admin workflow remain unverified in this run, despite successful build and database migration validation.
