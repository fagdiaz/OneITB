# Feature Specification: QA Resolution and UX Polish

**Feature Branch**: local ignored spec  
**Created**: 2026-07-08  
**Status**: Draft  
**Input**: Manual QA regression found eight blocking polish issues before academic defense.

## User Scenarios & Testing

### User Story 1 - Employment queries remain usable under GraphQL hardening (Priority: P1)

As an authenticated user, I can open employment views without GraphQL rejecting valid nested job/application queries as too expensive.

**Independent Test**: Employment GraphQL operations compile against the schema and backend build passes with bounded depth and parser node limits.

### User Story 2 - Registration matches academic terminology (Priority: P1)

As a new institutional user, I register with name, surname, role, email, password and careers without being asked for an "Alias".

**Independent Test**: The registration form does not render Alias and the mutation still sends a valid username derived by the client.

### User Story 3 - Header, search filters and chat widget behave in constrained layouts (Priority: P1)

As a user in split-screen or smaller desktop widths, I can use the header, search filters and chat widget without horizontal scroll, invisible selections or persistent popovers.

**Independent Test**: Header containers use min-width-safe layout; selected search filters are visible; chat closes on route change and click outside.

### User Story 4 - Profile and password micro-interactions are polished (Priority: P2)

As a user, saving profile edits returns me to my profile, and password visibility buttons do not steal focus from password inputs.

**Independent Test**: Successful profile save navigates to `/profile`; password eye buttons prevent default mousedown in login and register.

## Functional Requirements

- **FR-001**: The system MUST keep GraphQL anti-DoS controls enabled while allowing legitimate employment/job application queries.
- **FR-002**: The public registration form MUST NOT ask users for Alias.
- **FR-003**: Registration MUST still provide a deterministic username value to the backend without relying on user-entered alias.
- **FR-004**: Header and layout containers MUST avoid horizontal page overflow on constrained widths.
- **FR-005**: Search career/subject selections MUST remain readable in light and dark contexts.
- **FR-006**: Successful profile save MUST redirect to `/profile`.
- **FR-007**: Mini chat widget MUST close on route changes and on outside clicks.
- **FR-008**: Login/Register password visibility buttons MUST NOT remove focus from the input.
- **FR-009**: Documentation MUST record the Spec 176 fixes in chronological inverse order.

## Edge Cases

- Registration users with repeated names must still receive unique backend IDs; username is not used as a persistent uniqueness constraint.
- The chat toggle button must not immediately close itself through the outside-click handler.
- GraphQL protection must not be disabled globally.
- Horizontal overflow must be fixed without hiding legitimate dropdown content.

## Assumptions

- The prompt says seven bugs but lists eight; Spec 176 resolves all eight.
- Removing Alias from backend means removing user-facing registration dependency on alias/username. The existing compatibility `User.alias` GraphQL field remains available to avoid breaking legacy UI fragments.
- Runtime browser validation may be blocked by the current execution environment; build/test evidence remains mandatory.

## Success Criteria

- **SC-001**: Registration can be completed without any visible Alias field.
- **SC-002**: Header and chat UI no longer create horizontal scroll in constrained desktop widths.
- **SC-003**: Password visibility toggles preserve typing focus.
- **SC-004**: Profile save sends the user back to the profile view.
- **SC-005**: Backend and frontend builds complete with zero compilation errors.
- **SC-006**: The development log has exactly one new top entry for Spec 176.
