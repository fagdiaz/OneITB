# Data Model: Spec 182

## Comment

New fields:

- `ReplyToUserId: Guid?`: semantic recipient of a directed reply.
- `ReplyToUser: User?`: explicit navigation.

Rules:

- Null for ordinary root comments.
- For replies, may identify the root author or a sibling reply author.
- Target comment must belong to the same active inquiry.
- `ParentCommentId` always points to a root comment; a reply to a reply reuses that root.
- FK to `Users.Id` uses `DeleteBehavior.Restrict`.
- Index on `ReplyToUserId` supports future mention inbox/reporting without scanning content.

## UserInteraction

Existing fields remain unchanged: `ObserverId`, `TargetId`, `Type`, and `CreatedAt`.

Index change:

- Drop unique `(ObserverId, TargetId)`.
- Create unique `(ObserverId, TargetId, Type)`.
- Preserve `(ObserverId, Type)` and target lookup indexes.

Invariants:

- One edge per observer/target/type.
- Self edges are forbidden by service validation.
- Follow and Mute may coexist.
- Block is exclusive: creating Block removes existing Follow and Mute in one save.
- Unfollow removes only Follow.

## Notification

No schema change. `ActionUrl` stores the latest specific comment deep link for grouped comment/mention notifications. Existing max length is sufficient for two GUID query parameters.

## SocialAttachment

No schema change. Existing `SortOrder` determines cover and mosaic order. The media grid is presentation-only and never duplicates attachment rows.

## Migration

`AddDirectedRepliesAndSocialGraphIndex`:

1. Add nullable `ReplyToUserId` to `Comments`.
2. Add index `IX_Comments_ReplyToUserId`.
3. Add restrictive FK `FK_Comments_Users_ReplyToUserId`.
4. Drop `IX_UserInteractions_ObserverId_TargetId`.
5. Create unique `IX_UserInteractions_ObserverId_TargetId_Type`.

The migration is additive except for index normalization and does not delete social data.
