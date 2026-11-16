# Feature Specification: Employer Authentication JWT Remediation

**Feature Directory**: specs/186-auth-jwt-mock-remediation  
**Created**: 2026-07-22  
**Status**: Verified  
**Audit Source**: docs/audit/FINAL_AUDIT_REPORT.md (critical authentication finding)

## Problem Statement

Employer magic-link authentication must issue the same verifiable, signed JWT contract used by password authentication. The audited baseline is inconsistent: the committed EmployerAuthService returned a mock token, the working tree contains a partial direct JWT implementation, AccountsService owns a second private generator, and UsersService.GenerateToken still returns token_placeholder. A partial patch is not sufficient evidence of remediation.

## User Scenarios & Testing

### User Story 1 - Employer receives a real platform token (Priority: P0)

An active employer redeems one valid, unused magic link and receives a signed JWT accepted by protected GraphQL operations.

**Independent Test**: Seed an employer and magic link, execute loginWithMagicLink, validate signature/issuer/audience/expiry and call an Empleador-authorized operation with the returned bearer token.

**Acceptance Scenarios**

1. **Given** a valid unused link for an active employer, **When** it is redeemed, **Then** exactly one signed JWT is returned and the link becomes unusable.
2. **Given** that JWT, **When** HotChocolate authenticates it, **Then** user id, email/name and role claims resolve to the same employer.
3. **Given** an expired, unknown, already-used or inactive-account link, **When** it is redeemed, **Then** no JWT is issued and a stable authentication error is returned.

### User Story 2 - All authentication paths share one issuer (Priority: P0)

Security maintainers can change claim or expiry policy once without password and employer authentication drifting apart.

**Independent Test**: Resolve the central token issuer from DI, issue tokens through password and employer flows, and assert the same signing algorithm, issuer, audience and required claim set.

### User Story 3 - Token material is not leaked (Priority: P1)

Production operators can run the employer flow without secrets, JWTs or raw magic-link tokens appearing in logs or generic error payloads.

## Functional Requirements

- **FR-001**: Production code MUST contain no mock, placeholder or unsigned authentication token path.
- **FR-002**: JWT creation MUST be centralized behind a DI contract such as IJwtTokenService; resolvers and domain services MUST NOT construct JwtSecurityTokenHandler independently.
- **FR-003**: The issuer MUST validate required JWT configuration and fail closed when key, issuer or audience is invalid.
- **FR-004**: Tokens MUST include a stable user identifier, role, unique token id and identity fields required by the current contract.
- **FR-005**: Password and magic-link tokens MUST use the same algorithm, issuer, audience and configured lifetime policy.
- **FR-006**: Magic-link redemption MUST reject inactive/non-employer accounts and prevent replay under concurrent requests.
- **FR-007**: Authentication failures MUST use sanitized GraphQL codes and MUST NOT reveal whether an unrelated account exists.
- **FR-008**: IUsersService.GenerateToken and its token_placeholder implementation MUST be removed or replaced by the central issuer.
- **FR-009**: JWT signing keys, complete tokens and raw magic-link values MUST NOT be logged.
- **FR-010**: The public schema contract MUST remain compatible unless a separately documented production-safe magic-link payload is approved.

## Edge Cases

- Two requests redeem the same link concurrently.
- JWT configuration exists but the symmetric key is below the accepted security length.
- A magic link references a deleted/inactive user or incomplete account navigation.
- Role casing differs from the canonical Spanish role Empleador.
- Clock boundaries occur at link expiry or JWT expiry.

## Success Criteria

- **SC-001**: Source scan finds zero Mock_JWT, token_placeholder or duplicate JWT construction outside the central issuer.
- **SC-002**: Automated tests cover success, invalid, expired, replayed, inactive and malformed-configuration paths.
- **SC-003**: A runtime JWT from loginWithMagicLink authenticates against the running HotChocolate schema.
- **SC-004**: Backend Release build and full backend test suite pass with zero new warnings.
- **SC-005**: Evidence records the actual runtime operation; compilation alone does not close the spec.

## Out of Scope

- OAuth/Google SSO, refresh tokens and mobile token storage.
- Changing employer onboarding rules beyond secure credential issuance.
- Persisting JWTs in SQL Server.
