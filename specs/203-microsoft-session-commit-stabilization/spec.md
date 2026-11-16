# Feature Specification: Microsoft Session Commit Stabilization

**Spec**: 203  
**Date**: 2026-08-03  
**Status**: Implemented - successful institutional path accepted; session-exit matrix pending

## User Scenarios & Testing

### User Story 1 - Finish institutional sign-in (Priority: P1)

As an institutional user, after Microsoft returns to the OneITB callback I reach the
requested private route with the same authenticated identity instead of returning to
`/login`.

**Independent test**: Complete the redirect with one Microsoft account and verify that
OneITB exchanges the token once, commits its local session, and only then navigates.

### User Story 2 - Keep identity boundaries isolated (Priority: P1)

As a security reviewer, I can verify that a Microsoft login preserves the provider cache
needed by that identity while password, employer, logout, expiry, and account replacement
continue clearing provider and Apollo state.

**Independent test**: Exercise Microsoft and local session transitions and assert the
provider cache is retained only for the Microsoft session establishment path.

### User Story 3 - Recover from incomplete callback state (Priority: P2)

As a user, if token exchange or session commit fails, I see a controlled Spanish error and
can return to Login without a loop or a partially completed flow.

**Independent test**: Simulate missing account, exchange failure, stale flow, and delayed
session commit; no protected navigation occurs before a matching session exists.

## Edge Cases

- React renders the callback more than once in development.
- Two callback components observe the same redirect flow concurrently.
- The OneITB session update becomes visible one render after the exchange resolves.
- A previous local or Microsoft identity exists in browser storage.
- A partial local session contains `token` without a valid serialized `user`, or vice versa.
- MSAL completes authentication but restores the original `/login` document instead of
  the dedicated callback route.
- The returned account ID does not match the identity committed by OneITB.
- Microsoft-owned CSP, BSSO, cookie, or telemetry warnings remain visible.

## Functional Requirements

- **FR-001**: Microsoft sign-in MUST preserve the MSAL account/cache while establishing the
  corresponding OneITB session.
- **FR-002**: Non-Microsoft login, logout, expiration, and account replacement MUST retain
  the existing provider-cache and Apollo transport cleanup.
- **FR-003**: The callback MUST exchange a redirect flow at most once.
- **FR-004**: The callback MUST NOT mark a flow complete or navigate until the canonical
  auth context exposes an authenticated session with the exchanged user ID and JWT.
- **FR-005**: Protected route guards MUST remain fail-closed for truly anonymous users.
- **FR-006**: A valid committed session found on `/login` MUST be redirected defensively to
  `/feed`, where academic onboarding policy remains authoritative.
- **FR-007**: Failure messages MUST be controlled and MUST NOT log or render Microsoft
  access tokens, OneITB JWTs, claims, or unnecessary personal data.
- **FR-008**: External Microsoft browser warnings MUST be documented as provider-owned and
  MUST NOT be suppressed by weakening OneITB CSP or CORS.
- **FR-009**: A real institutional account MUST complete provider redirect, OneITB token
  exchange, canonical session commit and private/onboarding arrival before the successful
  path is classified as runtime verified. Logout, cancellation and second-account
  isolation remain separate acceptance cases.
- **FR-010**: Public identity operations MUST expose their controlled error to the calling
  screen and MUST NOT be reclassified as expiration of an unrelated persisted session.
- **FR-011**: Login MAY recover an unfinished redirect only when the flow is valid, MSAL
  is idle, and exactly one or an explicitly active Microsoft account is available.
- **FR-012**: The OneITB token exchange MUST have a finite timeout, cancel on callback
  unmount, and expose a controlled retry message when the backend is unavailable.

## Non-Functional Requirements

- No popup flow, Azure portal mutation, backend authorization change, CORS relaxation, or
  CSP relaxation is introduced.
- Automated validation is finite and does not start Vite or the backend.
- Regression coverage includes provider-aware cleanup and navigation-after-commit order.

## Success Criteria

- All automated session and callback scenarios pass without duplicate token exchange.
- Protected navigation occurs zero times while the committed identity is absent or differs.
- Local login and logout continue clearing stale Microsoft identity state.
- The frontend production build completes without errors.
- Manual acceptance with `38079238@itbeltran.com.ar` either reaches onboarding/private UI
  or shows a controlled OneITB error with no redirect loop.

## Assumptions

- Azure already registers `http://localhost:5173/auth/microsoft/callback` as an SPA URI.
- Microsoft authentication reaches the callback and `AADSTS50011` is resolved.
- The backend GraphQL `microsoftLogin` contract remains unchanged.
