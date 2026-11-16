# Feature Specification: QA Session 4 - Feed Hierarchy and Media Grid

**Feature Branch**: `182-qa-session4-feed-hierarchy-and-media-grid`

**Created**: 2026-07-12

**Status**: Ready

**Input**: Improve feed media density, comment hierarchy and mentions, notification navigation, unread chat signals, and explicit follower controls without duplicating existing social infrastructure.

## User Scenarios & Testing

### User Story 1 - Compact and useful media mosaics (Priority: P1)

People can understand a publication's main visual at a glance without an excessively tall card. A selected PDF cover shows its first page, mixed media is arranged in a bounded mosaic, and every hidden item remains reachable from an accessible gallery.

**Why this priority**: Dense or document-heavy publications currently dominate the feed and make scanning difficult.

**Independent Test**: Open posts and comments containing one, four, and more than four mixed files; verify the chosen cover, bounded height, overflow count, first-page PDF preview, and access to every item.

**Acceptance Scenarios**:

1. **Given** a PDF selected as the main medium, **When** its card becomes visible, **Then** the first page appears without blocking initial feed interaction and View/Download actions remain available.
2. **Given** mixed media, **When** rendered in a post, **Then** at most four tiles are visible and the chosen cover receives visual priority.
3. **Given** more media than visible slots, **When** the overflow tile is selected, **Then** an accessible gallery exposes every item and clearly states the remaining count.
4. **Given** media in a comment or reply, **When** rendered, **Then** the same behavior uses a smaller bounded layout appropriate to the thread.

---

### User Story 2 - Two-level conversations with directed mentions (Priority: P1)

Comments and replies are visually distinct. Replying to an existing reply keeps the conversation at two levels, mentions the selected participant, and notifies that person without creating a third nested level.

**Why this priority**: The depth rule is already enforced, but the current interface removes the reply affordance and makes ongoing conversations difficult.

**Independent Test**: Reply to a root comment and then to that reply; confirm both responses remain siblings under the root, the second draft starts with the selected person's mention, and only the intended participant receives the directed notification.

**Acceptance Scenarios**:

1. **Given** a root comment, **When** replies render, **Then** indentation, connector and surface styling clearly differentiate both levels.
2. **Given** a second-level reply, **When** the user selects Reply, **Then** the composer targets the root thread and prepopulates a mention for the selected author.
3. **Given** a directed reply, **When** it is persisted, **Then** the target identity is validated by the server, the structure remains two levels, and self-notifications are suppressed.
4. **Given** a forged or unrelated reply target, **When** submitted, **Then** the operation is rejected without storing a comment or notification.

---

### User Story 3 - Actionable notifications and reliable unread signals (Priority: P2)

Selecting a comment notification opens the correct post and focuses the specific comment with a temporary highlight. Unread messages remain visible on the minimized chat widget even before it is opened, and notification settings use a compact dismissible dialog.

**Why this priority**: A notification is useful only when it reaches the exact context, and unread state must not depend on another component having loaded first.

**Independent Test**: Receive a comment notification and a private message while the widget is closed; follow the notification deep link, observe target highlighting, and verify the minimized badge updates in real time.

**Acceptance Scenarios**:

1. **Given** a notification for a specific comment, **When** selected, **Then** its thread opens, the comment scrolls into view, focus is preserved, and a temporary highlight fades without changing data.
2. **Given** a private message received while chat is closed, **When** the event arrives, **Then** the minimized widget badge updates without requiring the full chat view.
3. **Given** notification settings are open, **When** the user clicks the backdrop or presses Escape, **Then** the compact dialog closes unless a setting is being saved.

---

### User Story 4 - Explicit and consistent follower controls (Priority: P2)

People can follow or unfollow another active user from a publication or public profile and immediately see the real state. Following remains compatible with mute/block rules, and followed authors retain feed priority with chronological ordering inside each priority group.

**Why this priority**: The underlying relation and ordering exist, but the current action is ambiguous, cannot explicitly unfollow, and does not show server state.

**Independent Test**: Follow and unfollow one author from both feed and profile, reload, apply mute/block combinations, and verify state persistence and deterministic feed order.

**Acceptance Scenarios**:

1. **Given** an active user not currently followed, **When** Follow is selected, **Then** the action is idempotent, visible immediately, and survives reload.
2. **Given** a followed user, **When** Unfollow is selected, **Then** only the follow relation is removed and unrelated interaction state is preserved.
3. **Given** a blocked target, **When** Follow is attempted, **Then** the request is rejected until the block is explicitly removed.
4. **Given** followed and non-followed authors, **When** the feed is loaded without a search term, **Then** followed authors appear first and each group remains newest-first.

### Edge Cases

