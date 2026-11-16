# GraphQL Contract: Spec 160

## Registration

```graphql
mutation RegisterUser($input: RegisterInput!) {
  registerUser(input: $input) {
    id
    success
    message
  }
}
```

Expected input shape:

```graphql
input RegisterInput {
  username: String!
  email: String!
  password: String!
  firstName: String!
  lastName: String!
  role: String!
  careerIds: [Int!]!
}
```

Security:

- Backend accepts only `Estudiante`, `Profesor`, `Egresado`.
- Backend rejects empty career list.

## Messaging

Conversation nodes must include sender avatar for received bubbles:

```graphql
query Conversation($otherUserId: UUID!, $first: Int, $after: String) {
  conversation(otherUserId: $otherUserId, first: $first, after: $after) {
    nodes {
      id
      senderId
      receiverId
      content
      sentAt
      isRead
      sender {
        id
        firstName
        lastName
        avatarUrl
      }
    }
  }
}
```

Contacts must include avatar URL:

```graphql
query MessagingContacts($first: Int, $after: String) {
  messagingContacts(first: $first, after: $after) {
    nodes {
      userId
      firstName
      lastName
      role
      avatarUrl
      lastMessageAt
      lastMessageContent
      unreadCount
    }
  }
}
```

## Search Filters

No backend contract change. Client sends `careerIds` and `subjectIds` to existing inquiries queries. Backend scoping from Spec 159 remains authoritative.
