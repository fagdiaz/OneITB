# Research: Spec 160

## Decision: Registration must persist role and career identity at creation

**Rationale**: Spec 159 introduced backend feed scoping by `UserCareer`. A newly registered user with no career links will correctly see an empty feed. The fix belongs in the registration contract and backend service, not only in frontend defaults.

**Alternatives considered**:

- Post-registration profile edit: rejected because it leaves the user in a broken first-run state.
- Auto-assign first career: rejected because it creates incorrect academic identity.

## Decision: Public registration allows only Estudiante, Profesor and Egresado

**Rationale**: The constitution requires backend role validation for protected capabilities. Administrative roles must remain unavailable from public flows and rejected server-side even if the client is tampered with.

**Alternatives considered**:

- UI-only restriction: rejected as insufficient security.
- Keep backend default `User`: rejected because it causes unclear authorization and poor role display.

## Decision: Avatar retention should be enforced at save boundary

**Rationale**: The profile editor already receives the persisted `avatarUrl`. The safest fix is to normalize the outgoing `avatarUrl` as `profileForm.avatarUrl || avatarPreview || gqlData.me.avatarUrl || null`, preventing accidental nulling.

**Alternatives considered**:

- Backend ignores null avatar updates: rejected because users need a future explicit remove-avatar path.

## Decision: Canvas clamping uses transformed image bounds

**Rationale**: The image is drawn around canvas center with rotation, zoom, flip and offset. For 90-degree rotations, effective rendered width/height swap. Offset must be clamped to `(renderedSize - canvasSize) / 2`, and zoom must never fall below cover scale equivalent.

**Alternatives considered**:

- Mask over blank regions: rejected because saved JPEG would still contain blank borders.
- Third-party crop library: rejected by constraint.

## Decision: Chat unread badge reuses existing `messagingContacts`

**Rationale**: `MessagingContact.UnreadCount` already exists and is maintained by cache helpers. Adding a separate backend count would duplicate logic. A small header query with `first: 50` is acceptable and skipped when unauthenticated.

**Alternatives considered**:

- New `unreadMessageCount` query: rejected for this sprint as unnecessary contract expansion.

## Decision: Presence is removed unless backed by real data

**Rationale**: The current `En línea` label reflects WebSocket connectivity, not the contact's presence. Showing connection status as presence is misleading. The UI should show role/last-message context and only use reconnecting labels for transport status.

**Alternatives considered**:

- Add `IsOnline`: rejected because no persisted or real-time presence model exists.
