# Feature Specification: Moderation Roles Safety

**Feature Branch**: `111-moderation-roles-safety`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Implement role Egresado, participation metrics, report counters, temporary user silence for moderators, and administrative account protection."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Protect Administrative Accounts (Priority: P1)

Administrators need administrative accounts to be protected from accidental role changes or deactivation in the management panel.

**Why this priority**: A mistaken change to an administrator account can block platform recovery and moderation.

**Independent Test**: From the user management panel, verify that administrator rows do not allow role or status changes and that backend mutations reject direct attempts.

**Acceptance Scenarios**:

1. **Given** an administrator is listed in user management, **When** another administrator views the row, **Then** role and status controls are disabled.
2. **Given** a direct mutation targets an administrator for role or status changes, **When** the mutation is executed, **Then** the operation is rejected.

---

### User Story 2 - Silence Users Temporarily (Priority: P1)

Moderators and administrators need to temporarily silence users for 24 hours, 3 days, or 1 week without disabling their accounts.

**Why this priority**: Temporary moderation is less destructive than deactivation and better matches community moderation needs.

**Independent Test**: Silence a non-admin user and verify that the user cannot create posts or comments while the silence is active.

**Acceptance Scenarios**:

1. **Given** a moderator selects a silence duration, **When** the target user is silenced, **Then** the user record shows a future muted-until timestamp.
2. **Given** a silenced user tries to publish or comment, **When** the action is submitted, **Then** the action is rejected with a moderation message.

---

### User Story 3 - Show Moderation Metrics (Priority: P2)

Moderators and administrators need concise counters for user activity and reports to decide whether moderation is necessary.

**Why this priority**: Decisions should be based on visible evidence, not manual database inspection.

**Independent Test**: Open the admin panel and verify user rows include activity metrics and report counts.

**Acceptance Scenarios**:

1. **Given** a user has posts, comments, likes received, or reports received, **When** the management panel loads, **Then** those counts are visible.
2. **Given** a publication has reports, **When** a moderator views the feed or publication management, **Then** the report counter is visible.

### Edge Cases

- Existing active silences are extended from their current end time.
- Expired silences no longer block publishing or commenting.
- Administrator accounts cannot be silenced, deactivated, or role-edited through moderation controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support the role label `Egresado` wherever user roles are displayed or selected.
- **FR-002**: System MUST store a nullable silence expiration timestamp for users.
- **FR-003**: Moderators and administrators MUST be able to silence non-administrator users for preset durations.
- **FR-004**: Silenced users MUST be blocked from creating publications and comments until the silence expires.
- **FR-005**: Administrator accounts MUST be protected from role changes, deactivation, and moderation silence.
- **FR-006**: System MUST expose user metrics for total posts, total comments, total likes received, and total reports received.
- **FR-007**: System MUST expose report counters for publications and comments where available.
- **FR-008**: User management MUST show short IDs, report counts, silence status, and protected admin controls.

### Key Entities

- **User**: Platform account with role, status, moderation silence timestamp, and activity metrics.
- **Inquiry**: Publication that can receive reactions, comments, and reports.
- **Comment**: User response to a publication or another comment.
- **CommunityReport**: Moderation signal associated with publication content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of administrator rows in user management have destructive controls disabled.
- **SC-002**: A silenced non-admin user is blocked from both publishing and commenting during the active silence window.
- **SC-003**: Moderator/admin views display user activity and report counters without requiring manual database checks.
- **SC-004**: Backend and frontend builds complete with zero errors after the change.

## Assumptions

- Existing authentication and role names remain the source of truth.
- `Egresado` is represented as a supported role label without introducing a separate role table.
- Comment-specific reports are not yet persisted; comment report counters may default to zero until that model exists.
