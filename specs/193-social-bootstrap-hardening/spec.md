# Feature Specification: Social Policy and UI Bootstrap Resilience

**Feature Directory**: `specs/193-social-bootstrap-hardening`  
**Created**: 2026-07-27  
**Status**: Implemented `[I]`  
**Audit Source**: `docs/audit/FINAL_AUDIT_REPORT.md` (M3-M1 and M4-M1)

## Problem Statement

Administrative account silencing is enforced for posts, comments and comment reactions, but publication reactions bypass the same policy. Separately, the global React error boundary is nested inside Apollo and theme providers; failures while creating/rendering those providers can still produce an unrecoverable blank bootstrap.

## User Scenarios & Testing

### User Story 1 - Silencing has consistent social effects (Priority: P0)

A user with an active administrative silence cannot create or remove reactions on publications, matching the existing restrictions for posts, comments and comment reactions.

### User Story 2 - Personal mute remains a viewing preference (Priority: P1)

One user's `Mute` interaction continues to hide another user's content from that observer only. It is not confused with the administrative `MutedUntil` sanction.

### User Story 3 - Provider/bootstrap failures show a recovery screen (Priority: P0)

If Apollo client creation, ApolloProvider, ThemeProvider or the application tree throws during render/bootstrap, OneITB displays the institutional fallback instead of a blank page.

### User Story 4 - Normal startup and session behavior remain stable (Priority: P1)

Successful bootstrap creates one Apollo client, preserves theme/session behavior and does not introduce repeated clients, subscriptions or render loops.

## Functional Requirements

- **FR-001**: `ToggleReactionAsync` MUST enforce the same active-user and `MutedUntil` guard used by other social creation/reaction operations.
- **FR-002**: Rejected muted-user reactions MUST persist no insert/delete and emit no notification.
- **FR-003**: Existing reactions MUST remain unchanged when a muted user attempts to remove them.
- **FR-004**: Personal `InteractionType.Mute` feed filtering MUST remain semantically independent from administrative `User.MutedUntil`.
- **FR-005**: The global fallback MUST cover provider render failures, including lazy Apollo client creation and theme initialization.
- **FR-006**: Errors thrown before React can mount MUST be handled by an explicit bootstrap guard and rendered as the same institutional fallback.
- **FR-007**: Apollo client creation MUST remain singleton per application lifecycle and MUST not occur on every render.
- **FR-008**: The fallback MUST not require Apollo, theme or authentication context.
- **FR-009**: Error reporting MUST use a correlation/error ID and MUST not expose token, cache or personal data.
- **FR-010**: Recovery MUST offer a deterministic reload path and avoid reload loops.
- **FR-011**: Existing logout/session isolation and WebSocket cleanup from Spec 188 MUST remain intact.
- **FR-012**: Tests MUST inject failures at client factory, provider and child levels to prove coverage boundaries.

## Edge Cases

- Silence expires between guard evaluation and reaction write.
- Muted user already reacted and tries to unlike.
- User is inactive and muted.
- Apollo constructor throws synchronously before a React element is returned.
- Theme reads malformed local storage.
- Error fallback itself runs where `crypto.randomUUID` is unavailable.
- React StrictMode/double invocation in test/development.
- Reload repeatedly encounters a persistent configuration error.

## Success Criteria

- **SC-001**: Muted-user publication reaction tests show zero database and notification side effects.
- **SC-002**: Personal mute/feed behavior remains unchanged in regression tests.
- **SC-003**: Injected failures at bootstrap, Apollo provider, theme provider and application child all render a fallback.
- **SC-004**: Normal startup creates exactly one Apollo client and leaves no duplicate WebSocket connection.
- **SC-005**: Frontend/backend tests and builds pass; browser startup and muted-reaction smokes pass.

## Out of Scope

- Redesigning moderation policy or silence duration.
- Replacing React error boundaries with a monitoring vendor.
- Changing Apollo cache/session contracts.
- Adding offline mode.
