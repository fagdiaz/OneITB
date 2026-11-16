# Tasks: Feed Gamification UX

**Input**: Design documents from `specs/112-feed-gamification-ux/`

## Phase 1: Setup

- [X] T001 Create feature documentation in `specs/112-feed-gamification-ux/`
- [X] T002 Update `.specify/feature.json` and `AGENTS.md`

## Phase 2: Feed Social UX

- [X] T003 Add user metric fields to feed GraphQL selections in `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
- [X] T004 Link feed author names to `/profile/{id}` in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [X] T005 Add inline follow action and participation badges in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [X] T006 Add comment author links and badges in `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
- [X] T007 Add subtle administrator visual hierarchy to feed publications/comments

## Phase 3: Admin Review UX

- [X] T008 Add modal publication preview in `FrontEnd/OneItb-FE/src/Components/admin/PublicationManagement.jsx`
- [X] T009 Add modal comment preview in `FrontEnd/OneItb-FE/src/Components/admin/CommentManagement.jsx`
- [X] T010 Ensure short IDs and report counters remain visible in admin review rows

## Phase 4: Validation And Documentation

- [X] T011 Run backend build
- [X] T012 Run frontend build
- [X] T013 Attempt runtime smoke or record blocker
- [X] T014 Record evidence in `specs/112-feed-gamification-ux/evidence.md`
- [X] T015 Insert one top entry in `docs/audit/DEVELOPMENT_LOG.md`

## Definition Of Done

- [X] All required tasks are marked `[X]`
- [X] Backend build passes
- [X] Frontend build passes
- [X] Runtime smoke evidence is recorded or explicitly blocked
- [X] `DEVELOPMENT_LOG.md` has exactly one new top entry for this spec
