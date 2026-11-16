# Research: Media Embed Console Contract

## Decision: click-to-load YouTube

**Rationale**: The current warning set is triggered by loading `youtube-nocookie.com/embed/...` during feed render. Even privacy-conscious embeds can execute provider scripts, request third-party storage, and emit browser-specific warnings. A local preview avoids executing third-party code until the user asks to play.

**Rejected alternatives**:

- Hide warnings in browser tooling: not portable and violates the presentation goal.
- Broaden CSP/CORS: unrelated to third-party iframe script warnings and can weaken security.
- Remove YouTube support: degrades an already implemented rich media feature.

## Decision: no external thumbnail by default

**Rationale**: Loading a thumbnail from a YouTube domain still creates third-party traffic on feed render. The preview should be fully local until click.

## Decision: keep residual warnings documented

**Rationale**: After explicit playback, the iframe belongs to YouTube/browser privacy behavior. The app can choose when it mounts the iframe, but it cannot rewrite provider scripts.
