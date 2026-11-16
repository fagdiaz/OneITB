# Feature Specification: Spec 162 Session Boundary and Header Identity Fix

**Feature Branch**: `162-session-boundary-header-fix`
**Created**: 2026-07-04
**Status**: Draft
**Input**: QA report that after logout and login with a different account, the Header still shows the previous user's identity.

## User Scenarios & Testing

### Scenario 1 - User Switch Does Not Leak Previous Identity

A user logs out, another user logs in on the same browser, and the Header, avatar, user dropdown, search filters, sidebar, notifications and profile-edit surfaces must show only the new session's data.

**Acceptance Criteria**

1. The logout route calls the canonical auth logout flow instead of mutating partial state.
2. Logout clears React auth state, storage keys, Apollo memory and session-derived UI state.
3. Login clears stale Apollo data before installing the new session.
4. Header never renders `me` data if the returned `me.id` does not match `auth.id`.
5. Other current-user consumers apply the same guard or rely only on canonical auth state.

### Scenario 2 - Logout Preserves Non-Session Preferences

When a user logs out, visual preferences such as the selected theme remain available.

**Acceptance Criteria**

1. Logout removes only session keys (`token`, `user`) and Apollo session data.
2. Logout does not call `localStorage.clear()`.

### Scenario 3 - Anonymous and Transition States Stay Safe

While logout/login is in progress, protected components must not render stale authenticated data.

**Acceptance Criteria**

1. Components using `GET_USER_PROFILE` skip or ignore data until the current auth id is known.
2. Dropdown/avatar failure state resets when the authenticated user changes.
3. Chat/notification queries remain skipped when there is no authenticated user.

## Requirements

- **REQ-001**: `/logout` must invoke `logout()` from `AuthContext`.
- **REQ-002**: `AuthContext.logout()` must be the only code path that clears a session.
- **REQ-003**: `AuthContext.login()` must clear prior Apollo session data before persisting the new user.
- **REQ-004**: Apollo `Query.me` and session-owned query fields must have explicit replacement field policies.
- **REQ-005**: Header, GlobalSearch and Profile Edit must ignore stale `me` results whose id differs from the current auth id.
- **REQ-006**: `setAuth` must not be exposed as a public escape hatch unless still required by active code.

## Constraints

- Frontend-only change unless investigation finds a backend authorization defect.
- No hard reload as the primary fix.
- No deletion of theme preferences or non-session local storage.
- No new dependencies.
- Preserve existing Clean Tech / Tech Noir UI behavior.

## Assumptions

- The observed stale Header comes from the current `/logout` component bypassing `AuthContext.logout()`, plus `GET_USER_PROFILE` using cache-first data without matching it to `auth.id`.
- Runtime browser verification may be limited if local dev HTTPS remains blocked; build evidence remains required.
