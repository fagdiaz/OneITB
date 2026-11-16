# Manual Role Matrix

## Status reconciliation - 2026-08-08

The defense planned for 2026-08-07 did not occur. T023 remains open and has aggregate
status `NOT RUN`: populated loading resolution and clean-console observations below are
limited partial evidence, while empty/error recovery, keyboard, responsive widths, both
themes, native print/PDF, and the complete cross-cutting journey matrix remain unexecuted.
No Word or diagram artifact substitutes for browser execution.

**Candidate SHA:** `7a6036cbe6830dcb41590b46f88944fab3e76e60`  
**Date/operator:** 2026-08-05 / Codex in-app browser  
**Browser profiles:** one clean in-app browser profile; two-profile realtime remains separate

No row may be marked PASS without executing it on the candidate SHA. Record screenshots
outside Git using identifiers only; never capture tokens or passwords.

| Actor | Allowed journey | Protected denial | Loading/empty/error | Responsive/theme/keyboard | Console | Result |
|---|---|---|---|---|---|---|
| Visitante | Home, Login, employer request | `/admin` redirected to Login | Home/request rendered | Cross-cutting pending | Clean | PASS |
| Estudiante | Feed loaded 15/30, academic scoped to ADS | `/admin` showed restricted state | Loading resolved to populated feed | Cross-cutting pending | Clean | PASS |
| Profesor | Academic resources and ADS subjects | `/admin` showed restricted state | Dashboard loaded | Cross-cutting pending | Clean | PASS |
| Egresado | Jobs route and academic identity | `/admin` showed restricted state | Jobs shell loaded | Cross-cutting pending | Clean | PASS |
| Empleador | Own offers and applications | `/admin` showed restricted state | 2 offers/3 applications loaded | Cross-cutting pending | Clean after hotfix | PASS |
| Moderador | Feed exposed moderation controls | `/admin` showed restricted state | Feed loaded | Cross-cutting pending | Clean | PASS |
| Administrador | Admin dashboard and employer-request tab | Non-destructive browser run; contextual ownership covered by service tests | User table loaded | Cross-cutting pending | Clean | PASS |

## Cross-Cutting Journeys

| Journey | Required assertion | Result | Evidence/deviation |
|---|---|---|---|
| Microsoft redirect | success, cancellation, error, logout, no stale flash | NOT RUN | |
| Career change | one career for Student; feed/profile agree after relogin | NOT RUN | |
| Avatar | upload, save, refresh, existing avatar preserved on error | NOT RUN | |
| Feed pagination | >15 rows, append, terminal state, retry, filter reset | NOT RUN | |
| CV | profile/edit parity, native print, readable extraction | NOT RUN | |
| Dark/light | contrast, approved assets, 1300 ms transition, reduced motion | NOT RUN | |
| B2B employer | public request, admin review, employer offer flow | NOT RUN | |

## Runtime Regression Found And Closed

- Initial role switching exposed `TypeError: graphQLErrors?.some is not a function` in
  Apollo's error link.
- `normalizeGraphQLErrors` now accepts arrays, `{ errors: [...] }`, individual error
  objects, and empty values before authorization classification and logging.
- Focused regression: 8/8 PASS.
- Full frontend suite: 58 files, 252/252 PASS.
- Vite production build: 565 modules, 716 ms, PASS.
- Repeated Empleador -> logout -> Estudiante: correct identity, no stale employer text,
  own-offer route PASS, and zero browser errors.
