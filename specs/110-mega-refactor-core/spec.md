# Feature Specification: Mega Refactor Core

**Feature Branch**: `110-mega-refactor-core`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Execute a full-stack structural update that fixes the chat render collision, implements careers and enrollments, refactors feed filtering and publication creation, adds soft-delete editing for publications and comments, adds follow/mute/block social graph behavior, and redesigns the public profile."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stable Chat Navigation (Priority: P1)

An authenticated user can move between the mini chat widget and the full chat view without
render warnings, stale cache updates, or state changes after a component unmounts.

**Why this priority**: The current render collision can destabilize the app and obscure
validation for every later UI change.

**Independent Test**: Open the mini chat widget, navigate to the full chat page, return to the
feed, and repeat the transition while confirming the console remains free of cross-render
state warnings.

**Acceptance Scenarios**:

1. **Given** the mini chat widget is mounted, **When** the user navigates to the full chat view, **Then** no cross-component state update warning is logged.
2. **Given** the full chat view is mounted, **When** the user navigates away during an active subscription or refetch, **Then** no state update occurs after unmount.
3. **Given** a new message arrives while either chat surface is open, **When** the cache updates, **Then** the message appears once and unread indicators stay consistent.

---

### User Story 2 - Careers And Enrollment Filtering (Priority: P2)

Users can be linked to one or more institutional careers, and publication creation and
feed filtering respect the selected career and its available subjects.

**Why this priority**: RF-005 is foundational for organizing academic content by program and
prevents unrelated subjects from polluting publication workflows.

**Independent Test**: Assign multiple careers to a user, create a publication by selecting a
career first, verify the subject list is narrowed, then filter the feed by career and subject.

**Acceptance Scenarios**:

1. **Given** a user has multiple careers, **When** they open publication creation, **Then** career selection appears before subject selection.
2. **Given** a career is selected, **When** the subject selector opens, **Then** only subjects linked to that career are available.
3. **Given** feed filters are applied, **When** the feed refreshes, **Then** only matching active publications appear.

---

### User Story 3 - Edit And Soft-Delete Content (Priority: P3)

Authors can edit their own publications and comments, and authorized users can deactivate
content without physical deletion.

**Why this priority**: Moderation and content lifecycle control are required before the feed
can be considered mature.

**Independent Test**: Edit a publication and comment as the author, deactivate both, reload
the feed, and verify the content no longer appears while the records remain recoverable for
administrative evidence.

**Acceptance Scenarios**:

1. **Given** a user owns a publication, **When** they edit title or content, **Then** the feed displays the updated text after refresh.
2. **Given** a publication or comment is deactivated, **When** normal feed queries run, **Then** inactive content is hidden.
3. **Given** a moderator or administrator reviews content, **When** they deactivate it, **Then** the action succeeds even if they are not the author.

---

### User Story 4 - Social Graph Feed Relevance (Priority: P4)

Users can follow, mute, or block other users, and the feed prioritizes followed authors while
excluding muted or blocked authors.

**Why this priority**: A relevant academic feed needs user-controlled ranking and safety
controls.

**Independent Test**: Follow one author, mute another, block a third, then query the feed and
verify followed content appears first while muted and blocked authors are absent.

**Acceptance Scenarios**:

1. **Given** a user follows an author, **When** the feed loads, **Then** that author's active publications are ranked before non-followed content.
2. **Given** a user mutes or blocks another user, **When** the feed loads, **Then** that user's content is excluded.
3. **Given** an interaction already exists, **When** the user chooses a different interaction with the same target, **Then** the prior interaction is replaced by the new one.

---

### User Story 5 - Public Profile Summary And Isolated Editing (Priority: P5)

Users can view a public profile as a read-only CV summary with recent publications, while
profile editing is isolated behind an explicit "Edit Profile" action in the account menu.

**Why this priority**: Public profile browsing and private editing must be separated to avoid
accidental edits and improve presentation quality.

**Independent Test**: Visit another user's profile, expand the summary, view recent
publications, and verify no inline editing controls appear. Then use the authenticated account
menu to open the edit profile flow.

