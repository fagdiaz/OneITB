# Tasks: Social Policy and UI Bootstrap Resilience

## Phase 1 - Baseline

- [x] T001 Capture current social mute/reaction behavior and notification side effects.
- [x] T002 Add failing tests for muted-user like and unlike attempts.
- [x] T003 Capture current React provider tree and Apollo client construction count.
- [x] T004 Add failing tests for Apollo/theme/provider bootstrap errors.

## Phase 2 - Social consistency

- [x] T005 Invoke the centralized moderation guard in `ToggleReactionAsync`.
- [x] T006 Preserve cancellation and stable user error mapping.
- [x] T007 Assert no reaction insert/delete and no notification for denied attempts.
- [x] T008 Add regression proving observer Mute still only affects feed visibility.

## Phase 3 - Bootstrap resilience

- [x] T009 Extract a provider-independent institutional fallback view.
- [x] T010 Add `AppProviders` with one stable lazy Apollo client.
- [x] T011 Place `GlobalErrorBoundary` outside Apollo and theme providers.
- [x] T012 Add pre-mount bootstrap guard for root/client construction failures.
- [x] T013 Sanitize error logging and harden error-ID generation.
- [x] T014 Add client/provider/theme/child failure-injection tests.
- [x] T015 Run Spec 188 session isolation and WebSocket cleanup regressions.

## Phase 4 - Verification

- [x] T016 Run focused/full backend and frontend tests.
- [x] T017 Run backend Release and frontend Vite builds.
- [x] T018 Run EF pending-model check and confirm no migration.
- [ ] [B] T019 Execute authenticated muted-reaction runtime smoke. Blocked by the explicit no-server instruction for this session.
- [ ] [B] T020 Execute normal and forced-failure browser bootstrap smokes. Blocked by the explicit no-server instruction for this session.
- [x] T021 Inspect console/logs for loops, duplicate clients or sensitive state.
- [x] T022 Record commands and runtime results in `evidence.md`.
- [x] T023 Update `ROADMAP.md` and `DOCUMENTATION_STATUS.md` only from verified evidence.
- [x] T024 Add exactly one newest-first completion entry to `DEVELOPMENT_LOG.md`.

## Definition of Done

- [x] Moderation behavior is consistent and side-effect free on denial.
- [x] All planned bootstrap layers show fallback on injected failure.
- [x] Apollo/session/WebSocket regression remains green.
