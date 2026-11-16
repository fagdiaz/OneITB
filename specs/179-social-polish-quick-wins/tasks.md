# Tasks: Social Polish Quick Wins

**Input**: Design documents from `specs/179-social-polish-quick-wins/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Component tests and Vite build are required. Backend build is not required unless implementation unexpectedly touches backend source.

**Organization**: Tasks are grouped by independently testable user story.

## Phase 1: Setup and Baseline

- [x] T001 Confirm clean git state and active feature path in `.specify/feature.json`
- [x] T002 [P] Review `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` for share action placement
- [x] T003 [P] Review `FrontEnd/OneItb-FE/src/Components/publication/AttachmentDraftPicker.jsx` for validation reuse
- [x] T004 [P] Review `FrontEnd/OneItb-FE/src/Components/publication/MediaViewerModal.jsx` and `ReactionUsersModal.jsx` for modal accessibility scope

## Phase 2: User Story 1 - Compartir publicaciones con enlace estable (Priority: P1)

**Goal**: Add a stable copy-link action per publication with controlled success/error feedback.

**Independent Test**: The post menu exposes `Copiar enlace`; clipboard success and failure paths produce feedback without crashing.

- [x] T005 [US1] Implement post link builder and copy handler in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [x] T006 [US1] Add `Copiar enlace` action to each post menu in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [x] T007 [P] [US1] Add focused coverage for share URL behavior in `FrontEnd/OneItb-FE/src/Components/publication/sharePostLink.test.js`

## Phase 3: User Story 2 - Adjuntar archivos con menos friccion (Priority: P2)

**Goal**: Support drag-and-drop in the existing multi-attachment picker while preserving all limits.

**Independent Test**: Dropped files go through the same validation and can be removed.

- [x] T008 [US2] Refactor attachment merging into a shared handler in `FrontEnd/OneItb-FE/src/Components/publication/AttachmentDraftPicker.jsx`
- [x] T009 [US2] Add drag-over/drop UI state and accessible copy in `FrontEnd/OneItb-FE/src/Components/publication/AttachmentDraftPicker.jsx`
- [x] T010 [P] [US2] Extend `FrontEnd/OneItb-FE/src/Components/publication/AttachmentDraftPicker.test.jsx` to cover drop behavior and duplicate rejection

## Phase 4: User Story 3 - Cerrar visores y modales con accesibilidad consistente (Priority: P2)

**Goal**: Improve modal focus/labels and defensive media behavior without adding dependencies.

**Independent Test**: Media and reaction modals close predictably and restore page scroll/focus.

- [x] T011 [US3] Add focus restoration and stable labelled-by wiring to `FrontEnd/OneItb-FE/src/Components/publication/MediaViewerModal.jsx`
- [x] T012 [US3] Add focus restoration and disabled duplicate load guard to `FrontEnd/OneItb-FE/src/Components/publication/ReactionUsersModal.jsx`
- [x] T013 [P] [US3] Add defensive link-preview image fallback coverage in `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.test.jsx`

## Phase 5: Validation and Documentation

- [x] T014 Run `npm.cmd run test -- --run --configLoader runner` from `FrontEnd/OneItb-FE`
- [x] T015 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`
- [x] T016 Record executed validation in `specs/179-social-polish-quick-wins/evidence.md`
- [x] T017 Recalculate or confirm `docs/project_docs/ROADMAP.md` remains consistent
- [x] T018 Insert one top entry for Spec 179 in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T019 Update `docs/audit/DOCUMENTATION_STATUS.md` if canonical status changed
- [x] T020 Verify `DEVELOPMENT_LOG.md` remains newest-to-oldest and active spec is first

## Dependencies & Execution Order

- Phase 1 precedes all implementation.
- US1, US2 and US3 are independent after Phase 1.
- Validation/documentation follows implementation.

## Definition Of Done

- [x] All required tasks are marked `[x]`
- [x] Acceptance scenarios were validated with recorded evidence
- [x] Frontend tests and build pass
- [x] No backend persistence or GraphQL schema was changed
- [x] `DEVELOPMENT_LOG.md` contains exactly one new Spec 179 entry at the top
- [x] Unverified browser behavior is not reported as verified
