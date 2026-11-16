# Data Model: Privacy Controls and SMTP Smoke Tests

## User

- `IsPublicProfile: bool`
- Default: `true`
- Existing users are public after migration.
- A private profile hides biography, social links, phone, CV collections and career names from unauthorized viewers.

## PublicProfileSummary

- Adds `isPublicProfile: bool`
- Adds `canViewSensitiveProfile: bool`
- Sensitive fields are nullable/empty when `canViewSensitiveProfile` is false.

## PublicProfileSearchResult

- Adds `isPublicProfile: bool`
- Adds `canViewSensitiveProfile: bool`
- `careers` is empty for private profiles when the viewer lacks permission.

## SMTP Smoke Result

- Returns `true` when email dispatch completes.
- Throws a controlled `USER_ERROR`/GraphQL error for invalid address or provider failure.
