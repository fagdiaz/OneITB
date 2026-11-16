# Tasks: Upload and Magic Link Abuse Hardening

## Phase 1 - Baseline and contracts

- [x] T001 Capture current upload and Magic Link GraphQL/runtime contracts.
- [x] T002 Add fixture inventory for every allowed file family and malformed counterpart.
- [x] T003 Define stable upload rejection and throttle error codes.
- [x] T004 Define configurable request/redemption limits and trusted proxy assumptions.

## Phase 2 - Upload inspection

- [x] T005 Add `IFileContentInspector` and canonical detected-format model.
- [x] T006 Implement bounded image, PDF, legacy Office, MP4 and WebM signatures.
- [x] T007 Implement safe ZIP/OOXML structural validation with bounded entry inventory.
- [x] T008 Implement UTF-8/plain-text validation and truncated/empty guards.
- [x] T009 Integrate inspection before storage and preserve cancellation.
- [x] T010 Add controller tests proving invalid files never invoke storage.

## Phase 3 - Magic Link throttling

- [x] T011 Add `IMagicLinkRateLimiter` and non-reversible key derivation.
- [x] T012 Implement bounded in-memory limiter for Development/tests.
- [x] T013 Implement conditional shared limiter for configured production Redis.
- [x] T014 Enforce request limits by IP and normalized email before database work.
- [x] T015 Configure trusted forwarded-header handling before rate limiting without trusting arbitrary client headers.
- [x] T016 Enforce redemption limits by IP and token fingerprint before lookup/consume.
- [x] T017 Add generic errors, retry metadata policy and sanitized logging.
- [x] T018 Add expiry, multi-key and concurrent-threshold tests.

## Phase 4 - Verification

- [x] T019 Run focused upload/auth tests and full backend suite.
- [x] T020 Run backend Release build and EF pending-model check.
- [x] T021 Execute authenticated runtime upload fixtures against local storage.
- [x] T022 Verify Magic Link threshold/recovery with deterministic automated tests; runtime server smoke was explicitly waived by the operator.
- [x] T023 Run security log scan and record evidence in `evidence.md`.
- [x] T024 Update `ROADMAP.md` and `DOCUMENTATION_STATUS.md` only from verified evidence.
- [x] T025 Add exactly one newest-first completion entry to `DEVELOPMENT_LOG.md`.

## Dependencies

Tests and contracts precede implementation. Upload inspection precedes storage integration. Limiter interfaces and key policy precede provider implementations.

## Definition of Done

- [x] All requirements and security checklist items pass.
- [x] No migration is generated.
- [x] Runtime evidence proves valid and hostile upload cases; Magic Link abuse controls are verified statically and by deterministic tests.
