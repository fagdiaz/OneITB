# Evidence: Privacy Controls and SMTP Smoke Tests

## Summary

Spec 175 implements profile privacy controls and an administrator-only SMTP smoke test without changing user-facing employment terminology.

## Implementation Evidence

- `User.IsPublicProfile` added with default `true`.
- EF Core maps `IsPublicProfile` explicitly with default true.
- Migration generated: `API Graphql/Data/Migrations/20260708161825_AddUserProfilePrivacy.cs`.
- `toggleProfilePrivacy(isPublic)` added as authenticated mutation acting only on the current user.
- `publicProfile` and `searchPublicProfiles` mask sensitive profile data when the target profile is private and the viewer is not authorized.
- Authorization rule for private profile visibility:
  - target profile is public, or
  - viewer owns the profile, or
  - viewer role is `Administrador` or `Moderador`, or
  - viewer follows the target user.
- `/profile/edit` includes a Tailwind privacy switch.
- `NotificationProvider` accepts local `oneitb:toast` events; privacy changes dispatch success toast feedback.
- Search/profile UI shows private profile notice without leaking sensitive fields.
- `testSmtpConnection(targetEmail)` added as `[Authorize(Roles = new[] { "Administrador" })]`, validates email format and returns controlled GraphQL errors.
- GraphQL integration test added for anonymous masking of a private profile.

## Commands Executed

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & ".agents/skills/speckit-qa/scripts/preflight.ps1" -RunBuilds
```

Result: initial BLOCKED by CRLF/trailing whitespace in modified Windows-generated files. After LF normalization, PASS.

```powershell
dotnet ef migrations add AddUserProfilePrivacy --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
```

Result: PASS.

```powershell
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
```

Result: PASS against local Docker SQL Server.

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
```

Result: PASS, 0 warnings, 0 errors.

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
```

Result: PASS, 39/39 tests.

```powershell
npm.cmd run build
```

Result: PASS, 352 modules.

```powershell
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
```

Result: PASS, no pending model changes.

```powershell
git -c core.autocrlf=false diff --check
```

Result: PASS.

## Runtime Attempt

Attempted to start a temporary backend process with `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB --no-build` to execute GraphQL smoke checks.

Result: BLOCKED by the Codex automatic reviewer while starting a persistent local process. No workaround was forced. Runtime/browser QA remains a manual follow-up to elevate this spec from `[I]` to `[V]`.
