# Data Model: Employer Authentication JWT Remediation

## Persistent Model

No EF Core schema migration is expected.

- User: source of Id, canonical role, active state and display identity.
- Account: source of normalized email and relation to User.
- MagicLink: one-time credential with Token, ExpiresAt, IsUsed and AccountId.

## Runtime Security Model

| Claim | Source | Rule |
|---|---|---|
| subject/name identifier | User.Id | Required GUID |
| role | User.Role | Required canonical project role |
| name | normalized display name | Required |
| email | Account.Email | Normalized |
| JWT id | generated identifier | Unique per token |
| issuer/audience | validated JWT options | Must match bearer validation |
| issued/expiry | UTC clock/configured lifetime | No flow-specific drift |

## Invariants

1. One magic link can transition from unused to used once.
2. JWT issuance occurs only after successful atomic consumption.
3. Inactive users and non-employer roles cannot receive employer tokens.
4. The signing key is configuration, never entity data or source-controlled content.

## Acceptance Criteria

- EF pending-model-change check reports no drift.
- Password and employer tokens expose the same mandatory claims.
- Concurrent redemption yields one success and one controlled failure.
