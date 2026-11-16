# Data Model: Final Operational Acceptance

## Persistent Schema

No EF Core entity or migration is introduced.

## Operational Records

### AcceptanceGate

| Field | Rule |
|---|---|
| Id | Stable identifier such as `BASELINE-BUILD` or `S190-MAGIC-THROTTLE` |
| Category | Baseline, Security, Pagination, Browser, Realtime, External, Documentation |
| Prerequisite | Explicit environment or identity requirement |
| Expected | Observable status, payload property or side-effect count |
| Actual | Sanitized result |
| Status | `PASS`, `FAIL`, `BLOCKED` |
| Evidence | Command/test/browser reference without credentials |

### TemporaryFixture

| Field | Rule |
|---|---|
| Scope | File, identity, message, notification or process |
| Identifier | Generated acceptance prefix or PID |
| CreatedAt | UTC |
| Cleanup | Exact bounded operation |
| Cleaned | Must be true before successful script exit |

### ExternalProviderGate

| Field | Rule |
|---|---|
| Provider | SMTP, Redis or Cloudinary |
| RequiredKeys | Configuration names only |
| Configured | Boolean; values never recorded |
| RuntimeResult | Verified, Blocked or Failed |
| ResidualRisk | Deployment impact |

## Invariants

1. No acceptance run modifies the EF model.
2. A rejected upload never reaches storage.
3. A silenced reaction changes no reaction or notification row.
4. A page never exceeds its documented limit or duplicates IDs across successive pages.
5. Session B observes no protected entity from session A.
6. Every started process and generated fixture has a confirmed cleanup result.
7. External-provider absence never produces a verified status.
