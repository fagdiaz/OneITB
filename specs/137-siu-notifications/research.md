# Research: SIU Sync and Notifications

## Decision: Use an adapter/anti-corruption boundary for SIU

**Decision**: Introduce an `ISiuIntegrationService` contract that returns normalized institutional grade records. Implement `MockSiuIntegrationService` for this feature.

**Rationale**: The real SIU Guarani contract is not available, and the project constitution forbids hard-coding external secrets or inventing production credentials. A local adapter lets the academic module validate integration behavior while keeping replacement with a real provider isolated.

**Alternatives considered**:
- Directly seed grades in `DbInitializer`: rejected because it does not exercise a sync workflow.
- Add a REST endpoint for SIU: rejected because business operations must stay on GraphQL.
- Store raw SIU payloads: rejected for this scope because no stable institutional payload exists.

## Decision: Upsert into existing AcademicProgress

**Decision**: `syncSiuGrades(subjectId)` resolves SIU records to active local students associated with the subject career and creates or updates one `AcademicProgress` per `(UserId, SubjectId)`.

**Rationale**: `AcademicProgress` is already the local source of truth for grades and has a unique user-subject constraint. Reusing it avoids parallel grade state and duplicate UI logic.

**Alternatives considered**:
- Create a separate imported-grade table: rejected because P2 needs visible academic progress, not an audit trail.
- Let the frontend upload CSV: rejected because the requested design is an institutional adapter.

## Decision: Persist notifications in SQL and emit per-user topic events

**Decision**: Add `Notification` and `NotificationPreference` entities. Notification service persists each notification and emits to `notification:{userId}` using HotChocolate `ITopicEventSender`.

**Rationale**: Persistence guarantees offline users see events later. Per-user topics match the existing private chat subscription model and avoid broadcasting private data.

**Alternatives considered**:
- Client-only notification state: rejected because it disappears after reload and misses disconnected users.
- Global notification topic with client-side filtering: rejected because it risks exposing metadata to the wrong clients.
- Distributed pub/sub: rejected for P2 because roadmap tracks that as P3.

## Decision: Default preferences are enabled

**Decision**: If a user has no explicit `NotificationPreference` row for a category, the category is treated as enabled.

**Rationale**: This prevents silent missed academic updates and avoids backfilling preferences for every existing user.

**Alternatives considered**:
- Default disabled: rejected because users would miss resource/grade events until discovering settings.
- Store a row for every user/category during migration: rejected as unnecessary data churn.

## Decision: Notify resource publication and progress changes

**Decision**: Academic resource creation fans out to active users enrolled in the subject career and with resource notifications enabled. Progress changes notify only the affected student when grade notifications are enabled.

**Rationale**: These are the two user-visible academic events requested by the feature and map directly to existing academic workflows.

**Alternatives considered**:
- Notify admins on every sync outcome: rejected for first pass; the sync mutation returns an immediate summary.
- Notify all users globally: rejected because academic relevance is scoped by career and subject.
