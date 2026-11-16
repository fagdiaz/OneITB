# Implementation Plan: Media Preview Stabilization

**Branch**: `133-media-preview-stabilization` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

## Summary

Restore visual richness after the console cleanup by adding static YouTube thumbnails to the click-to-load card and routing uploaded image attachments through the shared backend URL resolver.

## Technical Context

- Frontend: React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4.
- Backend: not affected.
- Relevant files:
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `FrontEnd/OneItb-FE/src/utils/uploadFile.js`

## Constitution Check

- No backend, GraphQL, EF, auth, upload, or CORS contract changes.
- No local console suppression.
- No `dangerouslySetInnerHTML`.
- Media URLs must stay bounded to existing upload/static behavior and known YouTube thumbnail/embed hosts.
- Evidence must separate build/static verification from blocked authenticated browser verification.

## Design

1. Keep `YouTubeEmbed` click-to-load.
2. Add a static thumbnail layer sourced from `i.ytimg.com` before iframe playback.
3. Add graceful thumbnail error fallback.
4. Replace duplicated `fileUrl` rendering in `MediaComponent` with shared `MediaAttachment`.
5. Add image error fallback in `MediaAttachment` to show the document/file card rather than broken alt text.

## Validation

- QA preflight with frontend build.
- Static search that YouTube iframe remains behind `isPlaying`.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- Browser/feed check if local authenticated runtime is available; otherwise record blocker.
