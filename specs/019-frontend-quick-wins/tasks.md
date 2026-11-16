# Tasks: Frontend Quick Wins (019)

**Input**: Design documents from `/specs/019-frontend-quick-wins/`

## Phase 1: Implementation
- [x] T001 Adjust Grid wrapper: Move `.layout` container class from `App.jsx` to layout wrapper files (`PrivateLayout.jsx`, `PublicLayout.jsx`).
- [x] T002 In `Nav.jsx`, replace dead `href="#"` menu links with `<NavLink>` pointing to proper routes, and inject dynamic user credentials.
- [x] T003 Rename file `feed.jsx` to `Feed.jsx` to match CamelCase naming standard, and fix corresponding import declarations.
- [x] T004 Build verification (`npm run build`).
