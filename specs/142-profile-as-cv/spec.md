# Feature Specification: Profile as a CV

**Feature Branch**: `[142-profile-as-cv]`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "El perfil necesita refactorización. Quiero que el módulo actúe visual y funcionalmente como un CV (Currículum Vitae) del estudiante/profesional."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public profile reads like a professional CV (Priority: P1)

Any authenticated user can open another member's profile and understand their identity, role, professional summary, academic path, contact availability and recent academic/social activity without entering edit mode.

**Why this priority**: This is the main user value. The profile must become an institutional portfolio instead of a generic profile card.

**Independent Test**: Open `/profile/{id}` for another user and verify the view renders a CV-style hero, professional profile, careers, contact/social links and recent publications without edit controls.

**Acceptance Scenarios**:

1. **Given** an authenticated user views another active user's profile, **When** the profile loads, **Then** the page displays a large avatar, full name, role badge and biography as "Perfil profesional".
2. **Given** the profile has social or contact data, **When** the page renders, **Then** each available contact channel appears as a clear icon link or contact card.
3. **Given** the profile has enrolled careers or public activity, **When** the page renders, **Then** the education/trayectoria section summarizes careers and relevant subjects from public posts.

---

### User Story 2 - Owner can access CV editing only on own profile (Priority: P2)

The logged-in owner can access "Editar CV/Perfil" from their own profile, while public viewers see a read-only CV with no editing affordances.

**Why this priority**: It preserves privacy and avoids confusing public readers with owner-only controls.

**Independent Test**: Open `/profile` and `/profile/{otherId}` with the same session and verify the edit button appears only on `/profile`.

**Acceptance Scenarios**:

1. **Given** a user opens their own profile, **When** the profile renders, **Then** an "Editar CV/Perfil" action is visible and points to the CV editor.
2. **Given** a user opens another profile, **When** the profile renders, **Then** no edit action is displayed.

---

### User Story 3 - Academic status is summarized without exposing private data (Priority: P3)

The profile shows an academic trajectory summary using public data for others and private progress only for the owner.

**Why this priority**: It adds CV value while respecting privacy boundaries around grades and academic progress.

**Independent Test**: Open own profile and verify progress summary appears if available; open another profile and verify no private grade information appears.

**Acceptance Scenarios**:

1. **Given** a user views their own profile and has academic progress records, **When** the page loads, **Then** the profile summarizes approved/regular/in-progress subjects without exposing details elsewhere.
2. **Given** a user views another member's profile, **When** the page loads, **Then** only public careers and public publication subjects are shown.

### Edge Cases

- If biography is missing, the page shows a professional empty state without breaking layout.
- If social links are missing, the page shows a restrained "Sin redes cargadas" message.
- If the viewer is unauthenticated or session is incomplete, protected routes continue to guard access as before.
- If academic progress query fails on own profile, the CV still renders public profile data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The profile page MUST render as a modern CV/portfolio with a prominent hero section.
- **FR-002**: The hero MUST include avatar, full name, role and biography positioned as a professional profile.
- **FR-003**: The page MUST render contact and social links with visual icons when data exists.
- **FR-004**: The page MUST include an Education/Trayectoria section with enrolled careers and academic/public activity summary.
- **FR-005**: The "Editar CV/Perfil" action MUST be visible only when the logged-in user views their own profile.
- **FR-006**: Public profile views MUST NOT expose private academic grades or owner-only controls.
- **FR-007**: The page MUST remain responsive for mobile and desktop.
- **FR-008**: Missing optional fields MUST render graceful empty states.

### Key Entities

- **Public Profile**: The readable identity summary of a user, including name, role, biography, contact, social links, careers and publication count.
- **Academic Trajectory**: A presentation summary based on careers, public subjects and owner-only progress when available.
- **Profile Ownership State**: Whether the currently authenticated user is viewing their own profile.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can identify the profile owner's role, biography and career path within 10 seconds of opening the profile.
- **SC-002**: Public viewers never see an edit action on another user's profile.
- **SC-003**: The profile remains usable at mobile and desktop widths without horizontal scrolling.
- **SC-004**: Missing biography, social links or activity do not produce blank broken sections.

## Assumptions

- Existing authentication and profile GraphQL contracts remain the source of data.
- No backend schema change is required for this visual refactor.
- GitHub is not persisted today; only available stored social/contact fields are rendered.
- Private grade/progress data can be shown only to the profile owner when already available from the academic module.
