# Feature Specification: Privacy Controls and SMTP Smoke Tests

**Feature Branch**: `175-privacy-controls-and-smoke-tests`

**Created**: 2026-07-08

**Status**: Ready for implementation

**Input**: User request to close the remaining roadmap privacy gap and add an admin-only SMTP smoke test without changing standardized product terminology.

## User Scenarios & Testing

### User Story 1 - Control profile visibility (Priority: P1)

A logged-in user can decide whether their profile is public or private from the profile editor.

**Why this priority**: This closes the only remaining functional profile privacy gap and protects sensitive CV/contact data.

**Independent Test**: A user toggles privacy in `/profile/edit`, reloads the profile, and the chosen state persists.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a public profile, **When** they switch it to private, **Then** the profile remains visible by name/role/avatar but sensitive details are hidden from unauthorized viewers.
2. **Given** the profile owner, **When** they view their own private profile, **Then** all CV/contact fields remain visible.
3. **Given** an administrator, moderator, or follower, **When** they view a private profile, **Then** they can see the full profile according to the institutional access rule.

---

### User Story 2 - Protect public profile queries (Priority: P1)

Public profile and search queries must not leak sensitive data for private profiles.

**Why this priority**: Frontend controls are insufficient; privacy must be enforced in GraphQL.

**Independent Test**: Query `publicProfile` and `searchPublicProfiles` as an unrelated user and verify masked details for private profiles.

**Acceptance Scenarios**:

1. **Given** a private profile and an unrelated viewer, **When** `publicProfile` is queried, **Then** biography, contact links, phone and CV collections are empty or null.
2. **Given** a private profile and search results, **When** a user searches profiles, **Then** the result marks the profile as private and hides career details.

---

### User Story 3 - Test SMTP configuration directly (Priority: P2)

An administrator can send a controlled SMTP test email without simulating a job application workflow.

**Why this priority**: This reduces demo and production risk for external mail configuration.

**Independent Test**: Admin executes `testSmtpConnection(targetEmail)` and receives a success boolean or controlled user error.

**Acceptance Scenarios**:

1. **Given** an administrator and valid SMTP settings, **When** they run the smoke test, **Then** the system sends a basic test email and returns `true`.
2. **Given** a non-admin, **When** they attempt the operation, **Then** GraphQL authorization rejects it.
3. **Given** invalid email input or SMTP failure, **When** the admin runs the test, **Then** the system returns a controlled error without exposing secrets.

### Edge Cases

- Existing users default to public profile to avoid breaking current behavior.
- Private profiles remain discoverable by name/role/avatar so social navigation does not become confusing.
- SMTP smoke test must not log passwords or provider secrets.

## Requirements

### Functional Requirements

- **FR-001**: Users MUST be able to switch their profile between public and private.
- **FR-002**: Profile privacy MUST persist across reloads and sessions.
- **FR-003**: Sensitive profile fields MUST be hidden from unauthorized viewers when the target profile is private.
- **FR-004**: The profile owner, administrators, moderators and followers MUST retain full profile visibility.
- **FR-005**: Search results MUST indicate when a profile is private and avoid exposing careers/contact/CV details for unauthorized viewers.
- **FR-006**: Administrators MUST be able to execute an SMTP smoke test against a target email.
- **FR-007**: SMTP smoke test failures MUST return controlled errors and MUST NOT expose configured secrets.
- **FR-008**: Documentation and roadmap status MUST reflect the privacy closure and SMTP pre-production tool.

### Key Entities

- **User**: Adds profile privacy preference.
- **UserInteraction**: Existing social relation used to authorize follower access.
- **SMTP smoke test**: Admin-only operation that sends a controlled email through the configured email sender.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can change profile visibility in under 30 seconds from `/profile/edit`.
- **SC-002**: Unauthorized profile viewers see zero CV/contact records for a private profile.
- **SC-003**: Admin SMTP smoke test returns a clear success/failure result in one operation.
- **SC-004**: Backend and frontend affected builds pass after implementation.

## Assumptions

- Existing `UserInteraction.Type == Follow` represents an approved follower relationship.
- Moderators receive full visibility for safety and moderation review.
- Private profiles remain searchable by display identity only.
- The existing email sender abstraction is reused.
