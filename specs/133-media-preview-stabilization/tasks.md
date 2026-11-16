# Tasks: Media Preview Stabilization

**Input**: Design documents from `specs/133-media-preview-stabilization/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

## Phase 1: Baseline and QA

- [x] T001 Record current media behavior and likely causes in `specs/133-media-preview-stabilization/evidence.md`
- [x] T002 Run QA preflight with frontend build before source changes

## Phase 2: YouTube Thumbnail Preview

- [x] T003 Add static thumbnail support to `YouTubeEmbed` in `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
- [x] T004 Keep iframe rendering gated behind explicit play state
- [x] T005 Add thumbnail load failure fallback without console logging

## Phase 3: Uploaded Image Rendering

- [x] T006 Replace duplicated file rendering in `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx` with shared `MediaAttachment`
- [x] T007 Add uploaded image failure fallback in `MediaAttachment`
- [x] T008 Verify relative `/uploads/...` paths resolve through the backend API base URL

## Phase 4: Validation and Documentation

- [x] T009 Run static searches for iframe gating and absence of console suppression
- [x] T010 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`
- [x] T011 Run final QA preflight with frontend build
- [x] T012 Update `docs/project_docs/ROADMAP.md` from evidence only
- [x] T013 Add exactly one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`
- [x] T014 Update `docs/audit/DOCUMENTATION_STATUS.md`
- [x] T015 Record browser validation or blocker in evidence

## Definition Of Done

- [x] YouTube cards show thumbnails before playback.
- [x] YouTube iframes are still not mounted before click.
- [x] Uploaded images render inline from the backend URL.
- [x] Broken image previews fall back to usable file cards.
- [x] Frontend build and QA preflight pass.
