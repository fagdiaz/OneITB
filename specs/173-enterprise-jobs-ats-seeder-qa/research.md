# Research: Enterprise Jobs ATS Seeder QA

## Decision: Extend existing JobOffer rather than recreate it

Rationale: `JobOffer` is already mapped, migrated and wired to GraphQL. Recreating it would introduce migration churn and traceability risk. Spec 173 becomes canonical by adding ATS and documentation.

## Decision: Unique applications per candidate and offer

Rationale: Prevents duplicate applications at database and service layers. The UI can confidently render Postulado.

## Decision: Status transitions are owner/admin-only

Rationale: The offer owner controls candidate review while administrators retain institutional oversight.

## Decision: Seeder uses deterministic IDs and phase commits

Rationale: Stable IDs allow idempotent demo data while `ChangeTracker.Clear()` prevents memory growth and tracked duplicates.
