# Evidence: Spec 213

**Status**: Implemented `[I]`; automated gates pass, real Microsoft browser acceptance pending.

## Environment

- Date: 2026-08-05 (America/Buenos_Aires).
- Worktree: `codex/199-ux-b2b-academic-onboarding`, not yet frozen.
- Runtime acceptance used a temporary Release DLL on `127.0.0.1:5013` and terminated
  that exact process in `finally`.

## Automated evidence

| Check | Result |
|---|---|
| Focused redirect/session/guard tests | PASS: 46/46 in 5 files |
| Complete frontend suite | PASS: 232/232 in 56 files |
| Vite production build | PASS: 561 modules, 775 ms in the final run |
| Backend Release build | PASS: 0 warnings, 0 errors |
| Backend suite | PASS: 216/216 |
| Runtime contract | PASS: build `1.0.0+700c6c342d84b54e4687a306146ee09299fcc7fc`; `inquiriesPage`, `microsoftLogin`, `confirmStudentCareer` present |
| Process cleanup | PASS: temporary process stopped after preflight |

`Get-NetTCPConnection` did not expose listener attribution in the current restricted
session and emitted a warning. HTTP response, `X-OneITB-Build` and GraphQL introspection
were therefore the authoritative checks; no PASS was inferred from the warning.

## Regression coverage

- Pending redirect is observable in the same tab and excludes completed flows.
- Login is not rendered while MSAL owns an active redirect.
- Clearing a cancelled flow restores normal routes.
- The academic guard preserves an in-flight redirect instead of returning to Login.
- Expiration of a previous JWT clears OneITB/Apollo but does not destroy MSAL transition.
- Callback phases are explicit and exchange remains exactly-once across rerenders.

## Open acceptance

The user must repeat success, cancellation/error and logout with a real Microsoft 365
account. Third-party CSP/BSSO/cookie/OneCollector messages are classified separately.
Until that browser evidence exists, Spec 213 remains `[I]`, not `[V]`.
