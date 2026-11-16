# Data Model: Premium Branding and Landing

No database or GraphQL entities are introduced.

## UI State

### Pointer spotlight

- Container reference
- Pending animation frame identifier
- CSS coordinates `--spotlight-x` and `--spotlight-y`
- Capability state derived from reduced-motion and pointer media queries

### Reveal section

- Visibility boolean
- Element reference
- One IntersectionObserver lifecycle

### Header scroll presentation

- Boolean indicating whether the document has moved beyond the small elevation threshold

All state is ephemeral, bounded to component lifetime and never written to storage.

