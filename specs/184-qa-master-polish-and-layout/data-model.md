# Data Model: QA Master Polish and Layout

No EF Core migration is required.

## Existing persisted identities

- `Comment.ReplyToUserId` / `ReplyToUser`: authoritative mention target.
- `JobOffer.Id`: authoritative employment deep-link target.
- `Notification.ActionUrl`: stores the route plus target identifier.

## Ephemeral UI state

- Header: hidden/elevated/top-trigger/focus state and previous scroll position.
- MediaGrid: gallery open state and deterministic visible-item selection.
- JobBoard: target offer ID and bounded highlight timeout.
- Notification drawer: open, pending preference and action error.

