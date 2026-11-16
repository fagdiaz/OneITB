# Spec 157: Core UX, Session & Header Constraints

## Objective

Stabilize Header active states, omni-search behavior, theme defaults, password visibility and expired-session handling without breaking the grid/profile/search work from Specs 155-156.

## Requirements

- Header active glow must be derived from React Router `useLocation().pathname`.
- `ONEITB` must be a static corporate brand link to `/`, without utility-button glow/elevation.
- Omni-search must behave as a dropdown/popover anchored below the search button using `absolute top-full mt-2`, without pushing nav buttons.
- Anonymous users and missing theme preference must default to light mode.
- Theme preference must continue to persist in `localStorage`.
- Login and Register password inputs must support eye/eye-slash visibility toggle.
- Apollo authorization failures caused by expired JWT must clear local session and force redirect to `/login` with a visible "Tu sesión ha expirado" alert.

## Non-Goals

- No backend changes.
- No migration.
- No change to feed filters, profile grid or public profile search contract.

## Validation

- `npm.cmd run build` from `FrontEnd/OneItb-FE`.
