# Research: Realtime Private Messaging

## Decision 1: Use one authenticated topic per user

**Decision**: Subscribe each socket to `private-message:{authenticatedUserId}` without a
client-supplied user identifier. Publish each persisted message to both sender and receiver
topics.

**Rationale**: Both participants receive immediate canonical state, while a client cannot
guess another user's topic. The subscription resolver derives identity from the validated
socket principal.

**Alternatives considered**:

- Receiver-only topic: rejected because the sender would depend only on mutation state and
  could diverge across multiple sessions.
- Conversation-id topic supplied by the client: rejected because this increment has no
  stored conversation entity and would require additional authorization checks on every
  subscription argument.
- Global message topic with resolver filtering: rejected because it broadcasts private
  payloads farther than necessary.

## Decision 2: Authenticate the GraphQL WebSocket initialization payload

**Decision**: Apollo sends `authorization: Bearer <token>` in `connectionParams`. A custom
HotChocolate socket session interceptor extracts the token, invokes the existing JWT bearer
scheme, assigns the resulting principal, and rejects missing or invalid credentials.

**Rationale**: Browser WebSocket APIs cannot add arbitrary authorization headers after the
upgrade. Authorization attributes require a real authenticated principal, not merely a token
present in the payload.

**Alternatives considered**:

- Token query string: rejected because URLs are more likely to be logged.
- Anonymous socket plus user-id argument: rejected as insecure.
- Cookie authentication: rejected because the application standardizes on JWT local session
  storage.

**Primary source**:

- HotChocolate v14 subscriptions and WebSocket authentication:
  https://chillicream.com/docs/hotchocolate/v14/defining-a-schema/subscriptions/

## Decision 3: In-memory subscriptions for the current deployment

**Decision**: Register HotChocolate's in-memory subscription provider.

**Rationale**: It satisfies the requested single-instance local architecture and requires no
new infrastructure. Topic naming and `ITopicEventSender` keep the implementation replaceable.

**Alternatives considered**:

- Redis provider: appropriate for multiple backend replicas, but outside the current
  infrastructure and requested scope.
- Short polling: rejected by the requirement because it increases repeated reads and latency.

## Decision 4: Persist through a messaging service and Unit of Work repository

**Decision**: Extend `IUnitOfWork` with a message repository and place validation, read
filters and writes in `IMessagingService`.

**Rationale**: Resolvers remain transport adapters, database rules are testable in one place,
and the implementation follows the project architecture and `speckit-db-perf`.

**Alternatives considered**:

- Direct `OneItbContext` access from resolvers: rejected as architectural debt.
- New standalone messaging project: rejected as unnecessary for one aggregate.

## Decision 5: Cursor-paginate contacts and history

**Decision**: Expose `messagingContacts` and `conversation` as cursor-paginated fields with a
maximum page size of 50. History uses deterministic ordering by `SentAt` and `Id`.

**Rationale**: Bounded reads prevent loading an unbounded message table and satisfy the
database performance policy. Read-only projections use `AsNoTracking`.

**Alternatives considered**:

- Return all messages: rejected for memory and response growth.
- Offset pagination: rejected because concurrent messages can shift pages.

## Decision 6: Use composite indexes aligned to participant filters

**Decision**: Add indexes on `(SenderId, ReceiverId, SentAt, Id)`,
`(ReceiverId, SenderId, SentAt, Id)`, and `(ReceiverId, IsRead, SentAt)`.

**Rationale**: Conversation queries use two directional predicates and unread queries start
from receiver/read state. Explicit indexes avoid scans as history grows.

## Decision 7: Apollo split transport and cache reconciliation

**Decision**: Derive HTTP and WebSocket URLs from environment configuration, route
subscription operations with Apollo `split`, send the current token through lazy
`connectionParams`, use `optimisticResponse` for sends, and deduplicate cache entries by
message ID.

**Rationale**: This preserves immediate UI feedback, supports token changes on reconnect,
and prevents duplicate bubbles when mutation and subscription results race.

**Alternatives considered**:

- Hardcoded WebSocket URL: rejected by QA configuration rules.
- Component-only append without cache update: rejected because navigation/re-render could
  reintroduce stale state.
- Refetch every message: rejected because it discards the real-time efficiency gain.

**Primary sources**:

- Apollo subscriptions and `GraphQLWsLink`:
  https://www.apollographql.com/docs/react/data/subscriptions
- `graphql-ws` client reconnection options:
  https://the-guild.dev/graphql/ws/docs/client/interfaces/ClientOptions

## Decision 8: Reconcile after reconnect

**Decision**: Keep the socket client lazy with bounded retry attempts and expose connection
status callbacks. When the client reconnects, refetch the active bounded conversation and
contacts once.

**Rationale**: In-memory pub/sub does not replay missed events; SQL Server remains the source
of truth.
