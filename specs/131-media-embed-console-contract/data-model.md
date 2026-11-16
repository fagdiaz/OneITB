# Data Model: Media Embed Console Contract

No database, GraphQL schema, or persistence model changes.

## UI State

- `isPlaying: boolean`
  - `false`: render local preview card, no third-party iframe.
  - `true`: render `youtube-nocookie.com` iframe after user action.

## Inputs

- `videoId: string`
  - Must already come from the existing YouTube parser and remain a valid 11-character YouTube ID.
- `compact: boolean`
  - Optional visual scaling for comments or smaller media surfaces.
