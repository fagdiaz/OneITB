# Tasks: QA Session 4 - Feed Hierarchy and Media Grid

**Input**: Design documents from `specs/182-qa-session4-feed-hierarchy-and-media-grid/`

**Tests**: Required because this spec changes relational uniqueness, authorization, notification routing, Apollo state, lazy workers, and interactive navigation.

## Phase 1: Baseline and Dependency

- [x] T001 Record branch, dirty baseline, existing-contract audit and pre-implementation gates in `specs/182-qa-session4-feed-hierarchy-and-media-grid/evidence.md`
- [x] T002 Install exact production dependency `pdfjs-dist@5.6.205`, run production dependency audit, and record Node/CI compatibility in `FrontEnd/OneItb-FE/package.json` and lockfile

## Phase 2: Foundational Data and Social Contracts

- [x] T003 [P] Add `ReplyToUserId`/navigation to `API Graphql/Entities/Models/Comment.cs`
- [x] T004 Configure restrictive directed-reply FK/index and normalize `UserInteraction` uniqueness to observer/target/type in `API Graphql/Data/OneItbContext.cs`
- [x] T005 Generate and review migration `AddDirectedRepliesAndSocialGraphIndex` in `API Graphql/Data/Migrations/`
- [x] T006 [P] Define idempotent social graph contracts and payloads in `API Graphql/Services/Social/ISocialGraphService.cs`
- [x] T007 Register the social graph service in `API Graphql/OneITB/Startup.cs`

## Phase 3: User Story 1 - Bounded Media Mosaic

**Goal**: Lazy first-page PDF covers and reusable bounded mixed-media grids.

**Independent Test**: Component tests prove tile limits, overflow gallery, cover order, PDF fallback and cleanup.

- [x] T008 [P] [US1] Add tests for PDF viewport sizing/cleanup and post/comment tile limits in `FrontEnd/OneItb-FE/src/Components/publication/PdfFirstPageThumbnail.test.jsx` and `MediaGrid.test.jsx`
- [x] T009 [US1] Implement lazy local worker/canvas first-page renderer with cancellation and fallback in `FrontEnd/OneItb-FE/src/Components/publication/PdfFirstPageThumbnail.jsx`
- [x] T010 [US1] Implement accessible bounded mosaic and all-media gallery in `FrontEnd/OneItb-FE/src/Components/publication/MediaGrid.jsx` and `MediaGalleryModal.jsx`
- [x] T011 [US1] Refactor `MediaComponent.jsx` and `MediaAttachment.jsx` to use the grid for posts/comments while preserving full viewer, View/Download and existing image carousel behavior
- [x] T012 [US1] Validate PDF.js remains code-split and no worker/CDN/CSP warning is introduced in Vite build and source scans

## Phase 4: User Story 2 - Directed Two-Level Replies

**Goal**: Clear hierarchy and reply-to-reply mentions without a third persistence level.

**Independent Test**: Backend rejects forged targets and derives root/recipient; UI prepopulates the mention and renders siblings under one root.

- [x] T013 [P] [US2] Add service tests for root derivation, target validation, self suppression and precise notification action in `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`
- [x] T014 [US2] Extend `ISocialService`/`SocialService` directed reply contract, cancellation, validation, persistence and notification routing in `API Graphql/Services/Social/`
- [x] T015 [US2] Extend grouped notification action override safely in `API Graphql/Services/Notifications/INotificationService.cs` and `NotificationService.cs`
- [x] T016 [US2] Expose `replyTargetCommentId` and `replyToUserId` with controlled GraphQL errors in `API Graphql/OneITB/GraphQL/Mutation.cs` and frontend GraphQL documents
- [x] T017 [P] [US2] Add comment hierarchy/mention/deep-link component tests in `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.test.jsx`
- [x] T018 [US2] Refactor `CommentThread.jsx` with semantic connectors, reply-to-reply mention prefill, root-parent submission, target IDs and compact media grid

## Phase 5: User Story 3 - Precise Navigation and Unread State

