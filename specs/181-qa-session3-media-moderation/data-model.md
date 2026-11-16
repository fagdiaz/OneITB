# Data Model: QA Session 3

## Inquiry changes

| Field | Type | Default | Purpose |
|---|---|---|---|
| `PreferAttachmentCover` | `bool` | `false` | Selects ordered attachment 0 before detected YouTube media |
| `IsHiddenByModerator` | `bool` | `false` | Excludes content from normal social queries independently of author state |

Index: `IsActive`, `IsHiddenByModerator`, `PublishDate`.

## Comment changes

| Field | Type | Default | Purpose |
|---|---|---|---|
| `IsHiddenByModerator` | `bool` | `false` | Excludes comments and replies from normal social queries independently of author state |

Index: `InquiryId`, `IsActive`, `IsHiddenByModerator`.

## Existing entities reused

- `SocialAttachment.SortOrder`: selected attachment cover is position zero.
- `ModerationAudit`: stores hide/restore action and bounded reason.
- `Notification.GroupKey`: fixed `private-message-reminder:{userId}` key ensures one reminder record per recipient.

## Invariants

1. Social content remains physically present when inactive or hidden.
2. Normal filters require `IsActive && !IsHiddenByModerator`.
3. A comment has no parent or a parent whose `ParentCommentId` is null.
4. Edit attachments use null to keep and a non-null list to fully replace.
5. Attachment validation remains 10 files and 15 MB aggregate.
6. Moderation reason is required and limited to 500 characters.
7. A reminder is emitted only for a new qualifying unread-message state.
