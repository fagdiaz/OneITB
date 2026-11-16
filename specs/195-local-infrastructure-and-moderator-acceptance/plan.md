# Implementation Plan: Local Infrastructure and Moderator Acceptance

**Branch**: `195-local-infrastructure-qa` | **Date**: 2026-07-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/195-local-infrastructure-and-moderator-acceptance/spec.md`

## Summary

Add a canonical, idempotent Moderator identity and verify its authorization boundaries.
Introduce an opt-in acceptance Compose overlay with ephemeral Redis and Mailpit services.
Exercise Redis and SMTP through finite xUnit integration tests and preserve the existing
React/Apollo session-isolation regression. Orchestrate the complete gate from PowerShell
without starting the API, Vite or any foreground server.

## Technical Context

**Language/Version**: C#/.NET 8; JavaScript/React 18; PowerShell 5.1-compatible automation; Compose Specification

**Primary Dependencies**: EF Core 8.0.6, HotChocolate 14.2.0, StackExchange.Redis, Apollo Client 3.7, Docker Compose, Redis 7, Mailpit

**Storage**: Existing SQL Server 2022 Docker database; ephemeral Redis and Mailpit acceptance state

**Testing**: xUnit, EF Core InMemory, real Redis/SMTP container integration, Vitest/Testing Library, finite PowerShell gates

**Target Platform**: Windows development host with Linux containers; CI-compatible opt-in infrastructure tests

**Project Type**: Full-stack web application plus local acceptance infrastructure

**Performance Goals**: Redis event delivered within 10 seconds; SMTP capture visible within 10 seconds; every external wait bounded

**Constraints**: No `dotnet run`, Vite/dev server, destructive SQL reset, tracked secret, `latest` image tag or false provider verification

**Scale/Scope**: One canonical Moderator, two independent Redis providers, three SMTP scenarios, one session replacement regression

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Decoupled contracts**: PASS. No new REST business endpoint or production resolver is introduced.
- **Security/passwords**: PASS. Seeder reuses the injected password policy and preserves user-managed hashes.
- **Input validation**: PASS. Ports, timeouts, environment switches and captured message queries are bounded.
- **Relational integrity**: PASS. No model/migration change; only stable seed data and existing FKs are used.
- **Session/token management**: PASS. Existing JWT and Apollo session boundaries are tested, not bypassed.
- **Evidence completion**: PASS. Local Redis/Mailpit evidence is distinct from external-provider status.
- **Environment security**: PASS. Process-only dummy credentials are not committed or logged.

## Project Structure

### Documentation (this feature)

```text
specs/195-local-infrastructure-and-moderator-acceptance/
├── checklists/requirements.md
├── contracts/acceptance-gates.md
├── evidence.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
API Graphql/
├── Data/EnterpriseDemoSeeder.cs
├── Data/DbInitializer.cs
└── Tests/Services.Tests/
    ├── Data/EnterpriseDemoSeederTests.cs
    ├── Infrastructure/RedisIntegrationTests.cs
    └── Infrastructure/SmtpIntegrationTests.cs
FrontEnd/OneItb-FE/src/
├── context/AuthContext.test.jsx
└── data/graphql/GraphqlProvider.test.js
docker-compose.acceptance.yml
scripts/validate-local-infrastructure.ps1
```

**Structure Decision**: Production code remains in existing projects. The acceptance
overlay and script live at repository root; infrastructure tests stay in the existing
xUnit project and are opt-in through environment configuration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations require justification.
