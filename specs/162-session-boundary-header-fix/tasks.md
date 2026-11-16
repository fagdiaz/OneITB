# Tasks: Spec 162 Session Boundary and Header Identity Fix

## Phase 1: Root Cause Fix

- [x] T001 Replace `Logout.jsx` direct storage/context mutation with canonical `logout()` from `AuthContext`.
- [x] T002 Make `AuthContext.login()` and `logout()` async-safe session boundary operations.
- [x] T003 Stop exposing `setAuth` as a public auth context escape hatch if no active component requires it.

## Phase 2: Apollo Session Isolation

- [x] T004 Ensure login clears previous Apollo memory before installing the new session.
- [x] T005 Add explicit replacement type policies for `Query.me` and notification session fields.
- [x] T006 Reset the GraphQL session-expiration guard when a new login succeeds.

## Phase 3: Current User Consumers

- [x] T007 Harden `Nav.jsx` so Header identity only uses `me` when `me.id === auth.id`.
- [x] T008 Harden `GlobalSearch.jsx` so career/subject scope only uses matching current-user profile data.
- [x] T009 Harden `CvEditorProfile.tsx` so edit defaults never hydrate from stale `me`.

## Phase 4: Validation and Documentation

- [x] T010 Run static checks for forbidden partial logout patterns.
- [x] T011 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- [x] T012 Record evidence in `specs/162-session-boundary-header-fix/evidence.md`.
- [x] T013 Add one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T014 Update `docs/audit/DOCUMENTATION_STATUS.md`.
