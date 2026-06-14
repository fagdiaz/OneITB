# Feature Specification: Realtime Private Messaging

**Feature Branch**: `104-realtime-private-messaging`

**Created**: 2026-06-14

**Status**: Complete

**Input**: User description: "Implement one-to-one private messaging for students and professors with persisted history, authenticated real-time delivery, and a responsive chat interface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exchange private messages (Priority: P1)

An authenticated user can select another active community member, review their shared
conversation, send a private message, and see the message appear immediately for both
participants without reloading the page.

**Why this priority**: Direct communication is the core value of the module and must work
independently of secondary indicators or administration features.

**Independent Test**: Sign in as two different users in separate sessions, open the same
conversation, send messages in both directions, and verify immediate delivery and
persistence after both sessions reload.

**Acceptance Scenarios**:

1. **Given** two authenticated users with an open conversation, **When** either participant
   sends valid text, **Then** both participants see one copy of the message within two
   seconds and the sender does not receive a duplicate.
2. **Given** a persisted conversation, **When** either participant reloads or reconnects,
   **Then** the same chronological history is restored.
3. **Given** an authenticated user, **When** they request a conversation with another user,
   **Then** only messages where both users are sender or receiver are returned.

---

### User Story 2 - Discover conversations and unread activity (Priority: P2)

An authenticated user can see eligible contacts, identify conversations with unread
messages, select a contact, and have received messages marked as read when the
conversation is viewed.

**Why this priority**: Users need a practical way to discover contacts and notice new
activity once real-time exchange exists.

**Independent Test**: Send a message while the receiver is viewing another conversation,
verify the unread indicator, open the sender's conversation, and verify the indicator is
cleared without a page reload.

**Acceptance Scenarios**:

1. **Given** a message arrives outside the active conversation, **When** the receiver views
   the contact list, **Then** the corresponding contact shows an unread indicator.
2. **Given** unread received messages, **When** the receiver opens that conversation,
   **Then** those messages become read and the visible unread indicator clears.
3. **Given** the contact list, **When** the current user views it, **Then** their own account
   is excluded and inactive accounts cannot be selected.

---

### User Story 3 - Recover from temporary connection failures (Priority: P3)

An authenticated user receives clear feedback when real-time delivery is temporarily
unavailable and can continue using persisted history after the connection is restored.

**Why this priority**: Real-time transport can disconnect even when the application and
database remain available; the module must fail visibly and recover safely.

**Independent Test**: Interrupt the real-time connection, send or receive a message after
reconnection, and verify that persisted history reconciles without duplicates or lost
messages.

**Acceptance Scenarios**:

1. **Given** a temporary real-time disconnection, **When** the connection is interrupted,
   **Then** the user sees a non-blocking connection status instead of a blank or broken UI.
2. **Given** the connection is restored, **When** the conversation synchronizes, **Then**
   missing persisted messages appear once and existing messages are not duplicated.

### Edge Cases

- A user attempts to message themselves.
- The receiver does not exist or has an inactive account.
- Message content is empty, whitespace-only, or exceeds the supported length.
- A user attempts to request or subscribe to another pair's private conversation.
- Two messages are sent almost simultaneously in opposite directions.
- A message arrives while the receiver is viewing a different conversation.
- The real-time connection reconnects after messages were persisted while disconnected.
- The same delivery event is received more than once.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST persist each private message with a unique identifier,
  sender, receiver, content, sent timestamp, and read state.
- **FR-002**: Every private message MUST reference two existing distinct users through
  explicit protected relationships.
- **FR-003**: Only authenticated active users MUST be allowed to query, send, receive, or
  mark private messages as read.
- **FR-004**: The acting sender MUST be derived from the authenticated session and MUST
  NOT be accepted from client-controlled input.
- **FR-005**: A user MUST only receive real-time events for messages in which that user is
  the sender or receiver.
- **FR-006**: Conversation history MUST include only messages exchanged between the
  authenticated user and the selected user.
- **FR-007**: Conversation history MUST be ordered deterministically and support bounded,
  incremental retrieval.
- **FR-008**: Message content MUST be trimmed, non-empty, and limited to 2,000 characters.
- **FR-009**: The system MUST reject self-messaging, nonexistent receivers, inactive
  receivers, and unauthorized conversation access with controlled errors.
- **FR-010**: A successfully persisted message MUST be delivered to both conversation
  participants without creating duplicate database records.
- **FR-011**: The client MUST reconcile real-time messages by unique identifier so repeated
  delivery events do not create duplicate bubbles.
- **FR-012**: The client MUST display explicit loading, empty, error, sending, and
  disconnected states in Spanish.
- **FR-013**: The contact list MUST exclude the authenticated user and inactive accounts.
- **FR-014**: Received unread messages MUST be identifiable by conversation.
- **FR-015**: Opening a conversation MUST mark its received unread messages as read and
  update the visible state without a full page reload.
- **FR-016**: The chat MUST be accessible from the authenticated navigation and the
  existing floating messaging action.
- **FR-017**: The chat interface MUST remain usable on mobile, tablet, and desktop widths.
- **FR-018**: Temporary real-time disconnections MUST recover by reconciling persisted
  history without losing or duplicating visible messages.
- **FR-019**: Private message content MUST NOT be exposed to users who are not participants.
- **FR-020**: The module MUST record controlled operational failures without exposing
  internal database or server details to clients.

### Key Entities

- **Private Message**: One immutable text communication sent by one user to another, with
  delivery ordering and read-state metadata.
- **Conversation**: The ordered view of all private messages exchanged by exactly two
  users; it is derived from message participants rather than stored as a separate record
  in this increment.
- **Contact Summary**: A selectable active user plus conversation metadata such as latest
  activity and unread count.
- **User**: An authenticated community member who can participate as sender or receiver.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Two authenticated users can exchange messages in both directions and see
  each new message within two seconds in normal local network conditions.
- **SC-002**: Reloading either participant's session restores 100% of messages sent during
  the validation conversation in deterministic order.
- **SC-003**: All tested attempts to read or subscribe to conversations belonging to other
  users are rejected without exposing message content.
- **SC-004**: Repeated delivery of the same event produces exactly one visible message.
- **SC-005**: Opening a conversation clears its unread indicator without reloading the page.
- **SC-006**: After a temporary connection interruption, the client restores the complete
  conversation without missing or duplicate messages.
- **SC-007**: The primary chat workflow can be completed at mobile and desktop widths
  without horizontal page overflow.
- **SC-008**: Backend and frontend validation commands complete with zero errors.

## Assumptions

- The existing JWT authentication and active-account rules remain the source of identity.
- All active application roles may use private messaging; the first validation focuses on
  student and professor accounts.
- Messages are plain text in this increment; attachments, editing, deletion, typing
  indicators, presence, group chats, and push notifications are out of scope.
- Read state is tracked per message because each conversation has exactly two participants.
- Message retention follows the application's existing database retention policy.
- The contact list reuses the existing user directory but exposes only fields required for
  messaging.
