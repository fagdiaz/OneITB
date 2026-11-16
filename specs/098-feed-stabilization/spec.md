# Feature Specification: Expose Inquiry Author

**Feature Branch**: `098-feed-stabilization`

**Created**: 2026-06-13

**Status**: Complete

## User Scenarios & Testing

### User Story 1 - Read publication authors (Priority: P1)

As an authenticated user, I need every publication returned by the feed to
include its author so the feed can render author identity without failing the
whole request.

**Why this priority**: The missing author relationship causes the publication
query to return HTTP 400 and blocks the feed.

**Independent Test**: Query publications with their author identifier and name.
The request succeeds and each publication with a valid author reference returns
the related author.

**Acceptance Scenarios**:

1. **Given** an inquiry linked to an existing user, **When** inquiries are
   requested with author fields, **Then** the related author is returned.
2. **Given** the inquiry query requests the canonical author field, **When**
   the schema validates the request, **Then** no missing-field error is returned.
3. **Given** many inquiries are requested, **When** author data is selected,
   **Then** the operation does not execute one author query per inquiry.

### Edge Cases

- An inquiry with an invalid `UserId` must be rejected by relational integrity.
- Deleting a user referenced by an inquiry must be restricted.
- A client using non-canonical author field names remains outside this
  backend-only change and must be aligned separately.

## Requirements

### Functional Requirements

- **FR-001**: Every inquiry MUST expose its related author through a `user` field.
- **FR-002**: The author relationship MUST use the existing `UserId` reference.
- **FR-003**: Referenced users MUST NOT be cascade-deleted through inquiries.
- **FR-004**: Selecting authors for a collection of inquiries MUST avoid
  per-record author lookups.
- **FR-005**: The physical schema MUST only be migrated when the model introduces
  an actual database change.
- **FR-006**: No frontend or seed-data file may be modified.
- **FR-007**: Canonical schema fields remain English: `user`, `id`,
  `firstName`, and `lastName`.
- **FR-008**: The backend MUST temporarily accept the current feed fields
  `idUsuario`, `nombre`, and `apellidos` without removing the canonical fields.

### Key Entities

- **Inquiry**: Publication containing `UserId` and a required related `User`.
- **User**: Author referenced by one or more inquiries.

## Success Criteria

- **SC-001**: The publication query validates without a missing `user` error.
- **SC-002**: All returned publications with valid references include the
  requested author information.
- **SC-003**: Loading a page of publications does not produce one author lookup
  per publication.
- **SC-004**: The backend builds with zero errors.
- **SC-005**: No unnecessary database migration is generated.

## Assumptions

- The `Inquiries.UserId` foreign key and index already exist in the physical
  schema.
- HotChocolate projections remain enabled for the inquiry resolver.
- The current frontend field names are supported through temporary backend
  compatibility aliases because this feature is explicitly backend-only.
