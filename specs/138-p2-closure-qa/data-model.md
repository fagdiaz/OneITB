# Data Model: P2 Closure QA

No production entities are added or changed.

## Documentation Artifacts

- `DesignDiagramSet`
  - ER diagram covering identity, social, academic, messaging, moderation and notifications.
  - SIU sequence diagram.
  - Pub/Sub architecture diagram.

## Test Artifacts

- `Services.Tests`
  - xUnit project referencing `Entities`, `Data`, and `Services`.
  - SQLite in-memory `OneItbContext` fixture.
  - Moq dependencies for SIU, notifications and topic sender.

## Covered Domain Objects

- `Account`, `User`, `Career`, `UserCareer`, `Subject`
- `AcademicResource`, `AcademicProgress`
- `Notification`, `NotificationPreference`, `NotificationType`

## Validation Rules Under Test

- Only `Administrador` and `Profesor` can manually manage academic progress.
- Only `Administrador` can run SIU sync.
- Academic progress target must be active, student role, and enrolled in the subject career.
- SIU sync uses idempotent upsert by `(UserId, SubjectId)`.
- Notification preferences default enabled and suppress disabled categories.
- Notification read operations are scoped to owner.
- Pub/Sub failure must not roll back notification persistence.
