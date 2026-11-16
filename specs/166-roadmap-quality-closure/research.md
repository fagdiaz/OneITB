# Research: Spec 166 Roadmap Quality Closure

## Decision: Add backend service tests before frontend component-test infrastructure

**Rationale**: The existing backend test project already has xUnit, Moq and EF Core InMemory. Auth/feed service tests close the roadmap's P0 gap with deterministic evidence and no dependency churn.

**Alternatives considered**:
- Add Vitest/Testing Library for frontend components. Rejected for this pass because it introduces new dependencies and requires a larger component mocking strategy.
- Add browser E2E tests. Rejected for this pass because a stable authenticated browser harness is not yet present.

## Decision: CI runs deterministic local-quality gates

**Rationale**: GitHub Actions can validate backend tests, backend Release build and frontend build without secrets. Docker SQL integration remains a separate explicit item.

**Alternatives considered**:
- CI with SQL Server service container. Deferred because it requires deterministic connection-string/secrets strategy and integration-test project structure.

## Decision: Update docs to match implemented academic scope

**Rationale**: `scope-and-requirements.md` and `architecture-and-design.md` still describe academic resources/SIU/notifications as planned even though the roadmap and code show implementation. This contradiction weakens presentation readiness.

**Alternatives considered**:
- Leave docs unchanged and rely only on `ROADMAP.md`. Rejected because the user requested `/docs` to be perfect and canonical documents must not contradict each other.
