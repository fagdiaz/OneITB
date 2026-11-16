# Tasks: Automatic Link Preview & Unified Media Component

## Phase 1: Setup
- [X] T001 Initialize spec and plan for 123-link-preview

## Phase 2: Backend Metadata Proxy
- [X] T002 Create `MetadataController.cs` with `/api/metadata` endpoint
- [X] T003 Implement `HttpClient` fetch with 3s timeout and Regex parsing for Open Graph tags

## Phase 3: Unified Media Component (Frontend)
- [X] T004 Create `src/Components/publication/MediaComponent.jsx` with Tailwind v4 styling
- [X] T005 Refactor `Feed.jsx` to use `MediaComponent` for posts
- [X] T006 Refactor `CommentThread.jsx` to use `MediaComponent` for comments

## Phase 4: Real-Time Drafting (Frontend)
- [X] T007 Add `useEffect` and `linkPreviewData` state to `Feed.jsx` post input
- [X] T008 Render `MediaComponent` dynamically during drafting

## Phase 5: Validation and documentation
- [X] T009 Verify backend build and frontend build
- [X] T010 Test UI real-time link detection and rendering
- [X] T011 Create evidence file `specs/123-link-preview/evidence.md`
- [X] T012 Update `ROADMAP.md` and `DEVELOPMENT_LOG.md`
- [X] T013 Update `DOCUMENTATION_STATUS.md`

## Definition Of Done
- [X] All tasks marked as `[X]`
- [X] Backend and frontend compile
- [X] No CORS errors
- [X] Tailwind v4 strictly used
