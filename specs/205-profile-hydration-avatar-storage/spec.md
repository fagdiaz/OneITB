# Feature Specification: Profile Hydration and Avatar Storage

**Feature Directory**: `205-profile-hydration-avatar-storage`  
**Created**: 2026-08-04  
**Status**: Implemented `[I]`; browser and real Cloudinary acceptance pending

## User Scenarios & Testing

### User Story 1 - Edit one stable profile (Priority: P1)

As a user opening profile editing, I see a stable loading state followed by my complete,
current data. Partial session labels never appear in editable inputs and a background
refresh never erases text I have started entering.

**Why this priority**: Visible data replacement undermines trust and can lose edits or
expose cached information from another session.

**Independent Test**: Delay the profile response, begin with a compact session identity,
and verify the form remains a skeleton until the full matching profile arrives once.

**Acceptance Scenarios**:

1. **Given** profile data is loading, **When** the editor renders, **Then** no partial or
   placeholder values appear in editable fields.
2. **Given** the full current profile arrives, **When** the editor becomes ready, **Then**
   every field and career reflects that profile in one stable transition.
3. **Given** the user has typed, **When** a background refresh completes, **Then** the
   unsaved input is preserved.
4. **Given** returned data belongs to another identity, **When** it is evaluated, **Then**
   the form remains blocked and offers controlled recovery.

---

### User Story 2 - Persist an avatar safely (Priority: P1)

As a user, I can crop and upload an avatar, save the profile and see the same image after
refresh. A failed upload or save preserves my previous avatar and other edits.

**Why this priority**: The current request reaching the upload route does not prove that
the image is stored and linked to the profile.

**Independent Test**: Exercise success, upload failure, save failure and save-without-new-
image; refresh profile and editor after each outcome.

**Acceptance Scenarios**:

1. **Given** a completed avatar edit, **When** upload succeeds, **Then** the candidate image
   is visibly awaiting profile save rather than reported as already persisted.
2. **Given** profile save succeeds, **When** the page is refreshed, **Then** the same avatar
   is displayed in profile, editor and header.
3. **Given** any stage fails, **When** recovery is shown, **Then** the previous persisted
   avatar remains available and retry is possible.
4. **Given** no new image was chosen, **When** other fields are saved, **Then** the current
   avatar is not cleared.

---

### User Story 3 - Know the active storage mode (Priority: P2)

As an operator, I can verify whether the environment uses local storage or an approved
cloud provider without exposing credentials and without breaking the local demonstration.

**Why this priority**: Conditional cloud support is not equivalent to a verified cloud
integration; evidence must state the selected mode honestly.

**Independent Test**: Validate local mode without cloud configuration and, only when safe
credentials exist, validate cloud mode separately.

**Acceptance Scenarios**:

1. **Given** no cloud provider is configured in Development, **When** an avatar is stored,
   **Then** the supported local fallback works and is identified as local.
2. **Given** cloud configuration is incomplete, **When** the application starts or uploads,
   **Then** it fails safely rather than claiming cloud persistence.

### Edge Cases

- The session changes while profile data or an upload is in flight.
- A late profile response arrives after the user has edited a field.
- The uploaded file succeeds but profile persistence fails.
- The stored URL is relative, absolute, expired or returns an image error.
- The editor unmounts while FileReader, preview or network work is active.

## Requirements

### Functional Requirements

- **FR-001**: Editable data MUST come only from the complete current profile matching the
  active identity.
- **FR-002**: The editor MUST show a stable loading state until that profile is ready.
- **FR-003**: Initial data MUST be applied once per identity session and MUST NOT overwrite
  dirty user input.
- **FR-004**: Missing, mismatched or failed profile data MUST produce controlled recovery.
- **FR-005**: Career editing MUST obey the role rules established by Spec 204.
- **FR-006**: Avatar storage and profile association MUST complete in a defined order with
  visible progress for each outcome.
- **FR-007**: The previous avatar MUST be preserved until the new profile association is
  confirmed.
- **FR-008**: Saving without a new image MUST retain the existing avatar.
- **FR-009**: Temporary previews and in-flight work MUST be released when replaced,
  canceled or unmounted.
- **FR-010**: Local storage MUST remain a supported Development fallback.
- **FR-011**: Cloud storage MUST be represented as active only after real configuration
  and a successful environment-specific check.
- **FR-012**: Relative and absolute approved avatar locations MUST render safely with an
  accessible fallback if loading fails.

### Key Entities

- **Current Profile**: Complete editable identity and CV data for the authenticated user.
- **Editor Draft**: Local, potentially dirty values not yet persisted.
- **Avatar Candidate**: Edited image awaiting storage and profile association.
- **Storage Mode**: Explicit local or cloud environment selection, without credentials in
  client-visible state.

## Success Criteria

- **SC-001**: Under delayed data loading, editable fields display zero provisional values.
- **SC-002**: Background refreshes erase zero dirty fields.
- **SC-003**: Saving without a replacement image clears zero existing avatars.
- **SC-004**: Every successful avatar flow survives full page refresh in profile, editor
  and header.
- **SC-005**: Every tested failure path preserves the previous persisted avatar and offers
  a retry or safe exit.
- **SC-006**: Evidence always names local versus verified cloud mode without secrets.

## Assumptions

- Spec 204 is complete before final career-editor acceptance.
- Local file storage is the canonical no-credential Development mode.
- Cloud credentials are never provided through frontend environment variables.
