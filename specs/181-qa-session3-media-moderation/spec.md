# Feature Specification: QA Session 3 - Media, Moderation and Notifications

**Feature Branch**: `181-qa-session3-media-moderation`

**Created**: 2026-07-12

**Status**: Ready

**Input**: Stabilize media rendering, social moderation, unread-message reminders, notification preferences, and actionable console warnings without weakening security.

## User Scenarios & Testing

### User Story 1 - Safe social moderation (Priority: P1)

Authors retain exclusive control over editing their own text and deactivating their own content. Moderators and administrators can hide inappropriate publications or comments only after supplying a reason, and every decision remains auditable.

**Why this priority**: The current contract allows privileged users to edit other people's words, which is a critical integrity and accountability defect.

**Independent Test**: An authenticated moderator is rejected when attempting to edit another user's content, but can hide it with a valid reason; the content disappears from the public feed and an audit entry records actor, target, action, and reason.

**Acceptance Scenarios**:

1. **Given** a publication owned by another user, **When** a moderator attempts to edit its title or content, **Then** the operation is rejected without modifying persisted data.
2. **Given** active reported content, **When** a moderator hides it with a reason, **Then** normal feed queries exclude it and the moderation audit remains visible to authorized staff.
3. **Given** a reply whose parent is already a reply, **When** a user attempts to reply again, **Then** the backend rejects the third nesting level and the UI does not offer the action.

---

### User Story 2 - Controlled rich-media experience (Priority: P1)

Users can choose a main visual for a new publication, navigate all attached images in an accessible gallery, preview local PDFs without relaxing application-wide framing security, and add or remove attachments while editing their own content.

**Why this priority**: Media is a central feed workflow and current inconsistencies create broken previews, overloaded cards, and orphan-prone edit behavior.

**Independent Test**: Create a publication containing YouTube plus multiple files, choose an attachment as cover, reload the feed, navigate images with buttons and keyboard, open a PDF, then edit the publication and replace its attachments.

**Acceptance Scenarios**:

1. **Given** a post with multiple images, **When** an image opens, **Then** previous/next controls and arrow keys navigate only that post's image set and expose the current position.
2. **Given** a locally hosted PDF, **When** the user requests preview, **Then** it opens from a temporary browser object URL with loading, failure, and external-open fallbacks while global anti-framing headers remain strict.
3. **Given** a draft containing YouTube and attachments, **When** the author selects a cover and publishes, **Then** the selected medium remains primary after reload and secondary media remains accessible in a compact gallery.
4. **Given** an existing publication or comment owned by the current user, **When** attachments are added or removed during editing, **Then** metadata is atomically replaced and total count/size/type validation still applies.

---

### User Story 3 - Clear feed and messaging signals (Priority: P2)

Long posts are initially compact with an explicit expansion control, reaction action and count form one coherent control group, and unread chat counts are visible both on the minimized widget and the mobile navigation trigger.

**Why this priority**: These changes reduce feed density and prevent unread messages from being hidden on small screens.

**Independent Test**: Load a long publication on desktop and mobile, expand/collapse it, use its reaction control, and confirm the mobile menu button and minimized chat widget show the same unread total.

**Acceptance Scenarios**:

1. **Given** content exceeding four visual lines, **When** rendered in the feed, **Then** it is clamped until the user selects `Leer mas`, and can be collapsed again.
2. **Given** a publication reaction count, **When** the icon is selected, **Then** it toggles the reaction; when the eligible count is selected, it opens the existing reaction-user dialog without duplicate labels.
3. **Given** unread private messages, **When** navigation is collapsed on mobile, **Then** the hamburger button displays a bounded unread badge.

---

### User Story 4 - Actionable notification preferences and reminders (Priority: P2)

Users receive one idempotent general notification when private messages remain unread beyond the configured threshold, and manage notification categories in a dedicated, accessible settings dialog instead of inside the bell list.

**Why this priority**: A durable reminder improves message discovery, while separating preferences simplifies a frequently used popover.

**Independent Test**: Age an unread message beyond the configured threshold, run the reminder worker twice, verify only one grouped notification exists, mark/read messages, and update preferences in the dedicated dialog.

**Acceptance Scenarios**:

1. **Given** one or more messages unread past the threshold, **When** the reminder worker runs repeatedly, **Then** it creates or updates one notification per recipient and does not inflate the count on unchanged data.
2. **Given** a disabled private-message preference, **When** the worker runs, **Then** no reminder is created for that user.
3. **Given** the notification bell is open, **When** the user selects configuration, **Then** a separate keyboard-accessible dialog presents labeled switches and persists each change with feedback.

---

### User Story 5 - Honest console hardening (Priority: P3)

First-party media code uses current browser attributes and deterministic cleanup. Warnings emitted exclusively by external providers or built-in browser viewers are documented rather than hidden or intercepted.

**Why this priority**: A clean console is useful only when achieved without suppressing real defects or weakening browser protections.

**Independent Test**: Run targeted source scans and browser smoke checks; no first-party use of obsolete Mozilla mouse APIs remains, YouTube embeds expose the required allow-list, and media object URLs/listeners are released on close.

