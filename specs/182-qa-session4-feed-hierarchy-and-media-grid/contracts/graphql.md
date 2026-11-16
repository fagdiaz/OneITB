# GraphQL Contract: Spec 182

## Queries

```graphql
query MyFollowedUserIds {
  myFollowedUserIds
}
```

- Authorized only.
- Returns `[UUID!]!`.
- One no-tracking database query ordered deterministically.

## Mutations

```graphql
mutation FollowUser($targetUserId: UUID!) {
  followUser(targetUserId: $targetUserId) {
    targetUserId
    isFollowing
  }
}

mutation UnfollowUser($targetUserId: UUID!) {
  unfollowUser(targetUserId: $targetUserId) {
    targetUserId
    isFollowing
  }
}
```

Controlled failures: unauthenticated actor, self-follow, inactive/missing target, blocked target, or persistence/concurrency failure after bounded retry.

`interactWithUser` remains for Mute/Block compatibility but delegates to the social-graph service.

## Directed comment mutation

```graphql
mutation AddComment(
  $inquiryId: UUID!
  $content: String!
  $parentCommentId: UUID
  $replyTargetCommentId: UUID
  $fileUrl: String
  $attachments: [SocialAttachmentInput!]
) {
  addComment(
    inquiryId: $inquiryId
    content: $content
    parentCommentId: $parentCommentId
    replyTargetCommentId: $replyTargetCommentId
    fileUrl: $fileUrl
    attachments: $attachments
  ) {
    id
    inquiryId
    parentCommentId
    replyToUserId
    content
  }
}
```

Rules:

- `replyTargetCommentId` is optional for backward compatibility.
- If supplied, the server derives the root parent and `ReplyToUserId`.
- If both parent and target are supplied, the requested parent must match the derived root.
- The target must be active, visible and part of the same inquiry.
- Directed/self notification behavior is server controlled.

## Existing feed contract

`inquiries` and `inquiriesPage` signatures remain unchanged. Ordering continues to be followed-author flag descending, then publish date descending. No nested follow resolver is added to `Inquiry.user`; UI state comes from `myFollowedUserIds`.
