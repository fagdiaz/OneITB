# Implementation Plan: Microsoft Entra Redirect Authentication

**Branch**: `codex/199-ux-b2b-academic-onboarding` | **Date**: 2026-08-03

## Summary

Replace popup authentication with an explicit redirect state machine. Fail closed unless
the redirect URI targets `/auth/microsoft/callback`, keep MSAL on that route after it
handles the response, acquire the configured delegated API scope silently, and execute
the existing GraphQL exchange through one module-level idempotency coordinator.

## Technical Context

- React 18, React Router 6.30, Apollo Client 3.7.
- `@azure/msal-browser` 5.17 and `@azure/msal-react` 5.5.
- Backend mutation: `microsoftLogin(accessToken: String!)`.
- Canonical local session: `AuthContext.login`, which invalidates Apollo transport/cache.

## Constitution Check

- GraphQL remains the business boundary: PASS.
- No token is logged or newly persisted: PASS.
- Session replacement continues through canonical AuthContext: PASS.
- No backend or schema expansion: PASS.
- Runtime claims remain evidence-based: PASS.

## Architecture

1. `microsoftEntraConfig.js` resolves only a dedicated callback URI.
2. MSAL sets `navigateToLoginRequestUrl: false` and a Login logout destination.
3. `MicrosoftInstitutionalLogin` records a safe return destination and calls
   `loginRedirect`; it never exchanges credentials itself.
4. `/auth/microsoft/callback` renders `MicrosoftRedirectCallback` outside the Login UI.
5. The callback waits for `InteractionStatus.None`, selects the returned/active account,
   obtains the delegated API token silently, exchanges it, and calls `AuthContext.login`.
6. `microsoftRedirectFlow.js` owns the flow descriptor, destination sanitation, and an
   in-memory promise registry that deduplicates the entire completion transaction.

## State Machine

```text
login idle -> record flow -> redirecting
callback startup/handle-redirect/acquire-token -> authenticating
authenticating -> exchange -> local-session -> safe navigation
authenticating -> controlled error -> return to login -> explicit retry
```

## Security Controls

- Dedicated callback route contains no interactive login action.
- All non-`None` MSAL states block another interaction.
- One random flow ID scopes idempotency and destination restoration.
- Return destinations reject external URLs, protocol-relative paths, and auth routes.
- The access token exists only in memory and GraphQL variables.
- Previous Apollo state is invalidated by the established local session boundary.

## Validation Order

1. Speckit QA before implementation.
2. Pure configuration and redirect-flow unit tests.
3. Login redirect component tests.
4. Callback success, concurrency, and failure tests.
5. Full frontend suite and production build.
6. Static popup search, `git diff --check`, Speckit Analyze, and docs reconciliation.
