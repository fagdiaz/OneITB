# Feature Specification: Async Query and Pagination Hardening

**Feature Directory**: `specs/191-query-pagination-hardening`  
**Created**: 2026-07-27  
**Status**: Implemented (runtime smoke deferred)  
**Audit Source**: `docs/audit/FINAL_AUDIT_REPORT.md` (C-3, A-3 and A-4)

## Problem Statement

The social query builder performs a synchronous database lookup before returning its query, while its paged execution lacks request cancellation. A bounded feed query exists, but an unbounded inquiries field remains public and is still consumed by profile and administration screens. Academic student loading returns the complete career cohort without pagination.

## User Scenarios & Testing

### User Story 1 - Feed remains responsive under concurrency (Priority: P0)

Authenticated users load and paginate the feed without request threads blocking on synchronous database I/O. Cancelling a request stops count/list operations.

### User Story 2 - Every inquiry consumer is bounded (Priority: P0)

Feed, profile and administrative inquiry views retrieve a controlled page instead of materializing the full graph.

### User Story 3 - Academic staff browse students incrementally (Priority: P0)

Administrators and professors retrieve a bounded, ordered page of eligible students and can request subsequent pages without duplicates.

### User Story 4 - Existing filters and visibility remain exact (Priority: P1)

Career scoping, followed-author priority, mute/block exclusions, search, deep links and role visibility produce the same authorized records after the refactor.

## Functional Requirements

- **FR-001**: No EF Core terminal query in the affected social/academic paths may execute synchronously.
- **FR-002**: Request cancellation MUST propagate from GraphQL through service methods to every EF Core async terminal operation.
- **FR-003**: The existing bounded `inquiriesPage` behavior MUST remain the canonical feed/search contract.
- **FR-004**: Public use of the unbounded `inquiries` field MUST be removed or explicitly deprecated and bounded during compatibility migration.
- **FR-005**: All current frontend consumers of `inquiries` MUST migrate to a bounded contract.
- **FR-006**: Inquiry page size MUST remain clamped to a documented maximum and cursors MUST be opaque to clients.
- **FR-007**: Academic students MUST expose a bounded page with items, total count and next-page state.
- **FR-008**: Academic student ordering MUST remain deterministic by last name, first name and ID.
- **FR-009**: Authorization and career scoping MUST occur before returning any academic student data.
- **FR-010**: Count and page queries sharing one DbContext MUST execute safely and sequentially unless separate contexts are explicitly used.
- **FR-011**: Existing deep-link retrieval by inquiry ID MUST remain functional and visibility-scoped.
- **FR-012**: Pagination MUST not introduce N+1 loading for inquiry or student graphs.
- **FR-013**: Profile publication paging MUST filter by author on the server before applying offset and limit.

## Edge Cases

- Invalid, negative, stale or out-of-range cursor.
- Page boundary while new inquiries are inserted.
- User with no careers, inactive career or moderator/admin global visibility.
- Duplicate names in the academic student list.
- Cancellation between total-count and page materialization.
- An inquiry deep link outside the viewer's career or block scope.
- Legacy frontend cache entries for the former unbounded field.

## Success Criteria

- **SC-001**: Source and tests show zero synchronous EF terminal calls in affected paths.
- **SC-002**: Every inquiry and academic-student response contains no more than the configured maximum.
- **SC-003**: Pagination tests cover first, middle, final, invalid-cursor and cancellation cases.
- **SC-004**: Visibility/order regression tests produce the same authorized ordering as baseline.
- **SC-005**: Backend/frontend tests and Release/Vite builds pass with no Apollo cache warnings.

## Out of Scope

- Replacing the existing inquiry offset cursor with keyset pagination in this stabilization pass.
- Redesigning feed ranking.
- Changing academic authorization roles.
- Adding new search features.
