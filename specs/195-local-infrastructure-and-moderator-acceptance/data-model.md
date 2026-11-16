# Data Model: Local Infrastructure and Moderator Acceptance

## Persistent Domain Impact

No EF Core entity or database schema changes are required.

## Canonical Moderator Seed

| Field | Rule |
|---|---|
| ID | Stable deterministic GUID derived from institutional email |
| Email | `moderador1@itbeltran.com.ar` |
| First name | `Moderador` |
| Last name | `Institucional` |
| Role | `Moderador` |
| Active | `true` |
| Password | Hash of non-versioned `Seed:DemoPassword`, only on first insert |
| Careers | None by default; moderation is institutional |

Invariants:

1. Account ID and User ID are identical.
2. Email and role are canonical.
3. Re-seeding never changes an existing password hash.
4. Re-seeding never creates another account/profile for the same stable identity.
5. Moderator content actions use existing reversible moderation/audit entities.

## Ephemeral Acceptance State

### Redis Probe

- Unique run prefix.
- Unique topic.
- Intended recipient identifier.
- Unrelated recipient identifier.
- Payload nonce.
- Expected count: exactly one.
- Deadline: 10 seconds.
- Keys/channels are never persisted in repository evidence.

### SMTP Fixture

- Unique subject prefix.
- Synthetic institutional recipient.
- Plain-text body without credentials.
- Expected scenario type: connectivity, Reviewed, Rejected.
- Removed from Mailpit after assertion.

### Gate Result

- Name.
- Status: PASS, FAIL, BLOCKED or SKIPPED.
- Sanitized evidence.
- Start/end time.
- Cleanup outcome.

No ephemeral fixture is inserted into the production domain database by infrastructure
tests.
