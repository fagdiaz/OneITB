# Data Model: Spec 161 Session Cache, Search and Avatar Hardening

No persistent schema changes are introduced.

## Runtime State Affected

### Apollo Client Cache

- **Fields**: `Query.inquiries`, `Query.inquiriesPage`, `Query.conversation`, `Query.messagingContacts`, `Query.activeConversations`, `Query.searchMyMessages`
- **Behavior**: incoming result replaces the field explicitly to avoid Apollo replacement warnings and stale cross-filter merges.
- **Security rule**: cache must be cleared when the authenticated session is explicitly ended.

### Registration Form State

- **Role**: single string value; allowed values `Estudiante`, `Profesor`, `Egresado`.
- **Email**: must match `^[a-zA-Z0-9._%+-]+@itbeltran\.com\.ar$`.
- **Password labels**: user-facing strings must use `Contraseña` / `contraseña`.

### Avatar Editor State

- **Canvas**: square 720x720 export surface.
- **Zoom**: visible slider range below and above `1`, with effective cover scale ensuring no blank borders.
- **Offset**: clamped pan vector in canvas coordinates.
- **Export**: JPEG blob from the same visible canvas, not a separate crop calculation.
