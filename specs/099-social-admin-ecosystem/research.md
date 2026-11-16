# Research: Social and Administration Ecosystem

## Strongly typed publication reports

**Decision**: Replace the generic string content reference in `CommunityReport` with an explicit `InquiryId` and `Inquiry` navigation.

**Rationale**: This scope reports publications only, requires referential integrity, and must avoid shadow or polymorphic pseudo-relations.

**Alternatives considered**: Keeping `ContentId` and `ContentType` cannot enforce a database FK to `Inquiry`.

## JWT-derived social actor

**Decision**: Resolve the acting user from the authenticated `NameIdentifier` claim for publications, comments, reactions and reports.

**Rationale**: Accepting `userId` from Apollo permits impersonation.

**Alternatives considered**: Passing a user UUID from the frontend was rejected as untrusted input.

## Service-backed writes and projected reads

**Decision**: Put validation and persistence in scoped services and return query roots compatible with HotChocolate projections.

**Rationale**: This follows the Constitution and lets EF translate requested related fields into bounded SQL instead of field-level database calls.

**Alternatives considered**: Resolver-local EF logic duplicates validation and violates the required architecture.

## Unique interaction invariants

**Decision**: Enforce a unique `(InquiryId, UserId)` reaction index and prevent duplicate pending reports per reporter and inquiry.

**Rationale**: Application checks alone are race-prone.

**Alternatives considered**: Count-before-insert without database uniqueness can fail under concurrency.

## Deterministic idempotent seed

**Decision**: Use fixed GUIDs, stable subject codes and existence checks per dataset rather than an all-or-nothing `Users.Any()` guard.

**Rationale**: Local databases may be partially populated and repeated startup must not duplicate data.

**Alternatives considered**: Random generation produces unstable evidence; deleting data destroys developer records.

## Recursive UI with flat comment data

**Decision**: Query comments with parent identifiers, build the tree once in React, and render it recursively.

**Rationale**: A self-recursive GraphQL selection needs a fixed depth, while a flat projected set supports arbitrary stored depth.

**Alternatives considered**: Repeated nested `replies` selections are brittle and query-size dependent.

