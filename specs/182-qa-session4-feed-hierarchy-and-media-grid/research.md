# Research: Spec 182

## Existing contract audit

- `UserInteraction` already stores `Follow`, `Mute`, and `Block`, and `SocialService.GetInquiries` already prioritizes followed authors before chronological ordering.
- The current unique index is `ObserverId + TargetId`; `InteractWithUser` overwrites `Type`, so following can unintentionally replace mute/block and explicit unfollow is unavailable.
- The feed already shows a `Seguir` action but does not hydrate real follow state. The public profile has no follow control.
- `MiniChatWidget` already renders a badge, but its contacts query and message subscription are skipped while closed, making the badge depend on another component's cache activity.
- `NotificationPreferencesModal` already supports Escape and backdrop closing; only density, accessibility regression coverage, and alignment need improvement.
- Spec 181 added safe full-PDF viewing via fetched Blob URLs. Spec 182 adds only a first-page cover renderer and keeps the full viewer unchanged.
- The feed currently deep-links to `inquiryId`; comment notifications do not identify a specific comment.

## Decisions

### Lazy local PDF first-page rendering

Use `pdfjs-dist` 5.6.205 because it supports both the CI Node 20 line and local/Docker Node 22. The display module is dynamically imported only by the PDF thumbnail component, while the worker URL is resolved from the installed package and bundled locally. Render page 1 to a canvas at a capped device-pixel ratio and destroy/cancel loading, page and render resources on cleanup.

Rejected:

- `react-pdf`: adds an additional React abstraction without value for one thumbnail.
- CDN worker: introduces an external runtime dependency and CSP/supply-chain exposure.
- Native iframe/object as cover: browser-specific chrome, prior warning noise, and inconsistent first-page rendering.
- Server thumbnail generation: adds backend binary-processing complexity and storage lifecycle outside this QA scope.

Reference: Mozilla PDF.js documents `getDocument`, `getPage(1)`, viewport calculation and canvas rendering in its official examples.

### Directed replies without third-level nesting

Add nullable `Comment.ReplyToUserId` with a restrictive FK and index. The client sends a `replyTargetCommentId`; the service loads that active comment, verifies inquiry ownership, derives the root `ParentCommentId`, and derives the target user. The visible `@Name` prefix is stored as ordinary content while the FK retains semantic identity.

This prevents clients from targeting arbitrary users and makes notification routing independent of display-name parsing.

### Precise notification deep links

Extend grouped notification upsert with an optional validated action URL. Comment and directed-reply events update the group's action to `/feed?inquiryId={id}&commentId={id}`. The latest event is the navigation target while aggregation remains per recipient/post/type.

### Existing social graph normalization

Replace the pair-unique index with `ObserverId + TargetId + Type`. Add `ISocialGraphService` so GraphQL resolvers no longer manipulate EF directly. Follow is idempotent and rejected while blocked; unfollow removes only Follow; block removes Follow/Mute atomically. `myFollowedUserIds` returns one list for feed/profile hydration and avoids per-card resolvers.

### Bounded media mosaic

Build one `MediaGrid` over ordered descriptors. Posts expose four tiles and comments three. The final visible tile carries an overlay when overflow exists; selecting it opens an accessible gallery over the complete item collection. The first item is the persisted cover. Failed media retains tile geometry and recovery actions.

## Quick wins included

- Keep the minimized widget subscribed and contacts hydrated while authenticated, removing accidental coupling to Nav.
- Add accessible real-count labels while preserving bounded visual badges.
- Use one reusable `FollowButton` and explicit Apollo cache modification with optimistic rollback.
- Add precise comment deep links to grouped notification actions without adding a parallel notification table.
- Preserve PDF full-view security and avoid global header changes.

## Required project documents

The plan skill references `REQUERIMIENTOS.md` and `PLAN_DE_MITIGACION_EVALUACION.md`, but neither exists in the normalized repository. Canonical `scope-and-requirements.md`, `architecture-and-design.md`, `ROADMAP.md`, and the constitution were used instead; no conflicting academic constraint was found.
