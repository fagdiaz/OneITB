# Contract: Profile Editor State and Avatar Persistence

## Authoritative Profile

The editor may become `ready` only when:

```text
auth.id is present
AND me.id is present
AND String(auth.id) == String(me.id)
```

The auth snapshot can label a loading shell but cannot initialize editable values.

The hydration key is composed from the current session version and normalized account
identifier. A profile response for another key is rejected. Once hydrated, background
responses update Apollo's canonical cache but do not replace a dirty editor draft.

## Editor Phases

```text
loading -> ready
loading -> mismatch | error
ready -> saving -> confirming -> complete
ready | saving | confirming -> error (draft retained)
any phase -> session changed (abort and reset)
```

## Avatar Sequence

1. User selects an image.
2. Local editor produces one final image `File`.
3. Authenticated, cancelable `POST /api/upload` returns `{ fileUrl, originalName,
   contentType, size, storageMode }`.
4. Local form stores the candidate URL.
5. `updateProfile` persists the candidate URL with all other fields.
6. `me` refetch confirms the URL before navigation.

On failure at steps 3-6, a controlled error is shown and the previously persisted URL is
not replaced in canonical state.

`storageMode` is operational evidence only. It may be `Local` or `Cloudinary`; it never
contains provider configuration. `Cloudinary` selection tests do not establish provider
acceptance without a real credentialed upload/read smoke.
