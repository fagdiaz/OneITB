# Evidence: Spec 215

**Date**: 2026-08-05  
**Status**: Implemented `[I]`; external/browser gates remain open  
**Environment**: Windows, .NET 8 Release, Node/Vite test runner, no persistent server

## Automated evidence

| Gate | Result |
|---|---|
| Speckit QA preflight (`-RunBuilds`) | PASS; checklist 4/4, backend/frontend builds PASS |
| Upload/storage focused backend tests | PASS, 44/44 |
| Upload/profile focused frontend tests | PASS, 12/12 |
| Full backend suite | PASS, 230/230 |
| Full frontend suite | PASS, 240/240 in 57 files |
| Backend Release build | PASS, 0 warnings, 0 errors |
| Frontend Vite build | PASS, 562 modules, 603 ms |
| Production Compose parse | PASS with `config --no-interpolate --quiet` |
| EF pending model changes | PASS; sin cambios desde la última migración. Se fijó `NUGET_PACKAGES` al caché local luego de que el sandbox resolviera inicialmente un perfil incorrecto |
| `npm audit --omit=dev` | 2 moderate React Router advisories; available fix is breaking v7 and remains accepted under `RR-09` |

## Covered scenarios

- Development accepts only explicit `Local`; missing/unknown provider fails.
- Production rejects `Local` and incomplete Cloudinary configuration.
- Cloudinary validates bounded timeout, maps timeout/transport/provider failure without
  exposing credentials, and preserves caller cancellation.
- Local storage generates its own name, writes under `/uploads` and removes partial files
  on failure.
- `/api/upload` returns a sanitized 503 with stable code, storage mode, retryable flag and
  correlation identifier.
- React carries the correlation identifier, does not retry automatically and preserves
  the persisted avatar.
- Profile editor remains in a full skeleton while either profile or careers is loading,
  rejects a mismatched identity and exposes a recoverable boundary for an absent catalog.

## Open acceptance gates

1. Browser local: authenticate, upload a valid avatar, save profile, refresh profile,
   editor and header, then verify the same persisted URL and no previous-session data.
2. Browser negative path: force storage outage and confirm controlled UI plus preserved
   avatar without automatic retry.
3. Cloudinary real: execute upload/read/refresh with approved secrets and quota. Static
   adapter tests do not prove provider availability.

No credentials, provider URLs, JWTs, uploaded user images or personal profile data were
stored in this evidence.
