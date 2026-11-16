# Research: Full Profile & CV Schema Normalization

## Decision: Persist extended CV as validated JSON on `User`

**Rationale**: The CV sections are user-owned document-like data. Persisting them as one bounded JSON document eliminates duplicated local state quickly while avoiding multiple new tables and relationships for a still-evolving CV builder.

**Alternatives considered**:
- Separate tables per CV section: stronger queryability but higher migration and UI mapping cost for this stabilization sprint.
- LocalStorage: rejected because the requirement explicitly asks for SQL persistence and no orphan state.
- Keep state-only preview: rejected because it does not survive reload.

## Decision: Remove `PersonalForm` from the lower CV builder

**Rationale**: It duplicates photo, bio, contact and social fields already controlled by the native profile block. Extended forms should start at experience/education/projects/skills/languages.

**Alternatives considered**:
- Keep `PersonalForm` but hide duplicated fields: rejected because it preserves two separate concepts for the same data.

## Decision: Use one save mutation

**Rationale**: The user needs a single coherent save operation. Sending profile basics and `cvDataJson` through `updateProfile` keeps authorization and validation centralized.
