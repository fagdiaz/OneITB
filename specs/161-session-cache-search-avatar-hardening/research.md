# Research: Spec 161 Session Cache, Search and Avatar Hardening

## Decision: Use Apollo `clearStore()` on Logout

**Rationale**: `clearStore()` purges in-memory cache without refetching active queries after the token is removed. This is safer than `resetStore()` for logout because refetching after token removal can produce avoidable authorization noise.

**Alternatives considered**: `resetStore()` was rejected for logout because it refetches observable queries. Manual `cache.evict` was rejected because session bleed can involve unknown active queries.

## Decision: Add Explicit Replacement Field Policies

**Rationale**: The current warning is produced when Apollo replaces array/connection fields without a merge policy. The UI already controls pagination through queries/update logic, so explicit replacement policies avoid warnings and prevent stale cross-filter cache merges.

**Alternatives considered**: Generic concat merge was rejected because it can duplicate `fetchMore` results or leak old filter results into a new search.

## Decision: Extend Backend Profile Search With `Account.Email`

**Rationale**: Email search belongs in the backend resolver because global search results must stay bounded and scoped consistently. The existing query can include `Account` and add a `Contains` predicate without a schema migration.

**Alternatives considered**: Client-side filtering was rejected because it only filters already returned users and cannot find email-only matches.

## Decision: Keep Registration Role as Single Select

**Rationale**: Public registration has one role per account in the current domain model. The existing selector is single-value and should remain so.

**Alternatives considered**: Checkboxes were rejected because they imply multi-role registration and can accidentally widen privileges.

## Decision: Make Avatar Preview the Export Coordinate System

**Rationale**: The previous inner crop mask made the visual crop smaller than the exported canvas, causing mismatch. The cleanest fix is to make the visible square canvas itself the exact exported crop and use one draw pipeline for preview and blob export.

**Alternatives considered**: Pixel extraction from an inner crop rectangle was rejected because it adds duplicate math and increases the chance of drift between preview and export.
