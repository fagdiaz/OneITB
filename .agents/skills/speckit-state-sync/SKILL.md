---
name: "speckit-state-sync"
description: "Protect React and Apollo state consistency across mutations, pagination, subscriptions, authentication changes, and route transitions."
---

# Speckit State Sync

## Purpose

Choose an explicit client-state strategy for every frontend operation that changes server state. Reuse the repository's current hooks, contexts, cache policies, and component conventions; do not introduce a state library solely to satisfy this skill.

## Required Checks

1. Map UI state to the current GraphQL contract with the correct names, nullability, identifiers, and enum values.
2. Define one authoritative post-mutation strategy:
   - normalized cache update or `cache.modify` for a local deterministic change;
   - a bounded `refetchQueries` when server-side ordering, authorization, or aggregation is authoritative;
   - eviction when an entity becomes inaccessible;
   - optimistic UI only when rollback is safe and the operation is idempotent enough for the user experience.
3. Review `typePolicies`, `keyFields`, `keyArgs`, and `merge` for paginated or parameterized fields. Prevent duplicate entities and cross-filter contamination.
4. Guard against session bleed: clear user-scoped Apollo state on logout/account change and prevent stale query results from rehydrating the next session.
5. For subscriptions, unsubscribe on unmount, deduplicate events by stable ID, and scope topics/results to the authenticated user.
6. Keep React hooks at the component top level. Never call state setters, cache writes, navigation, or subscriptions during render.
7. Add cleanup for event listeners, timers, object URLs, and manual subscriptions.
8. Render intentional loading, empty, recoverable-error, and unauthorized states without exposing internal errors.
9. Preserve existing avatar/file URL resolution and avoid hard reloads unless a forced authentication reset is required.

## Evidence

- Test at least the changed loading, success, and error paths.
- For authentication or realtime changes, test two sequential identities or isolated sessions.
- For paginated lists, test initial load, next page, filter change, and no-more-results behavior.

## Output

Document the chosen cache/state strategy, cleanup behavior, test evidence, and any runtime validation still pending.
