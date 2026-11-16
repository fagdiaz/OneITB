# Plan

## Backend

1. Add `AuditLog` entity and `DbSet`.
2. Configure `AuditLogs` table with explicit FK to `User`, restrictive delete, bounded columns and indexes.
3. Add stateless `AuditSaveChangesInterceptor` using `IHttpContextAccessor`.
4. Register the interceptor in `AddPooledDbContextFactory`.
5. Add Admin-only `auditLogs(first, entityName, actorUserId)` query.
6. Add public `publicCertificate(id)` query returning only approved academic progress.
7. Generate and apply `AddAuditLogs` migration.

## Frontend

1. Add certificate query definitions.
2. Add `/certificate/:id` page with runtime meta tags and LinkedIn share link.
3. Add `CertificateExport` component to `/academic`.
4. Add `NotificationProvider` and mount it once under `AuthProvider`.
5. Update Apollo cache type policy for `AuditLog`.

## Documentation

1. Update roadmap with the high-impact module.
2. Update development log and documentation status.
3. Mark Google SSO and crawler-perfect OG constraints honestly.

## Validation

1. `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`
2. `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`
3. `npm.cmd run build`
4. EF migration add/update when local DB is available.
