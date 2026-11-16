# Spec 169: Final QA & Hardening

## Objective

Move OneITB23 into code-freeze hardening by reducing crash risk and adding the first automated baselines for the two documented testing gaps: frontend component tests and backend GraphQL integration tests.

## Scope

### In

- Global React error boundary with Clean Tech / Tech Noir fallback.
- Central GraphQL error sanitation to avoid leaking raw unexpected exceptions.
- Audit of notification effects for session bleed and cleanup.
- Backend GraphQL integration test baseline using the real HotChocolate executor over EF Core InMemory.
- Frontend component test baseline using Vitest and React Testing Library.
- Roadmap and audit documentation updates from executed evidence.

### Out

- Functional feature expansion.
- Breaking mutation schema rewrites to GraphQL unions.
- Distributed pub/sub, cloud storage, SSO, or admin browser regression.

## Acceptance Criteria

- Unhandled React render errors display an institutional fallback instead of a blank page.
- Unexpected backend exceptions are sanitized by a central GraphQL error filter while intentional `GraphQLException` messages stay user-facing.
- Component tests run through `npm.cmd test -- --run`.
- Backend tests include at least one GraphQL executor integration test that executes a real query through the schema.
- Existing build and service tests still pass.
- Roadmap moves only the testing baseline items that were actually implemented to `[x] [I]`.

## Risk Notes

- Replacing existing mutations with unions would break Apollo documents and frontend call sites. This spec uses a backward-compatible error filter instead.
- Component testing requires dev-only test packages; these do not ship in the production bundle.
