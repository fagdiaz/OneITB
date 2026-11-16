# Research: Spec 165 Academic Hub Hardening

## Decision: Keep Backend Search and Add Local Title Filter

**Rationale**: Existing GraphQL search is useful for API consumers and future server-side pagination. The UI request was immediate title filtering, which can be satisfied by fetching the selected subject/category set and applying `useMemo` locally.

**Alternatives considered**: Removing backend search would reduce API capability; debounced server search would not satisfy "instant local" behavior.

## Decision: Use Apollo `cache.updateQuery` for Resource List Mutation Updates

**Rationale**: The academic hub uses a bounded subject/category result set. Updating the exact visible query avoids broad `refetchQueries` while keeping cache behavior predictable.

**Alternatives considered**: `cache.modify` is viable but requires field-level argument parsing; scoped `updateQuery` is simpler and precise here.

## Decision: Add `resourcesBySubject` Alias, Keep Existing `academicResources`

**Rationale**: The app already uses `academicResources`. Adding an alias meets the explicit prompt without breaking current clients.

**Alternatives considered**: Renaming the field would cause avoidable client churn.

## Decision: Use `AsSplitQuery` for Social Feed Includes

**Rationale**: Feed queries include multiple collections (`Reactions`, `Comments`, nested replies). Split queries reduce cartesian explosion and avoid lazy-loading/N+1 behavior.

**Alternatives considered**: DataLoaders are useful for resolver-per-field models, but the current service returns pre-shaped EF queryables.
