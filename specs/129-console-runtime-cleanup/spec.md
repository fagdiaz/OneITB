# Feature Specification: Frontend Console Runtime Cleanup

**Feature Branch**: `129-console-runtime-cleanup`
**Created**: 2026-06-19
**Status**: In progress
**Input**: Resolve the frontend console findings in `errores.txt` without hiding real failures.

## User Scenarios & Testing

### User Story 1 - Clean application console (Priority: P1)

An authenticated user opens the feed without application-owned errors or warnings filling the console.

**Why this priority**: Runtime noise hides actionable regressions.

**Independent Test**: Load the feed in a clean browser profile and inspect source-owned console output.

**Acceptance Scenarios**:

1. **Given** the mini chat is collapsed, **When** the page loads, **Then** it does not open an unnecessary message subscription.
2. **Given** chat is open and the backend is available, **When** a message arrives, **Then** real-time delivery still works.
3. **Given** a browser extension injects a script, **When** it warns, **Then** the warning is classified as external and is not concealed by application code.

### User Story 2 - Safe link previews (Priority: P1)

An authenticated user can preview a public link without exposing an anonymous server-side fetch primitive.

**Why this priority**: The current scheme-only validation permits server-side requests to internal hosts.

**Independent Test**: Accept a public URL and reject loopback, private, link-local, credential-bearing, nonstandard-port, and redirect-to-private targets.

**Acceptance Scenarios**:

1. **Given** an authenticated user requests a safe public page, **When** validation passes, **Then** bounded metadata is returned.
2. **Given** an unauthenticated request or unsafe target, **When** preview metadata is requested, **Then** no target content is fetched.
3. **Given** a slow, oversized, binary, or unsafe redirect response, **When** a limit is reached, **Then** preview generation fails without blocking the feed.

### Edge Cases

- The backend is unavailable while mini chat is collapsed.
- A page reload closes an existing WebSocket.
- DNS resolves a hostname to a private address or a redirect changes destination.
- Metadata is missing, malformed, or oversized.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST classify console entries by reported source ownership.
- **FR-002**: Collapsed mini chat MUST NOT subscribe until real-time data is needed.
- **FR-003**: Expected subscription shutdown MUST NOT be logged as a GraphQL operation failure.
- **FR-004**: Open chat MUST preserve authenticated real-time messaging.
- **FR-005**: Link preview generation MUST require an authenticated application contract.
- **FR-006**: Preview validation MUST reject local, private, link-local, multicast, unspecified, and credential-bearing destinations before every request.
- **FR-007**: Preview fetching MUST bound URL length, ports, redirects, duration, response size, content type, and metadata length.
- **FR-008**: Preview failures MUST remain non-blocking.
- **FR-009**: Validation MUST include clean-browser runtime evidence and affected builds.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A clean-browser feed load produces zero application-owned console errors and warnings.
- **SC-002**: Every defined unsafe target class is rejected before content is read.
- **SC-003**: A valid preview appears or fails gracefully within five seconds.
- **SC-004**: Feed and messaging builds complete without errors.

## Assumptions

- Extension-generated warnings are resolved in the browser profile, not suppressed in application code.
- JWT and `/graphql` remain the canonical protected contract.
- No database migration is required.
