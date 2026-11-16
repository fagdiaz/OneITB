# Implementation Plan: Media Embed Console Contract

**Branch**: `131-media-embed-console-contract` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

## Summary

Change YouTube rich media from automatic iframe mounting to a local, click-to-load preview. This reduces console noise at feed render time without hiding DevTools output, weakening browser security, or changing backend contracts.

## Technical Context

- Frontend: React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4.
- Backend: not affected.
- Relevant files:
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `FrontEnd/OneItb-FE/src/utils/mediaParser.js`
  - `errores.txt`

## Constitution Check

- Business data remains on GraphQL; no REST business endpoint added.
- No secrets, auth, EF, migrations, or CORS changes.
- Rich content must not use `dangerouslySetInnerHTML`.
- YouTube host remains allowlisted through `youtube-nocookie.com`.
- Runtime claims must be backed by evidence; browser-authenticated feed validation may remain blocked by SQL/HTTPS environment issues.

## Design

1. Add a reusable `YouTubePreview` component in the publication media layer.
2. Render a local Tailwind preview card by default with no iframe.
3. Mount the iframe only after an explicit user click.
4. Keep document/image rendering unchanged.
5. Update evidence and docs to distinguish app-owned initial render from residual third-party warnings after explicit playback.

## Validation

- `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- Static search for YouTube iframe usage and forbidden local suppression.
- QA preflight for frontend/shared component risk.
- Browser validation if local authenticated feed is available; otherwise record blocker.

## Out of Scope

- Backend, GraphQL schema, EF migrations, upload storage, ad-blocker/browser settings, and DevTools filtering.
