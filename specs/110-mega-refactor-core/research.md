# Research: Mega Refactor Core

## Decision: Treat chat cache isolation as the first deliverable

**Rationale**: The render warning can mask real UI regressions and is independent from the
schema work. Fixing it first improves validation reliability.

**Alternatives considered**: Deferring chat until after backend changes. Rejected because the
bug is already known and affects the test harness.

## Decision: Use explicit join entities for career enrollment and social graph

**Rationale**: `UserCareer` and `UserInteraction` provide clear ownership, explicit keys and
restricted delete behavior. They also avoid EF shadow properties.

**Alternatives considered**: Implicit many-to-many mappings. Rejected because the project
requires explicit foreign keys and predictable migration output.

## Decision: Use soft-delete flags with query filters

**Rationale**: `IsActive` on `Inquiry` and `Comment` preserves auditability while hiding
inactive content from ordinary queries.

**Alternatives considered**: Physical deletes or status strings. Physical deletes violate the
constraint; strings add unnecessary state complexity for this iteration.

## Decision: Keep feed ranking in the backend query/service layer

**Rationale**: Prioritizing followed authors and excluding muted/blocked authors must be
consistent for every client and should not be reimplemented in React.

**Alternatives considered**: Client-side sorting/filtering. Rejected because it leaks blocked
content to the client and cannot enforce privacy expectations.

## Decision: Seed careers idempotently with deterministic subject links

**Rationale**: The local demo dataset must remain repeatable and not duplicate records on app
startup.

**Alternatives considered**: Manual admin creation only. Rejected because the user requested
seeded institutional careers and needs local verification.

## Decision: Profile editing is a route/state boundary, not inline controls

**Rationale**: Public read-only profile and isolated editing reduce accidental edits and make
authorization easier to reason about.

**Alternatives considered**: Conditional inline editing inside the same view. Rejected because
the current requirement explicitly removes inline editing.