**Acceptance Scenarios**:

1. **Given** a user visits a public profile, **When** the page loads, **Then** only read-only summary content and recent publications are visible.
2. **Given** the visitor wants more detail, **When** they choose "Ver más", **Then** the full profile details open without enabling editing.
3. **Given** the authenticated user opens their account menu, **When** they choose "Editar Perfil", **Then** editing is available in an isolated flow.

---

### Edge Cases

- A user with zero careers can still browse the feed, but cannot create a career-bound publication until a career is assigned.
- A career with no active subjects appears as unavailable for publication creation.
- Inactive publications and comments are hidden from normal queries but remain in storage.
- Users cannot follow, mute, or block themselves.
- Blocking takes precedence over following if conflicting data exists.
- Search terms and filters must safely handle empty strings, accents, and very long input.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST prevent cross-render state updates between the mini chat widget and the full chat view.
- **FR-002**: The system MUST clean up subscriptions, refetch callbacks, and cache listeners when chat components unmount.
- **FR-003**: The system MUST store a canonical list of institutional careers.
- **FR-004**: The system MUST allow a user to be linked to multiple careers.
- **FR-005**: The system MUST allow publication creation to choose a career before a subject whenever the user has more than one career.
- **FR-006**: The system MUST filter selectable subjects by the selected career.
- **FR-007**: The system MUST allow feed search by text, career, and one or more subjects.
- **FR-008**: The system MUST hide inactive publications and comments from ordinary feed and comment queries.
- **FR-009**: The system MUST allow authors to edit their own publications and comments.
- **FR-010**: The system MUST allow authors, moderators, and administrators to deactivate publications and comments.
- **FR-011**: The system MUST preserve deactivated content in storage for audit and moderation purposes.
- **FR-012**: The system MUST allow users to follow, mute, and block other users.
- **FR-013**: The system MUST prioritize followed authors in the feed while excluding muted and blocked authors.
- **FR-014**: The system MUST expose dropdown actions for publication and comment ownership, moderation, and social interactions.
- **FR-015**: The public profile MUST be read-only by default and show a compact CV summary plus recent publications.
- **FR-016**: Profile editing MUST be available only through a dedicated authenticated edit action.
- **FR-017**: All new user-visible errors and empty states MUST be clear, localized, and non-destructive.

### Key Entities

- **Career**: Institutional academic program used to organize users and subjects.
- **UserCareer**: Association between a user and a career.
- **UserInteraction**: Relationship from one user to another with a single active interaction type.
- **Inquiry**: Publication that belongs to a subject and can be edited or deactivated.
- **Comment**: Comment or reply that can be edited or deactivated.
- **Subject**: Academic subject available within one or more careers.
- **PublicProfileSummary**: Read-only profile presentation containing identity, biography, career context, and recent publications.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Navigating between mini chat, full chat, and feed produces zero cross-render state warnings in the browser console.
- **SC-002**: A multi-career user can create a publication with career-filtered subjects in under 90 seconds.
- **SC-003**: Feed filtering by search, career, and subject returns only matching active content on the first attempt.
- **SC-004**: Edited publications and comments show updated content after reload in 100% of tested author flows.
- **SC-005**: Deactivated publications and comments are absent from normal feed/comment views after reload in 100% of tested cases.
- **SC-006**: Followed-author publications rank before non-followed content in the authenticated feed when both groups match the same filters.
- **SC-007**: Muted and blocked authors are excluded from the authenticated feed in 100% of tested cases.
- **SC-008**: Public profile pages can be viewed without exposing inline edit controls.

## Assumptions

- Existing authentication, roles, and moderation rules remain authoritative.
- The first implementation supports one soft-delete state: active or inactive.
- Blocking and muting affect the viewer's feed only; they do not delete or alter another user's content.
- Existing subjects can be linked to seeded careers using deterministic starter mappings.
- Public profile visibility uses currently available profile fields and does not add private CV attachments in this spec.
