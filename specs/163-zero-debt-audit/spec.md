# Feature Specification: Spec 163 Zero Debt Audit

**Feature Branch**: `163-zero-debt-audit`  
**Created**: 2026-07-05  
**Status**: Draft  
**Input**: End-to-end technical debt eradication request focused on frontend bundle hygiene, backend N+1 risk and Apollo cache policy consolidation.

## User Scenarios & Testing

### Scenario 1 - Cache Warnings Stay Clean

When paginated or filtered entities are replaced in Apollo, the browser console must not emit cache data-loss warnings for the core entities used by the social, messaging and academic modules.

**Acceptance Criteria**

1. Core entities have explicit `keyFields` when they are returned by GraphQL with stable identifiers.
2. Session-owned and filter-owned query fields use explicit replacement or scoped merge behavior.
3. Academic resource filtering does not mix results from different subject/search/category combinations.

### Scenario 2 - Academic Queries Avoid N+1

When the academic hub requests resources and progress, backend resolvers must not fan out per-row queries for `Subject`, `Career` or `Uploader`.

**Acceptance Criteria**

1. Academic service queries load the required graph deliberately with EF Core includes or projection.
2. Query filters and authorization checks execute as bounded SQL queries.
3. Evidence records the inspected resolver/service paths.

### Scenario 3 - Bundle Configuration Remains Production-Safe

The frontend production build must keep dependency bundling explicit and avoid unnecessary dependency churn.

**Acceptance Criteria**

1. Vite production build keeps a deterministic vendor split.
2. No dependency is removed without strong evidence that it is unused.
3. Build evidence is recorded after the implementation.

## Requirements

- **REQ-001**: Add Apollo type policies for `User`, `Inquiry`, `Comment`, `Message`, `AcademicResource`, `AcademicProgress`, `Subject`, `Career` and `Notification`.
- **REQ-002**: Add a query policy for `academicResources` scoped by `subjectId`, `searchTerm` and `category`.
- **REQ-003**: Preserve existing Vite vendor split and document dependency audit results.
- **REQ-004**: Ensure academic resource/progress graph loading stays explicit and does not rely on lazy loading.

## Constraints

- Do not delete broad component trees during this sprint without compiler evidence.
- Do not introduce new npm dependencies.
- Do not silence cache warnings by disabling Apollo warnings globally.
- Do not change business behavior outside the academic hub unless required for cache/session safety.

## Assumptions

- `react-to-print` remains retained because the profile/CV print flow uses a reusable print path in current UI work.
- The most valuable zero-debt changes in this sprint are cache policy coverage, resource graph shaping and documented build evidence.
