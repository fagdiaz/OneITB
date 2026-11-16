# Implementation Plan: Microsoft Entra Redirect Acceptance

## Summary

Close the local/portal redirect contract exposed by `AADSTS50011`, harden frontend URI
validation, expand finite tests, and document the exact Microsoft Entra SPA configuration.
The application flow from Spec 200 remains unchanged.

## Technical Context

- Frontend: React 18, Vite 8, MSAL Browser 5.17.3, Vitest.
- Backend: .NET 8 and existing Microsoft Entra token validator; no backend contract change.
- External dependency: Microsoft Entra App Registration portal.
- Canonical local callback: `http://localhost:5173/auth/microsoft/callback`.
- Evidence boundary: static checks/tests locally; real tenant login remains manual.

## Constitution Check

- **Identity/authorization**: PASS. Backend remains the trust boundary and validates the
  delegated access token; SPA configuration does not grant roles.
- **External adapters/environment safety**: PASS. Public SPA identifiers remain in `.env`;
  secrets remain in user-secrets and are never printed.
- **Evidence-based completion**: PASS. Portal acceptance is not inferred from builds.
- **Operational resilience**: PASS. No server is started for finite configuration checks.

## Architecture

1. `microsoftEntraConfig.js` resolves and validates public SPA configuration.
2. `MicrosoftInstitutionalLogin` starts `loginRedirect` with the canonical callback.
3. Microsoft Entra compares the request URI byte-for-byte with the SPA registration.
4. `MicrosoftRedirectCallback` acquires the API token and invokes `microsoftLogin`.
5. The backend validates signature, issuer/tenant, audience, scope, lifetime, and domain,
   then emits the canonical OneITB JWT.

## Security Controls

- HTTP redirect allowed only on `localhost` or IPv4 loopback development hosts.
- HTTPS required for non-local deployments.
- Callback path, query, fragment, and embedded credentials validated strictly.
- No response-header changes for third-party Microsoft documents.
- No telemetry warning is reclassified as an OneITB defect without causal evidence.

## Validation Order

1. Safe presence/equality checks for frontend and backend configuration.
2. Focused configuration and redirect-flow tests.
3. Complete frontend regression and production build.
4. Static popup/config/security scans and `git diff --check`.
5. Operator saves exact SPA URI in Azure.
6. Real institutional login, cancellation, retry, logout, and session-isolation smoke.

## Rollback

Revert only the URI validation hardening if it rejects a documented supported deployment.
Do not restore `/login` as a callback and do not restore popup authentication.
