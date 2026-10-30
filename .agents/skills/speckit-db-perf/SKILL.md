---
name: "speckit-db-perf"
description: "Audit GraphQL and EF Core changes for bounded queries, N+1 risks, indexes, async execution, and cancellation."
---

# Speckit DB Performance

## Purpose

Review planned or implemented backend data access without imposing a new repository or Unit of Work architecture. Prefer the service boundaries and query patterns already established in OneITB23.

## Required Checks

1. Identify the complete query shape, expected cardinality, ordering, filters, and authorization scope.
2. Detect N+1 risks in nested GraphQL fields. Select the least complex suitable strategy:
   - server-side projection for selection-driven reads;
   - a scoped DataLoader for repeated key-based relationships;
   - a deliberate `Include` only when the bounded aggregate is always required.
3. Use `AsNoTracking()` for read-only EF Core queries unless identity resolution or tracked updates are required.
4. Keep collection queries bounded with stable ordering. Cursor and offset pagination are both valid when their trade-offs match the existing contract.
5. Use async EF Core APIs and propagate `CancellationToken` from resolver or service boundaries.
6. Keep authorization predicates in the database query when possible so unauthorized rows are not materialized.
7. Review indexes for foreign keys and frequent equality, range, search, and ordering predicates. Document migration impact before adding an index.
8. Avoid premature materialization, client-side filtering, unbounded `Include` graphs, and `Task.Result` or `.Wait()`.
9. For writes, verify transaction boundaries, concurrency behavior, unique constraints, and `DeleteBehavior.Restrict` on project-owned relationships.

## Evidence

- Record the affected resolver/service and the resulting SQL/query strategy.
- Add focused tests for authorization and pagination boundaries when risk is medium or high.
- Use runtime query logging or an integration test to prove N+1 mitigation for high-cardinality graph changes.
- Compilation alone is not runtime evidence.

## Output

Report findings by severity with file references, the selected mitigation, and any residual risk or unverified runtime condition.
