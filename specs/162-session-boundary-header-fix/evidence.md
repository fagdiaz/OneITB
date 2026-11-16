# Evidence: Spec 162 Session Boundary and Header Identity Fix

## Root Cause

`FrontEnd/OneItb-FE/src/Components/user/Logout.jsx` bypassed the canonical auth logout flow:

- called `localStorage.clear()`;
- called `setAuth({})` directly;
- did not clear `isAuthenticated`;
- did not clear `token`;
- did not clear Apollo in-memory data.

This allowed `PrivateLayout`, `Nav`, `NotificationBell`, `GlobalSearch` and other session-owned surfaces to remain mounted with an authenticated state while Apollo could still serve cached `Query.me` data from the previous user.

## Implemented Fix

- `Logout.jsx` now calls `logout()` from `AuthContext` and navigates to `/login` with `replace: true`.
- `AuthContext.login()` clears prior Apollo memory before installing the new token/user.
- `AuthContext.logout()` removes only session keys, resets provider helpers, clears React auth state and clears Apollo memory.
- `setAuth` is no longer exposed through `AuthContext.Provider`.
- `GraphqlProvider.js` resets the session-expiration guard after a new login and defines replacement policies for `Query.me`, notifications, feed and messaging session fields.
- `Nav.jsx`, `GlobalSearch.jsx` and `CvEditorProfile.tsx` ignore `GET_USER_PROFILE` data unless `me.id === auth.id`.

## Static Checks

```powershell
rg -n "localStorage\.clear\(" FrontEnd/OneItb-FE/src
```

**Result**: PASS by absence of matches.

```powershell
rg -n "setAuth\(" FrontEnd/OneItb-FE/src
```

**Result**: PASS. Matches remain only inside `AuthContext.jsx` internal state transitions.

```powershell
rg -n "meData\?\.me \|\||gqlData\?\.me \|\||localStorage\.clear\(|setAuth\}" FrontEnd/OneItb-FE/src/Components FrontEnd/OneItb-FE/src/context
```

**Result**: PASS by absence of matches.

```powershell
git diff --check
```

**Result**: PASS; only Windows LF/CRLF conversion warnings.

## Build

```powershell
cd FrontEnd/OneItb-FE
npm.cmd run build
```

**Result**: PASS.

```text
vite v8.0.16 building client environment for production...
341 modules transformed.
✓ built in 704ms
```

## Runtime Notes

Browser user-switch QA was not executed in this turn because no local browser/backend session was available. The code path that caused the bleed was confirmed statically and replaced. The expected manual QA is:

1. Login as user A.
2. Logout from Header.
3. Login as user B without refreshing.
4. Verify Header, avatar, dropdown, search career filters, notification counts and profile edit no longer show user A data.
