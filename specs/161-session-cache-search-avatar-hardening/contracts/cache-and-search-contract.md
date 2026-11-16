# Contract: Cache, Search and Avatar Hardening

## Logout Contract

Triggering the authenticated logout flow must:

1. Remove `token` and `user` storage keys.
2. Clear Apollo in-memory cache using the active client instance.
3. Update React auth state to unauthenticated.
4. Avoid refetching protected queries after the token has been removed.

## Apollo Cache Contract

The Apollo cache must define explicit field policies for result sets that are routinely replaced:

- `Query.inquiries`
- `Query.inquiriesPage`
- `Query.conversation`
- `Query.messagingContacts`
- `Query.activeConversations`
- `Query.searchMyMessages`

Each policy must return incoming data as the field value unless a future feature explicitly centralizes pagination merging in cache policies.

## Profile Search Contract

`searchPublicProfiles(searchTerm, first)` must return bounded profile matches when `searchTerm` matches:

- `FirstName`
- `LastName`
- full name
- `Account.Email`

## Registration UI Contract

The form must reject non-institutional email before submitting and must keep role as a single select with no admin/moderator options.

## Avatar Export Contract

The saved JPEG must be square and visually equivalent to the preview canvas at the moment the user clicks `Actualizar Imagen`.
