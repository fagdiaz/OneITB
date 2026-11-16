# Tasks: Cloud, DevOps & Scalability

**Input**: Design documents from `specs/170-cloud-devops-scalability/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Build validation is mandatory; Docker runtime is documented but may be blocked if local Docker is unavailable.

## Phase 1: Setup

- [x] T001 Create Speckit artifacts for `specs/170-cloud-devops-scalability/`
- [x] T002 Add `HotChocolate.Subscriptions.Redis` 14.2.0 to `API Graphql/OneITB/GraphQL.csproj`

## Phase 2: Production Docker

- [x] T003 [P] Add backend multi-stage Dockerfile at `API Graphql/OneITB/Dockerfile`
- [x] T004 [P] Add frontend multi-stage Dockerfile at `FrontEnd/OneItb-FE/Dockerfile`
- [x] T005 [P] Add SPA/WebSocket reverse proxy config at `FrontEnd/OneItb-FE/nginx.conf`
- [x] T006 Add `docker-compose.prod.yml` with SQL Server, Redis, backend and frontend
- [x] T007 Add/verify `.dockerignore` for production build contexts

## Phase 3: Distributed Subscriptions

- [x] T008 Modify `API Graphql/OneITB/Startup.cs` to register Redis subscriptions only when Redis configuration exists
- [x] T009 Preserve in-memory subscriptions as the local fallback in `API Graphql/OneITB/Startup.cs`

## Phase 4: Cloud Storage Fallback

- [x] T010 Add storage abstraction under `API Graphql/OneITB/Services/Storage/`
- [x] T011 Refactor `API Graphql/OneITB/Controllers/UploadController.cs` to delegate storage writes
- [x] T012 Adjust file URL validation in services to accept local `/uploads/` and Cloudinary HTTPS URLs only

## Phase 5: Security Hardening

- [x] T013 Add ASP.NET Core rate limiting to GraphQL and upload endpoints in `API Graphql/OneITB/Startup.cs`
- [x] T014 Add security headers middleware at `API Graphql/OneITB/Infrastructure/SecurityHeadersMiddleware.cs`
- [x] T015 Add production-safe configuration placeholders in `API Graphql/OneITB/appsettings.json`

## Phase 6: Validation and Documentation

- [x] T016 Run backend build and tests
- [x] T017 Run frontend build
- [x] T018 Record validation evidence in `specs/170-cloud-devops-scalability/evidence.md`
- [x] T019 Update `docs/project_docs/ROADMAP.md`
- [x] T020 Update `docs/audit/DEVELOPMENT_LOG.md`
- [x] T021 Update `docs/audit/FINAL_AUDIT_REPORT.md`
- [x] T022 Update `docs/audit/DOCUMENTATION_STATUS.md`

## Dependencies & Execution Order

Setup blocks all phases. Docker and backend hardening can proceed independently after setup. Validation and documentation run last.

## Definition Of Done

- [x] All required tasks are marked `[x]`
- [x] Backend and frontend builds pass
- [x] No secrets are committed
- [x] Local fallback remains the default
- [x] Roadmap and audit docs reflect evidence
