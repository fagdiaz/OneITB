# Tasks: Async Query and Pagination Hardening

## Phase 1 - Contract and baseline

- [x] T001 Capture current inquiry page SDL, Apollo cache behavior and all `GET_INQUIRIES` consumers.
- [x] T002 Capture academic student SDL and AcademicDashboard assumptions.
- [x] T003 Add visibility/order regression tests for feed filters, following and exclusions.
- [x] T004 Add academic eligibility/order regression tests.
- [x] T005 Add failing cancellation and synchronous-I/O source guard tests.

## Phase 2 - Social query hardening

- [x] T006 Refactor global-visibility lookup to async cancellation-aware execution.
- [x] T007 Make the internal inquiry query builder terminal-I/O free.
- [x] T008 Propagate `CancellationToken` through `GetInquiriesPage` and all EF terminals.
- [x] T009 Preserve page clamp, total count, deep-link and opaque cursor behavior.
- [x] T010 Migrate profile, publication-admin and comment-admin consumers to bounded pages.
- [x] T011 Deprecate/remove the public unbounded `inquiries` field and update Apollo policies.

## Phase 3 - Academic pagination

- [x] T012 Add `AcademicStudentPage` DTO and service contract.
- [x] T013 Implement authorized bounded query with deterministic ordering and cancellation.
- [x] T014 Update GraphQL query arguments/payload and controlled cursor errors.
- [x] T015 Update AcademicDashboard query, state and incremental loading.
- [x] T016 Add backend GraphQL and frontend component pagination tests.

## Phase 4 - Verification

- [x] T017 Inspect existing indexes for affected predicates/order.
- [x] T018 Add an index migration only if measured evidence justifies it. No migration was justified.
- [x] T019 Run full backend/frontend tests and Release/Vite builds.
- [x] T020 Run EF drift check and actual schema validation through the HotChocolate executor.
- [ ] T021 Execute authenticated feed/profile/admin/academic pagination smokes. Deferred: no server instance was started.
- [ ] T022 Confirm cancelled requests stop work and logs remain clean in runtime. Pre-cancelled automated tests pass; runtime log observation is deferred.
- [x] T023 Record commands, schema and deferred runtime scope in `evidence.md`.
- [x] T024 Update `ROADMAP.md` and `DOCUMENTATION_STATUS.md` only from verified evidence.
- [x] T025 Add exactly one newest-first completion entry to `DEVELOPMENT_LOG.md`.

## Definition of Done

- [x] No sync EF terminal operation remains in scope.
- [x] Every response is bounded.
- [x] All former unbounded frontend consumers are migrated.
- [x] Authorization and ordering regression tests pass.
