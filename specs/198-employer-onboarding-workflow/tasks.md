# Tasks: Employer Onboarding Workflow

## Phase 1 - Contracts and baseline

- [x] T001 Preserve unrelated `prompt_modulo1.txt` and record Git baseline
- [x] T002 Complete spec, plan, research, model, contracts and checklist
- [x] T003 Execute HIGH-risk Speckit QA baseline

## Phase 2 - Persistence and authentication invariant

- [x] T004 Add Employer request/status/outbox entities
- [x] T005 Add explicit `Account.MagicLinkEnabled`
- [x] T006 Configure Restrict relations, filtered indexes, checks and rowversion
- [x] T007 Generate and inspect `AddEmployerOnboardingWorkflow`
- [x] T008 Remove anonymous Employer auto-provisioning from Magic Link
- [x] T009 Add secure welcome-link issuance and approved CUIT verification

## Phase 3 - Domain and Outbox

- [x] T010 Add request contracts, CUIT/email/text normalization and stable errors
- [x] T011 Implement submission and generic conflict behavior
- [x] T012 Implement serializable idempotent approval/rejection/resend
- [x] T013 Add sanitized audit records
- [x] T014 Implement bounded leased Outbox processor and retry policy
- [x] T015 Add operation-specific HMAC rate limiter with Redis/local modes

## Phase 4 - GraphQL and seed

- [x] T016 Add public submission mutation with rate limiting
- [x] T017 Add paginated Admin query without N+1
- [x] T018 Add Admin approve/reject/resend mutations
- [x] T019 Update authorization matrix/schema tests
- [x] T020 Add demo-only idempotent request records

## Phase 5 - React

- [x] T021 Add Apollo employer-request contracts
- [x] T022 Add public `/empleos/solicitud` form and Home CTA
- [x] T023 Add Admin request management tab
- [x] T024 Add accessible confirmations, feedback, cache refresh and duplicate-submit guards
- [x] T025 Add frontend tests for public and Admin flows

## Phase 6 - Verification

- [x] T026 Add backend service, auth, limiter, Outbox and migration tests
- [x] T027 Run backend tests and Release build
- [x] T028 Run frontend tests and Vite build
- [x] T029 Apply migration and verify zero EF model drift
- [x] T030 Validate GraphQL schema/authorization in a finite runtime
- [x] T031 Validate public -> Admin -> Outbox -> Magic Link flow with local email evidence
- [x] T032 Record browser smoke as pending manual QA per user restriction; no server was started during closure

## Phase 7 - Documentation and closure

- [x] T033 Update canonical scope, architecture, Roadmap and runbook
- [x] T034 Add one top Development Log entry and update Documentation Status/audit
- [x] T035 Update final academic document with B2B/Outbox workflow
- [x] T036 Run secret/PII/ignored-artifact and `git diff --check` gates
- [x] T037 Complete evidence and Speckit Analyze

## Definition Of Done

- [x] Active email/CUIT requests are unique
- [x] Concurrent/repeated approval cannot duplicate accounts
- [x] Approval transaction includes request/account/user/audit/Outbox
- [x] SMTP failure leaves a retryable consistent account
- [x] UI reports the actual delivery state
- [x] Magic Links are expiring, single-use and digest-only
- [x] Approved accounts receive only canonical `Empleador`
- [x] No random password workaround remains
- [x] Request PII is Admin-only
- [x] Rate-limit keys contain no raw PII
- [x] Backend/frontend tests and builds pass
- [x] Migration is applied and EF reports no drift
- [x] Runtime GraphQL and local delivery evidence are recorded
- [x] Documentation is synchronized
- [x] External SMTP is not overclaimed
- [x] No automated commit or push was performed by Codex; the user created manual commit `a9a8d41`
