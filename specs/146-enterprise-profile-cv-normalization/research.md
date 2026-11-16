# Research: Enterprise Profile CV Normalization

## Decision: Normalize CV sections into dedicated tables

**Rationale**: CV data is queryable, auditable, migratable, and can evolve independently. It avoids opaque JSON contracts and supports future moderation/search/reporting without ad hoc parsing.

**Alternatives considered**:
- Keep JSON: fastest, but weak for integrity, querying, and long-term maintainability.
- Hybrid JSON plus tables: adds duplication and synchronization risk.

## Decision: Replace section rows on save

**Rationale**: The current UI edits the full CV document as one form. Replacing rows inside the authorized profile update keeps state simple and avoids partial-update edge cases.

**Alternatives considered**:
- Per-row CRUD mutations: more granular, but more UI/API surface than needed for current scope.

## Decision: Migration transforms existing JSON before column removal

**Rationale**: Existing demo data must survive. SQL Server `OPENJSON` can migrate the current shape into normalized tables in the same migration.

**Alternatives considered**:
- Manual reseed: loses user edits and is not presentation-safe.
