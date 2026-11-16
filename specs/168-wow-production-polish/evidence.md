# Evidence

## Implemented

- `AuditLog` entity, EF mapping, indexes and restrictive FK to `User`.
- `AuditSaveChangesInterceptor` registered in pooled EF Core factory.
- Admin-only GraphQL query `auditLogs(first, entityName, actorUserId)`.
- Public GraphQL query `publicCertificate(id)` restricted to approved active academic progress.
- Migration `20260706180418_AddAuditLogs`.
- `/academic` CSV export and formal print constancia via `CertificateExport`.
- Public `/certificate/:id` route.
- Global `NotificationProvider` with subscription-driven toast UI.
- Apollo `AuditLog` type policy.

## Commands

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errors.
- `dotnet ef migrations add AddAuditLogs --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
- `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS, 345 modules, final build 621 ms.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 34/34.
- Final `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errors.

## Runtime checks

- `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB -c Release --no-build`: BLOCKED inside PowerShell `Start-Job` by HTTPS developer certificate resolution, even after `dotnet dev-certs https --trust` reported success in the parent session.
- HTTP fallback without launch profile: `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" -c Release --no-build --urls http://localhost:5445`: PASS.
- GraphQL `{ __typename }` on `http://localhost:5445/graphql`: PASS, HTTP 200.
- GraphQL introspection confirms `auditLogs` and `publicCertificate`: PASS, HTTP 200 on final code after clean migration.

## Honest blockers

- Google SSO is not implemented because it requires real Google OAuth client credentials, callback URLs, institutional policy and a deploy origin. It is recorded as `[B]` in the roadmap.
- Crawler-perfect Open Graph for LinkedIn requires SSR or backend-rendered HTML. The current SPA route sets runtime meta tags and provides a share URL, but external crawlers may not execute JavaScript.
