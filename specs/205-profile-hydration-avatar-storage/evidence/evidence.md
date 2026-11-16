# Evidence: Profile Hydration and Avatar Storage

**Status**: Implemented `[I]`; local browser and real Cloudinary acceptance pending  
**Created**: 2026-08-04

## Triggering Observations

- `/profile/edit` briefly rendered a partial name (`diaz`) before the full GraphQL name.
- Career controls briefly displayed generic empty-state copy before canonical data.
- Avatar editing invoked `POST http://localhost:5173/api/upload`; cloud-provider status was
  not evident to the user.

## Implemented State Contract

- `CvEditorProfile` initializes editable values only from a complete `me` matching the
  active identity/session key. Auth data cannot populate inputs.
- A full skeleton covers the editor until profile and careers are ready. Mismatch and
  query failure render controlled recovery without exposing provisional data.
- Canonical data hydrates once per identity. Refetches do not overwrite dirty drafts;
  logout/account replacement aborts FileReader/upload work and resets the snapshot.
- Avatar upload is cancelable and staged. The persisted avatar remains authoritative
  until `updateProfile` succeeds and a bounded `me` refetch confirms the exact URL.
- Storage registration reports only `Local` or `Cloudinary`, validates cloud configuration
  early and maps provider failures to HTTP 503 / `UPLOAD_STORAGE_UNAVAILABLE`.

## Automated Evidence

| Gate | Result |
|---|---|
| Speckit QA preflight (HIGH) | PASS; checklist 10/10, baseline builds clean |
| Frontend focused tests | 17/17 PASS (`profileEditorState`, editor lifecycle, avatar cleanup, upload helper) |
| Backend upload/storage tests | 32/32 PASS |
| Backend full suite | 216/216 PASS |
| Frontend full suite | 186/186 PASS |
| Backend Release build | PASS, 0 warnings / 0 errors |
| Frontend Vite build | PASS, 554 modules / 1.23 s / 0 errors |
| EF model drift | PASS: `--configuration Release --no-build`; no pending model changes |
| npm production audit | 2 moderate React Router 6.30.4 advisories already tracked as `RR-09`; automatic fix requires breaking v7 migration |

No EF entity or mapping changed in this specification. The first default Debug drift
attempt could not replace assemblies held by the already-running backend process 18376;
the process was intentionally left untouched and the same check passed against the clean
Release build with `--no-build`.

## Security And Failure Review

- No token is sent when absent; upload requests carry an `AbortSignal`.
- Logs contain mode, status and correlation context only; provider bodies/configuration
  are not logged and no secrets were introduced in tracked source.
- Invalid Cloudinary URLs fail startup with sanitized configuration errors. Local mode is
  selected only when cloud configuration is absent, not after a cloud failure.
- Tests use non-secret synthetic Cloudinary URIs and do not establish provider acceptance.

## Open Acceptance

### Partial browser evidence - 2026-08-04

- Navigation from `/profile` to `/profile/edit` displayed the canonical full name
  `Estudiante Sistemas Uno` on the first observable editor render; the former partial
  name flash was not reproduced.
- Career controls were already hydrated when exposed and showed the canonical single
  Student association rather than a provisional empty selection.
- No candidate avatar file was uploaded during this pass because the seeded profile
  used its local initials fallback. Consequently the upload, save, refresh, failed
  provider and A -> logout -> B scenarios were not exercised.

The hydration observation reduces the local visual risk but is not sufficient to close
T021 or to claim Cloudinary acceptance.

- **T021**: manual throttled-network, avatar/refresh and A -> logout -> B browser scenario.
- **PR-03**: credentialed Cloudinary upload/read/delete acceptance in the target
  environment. This remains external and is not required for the controlled local demo.

The request reaching `/api/upload` alone is not considered persistence evidence. Until
T021 passes, Roadmap status remains `[I]`, not `[V]`.
