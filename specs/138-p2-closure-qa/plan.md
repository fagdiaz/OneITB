# Implementation Plan: P2 Closure QA

**Branch**: `137-siu-notifications` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/138-p2-closure-qa/spec.md`

## Summary

Close the P2 phase by replacing the academic design diagrams with current Mermaid diagrams and adding a backend unit-test suite for `AcademicService` and `NotificationService`. The implementation does not change production behavior; it adds documentation and automated regression coverage.

## Technical Context

**Language/Version**: C# .NET 8, Markdown Mermaid

**Primary Dependencies**: xUnit, Moq, EF Core InMemory provider, HotChocolate Subscriptions abstractions

**Storage**: EF Core InMemory for unit tests only; production SQL Server untouched

**Testing**: `dotnet test` for backend services, plus backend/frontend builds for closeout

**Target Platform**: Local developer workstation and CI-compatible .NET test runner

**Project Type**: Full-stack web application with backend test project

**Performance Goals**: Test suite should run locally in under 30 seconds

**Constraints**: No production behavior changes, no new GraphQL schema, no EF migrations, no secrets, no Docker dependency for unit tests

**Scale/Scope**: Diagrams for current domain; tests for `AcademicService` and `NotificationService`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Decoupled contracts: PASS. No new REST/GraphQL business endpoint.
- Security: PASS. Tests cover backend authorization and ownership rules.
- Validation/ReDoS: PASS. No new regex or unbounded external input.
- Relational integrity: PASS. No production model or migration changes.
- Session/token: PASS. No session changes.
- Evidence completion: PASS. `dotnet test`, builds, documentation and roadmap updates required.

## Project Structure

### Documentation

```text
specs/138-p2-closure-qa/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|-- tasks.md
`-- evidence.md
```

### Source Code

```text
API Graphql/
|-- Tests/Services.Tests/
|   |-- Services.Tests.csproj
|   |-- Academic/AcademicServiceTests.cs
|   |-- Notifications/NotificationServiceTests.cs
|   `-- TestSupport/
|-- Services/
|-- Data/
|-- Entities/
`-- OneITB/

docs/academic/04-design-diagrams.md
```

**Structure Decision**: Add a dedicated backend tests project under `API Graphql/Tests/Services.Tests` so service tests do not depend on the web host.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design

See [data-model.md](./data-model.md), [contracts/test-contract.md](./contracts/test-contract.md), and [quickstart.md](./quickstart.md).

## Constitution Check Post-Design

- PASS. Design adds tests and documentation only. No production schema, secrets, CORS, auth pipeline or migration changes.

## Complexity Tracking

No constitution violations.
