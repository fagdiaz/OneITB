# Contract: Academic Enrollment Confirmation

## GraphQL

Proposed semantic operation:

```graphql
mutation ConfirmStudentCareer($careerId: Int!) {
  confirmStudentCareer(careerId: $careerId) {
    id
    name
    code
    isActive
  }
}
```

### Authorization

- Requires a valid OneITB JWT.
- Actor is always obtained from claims.
- Actor must have role `Estudiante`.
- Target career must exist and be active.
- Repeated confirmation of the same career is idempotent.

### Errors

- `AUTH_NOT_AUTHORIZED`: no valid Student session.
- `ACADEMIC_CAREER_INVALID`: missing, inactive or unknown career.
- `ACADEMIC_ENROLLMENT_CONFLICT`: persistence/concurrency conflict.

No error includes provider tokens, tenant payloads or another user's identifiers.

## Compatibility and bypass prevention

- `linkUserToCareers(careerIds)` remains available for existing consumers, but resolves
  the current actor in the service and rejects any Student list whose normalized count
  is not one.
- Public registration creates only `Estudiante` and therefore accepts exactly one active
  career; it cannot create a temporarily over-scoped account.
- `updateProfile` validates the target user's persisted role before replacing links.
  Administrator UI access does not weaken the Student cardinality rule.
- Other active roles retain the existing non-empty multi-career contract.

## Institutional Provider Port

```csharp
Task<InstitutionalEnrollmentResult> GetEnrollmentAsync(
    InstitutionalIdentity identity,
    CancellationToken cancellationToken);
```

Development uses an explicit unavailable/manual implementation. A future HTTP adapter
must validate its own transport/authentication and map only known career/subject keys.
