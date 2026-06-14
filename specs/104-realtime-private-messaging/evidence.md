# Evidence: Realtime Private Messaging

**Feature**: `104-realtime-private-messaging`  
**Verified**: 2026-06-14  
**Branch**: `104-realtime-private-messaging`

## Baseline

- The project had no persisted `Message` entity, messaging service, GraphQL
  conversation operations, subscription type, Apollo WebSocket link or `/chat` UI.
- Existing uncommitted spec 103 file-upload changes were preserved in shared backend and
  frontend files.
- `graphql-ws` was not installed. Apollo Client 3.7 requires the compatible 5.x line, so
  `graphql-ws@5.16.2` was installed with the existing dependency tree.

## Persistence And EF Core

- Migration: `20260614022436_AddPrivateMessaging`.
- Table: `Messages`.
- Explicit foreign keys: `SenderId` and `ReceiverId`.
- Both user relationships use `DeleteBehavior.Restrict`.
- Indexes verified in the migration:
  - `(SenderId, ReceiverId, SentAt, Id)`
  - `(ReceiverId, SenderId, SentAt, Id)`
  - `(ReceiverId, IsRead, SentAt)`
- `dotnet ef database update`: `Done.`
- `dotnet ef migrations has-pending-model-changes`: no model changes pending.
- Runtime sends persisted records and a later conversation query recovered a message sent
  while the receiving socket was disconnected.

## Build Evidence

### Backend

Command:

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
```

Result: successful, `0` warnings and `0` errors.

### Frontend

Command:

```powershell
npm.cmd run build
```

Result: successful with Vite 8.0.16, 316 modules transformed and `0` build errors.
Vite still reports the existing deprecation warning for the React plugin `esbuild` option.

## GraphQL Contract

Introspection against the isolated backend confirmed:

- Query `messagingContacts(first, after, last, before)`.
- Query `conversation(otherUserId, first, after, last, before)`.
- Mutation `sendMessage(receiverId, content)`.
- Mutation `markConversationRead(otherUserId)`.
- Subscription `messageReceived` with no client-supplied user identifier.

HTTP operations without JWT were rejected. The socket interceptor rejected a
`connection_init` without JWT before a subscription could start.

## Runtime Integration

The reproducible test is
`specs/104-realtime-private-messaging/runtime-test.mjs`.

Final execution used an isolated API at `http://localhost:5114/graphql` and
`ws://localhost:5114/graphql`:

- Student, teacher and admin logins succeeded.
- Student and teacher received exactly one event for the same persisted message ID.
- Admin received zero events for the student-teacher message.
- An unauthenticated socket was rejected.
- Empty and self-directed messages were rejected.
- Teacher unread count increased and `markConversationRead` cleared persisted unread state.
- A message sent while the student socket was disconnected appeared in conversation history
  after reconnect.
- Contact projection including `lastMessageAt` executed as one composable EF query; no
  per-contact resolver or N+1 loop is used.

Final persisted message IDs from the automated run:

- `4ec95931-e9a8-4fc1-9968-705378827d82`
- `811189ba-9a0a-4b49-a073-f0071310239a`

## Browser Evidence

Validated in the in-app browser against the isolated backend:

- Authenticated navigation exposes both the `Mensajes` link and floating chat access.
- `/chat` renders nine eligible contacts and unread badges.
- Selecting the teacher loads the persisted chronological conversation.
- Desktop layout renders contact rail and conversation panel.
- Mobile viewport `390x844` switches between contacts and conversation with a back action.
- The floating chat shortcut is hidden on `/chat`, preventing it from covering the mobile
  send button.
- Sending `Validación UI móvil spec 104 1781406031674` cleared the composer and rendered one
  message bubble immediately.
- Final browser console contained no errors.

The two-participant real-time behavior was validated by the independent WebSocket clients;
the browser validation covered the complete student UI at desktop and mobile widths.

## Applicable Runbook Checks

- Backend Release build: passed.
- Frontend production build: passed.
- `/graphql` and introspection: passed.
- Valid login returns JWT: passed for student, teacher and admin.
- GraphQL HTTP and WebSocket authentication: passed.
- Apollo sends bearer authentication for HTTP and `connectionParams` for WebSocket.
- CORS remains restricted to configured origins.
- Message foreign keys use `DeleteBehavior.Restrict`.
- Persisted creation, immediate rendering and recovery after disconnect: passed.
- Explicit loading, empty, error and reconnecting states are present in the chat UI.

## Residual Risks

- `AddInMemorySubscriptions` is appropriate for the current single-instance deployment. A
  distributed deployment will require Redis or another shared pub/sub transport.
- `npm install` reported 7 dependency-tree vulnerabilities (2 moderate, 4 high, 1 critical).
  They were not auto-fixed because that could introduce unrelated breaking upgrades.
- Local SQL Server required an execution-only `Encrypt=False` override in this sandbox.
  The versioned connection string was not weakened and retains `TrustServerCertificate=True`.
