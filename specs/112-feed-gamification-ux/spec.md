# Feature Specification: Feed Gamification UX

**Feature Branch**: `112-feed-gamification-ux`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Continue with the UX/gamification slice: clickable profile names, inline follow action, participation badges, administrator visual hierarchy, content explorer modals, and contextual feed search."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Social Context From Feed (Priority: P1)

Users need author names in publications and comments to open the public profile, and they need a fast inline follow action without opening the overflow menu.

**Why this priority**: The social graph is already present, but discovery is slow if every action is hidden behind menus.

**Independent Test**: Open the feed, click an author name, and verify navigation to `/profile/{id}`; click inline follow on another user and verify the action succeeds.

**Acceptance Scenarios**:

1. **Given** a feed publication authored by another user, **When** the viewer clicks the author name, **Then** the public profile route opens.
2. **Given** the same publication, **When** the viewer clicks the inline follow action, **Then** the platform records the follow interaction.

---

### User Story 2 - Show Lightweight Participation Badges (Priority: P2)

Users need compact badges beside names that indicate high participation through posts, comments, and likes received.

**Why this priority**: Badges help identify active or helpful members without changing the core ranking model.

**Independent Test**: Load feed items with user metrics and verify badges render only when thresholds are met.

**Acceptance Scenarios**:

1. **Given** an author has enough posts, comments, or likes, **When** their name appears, **Then** a small badge appears next to the role label.
2. **Given** an author has no qualifying activity, **When** their name appears, **Then** no participation badge appears.

---

### User Story 3 - Improve Moderator/Admin Review Surfaces (Priority: P2)

Moderators and administrators need stronger visual hierarchy for administrator content and modal previews for publications/comments in the admin panel.

**Why this priority**: Review workflows become faster when the relevant context is visible without route changes.

**Independent Test**: Open the admin publication/comment tabs and verify rows can open a modal with full content and related metadata.

**Acceptance Scenarios**:

1. **Given** content authored by an administrator, **When** it appears in feed or comments, **Then** the visual treatment is subtly blue and clearly identified.
2. **Given** a moderator opens a publication or comment row, **When** they click the row content, **Then** a modal shows the full text and metadata.

### Edge Cases

- Inline follow is hidden for the current user.
- Missing metric fields must not break rendering.
- Admin content hierarchy must be subtle enough not to overwhelm normal feed reading.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Author names in feed publications and comments MUST link to `/profile/{id}`.
- **FR-002**: Feed publications MUST expose an inline follow action for other authors.
- **FR-003**: Participation badges MUST be derived from user activity metrics already exposed by GraphQL.
- **FR-004**: Administrator-authored publications and comments MUST receive a subtle blue hierarchy treatment.
- **FR-005**: Publication and comment management tabs MUST provide modal previews for full review.
- **FR-006**: Feed search MUST remain unrestricted for administrators/moderators while normal users keep the existing filtered behavior.

### Key Entities

- **User**: Author with role and activity metrics.
- **Inquiry**: Feed publication with author, reports, reactions, and comments.
- **Comment**: Nested response with author and report count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate from visible feed author names to profiles in one click.
- **SC-002**: Inline follow can be completed from the publication card without opening a menu.
- **SC-003**: Admin publication/comment management can inspect full content in a modal without route navigation.
- **SC-004**: Frontend and backend builds complete with zero errors.

## Assumptions

- The metrics fields introduced in spec 111 are available from GraphQL.
- The existing `interactWithUser` mutation remains the source of truth for follow actions.
- No new database schema is required for this UX-only slice.
