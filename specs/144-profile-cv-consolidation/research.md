# Research: Profile/CV Consolidation & Cleanup

## Decision: Use `me` for profile edit data

**Rationale**: The existing `users` field is an administrative listing and must remain protected. A self-profile query is the correct least-privilege contract for Estudiante, Profesor, Egresado and Administrador users.

**Alternatives considered**:
- Relax `GetUsers`: rejected because it would expose user listing broadly.
- Reuse `publicProfile`: rejected because it is public/read-only and does not include the edit-oriented contract shape already used by the editor.

## Decision: Enforce owner/admin authorization in `updateProfile`

**Rationale**: Frontend controls are not security. The resolver must reject attempts to update another user's profile unless the actor is Administrador.

**Alternatives considered**:
- Trust the submitted `id`: rejected due to privilege escalation risk.
- Remove `id` from input: cleaner long term, but would be a GraphQL breaking change for current clients.

## Decision: Delete temporary CV reference

**Rationale**: Production components already live under `src/Components/editor` and `src/Components/resume`; the reference copy is dead weight and risks accidental imports.
