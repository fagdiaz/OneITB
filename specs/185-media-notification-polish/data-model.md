# Data Model: Media and Notification Polish

No schema change is required.

## Existing Fields

- `Inquiry.Content`: stores text containing zero to two validated YouTube URLs.
- `Inquiry.PreferAttachmentCover`: preserves whether ordered attachments precede videos.
- `SocialAttachment.SortOrder`: identifies attachment cover and secondary ordering.
- `Notification.IsRead`: sole source for unread badge cardinality.
- `Notification.AggregateCount`: historical number of grouped events used in message copy; never badge cardinality.

## Runtime-only State

- Primary image orientation: derived from intrinsic image dimensions and reset by primary media key.
- Theme transition marker: temporary DOM class, never persisted.
- Preferences portal lifecycle: component-local state and focus reference.
