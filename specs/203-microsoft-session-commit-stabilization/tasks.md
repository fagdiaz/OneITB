# Tasks: Microsoft Session Commit Stabilization

## Phase 1 - Specification and reproduction

- [x] T001 Record the external warnings as non-causal provider output.
- [x] T002 Identify unconditional MSAL cleanup and pre-commit navigation as root causes.
- [x] T003 Define provider-aware establishment and navigation completion contracts.
- [x] T004 Run the risk-based pre-implementation QA gate.

## Phase 2 - Session boundary

- [x] T005 Add a closed identity-provider option to `AuthContext.login`.
- [x] T006 Preserve MSAL only for Microsoft establishment.
- [x] T007 Retain complete cleanup for local login, logout, expiry, and replacement.
- [x] T008 Add provider-boundary regression tests.

## Phase 3 - Redirect completion

- [x] T009 Split token exchange from session commit/navigation.
- [x] T010 Reuse exactly-once completion results across callback mounts.
- [x] T011 Add bounded timeout and controlled recovery without token logging.
- [x] T012 Add delayed-commit, mismatch, concurrency, and failure tests.
- [x] T013 Redirect an already authenticated Login route defensively to `/feed`.

## Phase 4 - Validation and evidence

- [x] T014 Run targeted frontend tests.
- [x] T015 Run complete frontend tests and production build.
- [x] T016 Run static popup/token/diff checks and Speckit analysis.
- [x] T017 Update evidence and canonical documentation without changing completion percent.
- [x] T018 Perform real institutional login through onboarding and private-route arrival.
- [x] T019 Purge partial persisted sessions and require canonical token/user state before
  global expiration handling.
- [x] T020 Exempt public identity exchanges from protected-session expiry interception.
- [x] T021 Recover a valid MSAL return to Login through the dedicated callback without loops.
- [x] T022 Add regression coverage and repeat the complete frontend suite and build.
- [x] T023 Bound and cancel a stalled backend token exchange with recoverable UI feedback.
- [ ] T024 Complete cancellation/error, logout and second-account isolation acceptance.
