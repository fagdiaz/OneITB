# Data Model: Credential Delivery and Cryptographic Policy Hardening

## MagicLink

The physical token column can remain a 64-character string while its semantic value changes from raw token to SHA-256 hex digest.

| Field | Rule |
|---|---|
| Id | existing GUID |
| AccountId | existing explicit FK |
| TokenDigest | SHA-256 lower-case hex; unique/indexed as currently applicable |
| ExpiresAt | existing UTC expiry |
| IsUsed | existing one-time state |
| CreatedAt | existing UTC creation |

If the property is renamed, map it to the existing column or create a reviewed rename migration with no data exposure.

## PasswordHashingOptions

| Field | Type | Rule |
|---|---|---|
| WorkFactor | int | Production minimum 10, default 12, bounded maximum |

## MagicLinkRequestPayload

| Field | Type | Rule |
|---|---|---|
| Accepted | bool | generic acceptance only |
| Message | string | same user-facing wording independent of account existence |

## Persistent Migration

No schema change is required if the existing 64-character token column is reused for the digest. Any property/column rename must be a metadata-safe reviewed migration. Existing plaintext rows are invalidated at deployment.

## Invariants

1. Raw Magic Link credentials exist only during generation, email composition and one browser component session.
2. Database and logs contain no reusable Magic Link credential.
3. BCrypt hashes remain exactly 60 characters and verifiable across policy upgrades.
4. JWT signing material is never sourced from tracked defaults.
