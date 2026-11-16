# Contract: Session Boundary

## Login

1. Clear prior Apollo in-memory data.
2. Store the new token and user in canonical keys.
3. Update React auth state.
4. Increment `sessionVersion`.
5. Navigate only after the state mutation is complete.

## Logout

1. Remove only `token` and `user`.
2. Reset provider token/user helpers.
3. Clear Apollo in-memory data.
4. Set React auth state to anonymous.
5. Increment `sessionVersion`.
6. Navigate to `/login` with `replace: true`.

## Current User Query Consumers

Components may use `GET_USER_PROFILE`, but must ignore `me` unless `me.id === auth.id`.

## Forbidden Pattern

No component may call `localStorage.clear()` or mutate `setAuth({})` as a substitute for logout.
