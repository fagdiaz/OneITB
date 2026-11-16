# Evidence: Microsoft Session Commit Stabilization

**Date**: 2026-08-03  
**Status**: Implemented and automatically validated; successful institutional path accepted

## Reproduction

- Azure returns from the configured SPA callback without `AADSTS50011`.
- The user is returned to `/login` with no OneITB GraphQL error displayed.
- Static inspection proves `AuthContext.login` clears MSAL unconditionally.
- Static inspection proves callback navigation occurs directly after scheduling auth state.
- The second manual attempt returned to `/login` without an application error. Static
  inspection found that Apollo could classify a controlled `MicrosoftLogin` authorization
  failure as global session expiry whenever an orphan token remained in local storage.
- MSAL may restore the Login document after a successful provider redirect; Login had no
  bounded recovery path to the dedicated callback.

## Executed Validation

- Speckit QA HIGH with build: PASS; scope frontend/security, checklist 10/10, Vite build
  551 modules in 844 ms.
- Focused regression:
  `vitest run AuthContext GraphqlProvider MicrosoftInstitutionalLogin
  MicrosoftRedirectCallback Login`: 34/34 PASS.
- Full frontend suite after the timeout hardening: 41 files, 163/163 PASS in 27.71 s.
- Production build after the timeout hardening: 551 modules, 0 errors, 20.90 s
  (executed concurrently with the complete test suite).
- `git diff --check`: no whitespace errors; PowerShell reported only expected line-ending
  conversion notices.
- Static source search: no active `loginPopup`/`acquireTokenPopup` and no console logging
  of access tokens/JWTs in the modified auth surface.
- Speckit artifact analysis: 9/9 functional requirements mapped to implementation tasks;
  no critical/high consistency issue.

The first aggregate npm invocation did not return output and was terminated. The same
tests were then executed through the finite local Vitest binary and completed normally;
no test process was left running.

The complete suite still emits pre-existing test-harness warnings outside Spec 203
(React Router flags in untouched tests, incomplete Apollo mocks, one `act` warning and
the PDF.js Node build advisory). They do not occur in the focused Spec 203 run and are not
presented as browser-runtime failures.

## Manual Acceptance

On 2026-08-04, the real institutional account completed Microsoft selection, returned to
the dedicated callback, committed the OneITB session, reached forced academic onboarding
and then entered the feed. This verifies the successful provider-to-private-route path.

The brief route transition through Login did not prevent session completion and remains
eligible for later visual polishing only if it is reproducibly visible after the final
loading-state work. Microsoft-owned CSP/BSSO/cookie/Quirks/OneCollector warnings are not
OneITB defects: they originated on Microsoft pages and did not stop authentication.

Cancellation/error recovery, logout and second-account isolation remain pending and are
not inferred from the successful path.

External Inter and Font Awesome download failures affect typography/icon fallback only;
they are not part of the MSAL redirect, OneITB GraphQL exchange, or local session commit.

## Runtime diagnosis - 2026-08-04

- Microsoft completed the provider redirect and the frontend invoked `MicrosoftLogin`.
- The API-only `__typename` probe returned HTTP 200, while a bounded `careers` database
  probe timed out and Docker reported that its daemon was unavailable.
- Docker Desktop was started without blocking the terminal; `oneitb23-sql` reached
  `healthy`, and the same `careers` probe then returned HTTP 200 with persisted data.
- The callback now also aborts a backend exchange after 20 seconds and renders a controlled
  retry message, preventing indefinite loading during future database outages.
- Focused callback regression: 11/11 PASS, including the stalled exchange cancellation.
- Infrastructure restoration was followed by successful institutional authentication,
  onboarding and feed arrival. The remaining acceptance scope is limited to
  cancellation/error, logout and second-account isolation.
