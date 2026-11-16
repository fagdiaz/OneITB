# Research: Microsoft Entra Redirect Acceptance

## Decision 1 - Treat `AADSTS50011` as exact registration drift

**Decision**: Register the URI sent by the SPA exactly under the Entra Single-page
application platform.

**Rationale**: Microsoft Entra compares redirect URIs against the application registration.
The observed request sends `http://localhost:5173/auth/microsoft/callback`; OneITB already
uses that callback consistently.

**Alternatives considered**: Returning to `/login` was rejected because it recreates the
nested-login rendering failure fixed by Spec 200. Popup auth was rejected for the same
reason and for weaker mobile/accessibility behavior.

## Decision 2 - Do not weaken CORS or CSP

**Decision**: Leave OneITB CORS and CSP unchanged.

**Rationale**: The CSP, BSSO, cookie, and telemetry messages originate from Microsoft-owned
pages or endpoints. They do not cause the Entra redirect mismatch and cannot be fixed by
allowing broader origins in OneITB.

## Decision 3 - HTTP only for local development

**Decision**: Permit HTTP callback URIs only for `localhost` and IPv4 loopback; require
HTTPS elsewhere.

**Rationale**: This preserves local Vite development while preventing accidental insecure
deployment configuration.

## Decision 4 - External acceptance remains evidence-gated

**Decision**: Automated tests validate the local contract, but Spec 202 is not externally
verified until a real institutional account completes the redirect and session lifecycle.

**Rationale**: Repository evidence cannot prove tenant configuration, consent, account
policy, or Azure propagation.

## Source

- Microsoft Learn, *Redirect URI (reply URL) restrictions and limitations*:
  <https://learn.microsoft.com/en-us/entra/identity-platform/reply-url>
