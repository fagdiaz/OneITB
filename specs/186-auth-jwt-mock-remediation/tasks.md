# Tasks: Employer Authentication JWT Remediation

## Phase 1 - Baseline and tests

- [x] T001 Record committed/working-tree JWT implementations and dirty-file ownership in evidence.md.
- [x] T002 Confirm canonical claims/lifetime against Startup.cs bearer validation.
- [x] T003 Add failing issuer tests for signature, issuer, audience, claims, lifetime and invalid config.
- [x] T004 Add magic-link tests for success, expiry, replay, inactive user, wrong role and concurrency.

## Phase 2 - Central issuer

- [x] T005 Add validated JWT options and IJwtTokenService implementation.
- [x] T006 Register the service/options in Startup.cs without source-controlled secrets.
- [x] T007 Refactor AccountsService while preserving account lockout.
- [x] T008 Refactor EmployerAuthService to use issuer and stable errors.
- [x] T009 Remove IUsersService.GenerateToken and token_placeholder.

## Phase 3 - Magic-link hardening

- [x] T010 Enforce active employer validation and atomic one-time consumption.
- [x] T011 Prevent token/key/raw-link leakage in logs and production errors.
- [x] T012 Preserve or explicitly migrate the GraphQL contract and callers.

## Phase 4 - Verification

- [x] T013 Run focused/full backend tests and Release build.
- [x] T014 Run EF drift and placeholder/duplicate-generator scans.
- [x] T015 Execute runtime magic-link login and protected GraphQL operation.
- [x] T016 Update evidence and canonical docs only from verified outcomes.

## Dependencies

Contract tests precede refactoring. The central issuer precedes both login migrations. Spec 187 may extend cancellation signatures but Spec 186 remains independently testable.

## Definition of Done

- [x] No mock/placeholder/duplicate issuer remains.
- [x] Replay and malformed configuration are tested.
- [x] Runtime bearer authentication succeeds.
- [x] Documentation distinguishes implementation from verification.
