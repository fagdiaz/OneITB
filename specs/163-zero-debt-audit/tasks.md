# Tasks: Spec 163 Zero Debt Audit

## Phase 1: Apollo Cache

- [x] T001 Add explicit `keyFields` for core GraphQL entities.
- [x] T002 Add scoped query policy for `academicResources`.
- [x] T003 Verify existing session-owned replacement policies remain intact.

## Phase 2: Backend Query Audit

- [x] T004 Inspect academic resource/progress query paths for N+1 risk.
- [x] T005 Add defensive split-query graph loading where EF includes multiple relationships.
- [x] T006 Record inspected paths and decisions in evidence.

## Phase 3: Bundle and Dependency Audit

- [x] T007 Inspect `package.json` and `vite.config.js` for production build hygiene.
- [x] T008 Preserve or adjust vendor chunking only if required by evidence.
- [x] T009 Record dependency removal recommendations if any are safe.

## Phase 4: Validation and Documentation

- [x] T010 Run frontend build.
- [x] T011 Run backend build.
- [x] T012 Update `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T013 Update `docs/audit/DOCUMENTATION_STATUS.md` if canonical status changes.
