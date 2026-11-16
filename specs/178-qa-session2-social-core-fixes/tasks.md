# Tasks: QA Session 2 Social Core Fixes

**Input**: Design documents from `specs/178-qa-session2-social-core-fixes/`

**Tests**: Esta spec modifica esquema EF, autorizacion, uploads, cache Apollo y WebSockets. Las pruebas de contrato/persistencia son obligatorias y preceden al cierre.

## Phase 1: Setup and Baseline

- [X] T001 Confirm active feature, constitution, canonical requirements, architecture, roadmap and dirty worktree before implementation
- [X] T002 Run high-risk Speckit QA preflight with builds and EF model check from repository root

## Phase 2: Foundational Data Contracts

- [X] T003 [P] Add `SocialAttachment` and `CommentReaction` domain models in `API Graphql/Entities/Models/SocialAttachment.cs` and `API Graphql/Entities/Models/CommentReaction.cs`
- [X] T004 Extend `Inquiry`, `Comment`, `User`, `Notification` and `NotificationType` navigations/grouping fields in `API Graphql/Entities/Models/`
- [X] T005 Map DbSets, restrictive FKs, query filters, owner XOR constraint, unique/index/concurrency rules in `API Graphql/Data/OneItbContext.cs`
- [X] T006 Add focused EF/social/notification regression tests for the new contracts in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs` and `API Graphql/Tests/Services.Tests/Notifications/NotificationServiceTests.cs`

**Checkpoint**: Additive data model is explicit, backward-compatible and test-specified.

## Phase 3: User Story 1 - Scoped Subject Selection (Priority: P1)

**Goal**: Only valid subjects from the author's careers can be selected or persisted.

**Independent Test**: A multi-career student sees grouped/sorted own subjects; a forged foreign subject mutation is rejected.

- [X] T007 [US1] Add subject-scope authorization tests in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`
- [X] T008 [US1] Enforce active subject/career membership with existing admin exception in `API Graphql/Services/Social/SocialService.cs`
- [X] T009 [US1] Filter, group and sort publication subjects as `Career -> Year -> Name` with `Name - Code` labels in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

## Phase 4: User Story 2 - Multiple Attachment Drafts and Persistence (Priority: P1)

**Goal**: Publications, comments and replies accept several named attachments under a 15 MB aggregate limit.

**Independent Test**: Select multiple files, remove one, publish and reload; retained files preserve metadata and order.

- [X] T010 [US2] Add allowlisted MIME/video handling and descriptor response in `API Graphql/OneITB/Controllers/UploadController.cs`
- [X] T011 [US2] Define bounded `SocialAttachmentInput` and extended service contracts in `API Graphql/Services/Social/ISocialService.cs`
- [X] T012 [US2] Validate and persist attachment collections while maintaining legacy `FileUrl` in `API Graphql/Services/Social/SocialService.cs`
- [X] T013 [US2] Include new attachment URLs in orphan preservation in `API Graphql/Services/Uploads/UploadCleanupService.cs`
- [X] T014 [US2] Extend `addInquiry` and `addComment` GraphQL arguments in `API Graphql/OneITB/GraphQL/Mutation.cs` and configure safe attachment output in `API Graphql/OneITB/Startup.cs`
- [X] T015 [P] [US2] Add descriptor and sequential multi-upload helpers without breaking existing callers in `FrontEnd/OneItb-FE/src/utils/uploadFile.js`
- [X] T016 [P] [US2] Create reusable multiple attachment draft picker with previews and object URL cleanup in `FrontEnd/OneItb-FE/src/Components/publication/AttachmentDraftPicker.jsx`
- [X] T017 [US2] Wire multi-attachment state and submit flow into `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` and `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`

## Phase 5: User Story 3 - Rich Media Gallery and Viewers (Priority: P2)

**Goal**: YouTube plus all attachments render together; image/video/PDF viewers preserve feed context.

**Independent Test**: A mixed post and nested comment show all media with functional modal/preview behavior.

- [X] T018 [P] [US3] Extend media type parsing for video and original-name descriptors in `FrontEnd/OneItb-FE/src/utils/mediaParser.js`
- [X] T019 [P] [US3] Create accessible Escape/click-outside media viewer modal in `FrontEnd/OneItb-FE/src/Components/publication/MediaViewerModal.jsx`
- [X] T020 [US3] Refactor attachment cards and YouTube preview into modal viewers in `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
- [X] T021 [US3] Render YouTube, link preview and attachment gallery non-exclusively in `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
- [X] T022 [US3] Add focused media/draft component tests in `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.test.jsx` and `FrontEnd/OneItb-FE/src/Components/publication/AttachmentDraftPicker.test.jsx`

## Phase 6: User Story 4 - Comment Reactions, Focus and Like Users (Priority: P1)

**Goal**: Comments/replies support persistent likes, comment action focuses input, owners can inspect paged post reactions.

**Independent Test**: Toggle reactions, reload, autofocus editor and page through reacting users as owner; reject non-owner access.

