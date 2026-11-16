# Feature Specification: Superadmin Security

**Feature Branch**: 119-superadmin-security
**Created**: 2026-06-18
**Status**: Draft
**Input**: Protect administrator accounts and require password confirmation before promoting another user to administrator.

## User Scenarios & Testing

### User Story 1 - Protect Existing Administrators (Priority: P1)

No authenticated administrator may change the role or active status of an account that already has administrator privileges.

**Why this priority**: Administrative lockout or hostile privilege removal would compromise platform recovery.
**Independent Test**: Attempt role and status mutations against an administrator account and verify both operations are rejected.

**Acceptance Scenarios**:

1. **Given** the target user is an administrator, **When** another administrator requests a role change, **Then** the request is rejected without modifying data.
2. **Given** the target user is an administrator, **When** another administrator requests deactivation, **Then** the request is rejected without modifying data.
3. **Given** an administrator row is displayed, **When** the panel renders, **Then** role and status controls are disabled.

---

### User Story 2 - Confirm Administrator Promotion (Priority: P1)

An administrator promoting a normal user to administrator must re-enter their own password and explicitly confirm the action.

**Why this priority**: Administrator promotion grants maximum privileges and requires stronger proof of intent and identity.
**Independent Test**: Promote a non-admin user with an incorrect password and then with the correct password; only the second request succeeds.

**Acceptance Scenarios**:

1. **Given** a non-admin target user, **When** the operator selects Administrador, **Then** the role is not changed immediately and a confirmation modal opens.
2. **Given** the modal is open, **When** the operator submits an incorrect password, **Then** the promotion is rejected and the modal shows the error.
3. **Given** the modal is open, **When** the operator submits the correct password and confirms, **Then** the target becomes an administrator and the list refreshes.

### Edge Cases

- Empty passwords are rejected before verification.
- Password values are never persisted, logged, cached, or returned.
- Canceling the modal clears both the pending target and password.
- Non-administrator role changes do not require password confirmation.

## Requirements

### Functional Requirements

- **FR-001**: Existing administrator roles MUST be immutable through system role-management operations.
- **FR-002**: Existing administrator accounts MUST NOT be deactivated through system status-management operations.
- **FR-003**: Administrator promotion MUST require the current operator password.
- **FR-004**: The supplied password MUST be verified against the authenticated operator stored password hash.
- **FR-005**: Failed password verification MUST leave the target user role unchanged.
- **FR-006**: The frontend MUST intercept administrator promotion and require explicit modal confirmation.
- **FR-007**: Administrator role and status controls MUST be disabled in the user grid.
- **FR-008**: Canceling or completing confirmation MUST clear sensitive local state.
- **FR-009**: Only authenticated administrators may invoke role and status mutations.

### Key Entities

- **Operator Administrator**: Authenticated account requesting the privileged action.
- **Target User**: Account whose role or status would change.
- **Account Credential**: Existing password hash used only for verification.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of tested attempts to modify existing administrators are rejected.
- **SC-002**: 100% of administrator promotions with an incorrect or empty password are rejected.
- **SC-003**: A correct operator password promotes the selected user in one confirmed workflow.
- **SC-004**: Backend and frontend production builds complete with zero errors.

## Assumptions

- The authenticated JWT contains the operator user ID and administrator role.
- Existing BCrypt password hashes remain the credential source of truth.
- This feature adds no new persisted fields or database migration.
