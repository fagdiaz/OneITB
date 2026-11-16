# GraphQL Contract: Realtime Private Messaging

All operations use `/graphql`. Queries and mutations use HTTP; subscriptions use
`graphql-transport-ws` on the same endpoint.

## Types

```graphql
type Message {
  id: UUID!
  senderId: UUID!
  receiverId: UUID!
  content: String!
  sentAt: DateTime!
  isRead: Boolean!
  sender: User!
  receiver: User!
}

type MessagingContact {
  userId: UUID!
  firstName: String!
  lastName: String!
  role: String!
  lastMessageAt: DateTime
  unreadCount: Int!
}

type MarkConversationReadPayload {
  otherUserId: UUID!
  markedCount: Int!
}
```

## Queries

```graphql
query MessagingContacts($first: Int, $after: String) {
  messagingContacts(first: $first, after: $after) {
    nodes {
      userId
      firstName
      lastName
      role
      lastMessageAt
      unreadCount
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

query Conversation($otherUserId: UUID!, $first: Int, $after: String) {
  conversation(otherUserId: $otherUserId, first: $first, after: $after) {
    nodes {
      id
      senderId
      receiverId
      content
      sentAt
      isRead
      sender { id firstName lastName }
      receiver { id firstName lastName }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Both queries require authentication. `conversation` is always filtered by the authenticated
user; no arbitrary participant pair can be supplied.

## Mutations

```graphql
mutation SendMessage($receiverId: UUID!, $content: String!) {
  sendMessage(receiverId: $receiverId, content: $content) {
    id
    senderId
    receiverId
    content
    sentAt
    isRead
  }
}

mutation MarkConversationRead($otherUserId: UUID!) {
  markConversationRead(otherUserId: $otherUserId) {
    otherUserId
    markedCount
  }
}
```

The sender is derived from JWT claims. The server emits a canonical `Message` event only
after persistence succeeds.

## Subscription

```graphql
subscription MessageReceived {
  messageReceived {
    id
    senderId
    receiverId
    content
    sentAt
    isRead
    sender { id firstName lastName }
    receiver { id firstName lastName }
  }
}
```

The field accepts no user ID. The server subscribes the socket to the topic derived from the
authenticated principal. Missing or invalid socket authentication rejects the connection.

## WebSocket initialization

```json
{
  "authorization": "Bearer <JWT>"
}
```

## Controlled errors

- Unauthenticated request or socket.
- Sender or receiver inactive.
- Receiver not found.
- Self-message.
- Empty or oversized content.
- Conversation participant not found.

Internal database details and stack traces are not part of the public contract.
