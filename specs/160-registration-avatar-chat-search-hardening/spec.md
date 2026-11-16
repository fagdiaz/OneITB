# Feature Specification: Spec 160 Registration, Avatar, Chat and Search Hardening

**Feature Branch**: `160-registration-avatar-chat-search-hardening`
**Created**: 2026-07-03
**Status**: Draft
**Input**: QA hardening request for registration completeness, profile avatar retention/canvas bounds, chat unread/presence consistency, and smart academic filters.

## User Scenarios & Testing

### Scenario 1 - Complete Registration With Academic Identity

A new user registers with institutional credentials, confirms password, selects an allowed non-administrative role, selects at least one career, and is redirected to `/login` with a success message after account creation.

**Acceptance Criteria**

1. Registration form includes `Confirmar contraseña` and validates mismatch before submit.
2. Role choices are limited to `Estudiante`, `Profesor`, and `Egresado`.
3. Career selector consumes the existing careers query and requires at least one active career.
4. Successful registration does not auto-login silently or leave the user on the form; it redirects to `/login` with a success state/message.

### Scenario 2 - Profile Editing Retains Avatar and Bounds Canvas

A user edits profile/CV without selecting a new avatar and the existing avatar URL remains persisted. If the user edits the avatar, zoom and pan cannot leave blank canvas borders.

**Acceptance Criteria**

1. `updateProfile` sends the current avatar URL when no new file is produced.
2. Avatar editor prevents zooming out below the minimum cover scale.
3. Avatar editor clamps drag offsets so the rendered image always covers the output canvas.
4. Existing filter, rotation, flip, and vignette behavior remain intact.

### Scenario 3 - Chat Unread State and Realistic Presence

A user can identify unread notifications/messages globally and within the chat list. Received message bubbles show sender avatars. Fake online indicators are removed unless backed by persisted data.

**Acceptance Criteria**

1. Header notification bell shows an unread badge/count when unread notifications exist.
2. Header `Mensajes` navigation shows a badge/count when unread messages exist.
3. Chat conversation list highlights unread conversations with stronger typography/background and an indicator.
4. Message queries request `sender { avatarUrl }` and received message bubbles render sender avatar fallback-safe.
5. Hardcoded `En línea` copy is removed or replaced only by real persisted last activity data if available.

### Scenario 4 - Smart Search Filters

The global search renders only filters that are meaningful for the authenticated user's academic scope.

**Acceptance Criteria**

1. Career filter renders only when the user has more than one career or has a global role.
2. Subject filter dynamically follows selected/effective careers.
3. `Todas` visually checks all visible subject checkboxes.
4. Unchecking `Todas` clears all individual subjects.
5. Unchecking one subject while `Todas` is active disables `Todas` and leaves all other visible subjects selected.

## Requirements

- **REQ-001**: Registration must reject mismatched passwords client-side before GraphQL mutation.
- **REQ-002**: Registration UI must never expose administrative role choices.
- **REQ-003**: Registration must require at least one career and send selected career IDs through the existing or extended GraphQL registration contract.
- **REQ-004**: Profile update must preserve `avatarUrl` unless a new edited upload URL replaces it.
- **REQ-005**: Avatar canvas math must clamp zoom/pan to avoid blank borders.
- **REQ-006**: Chat queries and UI must expose unread state without hardcoded presence.
- **REQ-007**: Header badges must reflect unread notification/message state without breaking existing route glow.
- **REQ-008**: Smart filters must derive default career/subject scope from `me.userCareers` and never expand visibility beyond backend scoping.

## Constraints

- No administrative role assignment from public registration.
- No plaintext secrets or changes to production security posture.
- Business actions remain GraphQL; `/api/upload` remains the only REST exception.
- No new third-party dependencies for avatar editing.
- Tailwind v4 only for new UI.
- Preserve Spec 159 backend cross-career scoping.

## Out of Scope

- Real-time presence system unless an existing backend field already exists.
- Distributed pub/sub or cloud storage.
- Full automated test suite expansion beyond build validation for this sprint.
