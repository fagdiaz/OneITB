# Tasks: Credential Delivery and Cryptographic Policy Hardening

## Phase 1 - Exposure baseline

- [x] T001 Capture current request/login SDL and frontend flow.
- [x] T002 Add failing test proving request response exposes a token.
- [x] T003 Add fake-email, token-digest, replay and expiry tests.
- [x] T004 Inventory every production `HashPassword` call and tracked secret source.
- [x] T005 Define generic request/error and environment delivery contracts.

## Phase 2 - Magic Link delivery

- [x] T006 Add `MagicLinkRequestPayload` and change service/resolver request contract.
- [x] T007 Persist SHA-256 token digest and preserve atomic one-time consumption.
- [x] T008 Send fragment-based employer login URL through `IEmailSender`.
- [x] T009 Add safe Development pickup sender and test fake.
- [x] T010 Prevent production startup with an unsafe/missing Magic Link delivery provider.
- [x] T011 Remove sensitive body logging from console/fallback email paths.
- [x] T012 Update Apollo mutation and EmployerLogin fragment consumption/URL cleanup.

## Phase 3 - Password and JWT policy

- [x] T013 Add validated password hashing options and abstraction.
- [x] T014 Use explicit policy in registration and employer placeholder creation.
- [x] T015 Adapt enterprise seeding without introducing an invalid project dependency.
- [x] T016 Verify old hashes and rehash weak hashes after successful login.
- [x] T017 Remove tracked JWT key and strengthen startup key validation.
- [x] T018 Update `.env.example`, user-secrets/runbook and secret-scan patterns.

## Phase 4 - Verification

- [x] T019 Run focused auth/email tests and full backend/frontend suites.
- [x] T020 Run Release/Vite builds and EF pending-model check.
- [x] T021 Execute Development pickup Magic Link end to end through an automated integration test.
- [ ] T022 Execute SMTP-backed smoke with non-production test recipient when secrets are available. **Blocked: no provider credentials/test recipient supplied.**
- [x] T023 Inspect GraphQL response, database and logs for credential leakage.
- [x] T024 Record commands and runtime results in `evidence.md`.
- [x] T025 Update `ROADMAP.md`, `DOCUMENTATION_STATUS.md`, `.env.example` and `RUNBOOK_DEV.md` from verified behavior.
- [x] T026 Add exactly one newest-first completion entry to `DEVELOPMENT_LOG.md`.

## Definition of Done

- [x] No raw request token is returned/stored/logged.
- [x] Existing password hashes still authenticate.
- [x] Production secrets/providers are mandatory and externalized.
- [ ] Coordinated backend/frontend runtime flow passes. **Automated pickup/schema/component coverage passes; browser + real SMTP remain pending.**
