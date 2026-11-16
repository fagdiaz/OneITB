# Feature Specification: Apollo Logout Session Isolation

**Feature Directory**: specs/188-apollo-cache-logout-cleanup  
**Created**: 2026-07-22  
**Status**: Verified  
**Audit Source**: docs/audit/FINAL_AUDIT_REPORT.md (high cross-session cache risk)

## Problem Statement

Apollo normalized cache, active observers and WebSocket subscriptions can outlive local credential changes. The current working tree already calls clearStore from AuthContext and the expiration handler, but this behavior lacks regression tests, uses separate termination paths and does not prove that user A data/events cannot appear after user B logs in. The security requirement is session isolation, not merely one clearStore call.

## User Scenarios & Testing

### User Story 1 - Manual logout purges private state (Priority: P0)

User A logs out and the login screen contains no cached profile, feed, message, notification, academic or job data from that session.

**Independent Test**: Prime Apollo with representative entities, invoke the canonical logout transition, and assert credentials, React auth state, cache extraction and active private subscriptions are cleared.

### User Story 2 - Session expiration uses the same safe path (Priority: P0)

An expired JWT terminates the session once, clears private state and redirects with the existing Spanish expiration message without unauthorized refetch storms.

### User Story 3 - User B starts from a clean boundary (Priority: P0)

After User A logs out, User B logs in in the same tab and all identity-scoped queries resolve from network/current session with no stale flash.

### User Story 4 - Logout is race-safe (Priority: P1)

Double clicks, simultaneous 401 responses and late WebSocket events do not execute conflicting clears, restore old credentials or repopulate cache.

## Functional Requirements

- **FR-001**: Manual logout and authorization-expiration handling MUST call one canonical asynchronous session-termination routine.
- **FR-002**: The routine MUST remove the bearer token and serialized user before clearing Apollo to prevent unauthenticated reset refetches.
- **FR-003**: The routine MUST use clearStore, not resetStore, unless all active query refetch behavior is explicitly controlled.
- **FR-004**: Normalized cache data for User, Inquiry, Message, Notification, AcademicResource, AcademicProgress, JobOffer and JobApplication MUST be absent after completion.
- **FR-005**: Private subscriptions/observers from the old session MUST be disposed or invalidated before they can repopulate the cache.
- **FR-006**: The transition MUST be idempotent under concurrent logout/401 triggers.
- **FR-007**: Login MUST wait for any prior clear to complete before writing the next session and executing private queries.
- **FR-008**: Protected components MUST unmount or skip queries as soon as authentication becomes false.
- **FR-009**: A storage-event logout in another tab MUST terminate the local session without exposing stale state.
- **FR-010**: Session-expiration UX and existing redirect destination MUST remain compatible.

## Edge Cases

- Apollo client is not initialized when logout occurs.
- clearStore rejects because an observer callback fails.
- Multiple GraphQL operations return 401 simultaneously.
- User B submits login while User A logout is still pending.
- A WebSocket message arrives between token removal and protected-tree unmount.
- localStorage contains malformed serialized user data at startup.

## Success Criteria

- **SC-001**: Automated test proves cache.extract() has no user-scoped entities after logout.
- **SC-002**: A sequential User A to User B test shows no A identity in rendered output or cache.
- **SC-003**: Concurrent termination triggers execute one transition and no unhandled rejection.
- **SC-004**: No unauthorized network refetch is initiated by the clear operation.
- **SC-005**: Frontend tests and Vite production build pass with no new console warning.

## Out of Scope

- Server-side JWT revocation and refresh-token rotation.
- Persisting Apollo cache to disk.
- Replacing Apollo Client or graphql-ws.
