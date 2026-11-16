# Feature Specification: Local Infrastructure and Moderator Acceptance

**Feature Branch**: `195-local-infrastructure-qa`

**Created**: 2026-07-28

**Status**: Complete

**Input**: Validate the locally controllable Moderator, distributed notification and
email-delivery gates without external provider credentials or blocking development
servers.

## User Scenarios & Testing

### User Story 1 - Reproducible Moderator Identity (Priority: P1)

As the academic demonstration operator, I can initialize a stable Moderator account and
exercise its permitted and denied operations without manually repairing the database.

**Why this priority**: The final role matrix cannot be demonstrated while one canonical
institutional role is absent from the reproducible dataset.

**Independent Test**: Initialize demo data twice, authenticate the Moderator and execute
representative moderation and administrator-only operations.

**Acceptance Scenarios**:

1. **Given** an empty demonstration database, **When** demo data is initialized, **Then**
   exactly one active Moderator identity exists with a valid hashed password.
2. **Given** an existing Moderator whose password changed, **When** initialization runs
   again, **Then** the account is not duplicated and its password is not overwritten.
3. **Given** an authenticated Moderator, **When** they silence a user or hide/restore
   reported content, **Then** the operation is allowed and persistently audited.
4. **Given** an authenticated Moderator, **When** they attempt to edit another author's
   text, change an administrator role or deactivate an administrator, **Then** the
   operation is rejected without a write.

---

### User Story 2 - Isolated Local Realtime Delivery (Priority: P1)

As the operator, I can prove that two independent application instances exchange a
targeted event through the configured local distributed transport without leaking it to
an unrelated identity.

**Why this priority**: In-memory delivery cannot demonstrate horizontal scalability or
recipient isolation.

**Independent Test**: Subscribe through one independently configured application
provider, publish through another and assert exactly one correctly targeted event within
a bounded deadline.

**Acceptance Scenarios**:

1. **Given** two independent providers sharing the local distributed transport,
   **When** provider B publishes an event, **Then** provider A receives it exactly once.
2. **Given** subscriptions for two different recipients, **When** a private event is
   emitted for one recipient, **Then** the other recipient receives nothing.
3. **Given** unavailable local transport, **When** the test starts, **Then** it fails
   with a sanitized diagnostic rather than claiming a verification.
4. **Given** the no-server constraint, **When** a network WebSocket handshake cannot be
   proven in-process, **Then** that sub-gate remains explicitly blocked.

---

### User Story 3 - Captured Local Email Delivery (Priority: P1)

As the operator, I can send employment and configuration emails through a local SMTP
capture service and verify their safe content without contacting the public internet.

**Why this priority**: Unit mocks do not prove network SMTP configuration, while a real
provider is unavailable during this session.

**Independent Test**: Send bounded test messages, query the capture service and verify
recipient, subject and redacted content before deleting the fixtures.

**Acceptance Scenarios**:

1. **Given** a healthy local SMTP capture service, **When** the application email adapter
   sends a message, **Then** exactly one matching message is captured.
2. **Given** an application-status transition, **When** its notification is sent, **Then**
   the captured subject and recipient match the institutional contract.
3. **Given** captured email content, **When** it is inspected, **Then** it contains no
   password, access token, connection string or internal exception.
4. **Given** absent production credentials, **When** local acceptance completes, **Then**
   production SMTP remains blocked rather than being reported as verified.

---

### User Story 4 - Finite Pre-Production Gate (Priority: P2)

As the operator, I can run one finite command that starts only local supporting
infrastructure, executes all relevant checks and removes everything it owns.

**Why this priority**: A repeatable result is necessary for the academic defense and
prevents late-night manual setup from creating misleading evidence.

**Independent Test**: Run the command from a clean terminal and verify its exit code,
gate summary, fixture cleanup and released ports.

**Acceptance Scenarios**:

1. **Given** available container tooling, **When** the gate runs, **Then** every executed
   test/build completes and the command returns control.
2. **Given** a failing gate, **When** cleanup runs, **Then** acceptance containers,
   temporary messages and owned fixtures are still removed.
3. **Given** an unrelated SQL container or local file, **When** cleanup runs, **Then** it
   is not stopped, reset or deleted.

### Edge Cases

