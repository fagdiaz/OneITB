# Tasks: Realtime Private Messaging

**Input**: Design documents from `/specs/104-realtime-private-messaging/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/graphql.md`, `quickstart.md`

**Tests**: Runtime contract, persistence, authorization, WebSocket and browser evidence are
required. Compilation alone is insufficient.

## Phase 1: Setup and baseline

- [X] T001 Verify the active feature artifacts and completed requirements checklist in `specs/104-realtime-private-messaging/`
- [X] T002 [P] Record the pre-implementation schema, package and database baseline in `specs/104-realtime-private-messaging/evidence.md`
- [X] T003 [P] Verify generated backend/frontend outputs and environment files remain covered by `.gitignore`
- [X] T004 Confirm the existing spec 103 file-upload changes remain intact before editing shared files

## Phase 2: Foundational persistence and service architecture

**Purpose**: Complete the backend data and service foundation before WebSocket or React work.

- [X] T005 [P] Create the explicit `Message` entity in `API Graphql/Entities/Models/Message.cs`
- [X] T006 Add sent and received message navigation collections to `API Graphql/Entities/Models/User.cs`
- [X] T007 Add the `Messages` set, explicit properties, composite indexes and two restricted user relationships in `API Graphql/Data/OneItbContext.cs`
- [X] T008 Extend message repository contracts in `API Graphql/Services/Interfaces/IUnitOfWork.cs`
- [X] T009 Implement no-tracking message reads and persisted writes in `API Graphql/Services/Repositories/UnitOfWork.cs`
- [X] T010 [P] Define messaging DTOs, payloads and `IMessagingService` in `API Graphql/Services/Messaging/IMessagingService.cs`
- [X] T011 Implement active-user validation, bounded conversation queries, contact projections, send and mark-read behavior in `API Graphql/Services/Messaging/MessagingService.cs`
- [X] T012 Register `IMessagingService` in `API Graphql/OneITB/Startup.cs`
- [X] T013 Build `API Graphql/OneITB/GraphQL.csproj` in Release with zero errors before generating the migration
- [X] T014 Generate migration `AddPrivateMessaging` under `API Graphql/Data/Migrations/`
- [X] T015 Apply `AddPrivateMessaging` to the local database and verify no pending model changes

## Phase 3: User Story 1 - Exchange private messages (Priority: P1)

**Goal**: Persist and deliver private messages to both authenticated participants.

**Independent Test**: Two authenticated clients exchange messages in both directions, each
receives one event, and both retrieve the same persisted history after reconnect.

- [X] T016 [P] [US1] Create per-user topic naming and the authenticated subscription resolver in `API Graphql/OneITB/GraphQL/Subscription.cs`
- [X] T017 [P] [US1] Create the WebSocket JWT session interceptor in `API Graphql/OneITB/Authentication/AuthenticationSocketSessionInterceptor.cs`
- [X] T018 [US1] Configure the JWT WebSocket handshake, in-memory subscriptions, subscription type and `UseWebSockets` ordering in `API Graphql/OneITB/Startup.cs`
- [X] T019 [US1] Add cursor-paginated authenticated `GetConversation` in `API Graphql/OneITB/GraphQL/Query.cs`
- [X] T020 [US1] Add authenticated `SendMessage` service delegation, controlled error mapping and dual-topic publishing in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [X] T021 [US1] Build the backend in Release and introspect the message query, mutation and subscription contract
- [X] T022 [US1] Execute two authenticated WebSocket clients plus a rejected unauthenticated client and record delivery counts in `specs/104-realtime-private-messaging/evidence.md`
- [X] T023 [US1] Query both sides after reconnect and record deterministic persisted history in `specs/104-realtime-private-messaging/evidence.md`

## Phase 4: User Story 2 - Contacts and unread activity (Priority: P2)

**Goal**: Discover eligible contacts and maintain unread state without N+1 queries.

**Independent Test**: A message arriving outside the selected conversation increments the
sender's unread indicator; opening the conversation clears it without reload.

- [X] T024 [P] [US2] Add cursor-paginated authenticated `GetMessagingContacts` with a single projected database query in `API Graphql/OneITB/GraphQL/Query.cs`
- [X] T025 [US2] Add authenticated `MarkConversationRead` service delegation and controlled error mapping in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [X] T026 [US2] Verify contact exclusion, inactive-user rejection and read-state persistence through GraphQL and record results in `specs/104-realtime-private-messaging/evidence.md`

