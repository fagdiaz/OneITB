# Implementation Plan: Employer Authentication JWT Remediation

## Summary

Consolidate access-token issuance into one validated service, migrate password and employer login to it, remove placeholder APIs, make magic-link consumption replay-safe and prove the JWT against live HotChocolate authentication.

## Technical Context

- .NET 8, HotChocolate 14.2, EF Core 8, SQL Server.
- Paths: EmployerAuthService, AccountsService, UsersService.GenerateToken and JWT bearer setup in Startup.cs.
- Tests: xUnit service/integration project.
- Migration: none expected.

## Constitution Check

- **Service boundary**: PASS; JWT construction leaves resolvers/domain duplication.
- **Security**: PASS; fail-closed configuration, claims and replay prevention are explicit.
- **Data integrity**: PASS; existing MagicLink relation remains.
- **Evidence**: PASS; runtime bearer validation is mandatory.

## Implementation Phases

1. Capture committed and working-tree baselines; preserve unrelated changes.
2. Add failing tests for claims, config failure and replay.
3. Add validated JWT options, clock seam and IJwtTokenService.
4. Register issuer in DI and align bearer validation to the same options.
5. Refactor AccountsService and EmployerAuthService; remove UsersService.GenerateToken.
6. Make redemption atomic and coordinate cancellation signatures with Spec 187.
7. Run scans, tests, Release build, EF drift and live GraphQL bearer smoke.
8. Record evidence; only then update roadmap status.

## Test Strategy

- Unit: claims, expiry, configuration, inactive/wrong-role rejection.
- Concurrency: two simultaneous redeems produce one token.
- Integration: execute magic-link login and a protected operation on the real schema.
- Regression: password login and account lockout remain unchanged.

## Risks and Controls

- Dirty partial patch: refactor in place without overwriting unrelated work.
- Claim drift: one issuer and contract tests.
- Link leakage: generic errors and no secret logging.
- Clock flakiness: injectable time source or bounded assertions.

## Definition of Done

All tasks pass; no placeholder token remains; runtime authentication is evidenced; build-only evidence cannot close the spec.
