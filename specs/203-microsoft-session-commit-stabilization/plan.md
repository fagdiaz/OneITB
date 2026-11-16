# Implementation Plan: Microsoft Session Commit Stabilization

## Summary

Repair the post-redirect race without altering Azure, backend token validation, route
authorization, or the redirect strategy. Introduce an explicit identity-provider option at
the `AuthContext.login` boundary and split the callback into exchange and session-commit
phases. Navigation happens only after React exposes the matching OneITB session.

## Technical Context

- Frontend: React 18, Apollo Client 3.7, MSAL Browser 5.17.3, MSAL React 5.5.4.
- Routes: `/login`, `/auth/microsoft/callback`, protected routes under
  `RequireAcademicOnboarding`.
- Persistence: canonical OneITB `token` and `user` local-storage keys; MSAL session cache.
- Validation: Vitest/Testing Library and Vite production build; no server startup.

## Constitution Check

- **Identity isolation**: local login/logout still purge provider, Apollo, storage, and WS.
- **External token safety**: delegated token remains in memory and is never logged.
- **Fail-closed authorization**: private guards remain unchanged.
- **Evidence truth**: automated checks are recorded; tenant acceptance remains pending.
- **Finite lifecycle**: tests and builds terminate; no `dotnet run` or `npm run dev`.

## Root Cause

1. `AuthContext.login` unconditionally calls `clearMicrosoftIdentitySession`, deleting the
   MSAL account/cache immediately after a successful Microsoft exchange.
2. `MicrosoftRedirectCallback` calls `navigate` directly after setters are scheduled. The
   destination guard can render before those state updates commit and redirect to Login.
3. Existing callback tests mock `useAuth` as an immediate side effect and therefore do not
   reproduce the React commit boundary.

## Implementation Strategy

1. Extend `login(token, user, options)` with a closed provider value (`local` default or
   `microsoft`). Only local establishment clears stale Microsoft cache.
2. Make callback exchange return a pending session descriptor. Preserve the exactly-once
   coordinator for concurrent mounts.
3. Add a second effect that compares committed `auth.id`, `token`, and
   `isAuthenticated` with the descriptor before completion/navigation.
4. Add a bounded commit timeout with cleanup and a controlled UI error.
5. Add a Login defensive redirect for an already committed session.
6. Expand regression tests for provider cleanup, delayed React commit, mismatch, duplicate
   mounts, and Login recovery.

## Files

- `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
- `FrontEnd/OneItb-FE/src/context/AuthContext.test.jsx`
- `FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectCallback.jsx`
- `FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectCallback.test.jsx`
- `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
- `FrontEnd/OneItb-FE/src/Components/user/Login.test.jsx`
- Canonical status, runbook, audit, and evidence documents.

## Risks And Controls

| Risk | Control |
|---|---|
| Provider option is forged by arbitrary UI | Closed internal constant; backend JWT remains authoritative |
| Callback hangs after exchange | Bounded timeout and controlled recovery |
| Concurrent callbacks exchange twice | Shared flow coordinator returns the same promise/result |
| Stale identity navigates | Exact committed user ID and token checks |
| Login redirect loops | Redirect only for a complete canonical session and use replace |

