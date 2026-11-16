# Feature Specification: Demo Database Rebaseline

**Feature Branch**: `codex/196-demo-database-rebaseline`

**Created**: 2026-07-29

**Status**: Approved

**Input**: Rebuild the local demonstration database from migrations and a canonical,
idempotent seed; prove role access and relational integrity; reconcile technical and
academic documentation with the resulting model.

## User Scenarios & Testing

### User Story 1 - Reproducible demonstration environment (Priority: P1)

As the project presenter, I need to reconstruct the local demonstration database from
an empty state so the defense does not depend on historical workstation data.

**Why this priority**: A stale database can invalidate credentials and make the live
demonstration non-reproducible.

**Independent Test**: Restore a clean database from migrations, seed it twice, and
verify that entity counts remain stable.

**Acceptance Scenarios**:

1. **Given** the identified local Docker SQL database and a verified backup, **When**
   the controlled rebaseline runs, **Then** the latest migration and canonical demo
   graph are present without orphaned rows.
2. **Given** an already seeded clean database, **When** the seed runs a second time,
   **Then** no duplicate account, relationship, post, message, resource, offer, or
   notification is created.
3. **Given** a destination that is not the approved local Docker database, **When**
   reset is requested, **Then** the operation aborts before destructive work.

---

### User Story 2 - Predictable role access (Priority: P1)

As the presenter, I need one known demo identity per role to authenticate with the
single externally configured demo password.

**Why this priority**: A valid UI with unusable credentials still blocks the defense.

**Independent Test**: Authenticate Administrator, Moderator, Professor, Student,
Graduate, and Employer identities without exposing tokens or password material.

**Acceptance Scenarios**:

1. **Given** a freshly seeded database, **When** each canonical demo account logs in,
   **Then** authentication succeeds and the expected role is returned.
2. **Given** the fresh seed, **When** account security state is inspected, **Then**
   failed-attempt counters are zero and lockout timestamps are empty.

---

### User Story 3 - Accurate institutional documentation (Priority: P2)

As an evaluator, I need runbooks, diagrams, and the final report to describe the
database and reset process that actually exist.

**Why this priority**: Contradictions between code, diagrams, and defense material
reduce technical credibility.

**Independent Test**: Compare the entity inventory produced from the rebuilt database
with every canonical model list and relationship diagram.

**Acceptance Scenarios**:

1. **Given** the verified rebuilt model, **When** canonical documentation is reviewed,
   **Then** entity names, relationships, seed behavior, credentials policy, and reset
   instructions agree with runtime evidence.
2. **Given** a credential change after initial seeding, **When** the runbook is read,
   **Then** it clearly states that normal idempotent seeding does not reset existing
   passwords and directs operators to the controlled demo-only reset.

### Edge Cases

- Backup creation, verification, or destination identity fails.
- The API or Vite process still holds a database connection.
- Migration drift is detected before destructive work.
- A seed phase fails after database recreation.
- A second seed changes counts.
- SQL contains orphaned foreign keys or invalid attachment ownership.
- Runtime validation cannot start without blocking the terminal.

## Requirements

### Functional Requirements

- **FR-001**: The process MUST identify and accept only the approved local Docker SQL
  destination before destructive work.
- **FR-002**: The process MUST create and verify a timestamped restorable backup first.
- **FR-003**: The backup and all generated operational evidence containing local data
  MUST remain outside version control.
- **FR-004**: The database MUST be reconstructed exclusively from reviewed migrations.
- **FR-005**: The canonical seed MUST cover role identities, academic structure,
  social content, messaging, notifications, academic resources/progress, and jobs.
- **FR-006**: The canonical seed MUST use stable identities and remain idempotent.
- **FR-007**: Demo passwords MUST come from non-versioned configuration and use the
  application password hashing policy.
- **FR-008**: Normal application startup MUST preserve existing passwords.
- **FR-009**: Any explicit password reset capability MUST be Development-only,
  deliberate, and limited to canonical demo identities.
- **FR-010**: Runtime checks MUST authenticate one canonical identity for every role.
- **FR-011**: Integrity checks MUST detect orphaned relationships, duplicate canonical
  keys, attachment XOR violations, comment depth violations, and migration drift.
- **FR-012**: Canonical technical and academic documents MUST be reconciled with the
  verified model and operational procedure.
- **FR-013**: Validation processes MUST be finite, logged, non-blocking, and cleaned up.
- **FR-014**: No password, JWT, hash, connection string, or SQL administrator secret
  may appear in tracked files or evidence.

### Key Entities

- **Demo environment**: Local SQL container, database identity, migration baseline,
  backup artifact, and non-versioned configuration.
- **Canonical seed graph**: Stable accounts/users, careers, subjects, social graph,
  academic records, jobs, messaging, notifications, and CV data.
- **Validation evidence**: Sanitized commands, counts, integrity results, role outcomes,
  and documentation reconciliation.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Backup verification completes before the database is removed.
- **SC-002**: Every migration applies from an empty database with zero pending model
  changes afterward.
- **SC-003**: Two consecutive seed executions produce identical inventory counts.
- **SC-004**: Six of six canonical role identities authenticate with their expected role.
- **SC-005**: Integrity audit returns zero orphan, duplicate, XOR, and depth violations.
- **SC-006**: Backend tests/build, frontend tests/build, and diff checks all pass.
- **SC-007**: Every canonical document containing model or reset guidance agrees with
  the verified database inventory.

## Assumptions

- The target is the disposable local demonstration database in `oneitb23-sql`.
- Production and external databases are outside scope and must never be contacted.
- The existing migration history remains the schema source of truth.
- Existing runtime uploads are not embedded in the SQL backup and are preserved.
- External SMTP, Cloudinary, Google SSO, and cloud deployment remain outside scope.
