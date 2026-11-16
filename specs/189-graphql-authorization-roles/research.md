# Research: Declarative GraphQL Mutation Authorization

## Audited Baseline

- Mutation.cs already uses Authorize on most protected resolvers.
- UpdateProfile correctly has a broad authenticated attribute because ordinary users edit their own profile; making it Administrador-only would be a regression.
- User/subject/SIU and moderation mutations already show role arrays in several places.
- CreateJobOffer, ApplyToJob and UpdateApplicationStatus currently use broad Authorize while JobService enforces role and ownership.
- DeleteResource and UploadAcademicResource require a matrix review because role and ownership semantics are service-dependent.
- HotChocolate authorization is registered through AddAuthorization and JWT bearer authentication is configured in Startup.cs.

## Defense-in-Depth Model

1. Authentication middleware proves identity.
2. Declarative Authorize proves coarse role/policy eligibility.
3. Service logic proves ownership, enrollment and resource state.
4. EF constraints/filters preserve data integrity.
5. Error filter sanitizes unexpected failures.

Declarative attributes should reduce resolver attack surface, not delete contextual checks.

## Policy Guidance

Use role arrays for simple OR groups. Use named policies only where repeated semantics or claim requirements justify them. Avoid stacking attributes without verifying AND/OR behavior. Central constants or policies prevent role spelling drift.

Reference:

~~~csharp
[Authorize(Roles = new[] { "Empleador", "Administrador" })]
public Task<JobOffer> CreateJobOffer(...)
~~~

## Rejected Alternatives

- **Make UpdateProfile Admin-only**: violates self-service profile requirements.
- **Remove service role/ownership checks after adding attributes**: attributes cannot inspect resource ownership.
- **Trust hidden frontend buttons**: GraphQL remains directly callable.
- **Add Authorize to the whole Mutation type**: risks breaking login/register/magic-link public entry points.
- **Rely on static inspection only**: middleware registration and claim mapping require executor/runtime tests.

## Acceptance Research Gate

Produce the field-by-field matrix before changing attributes. Every role change needs a positive and negative test and must reference a documented business requirement.
