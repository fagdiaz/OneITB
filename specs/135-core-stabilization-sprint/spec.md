# Feature Specification: Core Stabilization Sprint

**Feature Branch**: `135-core-stabilization-sprint`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "Sprint de Estabilizacion y Cierre Core: validar runtime specs 118, 119, 121 y 122; arreglar bugs vivos; implementar paginacion del feed, limpieza de uploads huerfanos y auditoria persistente de moderacion."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verify Deferred Core Workflows (Priority: P1)

As a project owner preparing the system for presentation, I need the previously implemented subjects, superadmin security, file upload, and rich media comment workflows to be verified against a live local environment so that roadmap status reflects actual working behavior instead of compile-only confidence.

**Why this priority**: This is the current stabilization blocker. New P1 work should not be trusted until existing core workflows are exercised in runtime.

**Independent Test**: Can be fully tested by starting the local backend, executing the affected authenticated operations, uploading a real educational file, and confirming persisted data can be read back without console or server errors.

**Acceptance Scenarios**:

1. **Given** the local backend is running and an administrator is authenticated, **When** the administrator creates a subject with career, year, and prerequisites, **Then** the subject is persisted and returned with its academic relationships.
2. **Given** an administrator is authenticated, **When** the administrator promotes a normal user to administrator with password confirmation, **Then** the promotion succeeds only with the correct password and administrator accounts remain protected from role/status changes.
3. **Given** an authenticated user has a valid attachment, **When** the user uploads the file and creates a publication or comment with it, **Then** the file URL is persisted and rendered/read back as the correct media type.
4. **Given** invalid or unauthorized requests are executed, **When** the system rejects them, **Then** the rejection is explicit and does not leave inconsistent database or file state.

---

### User Story 2 - Paginated Feed Consumption (Priority: P1)

As a student or professor using the feed, I need publications to load incrementally so that the wall remains responsive as the amount of content grows.

**Why this priority**: Feed performance is central to the social core and currently risks slow loads and excessive payloads.

**Independent Test**: Can be fully tested by loading the first page of the feed, requesting the next page, and confirming there are no duplicates, missing items, or broken filters.

**Acceptance Scenarios**:

1. **Given** the feed has more publications than the first visible page, **When** the user requests more results, **Then** the next group is appended without duplicating existing publications.
2. **Given** the user applies search, career, or subject filters, **When** the user paginates, **Then** all returned publications continue to respect the same filters and social visibility rules.
3. **Given** no more publications are available, **When** the user reaches the end, **Then** the interface clearly stops requesting more items.

---

### User Story 3 - Orphan Upload Cleanup (Priority: P1)

As a maintainer, I need uploaded files that are not linked to any publication or comment to be removed automatically after a safe waiting period so that the local storage does not accumulate unused files.

**Why this priority**: The existing detached upload flow can create files before GraphQL persistence succeeds, so cleanup is required for operational stability.

**Independent Test**: Can be fully tested by creating an old unlinked file and confirming the cleanup process deletes it while preserving files referenced by existing content.

**Acceptance Scenarios**:

1. **Given** an uploaded file is not referenced by any active or historical content and is older than the retention window, **When** cleanup runs, **Then** the file is removed from storage.
2. **Given** an uploaded file is referenced by a publication or comment, **When** cleanup runs, **Then** the file is preserved.
3. **Given** cleanup encounters a locked or inaccessible file, **When** cleanup runs, **Then** the failure is logged and the process continues with other files.

---

### User Story 4 - Persistent Moderation Audit (Priority: P1)

As an administrator, I need moderation actions to be recorded persistently so that user, publication, comment, report, silence, and status changes can be reviewed later.

**Why this priority**: Moderation changes currently alter state without a durable accountability trail, which weakens presentation readiness and operational integrity.

**Independent Test**: Can be fully tested by performing moderation actions and confirming an administrator can retrieve the audit records with actor, action, target, timestamp, and context.

**Acceptance Scenarios**:

1. **Given** a moderator or administrator changes content or user status, **When** the operation succeeds, **Then** an audit record is stored with actor, action, target type, target identifier, timestamp, and summary.
2. **Given** an unauthorized moderation attempt is rejected, **When** the operation fails, **Then** no success audit record is created.
3. **Given** an administrator opens the administration panel, **When** audit records exist, **Then** the administrator can review the latest moderation actions in chronological order.

---

### Edge Cases

- The backend starts but the database schema is behind the current code.
- Existing seeded users or content are missing from a fresh local database.
- A file upload succeeds but the subsequent content mutation fails.
- A feed item is soft-deleted between page requests.
- Multiple feed items share the same creation timestamp.
- A cleanup run overlaps with a user uploading a new file.
- Moderation actions target users or content that are already inactive.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST verify the subjects workflow with career, year, and prerequisite data against a live local environment.
- **FR-002**: The system MUST verify administrator promotion and administrator-account protection against a live local environment.
- **FR-003**: The system MUST verify publication and comment file upload, persistence, and media rendering/readback against a live local environment.
- **FR-004**: The system MUST update roadmap verification status only when runtime evidence proves the workflow works.
- **FR-005**: Users MUST be able to load the feed in pages while preserving search, career, subject, and social visibility rules.
- **FR-006**: Paginated feed results MUST use a deterministic ordering that prevents duplicates and missing items between page requests.
- **FR-007**: The system MUST automatically remove unreferenced uploaded files after a safe retention window.
- **FR-008**: The cleanup process MUST preserve all files referenced by publications or comments.
- **FR-009**: The cleanup process MUST tolerate individual file failures and continue processing remaining files.
- **FR-010**: The system MUST persist successful moderation actions with actor, action, target, timestamp, and contextual details.
- **FR-011**: Administrators MUST be able to review persisted moderation audit entries.
- **FR-012**: Failed or unauthorized moderation attempts MUST NOT be recorded as successful moderation actions.
- **FR-013**: Runtime evidence MUST include executed commands, request outcomes, and any bug fixes made during the sprint.

### Key Entities *(include if feature involves data)*

- **Feed Page**: A bounded group of publications returned with enough navigation information to request the next group safely.
- **Upload File**: A physical file stored by the application that may or may not be referenced by a publication or comment.
- **Moderation Audit Entry**: A durable record of a successful moderation action, including who acted, what changed, which target was affected, and when it occurred.
- **Verified Workflow Evidence**: A record of runtime checks executed for previously compile-only features.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the previously deferred workflows in scope are either runtime-verified or explicitly documented with a blocking defect and reproduction steps.
- **SC-002**: Feed users can load additional publications without duplicate items across at least three consecutive page requests.
- **SC-003**: Referenced uploaded files are preserved and old unreferenced uploaded files are removed during cleanup validation.
- **SC-004**: At least three distinct moderation action types create reviewable audit entries.
- **SC-005**: The sprint closes with successful backend build, frontend build when affected, and at least one live GraphQL smoke test for each changed contract.

## Assumptions

- The local backend unblock from the previous spec remains valid and LocalDB is the target development database.
- Seeded users and roles are available or can be regenerated by the existing initializer.
- The feed should prefer a cursor-style user experience, but deterministic offset pagination is acceptable if it preserves filters and ordering.
- Upload cleanup should use a conservative retention window so newly uploaded files are not deleted before the related content mutation completes.
- Audit visibility is restricted to administrators unless existing project permissions already support moderators viewing a subset.
