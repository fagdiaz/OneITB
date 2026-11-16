# Data and State Model: Profile Hydration and Avatar Storage

## Persisted Data

No new EF entity is expected. Existing fields and relations remain authoritative:

- `User.AvatarUrl`
- profile/CV relational sections
- `UserCareer`
- uploaded object referenced by the URL returned from `IFileStorageService`

## Frontend State Machine

```text
loading
  -> ready/pristine
  -> dirty
  -> uploading-avatar -> dirty | error
  -> saving-profile -> saved | error
  -> refetch-confirmation -> navigate | error
```

`hydratedSessionKey` identifies the only canonical initialization. `isDirty` prevents a
late query response from overwriting user input.

## Storage Contract

- Local provider returns a relative `/uploads/...` URL.
- Cloud provider returns an HTTPS asset URL.
- The database stores only the returned URL, never bytes or credentials.
- The previous URL is retained until the final profile mutation succeeds.