**Acceptance Scenarios**:

1. **Given** a YouTube embed opened by the user, **When** its iframe mounts, **Then** modern feature permissions and referrer policy are present.
2. **Given** a PDF preview is closed or changed, **When** cleanup runs, **Then** generated object URLs are revoked and no state update occurs after unmount.
3. **Given** a warning originating from external provider code, **When** auditing the application, **Then** it is recorded as external residual risk and no application log filtering is added.

### Edge Cases

- A cover attachment is removed during editing: the first remaining attachment becomes cover, otherwise YouTube becomes primary.
- PDF download fails, is blocked by CORS, or has an unexpected content type: the viewer shows recovery actions and never injects untrusted HTML.
- Two moderation requests target the same content: repeated hide requests are idempotent and each meaningful state transition is audited once.
- A moderator is also the author: author actions remain author-owned; moderation hiding still requires a reason.
- A reply points to a deleted or hidden parent: creation is rejected.
- The reminder worker starts with no database connectivity: it logs a structured warning and retries on the next interval without stopping the API.
- A notification preference mutation fails: the switch returns to server state and an accessible error is shown.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST limit comments to root comments plus one reply level and enforce this rule on the server.
- **FR-002**: Only the content author MUST be able to edit or author-deactivate a publication or comment.
- **FR-003**: Moderators and administrators MUST be able to hide and restore social content with a required reason, without editing user-authored text or physically deleting social content.
- **FR-004**: Every moderation visibility transition MUST create a persistent audit record containing actor, target, action, reason, and timestamp.
- **FR-005**: Normal social queries MUST exclude moderator-hidden publications and comments while authorized moderation/audit queries retain access.
- **FR-006**: Image viewers MUST support previous/next navigation, keyboard arrows, Escape, focus restoration, image position, and post-local gallery boundaries.
- **FR-007**: Local PDF previews MUST use a fetched browser object URL or external-open fallback and MUST NOT require weakening global anti-framing headers.
- **FR-008**: Publication creation MUST persist whether the ordered first attachment or detected YouTube video is the primary medium.
- **FR-009**: Authors MUST be able to replace the attachment set while editing publications and comments, including adding and removing files under existing count, type, URL, and aggregate-size limits.
- **FR-010**: Long publication content MUST support collapsed and expanded states without altering persisted text.
- **FR-011**: Publication reaction action/count MUST render as one coherent control group while preserving owner/moderator access to the paginated user list.
- **FR-012**: The minimized chat widget and mobile navigation trigger MUST expose the current bounded unread-message count.
- **FR-013**: The system MUST create an idempotent persistent reminder for messages unread beyond a configurable threshold and respect private-message notification preferences.
- **FR-014**: Notification preferences MUST move to a dedicated accessible dialog with optimistic visual feedback and rollback on failure.
- **FR-015**: First-party media code MUST use current iframe permissions, bounded fetches, abort/cleanup behavior, and MUST NOT suppress third-party console output.
- **FR-016**: Social mutations MUST return controlled user-facing GraphQL errors for invalid ownership, depth, attachment, and moderation-reason cases.
- **FR-017**: Schema changes MUST use explicit fields, defaults, indexes where useful, and `DeleteBehavior.Restrict`; no shadow properties or cascade deletes are permitted.

### Key Entities

- **Inquiry**: Adds persisted media-cover preference and moderator-hidden state while retaining author soft-delete state.
- **Comment**: Adds moderator-hidden state and remains limited to one parent/reply level.
- **SocialAttachment**: Existing ordered metadata used to determine the selected attachment cover and atomically replace edited attachment sets.
- **ModerationAudit**: Existing immutable trail storing hide/restore decisions and reasons.
- **Notification**: Existing grouped notification record reused for unread-message reminders without periodic duplicate creation.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All unauthorized cross-user edit attempts and third-level reply attempts are rejected in automated tests with zero persisted changes.
- **SC-002**: A user can navigate a gallery of up to 10 attached images by mouse and keyboard, with the current position announced on every image.
- **SC-003**: Re-running the unread-message reminder against unchanged data produces no additional notification rows.
- **SC-004**: All affected backend tests, frontend component tests, release builds, and model-drift checks pass.
- **SC-005**: The affected GraphQL schema and authenticated operations execute successfully against the Docker SQL runtime.
- **SC-006**: Browser verification records no first-party uncaught error, leaked object URL/listener, or blocked local PDF caused by application framing policy.

## Assumptions

- Existing authenticated `/api/upload`, `SocialAttachment`, grouped notifications, moderation audit, chat unread counts, and global error handling are reused.
- Social content is never physically deleted; the prompt phrase "eliminar permanentemente" is superseded by the project constitution and remains author soft-deactivation.
- The existing 10-file and 15 MB aggregate limits remain authoritative.
- PDF rendering uses native browser capabilities only after explicit user action; no heavy PDF rendering dependency is introduced.
- External YouTube/browser warnings cannot be guaranteed absent and will not be hidden by application code.
