# Evidence: Feed Gamification UX

**Date**: 2026-06-17

## Implemented

- Added activity metric selections to `GET_INQUIRIES` for publication and comment authors.
- Linked publication author names to `/profile/{id}`.
- Linked comment author names to `/profile/{id}`.
- Added threshold-based participation badges:
  - 10+ posts: Publicador
  - 20+ comments: Conversador
  - 25+ likes received: Valorado
- Added inline follow action on publication cards for non-self authors.
- Added subtle blue hierarchy for administrator-authored publications and comments.
- Limited normal-user career filters to their careers when available; admin/moderator search remains global unless filters are explicitly selected.
- Added publication preview modal in the admin publication tab, including full content, metadata, counters, and associated comments.
- Added comment preview modal in the admin comment tab, including related publication context.

## Validation Commands

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

Result: Passed with 0 warnings and 0 errors.

```powershell
npm.cmd run build
```

Result: Passed. Vite emitted the existing `vite:react-babel` deprecation warning.

## Runtime Smoke

Blocked.

Attempted to start a temporary backend on `http://localhost:5112` with PowerShell Job and query GraphQL introspection.

Result:

- The temporary backend could not become reachable.
- Startup failed while seeding/applying migrations because SQL Server requires encryption and this machine/session does not support it with the current connection settings.
- The backend also attempted to write `.NET Runtime` logs to Windows Event Log and received `Access denied`.

Because of this, browser validation for profile links, inline follow, and admin preview modals remains unverified in runtime for this run.
