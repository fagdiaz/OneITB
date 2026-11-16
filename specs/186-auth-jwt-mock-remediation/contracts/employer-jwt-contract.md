# Contract: Employer Authentication JWT Remediation

## GraphQL Operations

### requestMagicLink(email, cuit)

- Normalizes email and validates existing employer onboarding rules.
- Creates a short-lived, one-time credential.
- Production behavior MUST NOT expose signing material. Any raw-link return retained for development must be environment-gated and documented.

### loginWithMagicLink(token)

- Success: signed access token compatible with bearer middleware.
- Invalid/expired/replayed/inactive: sanitized GraphQL error with stable code; no JWT.

## JWT Contract

- Algorithm: configured HMAC SHA-256 policy.
- Issuer and audience: values consumed by JwtBearerOptions.
- Required claims: user id, role, JWT id, name and normalized email.
- Lifetime: one configuration shared by all login paths.
- Authorization header: Bearer plus token.

## Compatibility Rules

- Existing frontend token storage remains a JWT string.
- Role value remains Empleador.
- Protected operations accept password and magic-link tokens identically.
- No resolver returns Mock_JWT_Token or token_placeholder.

## Error Contract

| Condition | Code | Exposure |
|---|---|---|
| Invalid/expired/replayed link | AUTH_MAGIC_LINK_INVALID | Generic Spanish message |
| Inactive/wrong-role account | AUTH_MAGIC_LINK_INVALID | Do not enumerate state |
| Invalid JWT server config | AUTH_CONFIGURATION_ERROR | Generic client error; secret-free server log |

## Verification

Decoding is insufficient: tests and runtime smoke validate signature, issuer, audience, expiry and protected-operation acceptance.
