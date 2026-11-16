# Tasks: Local Infrastructure and Moderator Acceptance

**Input**: Design documents from
`specs/195-local-infrastructure-and-moderator-acceptance/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`,
`contracts/acceptance-gates.md`

**Tests**: Runtime infrastructure tests are opt-in and finite. No task may start
`dotnet run`, `npm run dev` or another foreground web server.

## Phase 1: Setup and Quality Gate

- [x] T001 Confirm the active feature in `.specify/feature.json` and the branch
  `195-local-infrastructure-qa`.
- [x] T002 Review the constitution, canonical roadmap and acceptance contracts.
- [x] T003 Run Speckit cross-artifact analysis for `spec.md`, `plan.md` and `tasks.md`.
- [x] T004 Run the risk-based Speckit QA gate before implementation.

## Phase 2: Local Acceptance Infrastructure

- [x] T005 [P] [US2] Add pinned, ephemeral Redis configuration to
  `docker-compose.acceptance.yml`.
- [x] T006 [P] [US3] Add pinned, ephemeral Mailpit configuration to
  `docker-compose.acceptance.yml`.
- [x] T007 [US4] Add bounded health checks, configurable non-default host ports and
  acceptance-only container names to `docker-compose.acceptance.yml`.
- [x] T008 [US4] Validate the acceptance Compose model without starting application,
  SQL Server or frontend services.

## Phase 3: Reproducible Moderator Identity

- [x] T009 [US1] Add a stable `Moderator1Id` and canonical institutional Moderator
  account to `API Graphql/Data/EnterpriseDemoSeeder.cs`.
- [x] T010 [US1] Point the canonical initializer reference at the dedicated Moderator
  in `API Graphql/Data/DbInitializer.cs`.
- [x] T011 [US1] Expose seeder internals only to the existing test assembly through
  `API Graphql/Data/Properties/AssemblyInfo.cs`.
- [x] T012 [US1] Add an idempotency/password-preservation regression in
  `API Graphql/Tests/Services.Tests/Data/EnterpriseDemoSeederTests.cs`.
- [x] T013 [US1] Add representative permitted and denied Moderator authorization
  regressions in `API Graphql/Tests/Services.Tests/Moderation/ModerationServiceTests.cs`,
  including audited hide/restore and rejection of administrator-only account changes.
- [x] T014 [US1] Verify the signed Moderator role and execute the existing frontend
  Student-to-Moderator session/cache replacement regressions as an explicit gate.

## Phase 4: Redis and SMTP Integration Tests

- [x] T015 [US2] Add an opt-in real Redis connectivity and cross-provider delivery
  test in `API Graphql/Tests/Services.Tests/Infrastructure/RedisIntegrationTests.cs`.
- [x] T016 [US2] Prove exact-once intended-topic delivery and unrelated-topic
  isolation with bounded cancellation.
- [x] T017 [US2] Dispose Redis connections, subscriptions and service providers on
  success and failure.
- [x] T018 [US3] Add an opt-in real SMTP delivery test in
  `API Graphql/Tests/Services.Tests/Infrastructure/SmtpIntegrationTests.cs`.
- [x] T019 [US3] Inspect Mailpit independently and assert recipient, subject and
  absence of secret patterns for configuration, reviewed and rejected messages.
- [x] T020 [US3] Delete acceptance-owned Mailpit fixtures and dispose HTTP/SMTP
  clients on success and failure.
- [x] T021 [US4] Keep infrastructure tests inert during ordinary test runs unless
  `ONEITB_RUN_INFRA_TESTS=true`.

## Phase 5: Finite Acceptance Orchestrator

- [x] T022 [US4] Add `scripts/validate-local-infrastructure.ps1` with bounded waits,
  process-only configuration and deterministic exit codes.
- [x] T023 [US4] Start only Redis and Mailpit in detached mode and verify service
  health before tests.
- [x] T024 [US4] Run infrastructure tests, full backend tests, frontend tests,
  Release/Vite builds, EF pending-model validation and `git diff --check`.
- [x] T025 [US4] Implement `try/finally` cleanup that removes only acceptance-owned
  services and releases their host ports.
- [x] T026 [US4] Support explicit `-SkipContainerStartup` and `-KeepContainers`
  diagnostics without changing the safe default cleanup behavior.
- [x] T027 [US4] Ensure command output redacts connection credentials and captured
  message bodies.

## Phase 6: Execution and Evidence

- [x] T028 Execute the opt-in Redis/Mailpit integration tests against healthy local
  containers without starting a web server.
- [x] T029 Execute the complete finite acceptance script and record its exit code.
- [x] T030 Confirm no acceptance container, temporary fixture or acceptance port
  remains after the default run.
- [x] T031 Confirm the existing SQL container and persisted database were not
  recreated, stopped or reset.
- [x] T032 Record exact commands, results and non-claims in
  `specs/195-local-infrastructure-and-moderator-acceptance/evidence.md`.

## Phase 7: Documentation and Definition of Done

- [x] T033 Update `docs/project_docs/ROADMAP.md` only for gates proven by evidence.
- [x] T034 Insert exactly one newest-first Spec 195 entry in
  `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T035 Update `docs/audit/DOCUMENTATION_STATUS.md` and keep external SMTP,
  Cloudinary, Google SSO and network WebSocket validation explicitly blocked.
- [x] T036 Run final Speckit analysis and QA over implementation and evidence.
- [x] T037 Mark every completed task and leave any unavailable gate explicitly
  blocked rather than completed.
- [x] T038 Verify `git diff --check`, secret hygiene and a feature-scoped diff.
- [x] T039 Create one feature-scoped commit without pushing.

## Dependencies and Execution Order

- Phase 1 blocks implementation.
- Phase 2 provides the real services required by Phase 4.
- Phase 3 is independent of the containers after Phase 1.
- Phase 4 blocks the finite acceptance run in Phase 5.
- Phase 6 blocks documentation status changes in Phase 7.
- T039 depends on all applicable Definition of Done gates.

## Definition Of Done

- [x] All applicable tasks are marked `[x]`.
- [x] Moderator seeding is idempotent and preserves an existing password hash.
- [x] Representative Moderator allowed and denied operations pass with no unintended
  writes.
- [x] Redis cross-provider delivery and recipient isolation pass against a real local
  container.
- [x] SMTP delivery and independent Mailpit inspection pass against a real local
  container.
- [x] Backend/frontend tests and production builds pass.
- [x] EF reports no pending model changes.
- [x] The finite script returns control and removes only acceptance-owned resources.
- [x] Evidence distinguishes local verification from external-provider and network
  WebSocket verification.
- [x] `ROADMAP.md`, `DEVELOPMENT_LOG.md` and `DOCUMENTATION_STATUS.md` match evidence.
- [x] The final diff contains no secret, unrelated file or generated runtime artifact.
- [x] A feature-scoped commit exists and no push was performed.
