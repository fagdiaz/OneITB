# Tasks: Apollo Logout Session Isolation

## Phase 1 - Baseline and tests

- [x] T001 Document manual logout, expiration and WebSocket lifecycle sequences.
- [x] T002 Add a cache fixture containing all principal user-scoped entity types.
- [x] T003 Add failing tests for cache purge, A-to-B identity isolation and no reset refetch.
- [x] T004 Add race tests for double logout, simultaneous 401 and late subscription events.

## Phase 2 - Canonical session boundary

- [x] T005 Implement an idempotent asynchronous termination coordinator.
- [x] T006 Route AuthContext.logout through the coordinator.
- [x] T007 Route GraphqlProvider authorization-expiration handling through the same coordinator.
- [x] T008 Ensure login awaits pending cleanup and resets the expiration guard.

## Phase 3 - Transport and persistence hardening

- [x] T009 Invalidate or restart old-session GraphQL WebSocket subscriptions safely.
- [x] T010 Add storage-event handling for logout in another tab.
- [x] T011 Add defensive JSON parsing for persisted user hydration.
- [x] T012 Preserve one-shot expiration UX and protected-query skip behavior.

## Phase 4 - Verification

- [x] T013 Run focused and complete frontend tests.
- [x] T014 Run Vite production build and console/static checks.
- [x] T015 Verify the User A logout to User B login boundary with automated state/cache tests and a clean browser smoke.
- [x] T016 Record evidence and update canonical docs from actual outcomes.

## Dependencies

Tests precede coordinator extraction. The coordinator precedes AuthContext/error-link migration. Transport hardening precedes cross-user browser verification.

## Definition of Done

- [x] Cache contains no old-session entity after logout.
- [x] Old socket payloads cannot repopulate it.
- [x] Concurrent termination is idempotent.
- [x] New session renders only current-user data.
