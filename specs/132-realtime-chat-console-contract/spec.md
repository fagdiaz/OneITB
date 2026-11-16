# Feature Specification: Realtime Chat Console Contract

**Feature Branch**: `132-realtime-chat-console-contract`

**Created**: 2026-06-23

**Status**: Draft

**Input**: Validate and harden private chat and mini chat WebSocket lifecycle so expected navigation or shutdown does not pollute the console while real failures remain visible.

## User Scenarios & Testing

### User Story 1 - Chat lifecycle without false errors (Priority: P1)

A user can navigate between feed, mini chat, and full chat without false application-owned WebSocket errors.

**Why this priority**: Chat is a visible feature and previous fixes must not hide real realtime failures.

**Independent Test**: Navigate feed -> mini chat -> full chat -> feed while observing console and message delivery.

**Acceptance Scenarios**:

1. **Given** mini chat is collapsed, **When** the feed loads, **Then** no unnecessary subscription is opened.
2. **Given** chat is open, **When** a message arrives, **Then** the UI updates in realtime.
3. **Given** the user navigates away, **When** the socket closes normally, **Then** no false operation failure is logged.

### User Story 2 - Real failures stay visible (Priority: P2)

A developer can still see authentication, network, and subscription failures when they represent real bugs.

**Why this priority**: A clean console cannot come from hiding real failures.

**Independent Test**: Simulate unavailable backend or invalid token and verify the app reports the failure through controlled UI/error handling.

**Acceptance Scenarios**:

1. **Given** the backend is unavailable while chat is open, **When** a subscription fails, **Then** the failure remains observable and is not globally suppressed.

### Edge Cases

- Token expires while a WebSocket is open.
- The user rapidly switches routes.
- The same message arrives through history refetch and subscription event.

## Requirements

### Functional Requirements

- **FR-001**: Mini chat MUST avoid subscriptions while collapsed unless an explicit unread-count feature requires them.
- **FR-002**: Open chat MUST preserve authenticated realtime delivery.
- **FR-003**: Expected lifecycle socket closures MUST not be logged as operation failures.
- **FR-004**: Real authentication, backend, and subscription failures MUST remain visible through controlled error handling.
- **FR-005**: Browser runtime evidence MUST prove both clean lifecycle and actual message delivery.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Route transitions between feed, mini chat, and full chat produce zero false application-owned WebSocket console errors.
- **SC-002**: A sent message appears in the receiver chat without page reload.
- **SC-003**: Simulated backend or token failure remains visible and is not swallowed globally.

## Assumptions

- This spec is activated only if spec 130 proves remaining realtime findings are application-owned or if chat delivery cannot be verified.
