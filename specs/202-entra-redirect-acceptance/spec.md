# Feature Specification: Microsoft Entra Redirect Acceptance

**Spec**: 202  
**Date**: 2026-08-03  
**Status**: In progress - external tenant acceptance required

## User Scenarios & Testing

### User Story 1 - Complete institutional sign-in (Priority: P1)

As an institutional user, I can authenticate with Microsoft 365 and return to the
dedicated OneITB callback without an `AADSTS50011` redirect mismatch.

**Independent test**: Starting at `/login`, select Microsoft sign-in, authenticate with
an allowed `@itbeltran.com.ar` account, return to
`/auth/microsoft/callback`, exchange the delegated API token once, and reach the
authenticated application.

### User Story 2 - Diagnose configuration drift safely (Priority: P1)

As an operator, I can compare the exact SPA redirect URI used by OneITB with the URI
registered in Microsoft Entra without exposing credentials or weakening browser security.

**Independent test**: The runbook identifies the exact application ID context, SPA
platform, callback URI, expected protocol/host/path, and the difference between blocking
Entra errors and non-blocking Microsoft browser warnings.

### User Story 3 - Preserve a secure environment boundary (Priority: P2)

As a security reviewer, I can verify that plain HTTP redirect URIs are accepted only for
local loopback development and that deployed environments require HTTPS.

**Independent test**: Configuration tests accept the canonical localhost callback,
reject non-local HTTP callbacks, reject callback query/hash drift, and continue accepting
valid HTTPS deployment callbacks.

## Edge Cases

- The URI exists under a Web platform instead of the Single-page application platform.
- The registered URI differs only by path, port, scheme, case, query, fragment, or slash.
- The browser returns to the callback more than once under React Strict Mode.
- The account belongs to a disallowed domain even though Entra authentication succeeds.
- Microsoft telemetry, cookie partitioning, BSSO, or CSP warnings appear while the actual
  authorization request remains valid.
- Azure configuration propagation is delayed briefly after saving.

## Functional Requirements

- **FR-001**: The SPA MUST request exactly
  `http://localhost:5173/auth/microsoft/callback` in local development.
- **FR-002**: The URI MUST be registered under the Microsoft Entra **Single-page
  application (SPA)** platform for the configured client application.
- **FR-003**: The frontend MUST reject non-local redirect URIs that use plain HTTP.
- **FR-004**: The frontend MUST reject redirect URIs with query parameters, fragments,
  credentials, or a path other than `/auth/microsoft/callback`.
- **FR-005**: The redirect callback MUST preserve the Spec 200 exactly-once token
  exchange and canonical OneITB session replacement.
- **FR-006**: Documentation MUST classify `AADSTS50011` as a portal registration mismatch,
  not as an application CORS failure.
- **FR-007**: Documentation MUST distinguish external Microsoft telemetry/cookie/BSSO
  warnings from errors controlled by OneITB.
- **FR-008**: No token, password, client secret, SMTP secret, or user-secret value MAY be
  printed or committed as evidence.
- **FR-009**: Acceptance MUST remain blocked until a real institutional account completes
  success, cancellation/error recovery, and logout/session cleanup.

## Non-Functional Requirements

- Security headers and OneITB CORS policy remain unchanged.
- No client secret is introduced into the SPA.
- Configuration validation fails closed before MSAL is initialized.
- Automated checks are finite and do not start long-running servers.

## Success Criteria

- Local configuration tests pass for localhost HTTP and deployed HTTPS callbacks.
- A non-local HTTP callback is rejected before an authorization request is started.
- The frontend test suite and production build complete without errors.
- The runbook provides a reproducible five-minute `AADSTS50011` diagnosis.
- A real `@itbeltran.com.ar` login completes without `AADSTS50011` after the portal URI is
  saved and propagated.

## Assumptions

- Client application ID `4014d4f7-6cf4-4e4b-86eb-b36b8aa31cd2` is the intended SPA
  registration for the current local environment.
- The tenant authority remains `common`; backend token validation still requires a
  concrete token tenant and the institutional email domain.
- The delegated API scope and backend audience are already aligned.

## Out Of Scope

- Weakening OneITB CORS, CSP, or security headers to suppress third-party warnings.
- Supporting popup authentication again.
- Storing Microsoft access tokens in persistent browser storage.
- Automating Microsoft Entra portal changes or consent without operator credentials.
- Production hostname registration and production tenant acceptance.
