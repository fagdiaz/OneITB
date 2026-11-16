# Tasks: Production Security and Seeding

**Input**: Design documents from `specs/171-production-security-and-seeding/`

**Prerequisites**: spec.md, plan.md

**Tests**: Backend build and account lockout tests are mandatory. No frontend validation is required because the scope excludes React UI.

## Phase 1: Setup

- [x] T001 Create Speckit artifacts for `171-production-security-and-seeding`
- [x] T002 Analyze active roadmap, constitution, account model, login service, GraphQL startup and existing seeder

## Phase 2: GraphQL Anti-DoS

- [x] T003 Add HotChocolate max execution depth configuration
- [x] T004 Add global paging defaults and maximum page size
- [x] T005 Expose GraphQL hardening settings in `appsettings.json` and production compose

## Phase 3: Account Lockout

- [x] T006 Add `FailedLoginAttempts` and `LockoutEnd` to `Account`
- [x] T007 Map lockout fields and email uniqueness in EF Core
- [x] T008 Update `AccountsService.Login` to increment, lock and reset attempts
- [x] T009 Add unit tests for lockout behavior
- [x] T010 Generate EF Core migration `AddAccountLockout`

## Phase 4: Seeder Hardening

- [x] T011 Make the existing `DbInitializer` accept seed options
- [x] T012 Preserve existing seed passwords on repeated startup
- [x] T013 Require configured seed password for production compose

## Phase 5: Validation and Documentation

- [x] T014 Run backend build
- [x] T015 Run backend tests
- [x] T016 Record validation evidence
- [x] T017 Update `docs/audit/DEVELOPMENT_LOG.md`
- [x] T018 Update `docs/audit/FINAL_AUDIT_REPORT.md`
- [x] T019 Update `docs/project_docs/ROADMAP.md`
- [x] T020 Update `docs/audit/DOCUMENTATION_STATUS.md`

## Definition Of Done

- [x] Account lockout migration exists and is reviewed
- [x] Backend build passes
- [x] Account service tests pass
- [x] Production compose has no versioned seed password
- [x] Documentation records real evidence and residual limits
