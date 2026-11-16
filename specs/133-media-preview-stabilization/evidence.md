# Evidence: Media Preview Stabilization

## Status

Implemented.

## Baseline Analysis

Two regressions were identified after the console-clean media contract:

1. YouTube cards became generic text cards because spec 131 intentionally avoided all third-party requests before playback.
2. Uploaded images can render as the literal alt text `Attachment` because `MediaComponent` uses raw `fileUrl` values. Relative `/uploads/...` paths are then requested from the Vite origin instead of the backend origin.

## Planned Fix

- Use static YouTube thumbnails before playback while keeping iframe mounting behind the play button.
- Reuse `MediaAttachment` from `MediaComponent` so uploaded files use the canonical `apiBaseUrl` resolver.
- Add fallback UI when thumbnails or images fail.

## Validation

- QA preflight before implementation: PASS.
  - `git-diff-check`: PASS.
  - `backend-release-build`: PASS, 0 warnings, 0 errors.
  - `frontend-vite-build`: PASS; existing chunk-size warning remains.
- Implemented changes:
  - `YouTubeEmbed` now renders `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg` as a static thumbnail before playback.
  - `YouTubeEmbed` still mounts `https://www.youtube-nocookie.com/embed/{videoId}?rel=0` only after `isPlaying` becomes true from the play button.
  - `MediaComponent` now delegates `fileUrl` rendering to `MediaAttachment`.
  - `MediaAttachment` resolves relative upload URLs through `apiBaseUrl` and falls back to a file card if an image fails to load.
- Static verification:
  - `rg "youtube-nocookie|i\\.ytimg|<iframe|isPlaying|console\\.|dangerouslySetInnerHTML|suppress" FrontEnd/OneItb-FE/src/Components/publication FrontEnd/OneItb-FE/src/utils -n`: only expected media markers; no console suppression or `dangerouslySetInnerHTML`.
  - `git -c core.autocrlf=false diff --check`: PASS.
- Build verification:
  - `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS, 332 modules; existing Vite chunk-size/deprecation warnings remain.
  - Final QA preflight with builds: PASS.
- Dev server verification:
  - `http://localhost:5173/src/Components/publication/MediaAttachment.jsx` contains the `i.ytimg.com` thumbnail and `imageFailed` fallback markers.
  - `http://localhost:5173/src/Components/publication/MediaComponent.jsx` contains the shared `MediaAttachment` rendering path.

## Blockers

- Authenticated feed/browser validation with real database records was not executed from this session. The frontend dev server is reachable, but validating existing media posts still depends on the user's running authenticated app state and backend data.
