# Tasks: Microsoft Entra Redirect Acceptance

## Phase 1 - Specification and audit

- [x] T001 Audit MSAL configuration, callback flow, local `.env`, backend user-secrets presence, and current documentation
- [x] T002 Create specification, plan, research, data model, contracts, quickstart, and requirements checklist
- [x] T003 Execute risk-based Speckit QA before implementation

## Phase 2 - Local configuration hardening

- [x] T004 [US3] Restrict plain HTTP callbacks to local loopback development in `FrontEnd/OneItb-FE/src/auth/microsoftEntraConfig.js`
- [x] T005 [P] [US3] Add callback security cases in `FrontEnd/OneItb-FE/src/auth/microsoftEntraConfig.test.js`
- [x] T006 [P] [US2] Clarify exact SPA registration and HTTPS deployment requirements in `FrontEnd/OneItb-FE/.env.example`

## Phase 3 - Operational documentation

- [x] T007 [US2] Add an `AADSTS50011` decision procedure to `docs/audit/RUNBOOK_DEV.md`
- [x] T008 [US2] Classify Microsoft-owned browser warnings and prohibited false fixes in `docs/audit/RUNBOOK_DEV.md`
- [x] T009 [US1] Record the external acceptance gate in `docs/project_docs/ROADMAP.md` and `docs/audit/FINAL_AUDIT_REPORT.md`

## Phase 4 - Verification and closure

- [x] T010 Run focused Microsoft Entra tests
- [x] T011 Run the complete frontend test suite and Vite production build
- [x] T012 Run static popup/URI/secret checks and `git diff --check`
- [x] T013 Update `docs/audit/DEVELOPMENT_LOG.md`, `docs/audit/DOCUMENTATION_STATUS.md`, and `evidence/evidence.md`
- [x] T014 Execute Speckit Analyze and reconcile claims
- [ ] T015 [US1] Confirm real institutional login, cancellation/retry, logout, and session isolation after Azure portal propagation

## Definition Of Done

- [ ] Exact localhost callback is registered as a SPA redirect in Microsoft Entra
- [x] Local callback and deployed HTTPS callback validation are covered by tests
- [x] Non-local HTTP callbacks fail closed
- [x] No popup authentication path is reintroduced
- [x] No OneITB CORS/CSP weakening is used to mask third-party warnings
- [x] Frontend tests and build pass
- [x] Canonical documents distinguish local implementation from external acceptance
- [x] Real institutional login and logout smoke are recorded, or remain explicitly blocked
- [x] No secret value is printed, committed, or copied into evidence
