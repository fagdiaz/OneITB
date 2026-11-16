# Research: Student Enrollment Onboarding

## Decision 1 - Keep the relational N:M model

The database relation supports professors, historical imports and future institutional
records. Replacing it with `User.CareerId` would be a destructive late-stage migration.
The Student onboarding rule is therefore enforced in the application/service layer:
exactly one current link after explicit confirmation.

## Decision 2 - Use a dedicated role-aware mutation

The current list mutation has ambiguous semantics. A dedicated Student operation makes
authorization and cardinality visible in the GraphQL contract. The old operation must
also reject invalid Student lists while consumers migrate, preventing a bypass.

The audit also found public registration as a fourth writer. Because that endpoint can
only create `Estudiante`, accepting several IDs would recreate an invalid state before
the first login. Both frontend and backend registration therefore use single selection.

## Decision 3 - Do not fabricate the institutional API

No stable ITB/SIU enrollment API contract is present in the repository. A professional
implementation can provide an anti-corruption port, normalized DTOs, configuration and a
manual fallback. It cannot honestly implement a real HTTP adapter, authentication or
field mapping without provider documentation. The defense can demonstrate the exact
extension point and explain that the provider would become authoritative when supplied.

## Decision 4 - Explicit confirmation over optimistic persistence

Career selection controls authorization scope. A second confirmation reduces accidental
over-scoping and provides an auditable UX. Data is written only after confirmation and
the private layout unlocks only after a network refetch returns the same current user
with exactly one career.
