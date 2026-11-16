# Feature Specification: Microsoft Entra Redirect Authentication

**Feature Branch**: `codex/199-ux-b2b-academic-onboarding`

**Created**: 2026-08-03

**Status**: Implemented; browser and real-tenant acceptance pending

## User Scenarios & Testing

### User Story 1 - Accessible Microsoft sign-in (Priority: P1)

As an institutional user, I can start Microsoft 365 authentication through a full-page
redirect so that the flow works consistently on desktop, mobile, and browsers that
restrict popups.

**Acceptance Scenarios**:

1. The Microsoft action starts one redirect interaction and never opens a popup.
2. While an identity interaction is active, the UI announces progress and prevents a
   second interaction.
3. Microsoft returns to a dedicated callback that never renders another login action.

### User Story 2 - Safe session completion (Priority: P1)

As a returning institutional user, the delegated API token is exchanged exactly once
for the canonical OneITB JWT and my session opens at a safe internal destination.

**Acceptance Scenarios**:

1. The callback obtains the delegated API access token from the returning account.
2. React rerenders and Strict Mode remounts do not duplicate the GraphQL exchange.
3. The OneITB session boundary clears prior Apollo state before hydrating the identity.
4. External, protocol-relative, login, and callback destinations resolve to `/feed`.

### User Story 3 - Recoverable failure (Priority: P1)

As a user whose Microsoft or OneITB exchange fails, I receive an accessible error and
can return to Login without entering a redirect loop.

**Acceptance Scenarios**:

1. Missing account, token acquisition, GraphQL, and rejected-session failures are
   displayed without exposing tokens.
2. Failed flows release their idempotency lock and can be retried from Login.
3. No automatic retry starts another Microsoft redirect.

## Edge Cases

- MSAL reports `Startup`, `Login`, `HandleRedirect`, or `AcquireToken`.
- React Strict Mode mounts the callback twice while one exchange is in flight.
- The callback reloads after a successful exchange but before navigation completes.
- More than one Microsoft account exists in the browser cache.
- The configured redirect URI points to the legacy `/login` route.
- The requested return URL is absolute, protocol-relative, Login, or the callback.
- Microsoft returns an account but silent delegated-token acquisition fails.

## Functional Requirements

- **FR-001**: The frontend MUST use `loginRedirect` and contain no active popup login.
- **FR-002**: MSAL MUST use the dedicated `/auth/microsoft/callback` redirect route.
- **FR-003**: MSAL MUST remain on the callback after processing the identity response.
- **FR-004**: Login MUST block all new actions while interaction status is not `None`.
- **FR-005**: The callback MUST render status/error UI without a login button.
- **FR-006**: The existing delegated API access-token GraphQL contract MUST remain.
- **FR-007**: The returning account MUST be made active before token acquisition.
- **FR-008**: The exchange, local login, and navigation MUST execute once per flow ID.
- **FR-009**: Failed flows MUST release the lock and allow an explicit new attempt.
- **FR-010**: OneITB authentication MUST continue through canonical `AuthContext.login`.
- **FR-011**: Return destinations MUST be internal, normalized, and denylisted when unsafe.
- **FR-012**: Authentication errors MUST be accessible and MUST NOT expose credentials.

## Non-Functional Requirements

- **NFR-001**: No backend, EF Core, schema, dependency, or secret change is permitted.
- **NFR-002**: User-facing status uses `role=status`, `aria-live`, and `aria-busy`.
- **NFR-003**: The implementation MUST tolerate React Strict Mode behavior.
- **NFR-004**: Validation MUST use finite tests and builds; no server may start.
- **NFR-005**: Browser and tenant acceptance MUST not be reported without execution.

## Success Criteria

- **SC-001**: Static search finds no active `loginPopup` or `acquireTokenPopup` call.
- **SC-002**: Unit tests prove redirect initiation and all busy states.
- **SC-003**: Callback tests prove exactly one exchange under concurrent mounts.
- **SC-004**: Failure and unsafe-destination tests pass without redirect loops.
- **SC-005**: The complete frontend suite and production build pass with zero errors.

## Assumptions

- `microsoftLogin(accessToken)` remains the authoritative backend exchange.
- The Entra SPA registration will include `/auth/microsoft/callback` as redirect URI.
- MSAL React owns redirect-response processing through the single root provider.

## Out Of Scope

- Microsoft App Registration or tenant consent changes.
- Backend token validation, provisioning, role, GraphQL, or database changes.
- Starting local servers or performing real Microsoft 365 acceptance.
