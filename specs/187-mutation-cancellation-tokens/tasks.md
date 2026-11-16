# Tasks: Mutation Cancellation Propagation

## Phase 1 - Inventory and baseline

- [x] T001 Map every async Mutation resolver to service, repository and terminal I/O call.
- [x] T002 Record direct parameterless EF calls and existing correctly propagated paths in evidence.md.
- [x] T003 Capture GraphQL SDL for affected mutations.
- [x] T004 Add tests asserting exact token forwarding and zero writes for pre-cancelled requests.

## Phase 2 - Repository and service propagation

- [x] T005 Add CancellationToken to IUnitOfWork.CompleteAsync and implementation.
- [x] T006 Add token parameters to asynchronous repository methods reached by mutations.
- [x] T007 Propagate through Users, Accounts and Messaging services.
- [x] T008 Propagate through Academic, Notification, Moderation and remaining Social mutation paths.

## Phase 3 - Resolver propagation

- [x] T009 Add CancellationToken to all I/O-bound Mutation resolvers.
- [x] T010 Pass token to direct EF query and SaveChangesAsync calls.
- [x] T011 Pass token to supported topic, email and notification operations.
- [x] T012 Ensure catch blocks do not swallow or remap OperationCanceledException.

## Phase 4 - Verification

- [x] T013 Run focused cancellation tests and full backend suite.
- [x] T014 Run Release build and static scan for parameterless async EF calls in scope.
- [x] T015 Compare GraphQL schema, execute a successful runtime operation and prove pre-cancelled writes deterministically.
- [x] T016 Record evidence and update canonical docs from actual results.

## Dependencies

Inventory precedes tests. Repository contracts change before services; services before resolvers. Spec 186 may consume the same cancellation signatures but is not a prerequisite.

## Definition of Done

- [x] Full audited call graph propagates the request token.
- [x] No cancellation is converted to business failure.
- [x] No SDL or normal-flow behavior regression exists.
- [x] Runtime and automated evidence are recorded.
