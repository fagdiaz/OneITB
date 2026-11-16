# Research Notes: Router Fix & CV Layout (023)

## SPA Route Prefix Cleanup
We researched the route prefixing in `Routing.jsx` and verified that removing the nested `/social` parent routing works flawlessly because:
- The `PrivateLayout` component handles authentication checks regardless of the route prefix.
- Simplifying paths from `/social/feed` to `/feed` makes the app URLs cleaner and more logical for users.

## Profile Unification Strategy
Previously, editing profiles occurred at `/social/profile/edit` while details loaded at `/social/profile`. Unifying these under `/profile` utilizing a dual-column flex/grid container avoids route hops:
- **Left Column**: Interactive resume/CV preview utilizing existing user details.
- **Right Column**: Direct input fields utilizing React state, invoking the `UPDATE_PROFILE` Apollo Mutation on submit. Refetching updates the CV instantly.
