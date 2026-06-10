# Tasks: Pre-Commit Stabilization (049)

## Phase 1: Planning
- [x] T001 Initialize spec 049-pre-commit-stabilization.
- [x] T002 Static scan of recently modified frontend files.

## Phase 2: Implementation (Fixes)
- [x] T003 `Login.jsx` — Remove `console.log(err)` in catch block.
- [x] T004 `Register.jsx` — Remove orphan `useQuery(GET_USERS)` import+call.
- [x] T005 `Register.jsx` — Remove 3× `console.log` debug statements.
- [x] T006 `Feed.jsx` — Remove orphan `useQuery` and `GET_USERS` imports.

## Phase 3: QA
- [x] T007 Confirm no logic was altered — only dead/debug code removed.
- [ ] T008 Verify React build succeeds (pending user approval to run).
