# Evidence: Microsoft Entra Redirect Authentication

**Date**: 2026-08-03

## Pre-implementation audit

- Active code used `instance.loginPopup(microsoftLoginRequest)`.
- `MicrosoftInstitutionalLogin` owned both interactive identity and GraphQL exchange.
- Default redirect URI resolved to `/login`, which rendered the interactive action again.
- Backend GraphQL contract requires `accessToken`, not `idToken`.
- `AuthContext.login` already invalidates Apollo session transport and cache.
- A single initialized `PublicClientApplication` and root `MsalProvider` already exist.

## Implementation evidence

- The Entra resolver accepts only `/auth/microsoft/callback`; `/login` fails closed.
- MSAL sets `navigateToLoginRequestUrl: false` and logout returns to `/login`.
- The Login action calls `loginRedirect` and blocks every non-`None` interaction state.
- The callback route sits outside `PublicLayout` and exposes no Login action.
- The callback uses the active/returned account and `acquireTokenSilent` for the existing
  delegated API scope before calling `microsoftLogin(accessToken)`.
- A credential-free, 15-minute session descriptor sanitizes return destinations.
- A promise registry deduplicates token acquisition, GraphQL exchange, session hydration,
  and navigation for each flow ID; rejection releases the entry for an explicit retry.
- MSAL success events establish the returned active account. Multiple cached accounts
  without an active identity fail closed instead of selecting an arbitrary account.
- Completed flow metadata prevents a callback reload from repeating the exchange.
- No Microsoft token or OneITB JWT is logged or added to redirect metadata.

## Commands and results

### Risk-based preflight

```text
speckit-qa preflight -RunBuilds: PASS
Backend Release baseline: 0 warnings, 0 errors
Frontend baseline build: PASS
Checklist: 13/13
```

### Targeted frontend tests

```text
Test Files: 5 passed
Tests: 41 passed
```

The first run found one state race: clearing MSAL after a token failure caused the
specific error to be replaced by missing-flow copy. An attempted-flow reference fixed
the rerender and the same suite then passed. A subsequent hardening iteration added
backslash-path and ambiguous-multi-account cases; the final focused result is 41/41.

### Full frontend regression

```text
Test Files: 41 passed
Tests: 144 passed
```

### Production build

```text
Vite 8.0.16
551 modules transformed
0 errors
1.69 s
```

### Static and documentation checks

```text
Active loginPopup/acquireTokenPopup calls: 0
Auth placeholders or token console logging: 0
Stale /login redirect documentation: 0
git diff --check: PASS (line-ending notices only)
Development Log: 150 dated entries, descending order PASS
```

## Speckit Analyze

| Metric | Result |
|---|---:|
| Functional requirements | 12 |
| Non-functional requirements | 5 |
| Success criteria | 5 |
| Tasks | 19/19 complete |
| Requirement-to-task coverage | 100% |
| Critical/high/medium findings | 0 |

The spec, plan, tasks, contract, tests, and evidence agree on redirect strategy,
delegated access-token semantics, idempotency, destination sanitation, and external
acceptance limits.

## External acceptance

Real Microsoft 365 acceptance remains pending. The SPA App Registration must contain
the exact callback URI, tenant consent must be granted, and the flow must be exercised
in a browser with an institutional account. No Vite or backend server, commit, or push
was executed during this spec.
