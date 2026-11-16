# GraphQL Contract: SIU Sync and Notifications

## Types

```graphql
enum NotificationType {
  ACADEMIC_RESOURCE
  ACADEMIC_PROGRESS
  SIU_SYNC
}

type Notification {
  id: UUID!
  userId: UUID!
  message: String!
  actionUrl: String
  type: NotificationType!
  isRead: Boolean!
  createdAt: DateTime!
  readAt: DateTime
}

type NotificationPreference {
  id: UUID!
  userId: UUID!
  type: NotificationType!
  isEnabled: Boolean!
  updatedAt: DateTime!
}

type SiuSyncResult {
  subjectId: Int!
  processed: Int!
  created: Int!
  updated: Int!
  skipped: Int!
  message: String!
  skippedItems: [String!]!
}
```

## Queries

```graphql
query MyNotifications($first: Int) {
  myNotifications(first: $first) {
    id
    message
    actionUrl
    type
    isRead
    createdAt
    readAt
  }
}

query UnreadNotificationCount {
  unreadNotificationCount
}

query MyNotificationPreferences {
  myNotificationPreferences {
    id
    type
    isEnabled
    updatedAt
  }
}
```

Authorization:
- Authenticated user only.
- Results are scoped to the authenticated user.

## Mutations

```graphql
mutation SyncSiuGrades($subjectId: Int!) {
  syncSiuGrades(subjectId: $subjectId) {
    subjectId
    processed
    created
    updated
    skipped
    message
    skippedItems
  }
}

mutation MarkNotificationRead($notificationId: UUID!) {
  markNotificationRead(notificationId: $notificationId) {
    id
    isRead
    readAt
  }
}

mutation MarkAllNotificationsRead {
  markAllNotificationsRead
}

mutation UpdateNotificationPreference($type: NotificationType!, $isEnabled: Boolean!) {
  updateNotificationPreference(type: $type, isEnabled: $isEnabled) {
    id
    type
    isEnabled
    updatedAt
  }
}
```

Authorization:
- `syncSiuGrades`: `Administrador` only.
- Notification read/preference mutations: authenticated owner only.

## Subscription

```graphql
subscription NotificationReceived {
  notificationReceived {
    id
    message
    actionUrl
    type
    isRead
    createdAt
  }
}
```

Authorization:
- Authenticated user only.
- Server subscribes to the authenticated user's private topic.

## Runtime Validation

- Admin token can run `syncSiuGrades(subjectId)` and receive created/updated/skipped counts.
- Student token cannot run `syncSiuGrades`.
- Creating an academic resource emits and persists one notification for eligible students.
- Updating academic progress emits and persists one notification for the affected student.
- Disabling a preference prevents new notifications of that category.
- Subscription receives a notification over WebSocket for the authenticated user.