- Container images cannot be downloaded or the container engine is unavailable.
- Default acceptance ports are occupied by unrelated processes.
- Demo password configuration is absent or the demo database already contains users.
- A repeated seed encounters an existing Moderator account with a user-managed password.
- Distributed transport connects but a subscription times out or receives duplicates.
- The capture service accepts SMTP but its HTTP inspection endpoint is unavailable.
- Cancellation occurs during publication, delivery or cleanup.
- A test fails before all resources are constructed.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST create exactly one canonical Moderator identity when demo
  initialization is enabled.
- **FR-002**: Repeated initialization MUST preserve an existing account password and MUST
  NOT duplicate the Moderator account or profile.
- **FR-003**: The Moderator identity MUST receive a signed session carrying only the
  canonical Moderator role.
- **FR-004**: Moderator permissions MUST allow silence, report processing and reversible
  content visibility changes while denying author text edits and administrator account
  management.
- **FR-005**: Every successful Moderator visibility action MUST retain a reason and an
  audit record.
- **FR-006**: Session replacement MUST remove the previous identity, protected cached
  data and realtime transport before accepting the next identity.
- **FR-007**: Late results from a terminated session MUST NOT repopulate the next
  session's protected state.
- **FR-008**: The local distributed transport MUST be exercised by two independently
  configured providers against a real local service.
- **FR-009**: Distributed events MUST be delivered exactly once to the intended topic
  within a bounded timeout.
- **FR-010**: Private event tests MUST prove that an unrelated recipient observes no
  event.
- **FR-011**: The local SMTP adapter MUST communicate with a real local capture service
  and the captured message MUST be inspected through an independent channel.
- **FR-012**: Local email evidence MUST validate recipient, subject and absence of secret
  material.
- **FR-013**: Local validation MUST NOT elevate external SMTP, Cloudinary or Google SSO
  to verified status.
- **FR-014**: The acceptance workflow MUST NOT launch a foreground application or
  development server.
- **FR-015**: The workflow MUST use bounded timeouts, process-only configuration and
  cleanup that targets only acceptance-owned resources.
- **FR-016**: The default workflow MUST stop acceptance containers and release their
  ports even after a failed gate.
- **FR-017**: The workflow MUST execute affected test suites, production builds, model
  consistency and repository hygiene checks.
- **FR-018**: Logs, reports and committed files MUST NOT contain credentials, tokens,
  connection strings, captured message bodies or personal test data.
- **FR-019**: Network WebSocket verification MUST remain blocked when it cannot be
  executed without violating the no-server constraint.
- **FR-020**: Every verified, blocked or failed gate MUST record evidence and an exact
  reason.

### Key Entities

- **Canonical Moderator**: Stable demonstration identity, account, role and optional
  career associations used for repeatable authorization checks.
- **Acceptance Container**: Ephemeral supporting service created and owned by one
  validation run.
- **Distributed Event Probe**: Bounded publish/subscribe fixture with topic, recipient,
  payload, deadline and observed delivery count.
- **Captured Email Fixture**: SMTP message created by a validation run and removed after
  its metadata/content contract is checked.
- **Acceptance Gate**: Named result with status, evidence and cleanup outcome.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Two consecutive demo initializations produce exactly one active Moderator
  and preserve an existing password hash.
- **SC-002**: All representative permitted and denied Moderator operations produce the
  expected authorization result with zero unintended writes.
- **SC-003**: A cross-provider event is received exactly once within 10 seconds and an
  unrelated recipient receives zero events.
- **SC-004**: At least three local SMTP scenarios are captured and validated with zero
  secret-pattern matches.
- **SC-005**: The session A-to-B regression exposes zero protected entities from session
  A after session B starts.
- **SC-006**: The complete workflow returns control with a deterministic exit code and
  leaves zero acceptance containers, fixtures or occupied acceptance ports.
- **SC-007**: All affected automated suites and production builds finish with zero
  errors.
- **SC-008**: 100% of unavailable external-provider/network gates remain explicitly
  blocked with their exact dependency.

## Assumptions

- SQL Server Docker remains the canonical local persistence runtime and is not recreated
  or reset by this feature.
- Demo initialization receives its password through existing non-versioned
  configuration.
- External provider credentials will remain unavailable throughout this specification.
- Container image downloads may require network access, but no public email or identity
  provider call is permitted.
- Local service verification may use process-only dummy credentials accepted by the
  capture service.
- No new business feature or production schema change is required.
