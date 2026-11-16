# Data Model: Microsoft Entra Institutional SSO

## Account additions

| Field | SQL | Nullable | Purpose |
|---|---|---:|---|
| `PasswordHash` | `char(60)` | yes | BCrypt credential for local-login accounts |
| `ExternalProvider` | `varchar(32)` | yes | Canonical provider (`MicrosoftEntra`) |
| `ExternalTenantId` | `varchar(64)` | yes | Validated Entra tenant ID |
| `ExternalSubjectId` | `varchar(128)` | yes | Validated immutable object ID |
| `LastExternalLoginAt` | `datetime2` | yes | Last successful exchange |

## Invariants

1. A local-password account has a valid BCrypt hash.
2. An external-only account has no password hash and has all three external identity
   fields.
3. Partial external identity state is invalid.
4. Provider + tenant + subject is unique when present.
5. Existing account and user share the same stable GUID.
6. External tokens and authorization codes are never columns.

## Migration safety

The migration only relaxes `PasswordHash` nullability, adds nullable columns and creates
a filtered unique index. Existing rows retain their hashes and need no backfill.
