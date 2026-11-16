# Feature Specification: Spec 165 Academic Hub Hardening

**Feature Branch**: `165-academic-hub-hardening`  
**Created**: 2026-07-06  
**Status**: Implemented  
**Input**: Close the remaining gaps from Specs 163/164 end-to-end: audit weak points, implement missing full-stack pieces, and re-audit.

## User Scenarios & Testing

### Scenario 1 - Academic Hub Upload Uses a Modal

A logged-in user selects a career and subject, opens a clean upload modal, attaches a file or link, assigns category/version, submits the resource, and sees the card appear without a page reload or broad refetch.

**Acceptance Criteria**

1. The upload UI is a modal instead of an always-visible sidebar.
2. The modal uses the existing authenticated `/api/upload` endpoint for binaries.
3. The GraphQL mutation writes metadata through `uploadAcademicResource`.
4. Apollo cache updates the visible `academicResources` list explicitly.

### Scenario 2 - Resource Search Is Instant Locally

A user types in the academic resource search field and sees cards filter immediately by title without waiting for network activity.

**Acceptance Criteria**

1. `academicResources` fetches the selected subject/category result set.
2. The title search filters the currently loaded list with `useMemo`.
3. The backend search argument remains available for API consumers.

### Scenario 3 - GraphQL Provides Stable Academic Alias

Clients can request subject resources through the existing `academicResources(...)` field or the explicit alias `resourcesBySubject(...)`.

**Acceptance Criteria**

1. `resourcesBySubject(subjectId, searchTerm, category)` delegates to the same service.
2. Authorization and validation behavior match `academicResources`.
3. Introspection shows the alias.

### Scenario 4 - Social Feed Graph Avoids Query Explosion

Feed queries that include reactions, comments and comment replies do not rely on lazy-loading or one-query-per-row behavior.

**Acceptance Criteria**

1. Social feed graph loading uses `AsNoTracking()`, `AsSplitQuery()` and explicit includes.
2. Comment replies and reply authors are included for nested comment rendering.
3. `LoadInquiryGraphAsync` follows the same graph-shaping policy.

## Requirements

- **REQ-001**: Convert the academic resource upload panel into a reusable modal flow.
- **REQ-002**: Implement explicit Apollo cache updates for resource create/delete.
- **REQ-003**: Keep local instant title filtering in the frontend.
- **REQ-004**: Add GraphQL query alias `resourcesBySubject`.
- **REQ-005**: Harden social feed graph loading against N+1/query explosion.
- **REQ-006**: Generate missing SDD artifacts for this hardening spec.
- **REQ-007**: Validate builds, tests, schema, and document blocked browser runtime if not available.

## Constraints

- Preserve the existing REST exception for uploads only.
- Do not remove broad component trees without compiler evidence.
- Do not install new npm packages.
- Keep Tailwind v4 Clean Tech / Tech Noir styling.
- Do not commit or push.

## Assumptions

- The existing academic schema and migration from Spec 164 are the baseline.
- Runtime browser validation may remain blocked if no authenticated session is available through the tool environment.
