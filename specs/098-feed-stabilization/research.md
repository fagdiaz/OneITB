# Research: Expose Inquiry Author

## Decision: Use an explicit required navigation

`Inquiry.User` will reference the existing `UserId` foreign key.

**Rationale**: The database already stores the relationship, but HotChocolate
cannot expose a navigation that does not exist in the entity model.

**Alternatives considered**:

- Resolver-per-inquiry: rejected because it risks N+1 queries.
- DataLoader-only field: unnecessary for an existing EF relationship.

## Decision: Keep HotChocolate projection

`GetInquiries` remains an `IQueryable<Inquiry>` with `[UseProjection]`.

**Rationale**: HotChocolate translates the selected relationship into the EF
query and avoids one lookup per inquiry.

**Alternative considered**: `.Include(i => i.User)` was rejected because it
loads author data even when the client does not request it and duplicates the
projection responsibility.

## Decision: Migration is conditional

Run EF's pending-model check before generating a migration.

**Rationale**: `UserId`, its index, and foreign key are already represented in
the current snapshot. A navigation-only change should not alter the physical
schema.

## Decision: Preserve canonical English schema with compatibility aliases

The canonical nested fields remain `id`, `firstName`, and `lastName`.

**Rationale**: The strict backend-only constraint prevents correcting the
current frontend query in this feature. Temporary resolver aliases allow that
query to work while preserving the English fields for normalized consumers.

**Follow-up**: Remove the aliases after the frontend migrates to the canonical
field names.
