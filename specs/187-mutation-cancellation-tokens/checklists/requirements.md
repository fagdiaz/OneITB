# Specification Quality Checklist: Mutation Cancellation Propagation

**Created**: 2026-07-22  
**Feature**: [spec.md](../spec.md)

## Completeness

- [x] Direct Mutation findings and downstream call chains are both covered.
- [x] UnitOfWork, repository, service and side-effect boundaries are explicit.
- [x] Normal-flow compatibility and cancellation semantics are measurable.
- [x] No database migration or GraphQL argument is implied.

## Correctness

- [x] OperationCanceledException is not treated as a business error.
- [x] Pre-commit and post-commit cancellation are distinguished.
- [x] Background-service tokens remain separate from request tokens.
- [x] State-based tests are required.

## Readiness

- [x] All nine Speckit artifacts contain actionable content.
- [x] Dependency order is bottom-up and test-first.
- [x] Runtime evidence is required before completion.
