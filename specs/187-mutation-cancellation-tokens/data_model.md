# Data Model: Mutation Cancellation Propagation

## Persistent Model

No entity, relationship or migration change is required.

## Execution Model

CancellationToken is request-scoped execution metadata:

| Layer | Responsibility |
|---|---|
| HotChocolate resolver | Accept request token and pass it explicitly |
| Application service | Preserve token through validation and orchestration |
| Repository/UnitOfWork | Pass token to EF Core async APIs |
| Side-effect adapter | Pass token to topic, email or notification operation |
| Background service | Use host stopping token, never a stale HTTP token |

## State Invariants

1. Pre-cancelled write paths persist zero rows.
2. No later side effect runs after a cancellation before commit.
3. A successful commit is not undone merely because response delivery is cancelled.
4. Cancellation metadata is never stored in SQL Server or exposed in GraphQL SDL.

## Acceptance Criteria

- EF pending-model-change check remains clean.
- Schema snapshot has no cancellation argument.
- Cancellation tests assert database state, not only thrown exception type.
