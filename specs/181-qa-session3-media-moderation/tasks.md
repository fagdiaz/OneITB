# Tasks: QA Session 3 - Media, Moderation and Notifications

**Input**: Design documents from `specs/181-qa-session3-media-moderation/`

**Tests**: Backend and frontend regression tests are required because the scope changes authorization, persistence, GraphQL contracts, background processing, and interactive media.

## Phase 1: Setup and Baseline

- [x] T001 Record the pre-implementation Git state and run risk-based baseline gates in `specs/181-qa-session3-media-moderation/evidence.md`
- [x] T002 Audit existing media, moderation, notification, and chat contracts to avoid duplicate implementation in `specs/181-qa-session3-media-moderation/research.md`

## Phase 2: Foundational Data and Contracts

- [x] T003 [P] Add cover/moderation state to `API Graphql/Entities/Models/Inquiry.cs` and `API Graphql/Entities/Models/Comment.cs`
- [x] T004 Configure defaults, visibility filters, and indexes without cascades in `API Graphql/Data/OneItbContext.cs`
- [x] T005 Update service and GraphQL interface contracts with backward-compatible null semantics and `CancellationToken` propagation in `API Graphql/Services/Social/ISocialService.cs`, `API Graphql/Services/Moderation/IModerationService.cs`, and `API Graphql/Services/Notifications/INotificationService.cs`
- [x] T006 Generate and review the EF migration `AddMediaModerationState` under `API Graphql/Data/Migrations/`

## Phase 3: User Story 1 - Safe Social Moderation

**Goal**: Author-only editing/deactivation, maximum two comment levels, and reasoned reversible moderation.

**Independent Test**: Service tests reject moderator edits and third-level replies, while visibility moderation persists one audited transition.

- [x] T007 [P] [US1] Add ownership, nesting, attachment-replacement, and moderation regression tests in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs` and `API Graphql/Tests/Services.Tests/Moderation/ModerationServiceTests.cs`
- [x] T008 [US1] Enforce author-only edit/status and two-level nesting in `API Graphql/Services/Social/SocialService.cs`
- [x] T009 [US1] Implement reasoned hide/restore with role validation and atomic audit in `API Graphql/Services/Moderation/ModerationService.cs`
- [x] T010 [US1] Expose controlled author and moderation mutations with `USER_ERROR` mapping and request cancellation in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [x] T011 [US1] Add moderation reason UI and separate author/moderator actions in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`, `CommentThread.jsx`, and `ModerationReasonModal.jsx`

## Phase 4: User Story 2 - Controlled Rich Media

**Goal**: Persisted cover selection, post-local image carousel, safe PDF viewing, and attachment replacement during editing.

**Independent Test**: Component tests navigate gallery/PDF fallbacks and runtime edit queries preserve selected cover and attachment metadata.

