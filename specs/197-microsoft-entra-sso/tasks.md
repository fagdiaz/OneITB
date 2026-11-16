# Tasks: Microsoft Entra Institutional SSO

## Phase 1: Specification and safety gate

- [x] T001 Record Git state and preserve unrelated Spec 196 changes
- [x] T002 Complete specification, research, model, contracts and checklist
- [x] T003 Execute HIGH-risk Speckit QA baseline

## Phase 2: Persistence and local auth compatibility

- [x] T004 Make local password hash optional only for external-only accounts
- [x] T005 Add external provider/tenant/subject/last-login account fields
- [x] T006 Configure explicit lengths and unique filtered identity index
- [x] T007 Generate and inspect `AddMicrosoftEntraIdentity`
- [x] T008 Make password login/admin verification reject SSO-only accounts safely

## Phase 3: Backend Entra adapter

- [x] T009 Add validated `MicrosoftEntraOptions`
- [x] T010 Implement cached tenant metadata and cryptographic access-token validation
- [x] T011 Implement bounded IP/identity SSO rate limiting
- [x] T012 Implement transactional link/provision and canonical JWT issuance
- [x] T013 Persist sanitized success/rejection audit events without tokens
- [x] T014 Register services conditionally without breaking unconfigured local startup

## Phase 4: GraphQL contract

- [x] T015 Add public `microsoftLogin(accessToken)` mutation with cancellation
- [x] T016 Add stable controlled error codes and generic client messages
- [x] T017 Add own-profile institutional-link Boolean
- [x] T018 Update mutation authorization/schema contract tests

## Phase 5: React/MSAL integration

- [x] T019 Install pinned MSAL browser/react dependencies
- [x] T020 Add tenant-specific PKCE/MSAL configuration using `sessionStorage`
- [x] T021 Add Microsoft institutional button and disabled/error/loading states
- [x] T022 Exchange the Entra API token and enter the existing OneITB session boundary
- [x] T023 Clear MSAL cache on logout/session replacement
- [x] T024 Display linked institutional account indicator on own profile

## Phase 6: Automated and runtime validation

- [x] T025 Add token validation, signing-key refresh and configuration tests
- [x] T026 Add linking/provisioning/conflict/idempotency/security tests and database-level concurrency safeguards
- [x] T027 Add SSO-only local login and authorization matrix tests
- [x] T028 Add frontend button/config/session cleanup tests
- [x] T029 Run backend tests and Release build
- [x] T030 Run frontend tests and Vite build
- [x] T031 Run EF migration list and zero model-drift check
- [x] T032 Validate running GraphQL schema and controlled rejection without blocking

## Phase 7: Documentation and closure

- [x] T033 Replace active Google SSO roadmap/audit/runbook/final-document references
- [x] T034 Document Entra app registration, API scope, redirect URIs and environment
- [x] T035 Update Roadmap, Development Log and Documentation Status
- [x] T036 Run repository Google-SSO/secret hygiene search and `git diff --check`
- [x] T037 Complete evidence and cross-artifact analysis

## Definition Of Done

- [x] Microsoft Entra access tokens are fully validated before local account changes
- [x] Only the canonical OneITB JWT authorizes application resolvers
- [x] Existing password and Magic Link logins still pass
- [x] SSO-only accounts cannot crash or bypass local password checks
- [x] External identity uniqueness is enforced by SQL Server
- [x] No external token or secret is persisted or logged
- [x] Logout purges Apollo, WebSocket and MSAL session state
- [x] Backend/frontend tests and builds pass
- [x] EF reports no pending model changes
- [x] Runtime schema and rejection smoke are evidenced
- [x] Active documentation and final delivery consistently describe Microsoft Entra
- [x] No commit or push is performed
