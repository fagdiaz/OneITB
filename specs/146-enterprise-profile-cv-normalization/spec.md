# Feature Specification: Enterprise Profile CV Normalization

**Feature Branch**: `146-enterprise-profile-cv-normalization`  
**Created**: 2026-06-29  
**Status**: Draft  
**Input**: User requested the most enterprise-grade end-to-end implementation for Profile/CV persistence after reviewing the JSON-based MVP approach.

## User Scenarios & Testing

### User Story 1 - Persist CV as first-class structured data (Priority: P1)

As a student, graduate, professor, or administrator, I need profile and CV information to be stored as structured institutional data so it can be queried, audited, migrated, and extended without depending on opaque JSON documents.

**Independent Test**: Save profile basics plus experience, education, projects, skills, and languages; reload the profile editor and public profile; verify all data is read back from normalized records.

### User Story 2 - Preserve existing populated CV data during migration (Priority: P1)

As an administrator preparing the project for presentation, I need previously populated CV data to survive the upgrade from JSON persistence to normalized tables.

**Independent Test**: Run the database migration against a database containing `CvDataJson`; verify rows are created in the new CV tables before the legacy JSON column is removed.

### User Story 3 - Keep one coherent edit flow (Priority: P2)

As a user editing my profile, I need one save button and one source of truth for profile and CV data so the UI cannot diverge from the backend.

**Independent Test**: Edit all profile/CV sections in the current editor; verify Apollo sends one mutation and the backend updates a single user-owned CV graph.

## Requirements

- **FR-001**: The system MUST persist CV experience, education, projects, skills, and languages as normalized user-owned records.
- **FR-002**: The system MUST expose normalized CV sections through the authenticated profile query and public profile query.
- **FR-003**: The system MUST update profile basics and all CV sections through one authorized profile mutation.
- **FR-004**: The system MUST prevent users from editing another user profile unless they have administrator privileges.
- **FR-005**: The migration MUST move data from the legacy JSON field into normalized tables before removing the legacy field.
- **FR-006**: The UI MUST remove JSON/local-only persistence for CV data and use the normalized GraphQL contract.
- **FR-007**: CV section records MUST preserve ordering and hidden/visible flags.
- **FR-008**: Database relationships MUST avoid accidental cascade deletes for CV section records.

## Key Entities

- **User CV Experience**: Work or institutional experience owned by a user.
- **User CV Education**: Education or academic trajectory owned by a user.
- **User CV Project**: Portfolio or academic project owned by a user.
- **User CV Skill**: Technical or professional skill owned by a user.
- **User CV Language**: Language competency owned by a user.

## Success Criteria

- **SC-001**: A user can update profile basics and at least one item in every CV section in a single save action.
- **SC-002**: Reloading the profile editor after save shows the same values without using browser-local draft storage.
- **SC-003**: Existing demo CV data remains available after applying the normalization migration.
- **SC-004**: Backend and frontend production builds complete with zero errors.
- **SC-005**: Runtime GraphQL validation confirms normalized save and readback.

## Assumptions

- Existing JSON CV data is treated as transitional data and will not remain part of the public contract.
- Replacing a user's CV section rows during profile save is acceptable for the MVP because the UI edits the full CV document as one graph.
