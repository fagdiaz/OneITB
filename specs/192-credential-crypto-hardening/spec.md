# Feature Specification: Credential Delivery and Cryptographic Policy Hardening

**Feature Directory**: `specs/192-credential-crypto-hardening`  
**Created**: 2026-07-27  
**Status**: Implemented `[I]`; SMTP real and browser smoke pending  
**Audit Source**: `docs/audit/FINAL_AUDIT_REPORT.md` (A-1 and A-2), plus confirmed secret/log hygiene findings

## Problem Statement

The employer Magic Link request currently returns the one-time credential in the GraphQL response and the frontend inserts it into the next form. The development email fallback logs complete message bodies, which would disclose such credentials. Password creation uses BCrypt without an explicit, centrally governed work factor. A JWT signing key is also present in tracked base configuration.

## User Scenarios & Testing

### User Story 1 - Employer receives a real one-time link (Priority: P0)

An employer requests access and receives a generic confirmation in the browser. The one-time credential is delivered only through the configured email channel and is never returned by GraphQL.

### User Story 2 - Local development remains safe and usable (Priority: P0)

Without SMTP, Development writes a local, ignored mail artifact or uses another explicit development-only delivery sink. It does not print the credential to shared logs. Production cannot silently use that fallback.

### User Story 3 - Password hashing follows one policy (Priority: P0)

Registration, seeded accounts and employer placeholder passwords use an explicit approved BCrypt cost. Existing valid hashes remain verifiable and may be upgraded after successful authentication.

### User Story 4 - Signing secrets are environment-owned (Priority: P0)

No real/default JWT signing key is tracked in application configuration. Missing or weak production secrets fail startup with an actionable sanitized error.

## Functional Requirements

- **FR-001**: `requestMagicLink` MUST return only a generic acceptance payload, never the raw one-time credential.
- **FR-002**: The raw credential MUST be delivered through `IEmailSender` using a frontend link and MUST not appear in application logs.
- **FR-003**: The browser MUST consume the credential from a URL fragment or equally non-referrer channel and remove it from the visible URL immediately.
- **FR-004**: Magic Link credentials MUST be stored as non-reversible digests rather than reusable plaintext values.
- **FR-005**: Request responses MUST not reveal whether an account/email exists.
- **FR-006**: Development fallback delivery MUST be explicit, local-only and excluded from source control.
- **FR-007**: Production MUST require a real email delivery provider for Magic Link and MUST not use a console/body logger.
- **FR-008**: BCrypt hashing MUST use one explicit configurable policy with a secure production minimum.
- **FR-009**: Existing BCrypt hashes MUST remain verifiable; successful login SHOULD rehash hashes below current policy.
- **FR-010**: All production password creation paths MUST use the same hashing abstraction or approved policy.
- **FR-011**: Tests MAY use a reduced cost through a test-only constructor/configuration that cannot be selected in Production.
- **FR-012**: JWT signing keys MUST come from secrets/environment configuration and MUST meet minimum entropy/length validation.
- **FR-013**: No credential, password, token, signing key or email body containing credentials may be logged.
- **FR-014**: Existing Magic Link expiry, single-use atomic consumption and signed JWT issuance MUST remain intact.

## Edge Cases

- SMTP outage after credential persistence.
- Duplicate rapid requests; only the latest/multiple bounded links and their expiry behavior.
- Link opened twice or concurrently.
- URL fragment parsing with malformed/oversized values.
- Existing plaintext Magic Links during deployment.
- Existing BCrypt costs below/above the new policy.
- Production starts with missing SMTP or JWT secret.
- Development mail directory is unavailable.

## Success Criteria

- **SC-001**: GraphQL responses and logs contain zero raw Magic Link credentials.
- **SC-002**: One-time links work once, expire as configured and fail on replay.
- **SC-003**: All production hash creation sites use the approved explicit cost.
- **SC-004**: Existing hashes authenticate and weak hashes are upgraded without resetting passwords.
- **SC-005**: Secret scan reports no tracked JWT/email/password secrets.
- **SC-006**: Backend/frontend tests, builds and runtime email-link login pass.

## Out of Scope

- Google/OIDC SSO.
- Changing JWT claims or session duration.
- Replacing BCrypt with another password algorithm in this release.
- Email-domain approval policy for employers.
