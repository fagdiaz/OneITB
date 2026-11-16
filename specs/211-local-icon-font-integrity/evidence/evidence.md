# Evidence: Local Icon Font Integrity

## Diagnosis

- Firefox requested the repository-owned Font Awesome 6.1.2 WOFF2 successfully but
  reported repeated `glyf: Glyph bbox was incorrect` adjustments.
- The distribution was a manual source copy not represented in `package.json`.
- The replacement package contains different WOFF2 sizes and hashes, and keeps CSS,
  webfonts and icon-family metadata under one exact version.

## Automated execution - 2026-08-04

| Gate | Result | Evidence |
|---|---|---|
| Official dependency | PASS | `@fortawesome/fontawesome-free` exactly 6.7.2 |
| Supply-chain lock | PASS | npm registry tarball and `sha512-*` integrity in lockfile |
| License | PASS | CC-BY-4.0, OFL-1.1 and MIT declared by package |
| Focused visual assets | PASS | 6/6 tests |
| Full frontend | PASS | 55 files, 224/224 tests, 28.20 s |
| Vite build | PASS | 559 modules, 733 ms |
| Build assets | PASS | four local hashed WOFF2 files emitted from the 6.7.2 package |
| Old/remote references in dist | PASS | no 6.1.2, Google Fonts, gstatic or cdnjs references |
| Production dependency audit | ACCEPTED | only the two known moderate React Router 6 advisories (`RR-09`); Font Awesome adds none |

## Deviations and residual acceptance

- `fontTools` is not installed, so an optional offline table-level inspection was not
  added as a project dependency and produced no evidence.
- La aceptación Firefox pendiente se ejecutó posteriormente sobre el commit `2f20bce`;
  consultar la evidencia fechada del 2026-08-05 debajo.
- React, Apollo and Vite development banners remain classified as informational.
- No backend, database, GraphQL contract, server process or provider configuration was
  changed by this spec.

## Firefox acceptance - 2026-08-05

| Gate | Result | Evidence |
|---|---|---|
| Candidate cut | PASS | Commit `2f20bce`, worktree clean before execution |
| Local origin | PASS | Temporary Vite listener bound to `127.0.0.1:5173` |
| Native Firefox render | PASS | Firefox 153.0.1 headless produced a 1440 x 1000 PNG of 618,339 bytes |
| Official font request | PASS | Firefox cache recorded `/node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2` from the local origin |
| Owned font diagnostics | PASS | No `downloadable font: download failed`, `glyf bbox` or Font Awesome error in two native executions |
| Independent browser inspection | PASS | 12 active icons resolved `Font Awesome 6 Free`, non-empty pseudo-element content and rendered dimensions; warning/error console empty |
| Remote visual dependencies | PASS | Page asset inventory reported no remote asset hosts |
| Cleanup | PASS | Controlled browser tab finalized, temporary Firefox processes stopped and temporary profile removed |

The React, Apollo and Vite development notices are informational and were not silenced.
The validation did not authenticate, mutate data, start the backend or contact an external
provider.
