# Data Model Impact

No migration is planned.

## Existing relationships reused

- `UserCareer(UserId, CareerId)` scopes professor operations to subjects in linked careers.
- `UserInteraction(ObserverId, TargetId, Type)` remains a social relation only and no longer grants private-profile access.
- `Account.Email` remains the normalized unique identity.

## Configuration models

### PublicRegistrationRateLimitOptions

- `RequestIpLimit`: positive integer.
- `RequestIdentityLimit`: positive integer.
- `WindowMinutes`: positive integer.
- `MaxTrackedKeys`: bounded positive integer for local fallback.

### PublicRegistrationPolicy

- Institutional domain is read from configuration with `itbeltran.com.ar` as the safe project default.
- Public role is fixed to `Estudiante`.

## Invariants

1. Normalized account email is lower-case and trimmed.
2. A public registration cannot assert a privileged or staff role.
3. A professor's academic target subject must share a linked career.
4. Follow never changes privacy authorization.