- [X] T023 [US4] Implement comment reaction toggle and bounded owner-authorized reaction-user page in `API Graphql/Services/Social/SocialService.cs` and `API Graphql/Services/Social/ReactionUserPage.cs`
- [X] T024 [US4] Expose `toggleCommentReaction` and `inquiryReactionUsersPage` in `API Graphql/OneITB/GraphQL/Mutation.cs` and `API Graphql/OneITB/GraphQL/Query.cs`
- [X] T025 [US4] Extend Apollo queries/mutations and normalized cache policies in `FrontEnd/OneItb-FE/src/data/graphql/mutations/inquiries.js`, `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js` and `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
- [X] T026 [US4] Add optimistic post/comment reaction cache updates and comment autofocus in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` and `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
- [X] T027 [US4] Create paginated reacting-users modal in `FrontEnd/OneItb-FE/src/Components/publication/ReactionUsersModal.jsx`

## Phase 7: User Story 5 - Grouped Social Notifications (Priority: P1)

**Goal**: Third-party comments/likes always notify the correct author and aggregate persistently per target.

**Independent Test**: Multiple users create ten events; one notification group shows count ten, reopens unread and navigates to the inquiry.

- [X] T028 [US5] Add grouped-notification persistence, preference and self-event tests in `API Graphql/Tests/Services.Tests/Notifications/NotificationServiceTests.cs` and `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`
- [X] T029 [US5] Implement concurrency-safe grouped notification upsert and latest-event ordering in `API Graphql/Services/Notifications/INotificationService.cs` and `API Graphql/Services/Notifications/NotificationService.cs`
- [X] T030 [US5] Trigger grouped notifications for third-party comments, post likes and comment likes in `API Graphql/Services/Social/SocialService.cs`
- [X] T031 [US5] Expose grouping fields and add social labels/icons/direct navigation in `FrontEnd/OneItb-FE/src/data/graphql/notifications.js` and `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
- [X] T032 [US5] Support targeted inquiry query/scroll/thread opening in `API Graphql/Services/Social/ISocialService.cs`, `API Graphql/Services/Social/SocialService.cs`, `API Graphql/OneITB/GraphQL/Query.cs`, `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`, `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js` and `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

## Phase 8: User Story 6 - Institutional Footer (Priority: P3)

**Goal**: Finish the feed with responsive institutional identity after pagination.

**Independent Test**: Footer appears after load-more/end-state in desktop and mobile and stays hidden during print.

- [X] T033 [US6] Create static institutional footer in `FrontEnd/OneItb-FE/src/Components/layout/Footer.jsx`
- [X] T034 [US6] Render the footer after feed pagination/end-state in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

## Phase 9: Migration, Verification and Documentation

- [X] T035 Generate and review additive migration `AddSocialAttachmentsCommentReactionsAndNotificationGrouping` under `API Graphql/Data/Migrations/`, including legacy `FileUrl` backfill and rollback behavior
- [X] T036 Apply migration to Docker SQL and verify `dotnet ef migrations has-pending-model-changes` reports no changes
- [X] T037 Run backend build and complete service test suite; record exact results in `specs/178-qa-session2-social-core-fixes/evidence.md`
- [X] T038 Run frontend Vitest suite and Vite production build; record exact results in `specs/178-qa-session2-social-core-fixes/evidence.md`
- [X] T039 Run authenticated GraphQL schema/operation smoke for scoped posting, attachments, comment reactions, reaction users and grouped notifications
- [X] T040 Run browser regression for subject grouping, draft previews, mixed media modals, autofocus, likes modal, grouped navigation and footer when local runtime is available (executed partially; final post-fix reload blocked and recorded in evidence)
- [X] T041 Recalculate and update Module 4/global status from checklist evidence in `docs/project_docs/ROADMAP.md`
- [X] T042 Insert exactly one newest Spec 178 entry in `docs/audit/DEVELOPMENT_LOG.md` and verify reverse chronology
- [X] T043 Update `docs/audit/DOCUMENTATION_STATUS.md` and canonical architecture/requirements only if schema/status changes require it
- [X] T044 Run `git diff --check`, document branch-hook/runtime blockers accurately and complete `specs/178-qa-session2-social-core-fixes/evidence.md`

## Dependencies & Execution Order

- Phase 2 blocks every user story because it defines shared persistence.
- US1 can be implemented after Phase 2 independently of media UI.
- US2 blocks US3 because final media needs persisted attachment descriptors.
- US4 and US5 share reaction/notification contracts and execute sequentially in backend files.
- US6 is independent after the baseline but closes after feed integration.
- Migration and runtime verification occur only after all model/service contracts compile.

## Definition Of Done

- [X] All 44 tasks are marked `[X]` with evidence, not expectation.
- [X] Existing singular `FileUrl` data remains usable after migration and rollback.
- [X] Backend authorization prevents foreign-career posting and unauthorized reaction-user listing.
- [X] Attachment/reaction/notification negative paths have automated coverage.
- [X] Backend build/tests, frontend tests/build and EF model gate pass.
- [X] Affected GraphQL operations and browser flows are executed or explicitly marked blocked.
- [X] Roadmap and exactly one newest Development Log entry reflect only verified evidence.
