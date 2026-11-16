# Data Model: Social Polish Quick Wins

No persisted entities are introduced or changed.

## UI State Only

- **Share feedback**: transient success/error message already handled by the feed feedback surface.
- **Attachment drag state**: local boolean indicating whether files are being dragged over the picker.
- **Modal focus state**: local reference to the previously focused element, restored on close when possible.

## Contract Impact

- GraphQL schema: no change.
- EF Core model/migrations: no change.
- Upload REST contract: no change.
