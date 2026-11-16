# Contract: Media and Notification Polish

## YouTube

- Accepted publication content: zero, one or two valid supported YouTube URLs.
- Rejected publication content: three or more valid YouTube URLs on create or edit.
- The parser returns ordered renderable IDs and clean text; the first ID remains available for compatibility.

## Media Grid

- Primary landscape image: full-width natural-height cover, bounded maximum height.
- Primary portrait/unknown media: existing half-width bounded mosaic.
- Visible slots: cover first; up to two YouTube items retained before lower-priority attachments; overflow opens all items.
- PDF: first-page upper crop plus original filename and view/download actions.

## Notifications

- `unreadNotificationCount = COUNT(Notification WHERE UserId = currentUser AND IsRead = false)`.
- `AggregateCount` MUST NOT alter the badge.
- A read grouped row reopened by one event contributes exactly one unread notification.
- Preferences render at document-body level and remain dismissible by close button, backdrop and Escape.

## Theme

- Dark logo treatment is CSS-only and does not replace approved assets.
- Theme transition lasts 800 ms for color/background/border/shadow/opacity/filter only.
- Reduced motion disables the extended transition.
- Texture is decorative, pointer-inert and absent in print.