- A PDF is encrypted, corrupt, unavailable, larger than expected, or has no renderable first page: show a document fallback and keep View/Download usable.
- A media item fails after the grid mounts: preserve tile dimensions and expose a recovery action instead of shifting the page.
- The selected cover is removed: promote the next persisted media item deterministically.
- The reply target is deleted, hidden, belongs to another post, or is the current user: reject or suppress the directed notification safely.
- A deep-linked comment is absent because of moderation, pagination, or career scoping: scroll to the post and show non-disruptive feedback instead of looping.
- Follow/unfollow requests are repeated, race, or arrive after logout: keep one relation, return controlled errors, and reconcile the visible state.
- More than nine unread messages exist: badges use the established bounded display while accessible text reports the real count.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST render a selected PDF cover as a first-page visual preview with View and Download recovery actions.
- **FR-002**: PDF preview work MUST begin only when needed, remain bounded, and release document/render resources when the media changes or unmounts.
- **FR-003**: Publication media MUST use a responsive bounded mosaic with no more than four visible tiles.
- **FR-004**: Comment and reply media MUST reuse the mosaic behavior with a smaller maximum height and no more than three visible tiles.
- **FR-005**: An overflow tile MUST report the number of hidden items and open a gallery containing all media belonging to that post or comment.
- **FR-006**: The selected cover MUST remain the first and most prominent item while all secondary media stays reachable.
- **FR-007**: Root comments and replies MUST have distinct indentation, connector, spacing, and accessible hierarchy semantics.
- **FR-008**: Replying to a reply MUST preserve the root parent and MUST NOT create a third persistence level.
- **FR-009**: A directed reply MUST store the validated target user identity and expose a visible mention in its text.
- **FR-010**: The server MUST derive the directed target from a comment in the same active inquiry and reject unrelated or hidden targets.
- **FR-011**: Directed reply notifications MUST target the selected participant, avoid duplicate/self notifications, and link to the newly created comment.
- **FR-012**: Comment notification links MUST include sufficient context to open the post and identify the target comment.
- **FR-013**: The feed MUST open the target thread, scroll the comment into view, and apply a temporary non-persistent highlight.
- **FR-014**: Missing or inaccessible deep-link targets MUST degrade to the containing publication with controlled feedback.
- **FR-015**: The minimized chat widget MUST load and reconcile unread state independently and listen for new messages while closed.
- **FR-016**: The notification preferences dialog MUST be compact, visually balanced, keyboard dismissible, and backdrop dismissible while no save is pending.
- **FR-017**: Follow, mute, and block relations MUST reuse the existing explicit user-interaction model and permit their valid states without overwriting unrelated relations.
- **FR-018**: The system MUST expose explicit idempotent follow and unfollow operations with backend identity, active-target, self-follow, and block validation.
- **FR-019**: The system MUST expose the current user's followed target identifiers in one bounded read operation suitable for feed/profile state hydration.
- **FR-020**: Feed and profile controls MUST display `Seguir` or `Siguiendo` from server state and update optimistically with rollback on failure.
- **FR-021**: Blocking a target MUST remove incompatible follow/mute relations atomically; unfollowing MUST leave unrelated relations untouched.
- **FR-022**: Feed ordering MUST prioritize followed authors and then order each priority group chronologically, without adding per-post database queries.
- **FR-023**: New GraphQL operations MUST return controlled user-facing errors and MUST NOT leak database or stack details.
- **FR-024**: New relationships and indexes MUST be explicit, restrictive on delete, migration-backed, and free of shadow properties.

### Key Entities

- **Comment**: Existing two-level discussion item extended with an optional validated directed-reply user.
- **UserInteraction**: Existing social edge representing Follow, Mute, or Block; uniqueness must support independent valid interaction types.
- **Notification**: Existing grouped record whose action link points to the latest relevant comment.
- **SocialAttachment**: Existing ordered descriptor reused for cover selection, media mosaic order, and gallery membership.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Posts display at most four media tiles and comments at most three, regardless of the number of attached items.
- **SC-002**: A valid first PDF page appears within two seconds on the local demonstration dataset without delaying initial feed interaction.
- **SC-003**: Every reply attempt produces no more than two persisted hierarchy levels, and all forged cross-post targets are rejected in automated tests.
- **SC-004**: A comment deep link reaches and highlights the intended visible comment on the first navigation attempt.
- **SC-005**: Repeated follow/unfollow operations leave at most one edge of each type and preserve unrelated interaction state.
- **SC-006**: Loading a feed page with up to 25 posts performs no database query per author solely to determine follow state or ordering.
- **SC-007**: Backend tests, frontend component tests, release builds, migration application, model-drift checks, schema validation, and affected runtime smoke checks all pass or record an explicit environment blocker.

## Assumptions

- The existing authenticated upload endpoint, ordered attachments, cover flag, media viewer, grouped notifications, message subscription, privacy rules, and two-level comment limit remain authoritative.
- PDF first-page rendering is client-side, local to the application bundle, lazy, and limited to the selected/visible preview; no third-party CDN is required.
- A reply to a reply is persisted as a sibling under the same root comment while retaining the directed target identity.
- Follow is one-way and does not require approval in the current product model. Private-profile visibility continues to use the existing follower rule.
- Existing feed career scoping, mute/block exclusion, cursor paging, and chronological ordering remain unchanged except for corrected social-edge semantics.
- The already-present widget badge and backdrop close behavior are hardened and tested rather than reimplemented in parallel.