**Goal**: Comment-level deep links, independent minimized badge updates, and compact notification settings.

**Independent Test**: Target comment scroll/highlight works; closed widget subscription updates cache; modal dismiss behavior remains guarded.

- [x] T019 [P] [US3] Add focused tests for target-comment highlight/fallback and compact modal backdrop behavior in publication/notification test files
- [x] T020 [US3] Parse `commentId`, open the containing thread and delegate scroll/focus/highlight with cleanup in `Feed.jsx` and `CommentThread.jsx`
- [x] T021 [US3] Keep contacts hydration and message subscription active while authenticated/minimized, add accessible real-count badge text, and preserve unmount cleanup in `MiniChatWidget.jsx`
- [x] T022 [US3] Compact and rebalance `NotificationPreferencesModal.jsx` without regressing Escape/backdrop/pending-save guards

## Phase 6: User Story 4 - Explicit Followers

**Goal**: Idempotent follow/unfollow, valid coexistence with mute, explicit block semantics, and real UI state.

**Independent Test**: Service tests exercise duplicate/race semantics and feed ordering; UI tests verify optimistic toggle and rollback.

- [x] T023 [P] [US4] Add social graph service tests for self/inactive/block validation, idempotency, coexistence and selective unfollow in `API Graphql/Tests/Services.Tests/Social/SocialGraphServiceTests.cs`
- [x] T024 [US4] Implement `SocialGraphService` with no-tracking reads, atomic block cleanup and bounded concurrency handling in `API Graphql/Services/Social/`
- [x] T025 [US4] Refactor `interactWithUser` and add `followUser`, `unfollowUser`, `myFollowedUserIds` through service-backed controlled resolvers in `API Graphql/OneITB/GraphQL/Mutation.cs` and `Query.cs`
- [x] T026 [P] [US4] Add Apollo operations and reusable optimistic `FollowButton` with cache modification/rollback in `FrontEnd/OneItb-FE/src/data/graphql/social.js` and `Components/social/FollowButton.jsx`
- [x] T027 [US4] Hydrate one followed-ID set in `Feed.jsx`, replace ambiguous follow actions, and preserve Mute/Block behavior without refetch storms
- [x] T028 [US4] Add follow state/control to third-party `UserProfile.tsx` while suppressing it on the own profile
- [x] T029 [US4] Verify feed ordering remains followed-first/newest-second without per-post queries in backend tests and generated SQL review

## Phase 7: QA, Runtime and Documentation

- [x] T030 Run backend build/tests, frontend tests/build, npm production audit, EF migration apply/drift, source scans and `git diff --check`; record exact outputs in `evidence.md`
- [x] T031 Execute runtime schema and authenticated follow/directed-reply operations against Docker SQL; record results or explicit credential blocker
- [x] T032 Assess browser smoke availability for PDF grid, comments/deep-link, minimized badge, preferences and feed/profile follow controls; record the unavailable manual verification honestly
- [x] T033 Update `scope-and-requirements.md`, `architecture-and-design.md`, `ROADMAP.md`, `DOCUMENTATION_STATUS.md`, `FINAL_AUDIT_REPORT.md`, and add exactly one newest-first Spec 182 entry to `DEVELOPMENT_LOG.md`

## Dependencies and Order

- Phase 2 blocks directed replies and social graph work.
- US1 is frontend-independent after T002 and may proceed alongside backend tests.
- US2 backend contract precedes US2 UI and deep-link navigation.
- US3 uses the directed notification URL from US2.
- US4 service/schema precedes feed/profile cache integration.
- Validation/documentation follows all implementation tasks.

## Definition Of Done

- [x] All required tasks are marked `[X]`.
- [x] Migration is applied to Docker SQL and model drift is absent.
- [x] Backend/frontend builds and affected automated tests pass.
- [x] GraphQL schema and affected operations execute or have an explicit runtime blocker.
- [x] No per-post follower query, third comment level, stale worker, object URL, listener, or subscription leak is introduced.
- [x] Documentation percentages and evidence are canonical and honest.
