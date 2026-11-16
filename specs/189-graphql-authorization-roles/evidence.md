# Evidence: Declarative GraphQL Mutation Authorization

## Authorization Matrix

- Public mutations are limited to `registerUser`, `login`, `requestMagicLink` and `loginWithMagicLink`.
- Every other mutation has a declarative HotChocolate `Authorize` attribute.
- Canonical role constants use the persisted Spanish values only; legacy English aliases are not accepted.
- Administration, moderation, academic-resource and employment mutations use explicit role sets.
- Ownership, authorship, enrollment, target-user and resource-state checks remain inside services where request context is required.

## Automated Evidence

- Reflection matrix covers 100% of public methods declared by `Mutation`.
- Role-set tests validate every role-exclusive resolver.
- Employment tests prove that a wrong role and an allowed-role/non-owner request are rejected without changing the application row.
- Full backend suite: PASS, 82/82.
- Backend Release build: PASS, 0 warnings and 0 errors.

## Runtime Evidence

- Anonymous `addSubject` was rejected before resolver execution with `AUTH_NOT_AUTHENTICATED`.
- Authenticated `Empleador` calling `applyToJob` was rejected with `AUTH_NOT_AUTHORIZED`.
- Authenticated `Empleador` calling `createJobOffer` reached business validation, proving that the allowed declarative role enters the resolver.
- Runtime introspection reports 42 mutation fields; automated reflection confirms exactly four public entry points.
- EF drift: PASS, no pending model changes.

## Status

**Verified** by complete matrix coverage, negative/no-write tests and runtime authorization smokes. No commit or push was performed.
