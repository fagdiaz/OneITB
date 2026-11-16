# Implementation Plan: Mutation Cancellation Propagation

## Summary

Inventory all mutation I/O call chains, add request token parameters at HotChocolate boundaries, propagate through services/repositories and prove cancellation does not create partial writes or schema changes.

## Technical Context

- .NET 8, HotChocolate 14.2, EF Core 8, SQL Server.
- Primary file: API Graphql/OneITB/GraphQL/Mutation.cs.
- Supporting contracts: service interfaces, IUnitOfWork and repositories.
- Reference implementation: Services/Jobs/JobService.cs.
- Migration: none.

## Constitution Check

- **Performance**: PASS; abandoned work is released earlier.
- **Service boundary**: PASS; cancellation follows existing layers.
- **Error handling**: PASS; transport cancellation remains distinct.
- **Evidence**: PASS; schema/runtime verification is explicit.

## Implementation Phases

1. Generate resolver-to-I/O inventory and baseline schema.
2. Add cancellation-focused tests before interface changes.
3. Update IUnitOfWork/repositories and affected service contracts bottom-up.
4. Update Mutation resolvers and direct EF operations.
5. Audit event/email/notification calls and catch filters.
6. Run static scan, tests, build, schema diff and runtime cancellation smoke.
7. Record evidence and update status only when verified.

## Test Strategy

- Unit: mocked dependency receives exact token.
- EF state test: pre-cancelled operation writes nothing.
- GraphQL integration: request executor accepts token and SDL stays unchanged.
- Regression: all existing service/GraphQL tests pass.
- Runtime: cancel one long/controlled request and compare with successful control.

## Risk Controls

- Update interfaces bottom-up to keep compile failures localized.
- Do not add optional defaults in resolvers, which could hide missing propagation.
- Do not catch cancellation in generic validation conversions.
- Preserve current persistence-before-best-effort-event ordering.

## Definition of Done

The audited mutation graph has complete token propagation, state-based tests pass, schema is compatible, and runtime evidence is recorded.
