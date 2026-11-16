# Implementation Plan: Apollo Logout Session Isolation

## Summary

Consolidate manual/expired/remote logout into one idempotent session boundary, prove normalized cache removal, prevent old WebSocket events from repopulating state and add cross-user regression tests.

## Technical Context

- React 18, Apollo Client 3.7, graphql-ws, React Router.
- Primary paths: context/AuthContext.jsx and data/graphql/GraphqlProvider.js.
- Existing baseline already invokes clearStore but lacks full isolation evidence.
- Backend/migration: none.

## Constitution Check

- **Session correctness**: PASS; one canonical token/user/cache owner.
- **Security**: PASS; cross-account data leakage is explicitly tested.
- **State management**: PASS; avoids resetStore refetch and client recreation per render.
- **Evidence**: PASS; tests and browser flow are required.

## Implementation Phases

1. Capture current manual and expiration sequences and active subscriptions.
2. Add failing tests for cache purge, A-to-B isolation, concurrent 401 and late events.
3. Extract one termination coordinator with a shared in-flight promise/session generation.
4. Route AuthContext logout and error-link expiration through the coordinator.
5. Add safe hydration and cross-tab storage handling.
6. Implement restartable/invalidation-aware WebSocket behavior without permanently disposing the singleton link.
7. Run focused/full frontend tests, Vite build and authenticated browser regression.
8. Record evidence and update status only from results.

## Test Strategy

- Unit: cleanup order and idempotency.
- Apollo: prime normalized cache, terminate, inspect extract().
- Component/integration: User A logout followed by User B login.
- Transport: late old-session payload does not update cache.
- UX: expiration message appears once; manual logout does not show it.

## Risks and Controls

- Circular AuthContext/Apollo dependency: keep provider-neutral coordinator or explicitly inject callbacks.
- Socket disposal: recreate transport/link safely or use generation gating.
- Clear failure: fail closed to anonymous state and report structured error.
- Test false positive: inspect actual cache and rendered data.

## Definition of Done

One tested termination flow owns all session exits; A-to-B isolation and late-event rejection are proven; frontend build remains clean.
