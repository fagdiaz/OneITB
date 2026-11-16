# Feature Specification: Profile Data Binding Fixes

**Feature Branch**: `148-profile-data-binding-fixes`  
**Created**: 2026-06-29  
**Status**: Draft  
**Input**: Persist avatar uploads, allow editing academic career associations, and normalize identity casing for users.

## User Scenarios & Testing

### User Story 1 - Persistent avatar (Priority: P1)

As a user editing my profile, I need the selected profile photo to upload to the backend and remain visible after refresh.

**Independent Test**: Select an image, save the profile, refresh `/profile/edit` and `/profile`; the avatar URL remains loaded from the backend.

### User Story 2 - Editable academic identity (Priority: P1)

As a user, I need to select my institutional careers from the profile editor so the public profile shows my correct academic identity.

**Independent Test**: Select one or more careers in profile edit, save, refresh public profile, and verify the career chips match the selected careers.

### User Story 3 - Normalized identity casing (Priority: P1)

As a user of the social network, I need names and display identity values to appear with proper capitalization even if they were typed in lowercase during registration.

**Independent Test**: Register or normalize a user with lowercase first/last name and email; verify persisted and displayed first letters are uppercase where applicable.

## Requirements

- **FR-001**: The profile editor MUST upload avatar images through the authenticated REST upload endpoint.
- **FR-002**: The returned upload URL MUST be persisted through the profile GraphQL mutation.
- **FR-003**: The profile GraphQL contract MUST expose avatar URL on authenticated and public profile reads.
- **FR-004**: The profile editor MUST allow selecting one or more active careers.
- **FR-005**: Saving the profile MUST persist selected careers in `UserCareer`.
- **FR-006**: First name and last name MUST be normalized to title case at persistence boundaries.
- **FR-007**: Email display values MUST have an uppercase first character while login lookups remain case-insensitive.
- **FR-008**: Existing users with lowercase names MUST be normalized by migration or runtime update.

## Success Criteria

- **SC-001**: Avatar persists across page refreshes.
- **SC-002**: Career selections persist and are visible on public profile.
- **SC-003**: User `11111111@itbeltran.com.ar` no longer displays lowercase first/last name initials after migration.
- **SC-004**: Backend and frontend builds pass.
- **SC-005**: Runtime GraphQL validation confirms profile update/readback.

## Assumptions

- Avatar files reuse the existing `/api/upload` endpoint and upload policy.
- Career updates are user-owned and replace the user's current career links.
- Email login remains case-insensitive even if display casing is normalized.
