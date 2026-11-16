# Feature Specification: Student Enrollment Onboarding

**Feature Directory**: `204-student-enrollment-onboarding`  
**Created**: 2026-08-04  
**Status**: Implemented; browser acceptance pending

## User Scenarios & Testing

### User Story 1 - Confirm one active career (Priority: P1)

As a Student without a confirmed academic identity, I select one active career, review
its name and code, explicitly confirm that I attend it, and then enter the private area.

**Why this priority**: Career membership determines the content, subjects and resources
the Student can access.

**Independent Test**: Use a Student with no career, select one option, cancel once, then
confirm. Access remains blocked until confirmation and the chosen career survives reload.

**Acceptance Scenarios**:

1. **Given** a Student without a career, **When** onboarding opens, **Then** exactly one
   career can be selected at a time.
2. **Given** one selected career, **When** the Student submits, **Then** a confirmation
   identifies that career before any data changes.
3. **Given** the confirmation is canceled, **When** the Student returns to selection,
   **Then** no association was persisted.
4. **Given** confirmation succeeds, **When** the private area unlocks, **Then** the current
   profile contains exactly the confirmed career.
5. **Given** Microsoft authentication succeeds, **When** OneITB hands off to onboarding,
   **Then** an institutional loading state is shown instead of a usable Login form flash.

---

### User Story 2 - Reconcile an over-scoped Student (Priority: P1)

As a Student whose account already contains several careers, I must explicitly choose the
single current career before continuing; the system does not silently discard data.

**Why this priority**: The observed institutional account selected three careers and
therefore received a broader academic scope than intended.

**Independent Test**: Start with three associations, enter a private route, choose one,
and verify the prior set remains unchanged until confirmation and becomes one afterward.

**Acceptance Scenarios**:

1. **Given** a Student with more than one career, **When** a private route is requested,
   **Then** reconciliation is required.
2. **Given** reconciliation fails, **When** the page recovers, **Then** the previous set
   remains intact and the private area remains blocked.
3. **Given** another role with legitimate multiple careers, **When** it navigates,
   **Then** Student-only reconciliation is not applied.

---

### User Story 3 - Explain future institutional validation honestly (Priority: P2)

As a project reviewer, I can identify a clear extension point where an authorized ITB or
SIU enrollment source could confirm career and subjects, while the current demo remains
explicitly manual.

**Why this priority**: It demonstrates scalable architecture without claiming access to
an external service or contract that the project does not possess.

**Independent Test**: Review configuration and documentation and verify that manual mode
works without an external provider, while provider mode cannot report a false success.

**Acceptance Scenarios**:

1. **Given** no institutional provider is configured, **When** onboarding runs, **Then**
   the system identifies the process as manual and remains fully usable.
2. **Given** a future provider is unavailable, **When** validation is attempted, **Then**
   the system does not invent enrollment data or weaken authorization.

### Edge Cases

- The selected career becomes inactive before confirmation.
- The same confirmation is submitted twice or from two tabs.
- The current session changes while onboarding is open.
- The identity callback briefly passes through the Login route while session state settles.
- Existing data contains duplicate or unknown career references.
- The institutional provider returns no match, several matches or an unknown external key.

## Requirements

### Functional Requirements

- **FR-001**: Manual onboarding for a Student MUST allow exactly one active career.
- **FR-002**: The system MUST require explicit confirmation naming the selected career
  before changing academic identity.
- **FR-003**: Canceling confirmation MUST perform no data change.
- **FR-004**: The system MUST validate the rule independently of the user interface.
- **FR-005**: A successful Student update MUST replace the previous active selection as
  one indivisible operation.
- **FR-006**: A Student with zero or multiple careers MUST remain outside private modules
  until the state is reconciled.
- **FR-007**: Self-service profile editing MUST enforce the same Student rule.
- **FR-008**: Roles permitted to hold several career associations MUST retain that ability.
- **FR-009**: The existing many-to-many academic history MUST remain compatible.
- **FR-010**: A future institutional enrollment source MUST be isolated behind a provider
  boundary and MUST become authoritative only when explicitly configured and accepted.
- **FR-011**: Manual/demo mode MUST be explicit and MUST NOT be represented as live SIU or
  ITB validation.
- **FR-012**: The enrollment extension point MUST remain distinct from grade synchronization.
- **FR-013**: A successful institutional handoff MUST not expose an actionable Login form
  between callback completion and onboarding/private-route resolution.

### Key Entities

- **Student**: Authenticated academic user whose current content scope requires one
  confirmed career in the manual flow.
- **Career**: Active institutional program available for confirmation.
- **Career Association**: Persisted relationship between a user and a career; supports
  broader historical/role scenarios while this feature constrains Student self-service.
- **Institutional Enrollment Result**: Future normalized answer containing only known
  career/subject references and an explicit availability status.

## Success Criteria

- **SC-001**: In all automated and manual Student scenarios, zero requests can persist
  more than one current career through onboarding or self-service editing.
- **SC-002**: Canceling confirmation changes zero career associations.
- **SC-003**: A successful confirmation is reflected in the current profile before private
  content becomes visible.
- **SC-004**: Existing Students with several careers receive a deterministic reconciliation
  path with no silent data loss.
- **SC-005**: All non-Student role regressions and authorization checks pass.
- **SC-006**: Project documentation identifies manual mode and the future provider boundary
  without claiming a completed external integration.
- **SC-007**: Successful institutional onboarding shows zero actionable Login frames after
  the provider returns.

## Assumptions

- The current academic relation remains the source of feed and resource scope.
- A real ITB/SIU enrollment API contract and credentials are not available in this sprint.
- The academic demonstration must remain functional in manual mode.
