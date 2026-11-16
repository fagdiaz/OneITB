# Research: P2 Closure QA

## Decision: Use Mermaid source diagrams in `docs/academic/04-design-diagrams.md`

**Rationale**: Mermaid keeps diagrams reviewable in Git and renderable in common Markdown viewers without binary assets.

**Alternatives considered**: Static PNG/SVG diagrams were rejected because they are harder to diff and maintain.

## Decision: Use xUnit for the backend unit-test suite

**Rationale**: xUnit is the common .NET test framework, works well with `dotnet test`, and has low friction for async service tests.

**Alternatives considered**: NUnit/MSTest were viable but add no benefit for this repo.

## Decision: Use EF Core InMemory for service unit tests

**Rationale**: `AcademicService` and `NotificationService` tests target service rules, authorization branches and notification side effects. The current production model contains SQL Server-specific defaults and filtered indexes that make SQLite setup fail for reasons unrelated to unit behavior. EF Core InMemory keeps tests fast, deterministic and Docker-free.

**Alternatives considered**: SQLite in-memory was considered but rejected because the model uses SQL Server-specific SQL. Mocking `DbSet` was rejected as brittle and less representative than an EF provider.

## Decision: Use Moq only for external service boundaries

**Rationale**: The user requested Moq. It is appropriate for `INotificationService`, `ISiuIntegrationService`, `ITopicEventSender`, and logging-adjacent dependencies, while EF Core remains real.

**Alternatives considered**: Hand-written fakes were considered for SIU and notifications, but Moq gives direct verification of calls.
