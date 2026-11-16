# Data Model: Local Backend Runtime Unblock

No database schema, GraphQL schema, entity, migration, or persisted data changes.

## Configuration Inputs

- `ConnectionStrings:DefaultConnection`
  - Production/default: strict SQL encryption.
  - Development: local-only trust or alternate local connection path.
- `ASPNETCORE_ENVIRONMENT`
  - Must be `Development` for local overrides to apply.
- ASP.NET HTTPS development certificate
  - Machine/user-level local certificate managed by `dotnet dev-certs`.
- Logging providers
  - Development should use Console/Debug and avoid Windows Event Log.

## State Transitions

- Broken certificate -> `dotnet dev-certs https --clean` -> trusted certificate -> HTTPS startup available.
- SQL TLS failure -> Development connection string trust -> database connection available.
- SQL SSPI failure -> LocalDB or SQL Auth dev-only fallback -> database connection available.
