# Data Model: Media Preview Stabilization

No database, GraphQL schema, or persistence changes.

## UI State

- `isPlaying`: whether the YouTube iframe has been explicitly mounted.
- `thumbnailFailed`: whether the static YouTube thumbnail failed to load.
- `imageFailed`: whether an uploaded image failed and should fall back to the file card.

## Inputs

- `videoId`: existing validated YouTube video id from the media parser.
- `fileUrl`: absolute URL or relative `/uploads/...` path returned by the backend.
