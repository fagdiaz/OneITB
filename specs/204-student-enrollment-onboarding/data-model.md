# Data Model: Student Enrollment Onboarding

## Persisted Model

No new table is required by default.

```text
User (1) ---- (N) UserCareer (N) ---- (1) Career
```

### Student invariant

For an active `User` whose role is `Estudiante`, manual onboarding and self-service
profile editing produce exactly one `UserCareer` row. The database continues supporting
multiple rows for roles and future import cases where that is explicitly authorized.
Public Student registration applies the same one-career invariant before creating the
account. No entity or migration is required.

### Transaction

1. Resolve current user from JWT.
2. Validate role and target active career.
3. Load current links.
4. Remove obsolete links and add only missing links.
5. Save and commit once.
6. Return the persisted career projection.

Any validation or persistence failure leaves the previous set unchanged.

## Non-Persisted Integration DTOs

- `InstitutionalIdentity`: OneITB user ID and normalized institutional email derived server-side.
- `InstitutionalEnrollmentResult`: status, normalized career keys, subject keys and
  a controlled explanatory message.
- `InstitutionalEnrollmentStatus`: `ManualConfirmationRequired`, `Unavailable`, `Confirmed`.

Tokens, provider payloads and raw institutional claims are not persisted by this feature.
