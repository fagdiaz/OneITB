# Tasks: Declarative GraphQL Mutation Authorization

## Phase 1 - Matrix and baseline

- [x] T001 Enumerate every public Mutation field and current Authorize attribute.
- [x] T002 Map service-level role, ownership, enrollment and state checks.
- [x] T003 Approve the canonical matrix against roadmap/requirements/constitution.
- [x] T004 Capture current authorization error codes and representative SDL.

## Phase 2 - Security tests

- [x] T005 Add matrix/reflection coverage proving every non-public mutation is protected.
- [x] T006 Add wrong-role and allowed-role tests for administration, moderation, academic and employment.
- [x] T007 Add allowed-role/wrong-owner tests for profile, content, resource and job operations.
- [x] T008 Assert denied requests produce no database, event or email side effect.

## Phase 3 - Declarative enforcement

- [x] T009 Add missing base Authorize attributes to protected mutations.
- [x] T010 Add canonical role arrays/policies to role-exclusive mutations.
- [x] T011 Strengthen job mutation attributes while retaining JobOffer ownership checks.
- [x] T012 Review academic/resource gates and preserve enrollment/uploader checks.
- [x] T013 Remove only imperative checks proven exactly redundant; retain contextual checks.

## Phase 4 - Verification

- [x] T014 Run focused GraphQL authorization tests and full backend suite.
- [x] T015 Run Release build and source audit against the matrix.
- [x] T016 Execute runtime anonymous/wrong-role operations and automated allowed/wrong-owner no-write cases.
- [x] T017 Record evidence and update canonical docs from verified results.

## Dependencies

The matrix precedes tests and code. Negative tests precede attribute changes. Contextual-check review follows declarative enforcement.

## Definition of Done

- [x] Matrix covers 100% of Mutation fields.
- [x] Unauthorized resolvers are not invoked.
- [x] Ownership remains enforced.
- [x] Authorized workflows and build/tests pass.
