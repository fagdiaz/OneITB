# Feature Specification: End-to-End Subjects Module

**Feature Branch**: `118-end-to-end-subjects-module`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "Complete the administration subject module with mandatory career ownership, academic year, prerequisites, persistence, GraphQL, and admin UI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create an Academically Complete Subject (Priority: P1)

An administrator needs to create a subject with code, name, career, optional academic year, and optional prerequisites from the same career.

**Why this priority**: Subject creation is incomplete without academic ownership and prerequisite rules.

**Independent Test**: Create a subject from the administration panel, reload the page, and verify all academic fields remain visible.

**Acceptance Scenarios**:

1. **Given** an active career exists, **When** an administrator enters valid subject data, **Then** the subject is created and associated with that career.
2. **Given** existing subjects belong to the selected career, **When** the administrator selects prerequisites, **Then** those prerequisites are persisted with the new subject.
3. **Given** no career is selected, **When** the administrator submits the form, **Then** creation is blocked with a clear validation message.

---

### User Story 2 - Review Academic Rules (Priority: P1)

Administrators need the subject table to show code, name, career, year, and prerequisite names.

**Why this priority**: Academic configuration cannot be audited if relationships are hidden.

**Independent Test**: Open the subject management tab and verify every configured field is visible without opening an edit form.

**Acceptance Scenarios**:

1. **Given** subjects with and without prerequisites exist, **When** the list loads, **Then** the correct career, year, and prerequisite names are displayed.

---

### User Story 3 - Preserve Referential Integrity (Priority: P1)

The platform must prevent invalid prerequisite or career references and avoid cyclic cascade paths in the database.

**Why this priority**: Invalid academic references make publication filters and course planning unreliable.

**Independent Test**: Inspect the generated migration and verify both prerequisite foreign keys and the career foreign key use restricted deletion.

**Acceptance Scenarios**:

1. **Given** a prerequisite belongs to another career, **When** creation or update is attempted, **Then** the operation is rejected.
2. **Given** a referenced subject or career is in use, **When** deletion is attempted, **Then** the database does not cascade-delete dependent academic data.

### Edge Cases

- Duplicate prerequisite IDs are normalized before persistence.
- A subject cannot be its own prerequisite.
- Academic year is optional, but when supplied it must be between 1 and 6.
- Existing subject-to-career links are consolidated into one mandatory career per subject during migration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every subject MUST reference exactly one existing career.
- **FR-002**: A subject MAY define an academic year between 1 and 6.
- **FR-003**: A subject MAY reference zero or more prerequisite subjects.
- **FR-004**: Prerequisites MUST belong to the same career as the subject.
- **FR-005**: Duplicate and self-referencing prerequisite relationships MUST be rejected or normalized.
- **FR-006**: Subject, career, and prerequisite relationships MUST prevent cascading deletion.
- **FR-007**: Administrators MUST select a career before choosing prerequisites.
- **FR-008**: The prerequisite selector MUST only show subjects from the selected career.
- **FR-009**: The subject list MUST display code, name, career, year, and prerequisite names.
- **FR-010**: Existing subject-career data MUST be migrated to the new single-career model without creating duplicate ownership sources.

### Key Entities

- **Subject**: Academic subject with code, name, status, career, optional year, and prerequisites.
- **Career**: Institutional career that owns subjects.
- **Subject Prerequisite**: Directed relationship from a subject to a required prior subject.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a complete subject in one form and see it after reload.
- **SC-002**: 100% of listed subjects display their owning career.
- **SC-003**: Invalid cross-career prerequisite assignments are rejected in every tested attempt.
- **SC-004**: Database migration and application builds complete with zero errors.

## Assumptions

- A subject belongs to one career only; the previous many-to-many subject-career model is obsolete.
- If legacy data has multiple career links, the lowest career ID is retained deterministically during migration.
- Existing authentication and administrator authorization remain unchanged.