- [x] T012 [P] [US2] Add gallery, PDF cleanup, and cover-picker tests in `FrontEnd/OneItb-FE/src/Components/publication/MediaViewerModal.test.jsx` and `AttachmentDraftPicker.test.jsx`
- [x] T013 [US2] Implement cover selection/reordering in `FrontEnd/OneItb-FE/src/Components/publication/AttachmentDraftPicker.jsx` and `Feed.jsx`
- [x] T014 [US2] Implement keyboard image carousel and abortable PDF object-URL loading in `FrontEnd/OneItb-FE/src/Components/publication/MediaViewerModal.jsx` and `MediaAttachment.jsx`
- [x] T015 [US2] Render one primary medium plus compact secondary media in `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
- [x] T016 [US2] Implement atomic attachment replacement and cover persistence in `API Graphql/Services/Social/SocialService.cs` and `API Graphql/OneITB/GraphQL/Mutation.cs`
- [x] T017 [US2] Update Apollo mutation/query selections and edit-state upload mapping in `FrontEnd/OneItb-FE/src/data/graphql/mutations/inquiries.js`, `queries/inquiries.js`, `Feed.jsx`, and `CommentThread.jsx`

## Phase 5: User Story 3 - Feed and Messaging Signals

**Goal**: Compact long text, unified reaction action/count, and unread visibility on mobile navigation.

**Independent Test**: Frontend tests cover expansion and badge rendering from existing unread contact data.

- [x] T018 [P] [US3] Add focused UI tests for expandable text and mobile unread badge in `FrontEnd/OneItb-FE/src/Components/publication/ExpandableText.test.jsx` and layout tests
- [x] T019 [US3] Add reusable expanded/collapsed text UI and unify the publication reaction control in `FrontEnd/OneItb-FE/src/Components/publication/ExpandableText.jsx` and `Feed.jsx`
- [x] T020 [US3] Surface the existing unread total on the mobile hamburger trigger in `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx` without adding a duplicate query

## Phase 6: User Story 4 - Preferences and Unread Reminder

**Goal**: One idempotent reminder for aged unread messages and a dedicated notification settings dialog.

**Independent Test**: Repeated reminder processing leaves one row for unchanged data and preference failures roll back the switch.

- [x] T021 [P] [US4] Add idempotency/preference tests in `API Graphql/Tests/Services.Tests/Notifications/NotificationServiceTests.cs`
- [x] T022 [US4] Implement reminder upsert semantics in `API Graphql/Services/Notifications/NotificationService.cs`
- [x] T023 [US4] Add bounded configurable worker with structured failure logging in `API Graphql/OneITB/Infrastructure/UnreadMessageReminderHostedService.cs`, `Startup.cs`, and `appsettings.json`
- [x] T024 [P] [US4] Add notification preferences dialog tests in `FrontEnd/OneItb-FE/src/Components/notifications/NotificationPreferencesModal.test.jsx`
- [x] T025 [US4] Move preferences into `FrontEnd/OneItb-FE/src/Components/notifications/NotificationPreferencesModal.jsx` and simplify `NotificationBell.jsx`

## Phase 7: User Story 5 - Honest Console Hardening

**Goal**: Remove first-party media warnings/leaks while preserving observability of external code.

**Independent Test**: Source scans and browser smoke find no obsolete first-party APIs or leaked object URLs/listeners.

- [x] T026 [US5] Add current YouTube iframe permissions and deterministic media cleanup in `FrontEnd/OneItb-FE/src/Components/publication/MediaViewerModal.jsx` and `AttachmentDraftPicker.jsx`
- [x] T027 [US5] Scan first-party sources for `mozPressure`, `mozInputSource`, PDF worker assumptions, and unsafe iframe policies; record external-only residuals in `specs/181-qa-session3-media-moderation/evidence.md`
- [x] T027A [US5] Isolate the development Data Protection key ring to prevent stale DPAPI keys from polluting runtime logs in `API Graphql/OneITB/Startup.cs`

## Phase 8: Validation and Documentation

- [x] T028 Run backend build/tests, EF migration apply/drift check, frontend tests/build, and `git diff --check`; record actual outputs in `specs/181-qa-session3-media-moderation/evidence.md`
- [x] T029 Execute affected GraphQL operations and browser smoke when local services are available; leave any unexecuted behavior explicitly unverified in `specs/181-qa-session3-media-moderation/evidence.md`
- [x] T030 Update `docs/audit/DEVELOPMENT_LOG.md`, `docs/audit/DOCUMENTATION_STATUS.md`, `docs/project_docs/scope-and-requirements.md`, `docs/project_docs/architecture-and-design.md`, and recalculate `docs/project_docs/ROADMAP.md` only from evidence

## Dependencies & Execution Order

- Phase 2 depends on Phase 1 and blocks all implementation stories.
- US1 and US4 backend work may proceed independently after Phase 2.
- US2 depends on the cover and edit contracts from Phase 2; US3 reuses the resulting feed rendering.
- US5 follows US2 so it audits final media code.
- Validation/documentation follows every implemented story.

## Definition Of Done

- [x] All required tasks are marked `[X]`.
- [x] Security, persistence, GraphQL, browser, and console acceptance scenarios have recorded evidence or an explicit blocker.
- [x] Backend/frontend builds and affected tests pass.
- [x] EF migration is applied to Docker SQL and model drift is absent.
- [x] Documentation remains canonical and development log order is newest first.
