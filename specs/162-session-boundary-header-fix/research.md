# Research: Spec 162 Session Boundary and Header Identity Fix

## Finding: `/logout` Bypasses AuthContext Logout

**Evidence**: `Logout.jsx` calls `localStorage.clear()` and `setAuth({})` directly. It does not call `logout()`, does not clear `isAuthenticated`, does not clear `token`, and does not clear Apollo memory.

**Decision**: Replace the component with a canonical async logout call.

## Finding: `GET_USER_PROFILE` Can Serve Prior `me`

**Evidence**: `Nav.jsx` and `GlobalSearch.jsx` use `GET_USER_PROFILE` with `cache-first`. The query has no variables, so `Query.me` is a session-owned singleton in Apollo cache.

**Decision**: Clear Apollo cache on session boundaries and guard consumers with `me.id === auth.id`.

## Finding: Other Components Can Be Affected

**Affected surfaces**:

- `Nav.jsx`: Header name/avatar/dropdown.
- `GlobalSearch.jsx`: career and subject scope.
- `CvEditorProfile.tsx`: edit form defaults.
- `SideBar.jsx`: uses `auth`, affected if partial logout leaves auth stale.
- `NotificationBell.jsx`: queries are skipped by auth, affected if `isAuthenticated`/`auth.id` remains stale.

**Decision**: Fix central auth state first, then add identity guards to `me` consumers.

## Decision: Do Not Use Hard Reload

**Rationale**: A reload masks cache/state bugs and can drop non-session UI state. The project requires React/Apollo state consistency.
