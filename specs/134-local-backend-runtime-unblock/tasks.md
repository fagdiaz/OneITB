# Tasks: Local Backend Runtime Unblock

**Input**: Design documents from `specs/134-local-backend-runtime-unblock/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Runtime evidence is required. Compilation alone is insufficient.

## Phase 1: Setup and Baseline

- [x] T001 Record current `git status --short` in `specs/134-local-backend-runtime-unblock/evidence.md`
- [x] T002 Verify `API Graphql/OneITB/Properties/launchSettings.json` uses `ASPNETCORE_ENVIRONMENT=Development` for profile `OneITB`
- [x] T003 Verify `API Graphql/OneITB/appsettings.json` keeps production/default SQL strict with `Encrypt=True` and `TrustServerCertificate=False`
- [x] T004 Verify `API Graphql/OneITB/appsettings.Development.json` contains only Development-scoped local SQL certificate mitigation
- [x] T005 Verify `API Graphql/OneITB/Program.cs` does not register Windows Event Log logging

## Phase 2: User Story 1 - Backend Local Startup (Priority: P1)

**Goal**: Backend starts locally with Development configuration.

**Independent Test**: `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB` reaches a listening GraphQL endpoint.

- [x] T006 [US1] Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` and record result in `specs/134-local-backend-runtime-unblock/evidence.md`
- [x] T007 [US1] Run `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB` and record startup output or blocker
- [x] T008 [US1] If SQL TLS fails, adjust only `API Graphql/OneITB/appsettings.Development.json` to `Encrypt=True;TrustServerCertificate=True` and record rationale
- [x] T009 [US1] If SQL SSPI fails, test a local-only override via `ConnectionStrings__DefaultConnection` using LocalDB or SQL Auth without committing secrets
- [x] T010 [US1] Execute GraphQL probe `query { __typename }` against `https://localhost:44397/graphql` and record result

## Phase 3: User Story 2 - HTTPS Dev Certificate Recovery (Priority: P1)

**Goal**: Local HTTPS certificate is present and trusted.

**Independent Test**: `dotnet dev-certs https --check --trust` succeeds and backend HTTPS endpoint is reachable.

- [x] T011 [US2] Run `dotnet dev-certs https --check` and record current certificate state
- [x] T012 [US2] Run `dotnet dev-certs https --clean`
- [x] T013 [US2] Run `dotnet dev-certs https --trust`
- [x] T014 [US2] Run `dotnet dev-certs https --check --trust` and record final state
- [x] T015 [US2] Update `docs/audit/RUNBOOK_DEV.md` with exact certificate recovery commands if missing or incomplete

## Phase 4: User Story 3 - SSPI vs TLS Diagnostics (Priority: P2)

**Goal**: Developers can identify and fix the correct class of SQL startup failure.

**Independent Test**: A captured SQL error is classified as TLS/certificate or SSPI/Kerberos with a corresponding local-only fix path.

- [x] T016 [US3] Add a diagnostic note to `docs/audit/RUNBOOK_DEV.md` distinguishing SQL TLS errors from `Failed to generate SSPI context`
- [x] T017 [US3] Document local-only fallback options for SSPI: LocalDB or SQL Auth via environment variable, without committed secrets
- [x] T018 [US3] Verify no production config, GraphQL resolver, EF migration, entity, or service file was changed for this unblock

## Phase 5: Quality and Closeout

- [x] T019 Run applicable QA preflight and record result in `specs/134-local-backend-runtime-unblock/evidence.md`
- [x] T020 Update `docs/project_docs/ROADMAP.md` only if runtime evidence closes the P0 blocker
- [x] T021 Add exactly one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md` only after implementation/runtime validation
- [x] T022 Update `docs/audit/DOCUMENTATION_STATUS.md` only if canonical runtime status changes
- [x] T023 Verify `DEVELOPMENT_LOG.md` remains newest-first if documentation is updated

## Dependencies

- T001-T005 before any runtime changes.
- T006-T010 and T011-T014 can proceed independently.
- T016-T018 depend on observed SQL behavior or documented fallback decision.
- T019-T023 are closeout tasks.

## Definition Of Done

- [x] Backend Release build passes.
- [x] Backend starts locally with `OneITB` launch profile or the exact blocker is recorded.
- [x] GraphQL `query { __typename }` succeeds over HTTPS or the exact blocker is recorded.
- [x] Certificate recovery commands are documented.
- [x] SQL TLS and SSPI failure paths are documented separately.
- [x] No production security posture is weakened.
- [x] No GraphQL service, EF migration, entity, or business logic file is modified.
