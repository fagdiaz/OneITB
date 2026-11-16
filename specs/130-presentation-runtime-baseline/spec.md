# Feature Specification: Presentation Runtime Baseline

**Feature Branch**: `130-presentation-runtime-baseline`

**Created**: 2026-06-23

**Status**: Implemented with blocked runtime checks documented

**Input**: Stabilize the project for presentation by resolving application-owned console errors and proving a reproducible local runtime without hiding warnings through browser, Vite, or local-only suppression.

## User Scenarios & Testing

### User Story 1 - Reproducible startup (Priority: P1)

A developer or evaluator can start the backend and frontend from the repository instructions and reach the authenticated application without environment-specific fixes.

**Why this priority**: A clean presentation requires the project to run outside the original developer machine.

**Independent Test**: Follow the documented runbook from a clean terminal session and verify that the backend, frontend, GraphQL endpoint, and authenticated feed load successfully.

**Acceptance Scenarios**:

1. **Given** the documented prerequisites are installed, **When** the backend and frontend are started, **Then** the app reaches the login and authenticated feed without backend crashes.
2. **Given** a required local dependency is missing, **When** startup fails, **Then** the failure is documented as a prerequisite with a concrete remediation step.
3. **Given** HTTPS, SQL Server, CORS, or WebSocket configuration is involved, **When** the app starts, **Then** the configuration uses repository-controlled settings or documented environment variables rather than hidden local browser filters.

---

### User Story 2 - Console ownership classification (Priority: P1)

A developer can distinguish application-owned errors from browser, extension, and third-party iframe warnings using reproducible evidence.

**Why this priority**: Fixing the wrong source wastes time and can introduce suppression that hides real failures.

**Independent Test**: Load the app in a clean browser profile, capture the console, and produce a finding table with source ownership, impact, and action.

**Acceptance Scenarios**:

1. **Given** `errores.txt` contains warnings and errors, **When** they are reviewed, **Then** each recurring entry is classified as application, backend, browser, extension, or third-party embed.
2. **Given** a finding is application-owned, **When** it is fixed, **Then** the fix is validated by rerunning the exact browser flow.
3. **Given** a finding is external, **When** it remains visible in a privacy-hardened browser, **Then** the project documents the source and avoids local suppression as a solution.

---

### User Story 3 - Presentation evidence gate (Priority: P2)

The team can decide whether the project is presentation-ready based on recorded runtime evidence, not assumptions or previous development notes.

**Why this priority**: The project has historical specs that were implemented but not always revalidated after later changes.

**Independent Test**: Review this spec evidence and confirm every presentation-critical flow is either verified or explicitly blocked with a concrete blocker.

**Acceptance Scenarios**:

1. **Given** the presentation checklist is executed, **When** builds, startup, login, feed, media, uploads, and chat are checked, **Then** the result is recorded with command or browser evidence.
2. **Given** a flow cannot be verified in the current environment, **When** the spec closes, **Then** the behavior remains marked blocked or unverified rather than complete.

### Edge Cases

- The browser profile injects warnings from privacy protection, extensions, or third-party embeds.
- A stale frontend process serves an older bundle after code changes.
- The backend starts on HTTP but not HTTPS because the development certificate is missing.
- SQL Server is installed but the current Windows account cannot authenticate.
- A removed endpoint is still referenced by cached frontend code.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide a reproducible startup path for backend and frontend using repository-controlled documentation.
- **FR-002**: The team MUST classify every recurring console entry from the current error capture by source ownership and action.
- **FR-003**: Application-owned console errors and warnings MUST be fixed at their source rather than hidden by local console filters.
- **FR-004**: Third-party or browser-owned warnings MUST be documented separately and MUST NOT be treated as solved by application code unless the app can change the integration safely.
- **FR-005**: The runtime validation MUST include an authenticated feed load in a clean browser profile.
- **FR-006**: The runtime validation MUST verify that no stale REST link-preview endpoint remains in the active frontend bundle.
- **FR-007**: The runtime validation MUST verify that required CORS origins, headers, methods, and WebSocket behavior are compatible with the documented local ports.
- **FR-008**: The final evidence MUST distinguish verified, fixed, external, and blocked items.

### Key Entities

- **Console Finding**: A recurring console entry with source, severity, ownership, affected flow, and resolution state.
- **Runtime Check**: A command or browser flow executed to prove startup, API, UI, or realtime behavior.
- **Presentation Gate**: A checklist item that must be verified or explicitly blocked before calling the project presentation-ready.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A clean browser profile shows zero application-owned console errors during login and authenticated feed load.
- **SC-002**: All recurring entries from `errores.txt` are classified with ownership and next action.
- **SC-003**: Backend and frontend startup instructions are sufficient to reproduce the validated environment from a clean terminal session.
- **SC-004**: Every presentation-critical flow is marked verified or blocked with evidence before implementation continues to lower-priority features.

## Assumptions

- Browser extension, privacy protection, and third-party iframe warnings may remain visible in some developer profiles.
- The project will not silence console output through DevTools filters, Vite configuration, or global monkey patches.
- Existing spec 129 changes remain pending and must be respected rather than reverted.
