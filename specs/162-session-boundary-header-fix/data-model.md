# Data Model: Spec 162 Session Boundary and Header Identity Fix

No persistent schema changes.

## Runtime Session State

- `auth`: current user object from `AuthContext`.
- `token`: current JWT from `AuthContext`.
- `isAuthenticated`: boolean derived from successful login/hydration and cleared by logout.
- `sessionVersion`: monotonic number incremented on login/logout to help consumers reset local UI state.

## Apollo Session-Owned Fields

- `Query.me`
- `Query.myNotifications`
- `Query.unreadNotificationCount`
- `Query.myNotificationPreferences`
- existing feed and messaging fields from Spec 161

These fields must not be trusted across different authenticated users.
