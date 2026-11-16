# Feature Specification: Mutation Cancellation Propagation

**Feature Directory**: specs/187-mutation-cancellation-tokens  
**Created**: 2026-07-22  
**Status**: Verified  
**Audit Source**: docs/audit/FINAL_AUDIT_REPORT.md (high EF Core concurrency finding)

## Problem Statement

Several HotChocolate mutations invoke EF Core asynchronous work without propagating the request CancellationToken. The direct findings are UpdateReportStatus, AddSubject, UpdateSubject, ToggleSubjectStatus and LinkUserToCareers. Additional mutation call chains reach services and UnitOfWork methods that also omit cancellation. A disconnected client can therefore leave avoidable database and I/O work running.

## User Scenarios & Testing

### User Story 1 - Aborted mutation releases work promptly (Priority: P0)

When a client cancels a GraphQL request before completion, cancellable database and downstream I/O operations receive the request token and stop without starting subsequent side effects.

**Independent Test**: Execute a mutation through the HotChocolate executor with a pre-cancelled token and assert no persistence or notification/event publication occurs.

### User Story 2 - Normal mutations preserve behavior (Priority: P0)

Users completing ordinary mutations observe the same payloads, validation and transaction semantics after token propagation.

**Independent Test**: Run the existing mutation/service regression suite with a non-cancelled token and compare persisted state.

### User Story 3 - Cancellation is distinguishable from failure (Priority: P1)

Operators can distinguish expected request cancellation from application/database errors; cancellation is not wrapped as a misleading USER_ERROR or logged as a production fault.

## Functional Requirements

- **FR-001**: Every public asynchronous resolver in Mutation.cs that performs or initiates I/O MUST accept HotChocolate's CancellationToken parameter.
- **FR-002**: Direct EF Core async calls in mutation paths MUST receive that token, including query and SaveChangesAsync calls.
- **FR-003**: Service and repository interfaces called by those resolvers MUST propagate the same token to their lowest cancellable operation.
- **FR-004**: IUnitOfWork.CompleteAsync and asynchronous repository add/query methods MUST accept CancellationToken where used by mutation call chains.
- **FR-005**: ITopicEventSender, email and notification operations MUST receive the token when their API supports it.
- **FR-006**: OperationCanceledException and TaskCanceledException MUST not be converted into generic business errors or caught by broad exception handlers.
- **FR-007**: Cancellation before commit MUST leave no partial persistence; cancellation after a completed commit MUST not trigger a compensating delete.
- **FR-008**: CancellationToken MUST remain execution-only and MUST NOT appear as a GraphQL schema argument.
- **FR-009**: Existing GraphQL operation names, business arguments and payloads MUST remain compatible.

## Audited Direct Scope

- Mutation.cs: report status, subject create/update/status and user-career linking.
- Mutation-to-service chains: users/accounts, messaging, academic, moderation, notifications and social methods reached by mutations.
- UnitOfWork and repositories used by those chains.
- Background services and read-only Query.cs are out of the mandatory first pass unless a changed interface requires alignment.

## Edge Cases

- Cancellation occurs immediately before SaveChangesAsync.
- SQL commit completes while transport cancellation is signaled.
- Persistence succeeds but real-time publication is cancelled.
- A broad catch(Exception) currently intercepts OperationCanceledException.
- Default tokens are used by non-HTTP callers such as seeders/tests.

## Success Criteria

- **SC-001**: Static scan finds no parameterless EF Core async call in audited production mutation paths.
- **SC-002**: HotChocolate schema diff confirms no cancellationToken GraphQL argument.
- **SC-003**: Cancellation tests prove no write for pre-cancelled operations and no downstream event after cancellation.
- **SC-004**: Existing backend tests and Release build pass without regression.
- **SC-005**: Runtime smoke records a cancelled request and a successful control request.

## Out of Scope

- Changing transaction isolation or introducing distributed transactions.
- Rewriting synchronous legacy repositories not reached by mutations.
- Treating cancellation as a business validation error.