## Phase 5: Frontend transport and chat interface

**Goal**: Integrate Apollo HTTP/WebSocket transport and a responsive real-time chat.

**Independent Test**: Two browser sessions select each other, exchange messages, observe
unread updates and retain history after reload.

- [X] T027 Install `graphql-ws` and update `FrontEnd/OneItb-FE/package.json` and `FrontEnd/OneItb-FE/package-lock.json`
- [X] T028 Refactor `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js` with environment-derived URLs, `GraphQLWsLink`, lazy JWT `connectionParams`, bounded retries and Apollo `split`
- [X] T029 [P] Create contacts, conversation, send, mark-read and subscription documents in `FrontEnd/OneItb-FE/src/data/graphql/chat.js`
- [X] T030 Create `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx` with top-level hooks, `useForm`, responsive Tailwind layout and explicit Spanish loading/error/empty/disconnected states
- [X] T031 Implement optimistic send, ID-based deduplication, targeted Apollo cache updates, unread synchronization and reconnect reconciliation in `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
- [X] T032 Add `/chat` to `FrontEnd/OneItb-FE/src/router/Routing.jsx`
- [X] T033 [P] Add the authenticated chat link to `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- [X] T034 Replace the floating placeholder with navigation to `/chat` in `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
- [X] T035 Build `FrontEnd/OneItb-FE` with zero errors

## Phase 6: User Story 3 - Recovery and full-stack validation (Priority: P3)

**Goal**: Recover safely from temporary socket loss and prove the complete workflow.

**Independent Test**: Disconnect and reconnect one client, then verify persisted messages
reconcile once with visible connection feedback.

- [X] T036 [US3] Validate socket disconnect/reconnect, missed-message reconciliation and duplicate suppression and record results in `specs/104-realtime-private-messaging/evidence.md`
- [X] T037 [US3] Validate `/chat` at desktop and mobile widths, including console/network review, and record results in `specs/104-realtime-private-messaging/evidence.md`
- [X] T038 [US3] Execute the applicable checks from `docs/audit/RUNBOOK_DEV.md` and record exact outcomes in `specs/104-realtime-private-messaging/evidence.md`

## Phase 7: Documentation closure

- [X] T039 Mark `specs/104-realtime-private-messaging/spec.md` complete only after runtime evidence passes
- [X] T040 Recalculate every module and global percentage in `docs/project_docs/ROADMAP.md` from its checklists
- [X] T041 Insert exactly one `104-realtime-private-messaging` entry at the top of `docs/audit/DEVELOPMENT_LOG.md`
- [X] T042 Verify all `docs/audit/DEVELOPMENT_LOG.md` entries remain newest to oldest with spec 104 first
- [X] T043 Update canonical status and evidence links in `docs/audit/DOCUMENTATION_STATUS.md`
- [X] T044 Mark completed tasks in `specs/104-realtime-private-messaging/tasks.md` only when supported by evidence

## Dependencies and execution order

- Phase 2 blocks all GraphQL subscription and frontend work.
- Migration application and a clean backend build are required before Phase 3.
- Phase 3 provides the transport contract required by Phases 4 and 5.
- Frontend transport configuration blocks the chat page runtime.
- Documentation closure requires builds, GraphQL, WebSocket, persistence and browser evidence.

## QA corrections applied

- The subscription accepts no client user ID; its topic derives from the socket principal.
- Events publish to both sender and receiver topics after successful persistence.
- WebSocket JWT payloads are actively authenticated by the server.
- Lists use cursor pagination and read queries use no-tracking projections.
- Resolvers delegate to `IMessagingService` and message persistence uses `IUnitOfWork`.
- Conversation filters always include the authenticated user.
- Endpoints derive from environment configuration rather than hardcoded localhost URLs.
- Apollo uses optimistic responses and targeted cache updates instead of full-page reloads or
  broad refetches per message.
- React hooks remain above conditional returns and every network state has a visible fallback.

## Definition of Done

- [X] All required tasks are marked `[X]`.
- [X] Backend and frontend builds pass with zero errors.
- [X] Migration and database indexes are applied.
- [X] Two authenticated sockets exchange exactly one event per message.
- [X] Unauthorized sockets and operations are rejected.
- [X] Persisted history and unread state survive reload.
- [X] Browser chat and reconnect workflows are verified.
- [X] Roadmap, development log and documentation status reflect only verified outcomes.
