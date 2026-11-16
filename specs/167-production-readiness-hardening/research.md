# Research: Production Readiness Hardening

## Decision: Correlation ID middleware in the ASP.NET Core host

**Rationale**: Request tracing belongs at the HTTP boundary and must cover GraphQL, uploads, static files, and controllers. A middleware can propagate `X-Correlation-ID`, attach a logging scope, and emit duration/status without new dependencies.

**Alternatives considered**:

- Per-controller/resolver logging: rejected because GraphQL and uploads would diverge.
- External telemetry package: rejected because the current environment has a NuGet restore boundary and the requirement can be met with built-in logging.

## Decision: HotChocolate DataLoaders for computed GraphQL metric fields

**Rationale**: User and inquiry metrics are selected from GraphQL object fields and may appear on lists. DataLoaders batch keys collected during execution and reduce N+1 count patterns to grouped aggregate queries.

**Alternatives considered**:

- Remove metric fields from frontend queries: rejected because it regresses role badges, admin metrics, and report counters.
- Store denormalized counters now: rejected because it requires EF model changes, backfill, consistency rules, and migration validation not necessary for this hardening increment.

## Decision: No roadmap inflation for distributed/runtime-only gaps

**Rationale**: Pub/sub distributed transport, SQL-backed GraphQL integration tests, frontend component tests, and admin browser regression require either new dependencies, running browser sessions, or infrastructure not guaranteed in this prompt. Evidence-based completion is a constitutional rule.

**Alternatives considered**:

- Mark items complete based on implementation intent: rejected because it would weaken the academic audit.
- Add placeholders: rejected because the user explicitly requested zero technical debt.
