# Tasks: Media Embed Console Contract

**Input**: Design documents from `specs/131-media-embed-console-contract/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Frontend build and evidence are required. Browser validation is required when the authenticated feed is available.

## Phase 1: Setup and Baseline

- [x] T001 Record the updated `errores.txt` classification in `specs/131-media-embed-console-contract/evidence.md`
- [x] T002 Verify active YouTube iframe render sites in `FrontEnd/OneItb-FE/src/Components/publication/`
- [x] T003 Run QA preflight for the medium-risk frontend media change and record the result

## Phase 2: User Story 1 - Safe Initial Media Render

**Goal**: Feed and comment media do not mount YouTube iframes during initial render.

**Independent Test**: Render a post with a YouTube URL and verify the DOM shows a local preview until the play control is clicked.

- [x] T004 [US1] Add a reusable click-to-load YouTube preview in `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
- [x] T005 [US1] Update `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx` to use the click-to-load preview for YouTube links
- [x] T006 [US1] Preserve existing image, document, and link preview behavior without new console logging or local suppression

## Phase 3: User Story 2 - Evidence and Residual Warning Boundary

**Goal**: Remaining third-party warnings are explicitly separated from app-owned initial render behavior.

- [x] T007 [US2] Run static search proving no automatic YouTube iframe render remains outside the click-to-load component
- [x] T008 [US2] Run `npm.cmd run build` from `FrontEnd/OneItb-FE` and record the result
- [x] T009 [US2] Verify browser behavior when available, or record the SQL/HTTPS/authenticated-feed blocker

## Phase 4: Documentation Closeout

- [x] T010 Update `docs/project_docs/ROADMAP.md` from evidence only
- [x] T011 Add exactly one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`
- [x] T012 Update `docs/audit/DOCUMENTATION_STATUS.md`
- [x] T013 Verify `DEVELOPMENT_LOG.md` remains newest-first and this spec is the first entry

## Dependencies

- T001-T003 before source changes.
- T004-T006 before validation.
- T007-T009 before documentation closeout.
- T010-T013 last.

## Definition Of Done

- [x] Initial feed render no longer mounts YouTube iframes automatically.
- [x] Frontend build passes.
- [x] No warnings are silenced through local browser/tooling configuration.
- [x] Residual third-party warnings after explicit playback are documented.
- [x] Roadmap, development log, and documentation status are synchronized.
