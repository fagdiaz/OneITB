# Implementation Plan: Declarative GraphQL Mutation Authorization

## Summary

Build a complete Mutation authorization matrix, apply missing declarative role/policy gates, retain contextual service checks and prove middleware rejects unauthorized calls before side effects.

## Technical Context

- .NET 8, HotChocolate 14.2 authorization, ASP.NET JWT bearer.
- Primary paths: Mutation.cs, Startup.cs and affected service interfaces.
- Tests: existing HotChocolate integration executor plus service tests.
- Migration: none.

## Constitution Check

- **Security**: PASS; backend remains authoritative.
- **Architecture**: PASS; attributes handle coarse access, services contextual access.
- **Compatibility**: PASS; no GraphQL success contract change.
- **Evidence**: PASS; positive/negative runtime tests required.

## Implementation Phases

1. Enumerate all Mutation fields and classify public/authenticated/role/contextual gates.
2. Map canonical roles and existing service checks; identify inconsistencies.
3. Add failing executor tests for anonymous, wrong-role and wrong-owner cases.
4. Add/adjust Authorize role arrays or named policies without weakening service checks.
5. Centralize repeated role names/policies where supported cleanly.
6. Verify denial prevents resolver/database/event/email execution.
7. Run tests, Release build, schema/runtime smokes and source matrix audit.
8. Record evidence and update canonical status.

## Test Strategy

- Schema integration tests with claims principals for all six roles.
- Side-effect spies/database state proving resolver non-execution.
- Ownership tests for posts/comments/profile/jobs/resources.
- Positive regression for each allowed role group.
- HTTP and WebSocket claim mapping checks where applicable.

## Risks and Controls

- Over-restricting self-service operations: matrix based on requirements, not audit wording alone.
- OR/AND role semantics: one tested role array or named policy.
- Removing contextual checks: prohibited unless formally proven redundant.
- Role spelling drift: canonical constants/policies and tests.

## Definition of Done

Every Mutation field is classified, protected as intended, tested positively/negatively and verified without side-effect or schema regression.
