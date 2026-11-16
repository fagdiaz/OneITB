# Tasks: Spec 165 Academic Hub Hardening

## Phase 1: SDD and Audit Baseline

- [x] T001 Activate Spec 165 and update AGENTS plan pointer.
- [x] T002 Create `research.md`, `data-model.md`, `contracts/`, `quickstart.md`.
- [x] T003 Record initial audit findings.

## Phase 2: Backend Hardening

- [x] T004 Add GraphQL query alias `resourcesBySubject`.
- [x] T005 Harden social feed query graph with `AsSplitQuery()` and nested replies includes.
- [x] T006 Validate GraphQL schema exposes the alias.

## Phase 3: Frontend Academic Hub

- [x] T007 Convert academic resource upload panel into modal.
- [x] T008 Change resource title search to local `useMemo` filtering.
- [x] T009 Replace create/delete resource refetches with explicit Apollo cache updates.
- [x] T010 Preserve `/api/upload` binary flow and category/version metadata.

## Phase 4: Validation and Final Audit

- [x] T011 Run backend service tests.
- [x] T012 Run backend Release build.
- [x] T013 Run frontend production build.
- [x] T014 Run `git diff --check`.
- [x] T015 Record final audit and evidence.
- [x] T016 Update roadmap/status/log documentation.
