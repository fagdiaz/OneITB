# Implementation Plan: Final Operational Acceptance

**Branch**: `codex/194-final-operational-acceptance` | **Date**: 2026-07-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/194-final-operational-acceptance/spec.md`

## Summary

Convert the evidence-backed implementation state of Specs 186-193 into operational acceptance. Reuse the Docker SQL runtime, existing test suites and current browser flows; add bounded PowerShell orchestration for temporary services and security smokes; repair only reproducible defects; record external providers as blocked when credentials are absent.

## Technical Context

**Language/Version**: C#/.NET 8; JavaScript/TypeScript with React 18; PowerShell 5.1-compatible orchestration

**Primary Dependencies**: EF Core 8, HotChocolate 14, Apollo Client 3, Vite 8, SQL Server 2022 Docker

**Storage**: SQL Server Docker, local upload directory, Development email pickup; Redis/Cloudinary/SMTP conditional

**Testing**: xUnit, HotChocolate executor tests, Vitest/Testing Library, HTTP/GraphQL smoke checks and browser regression

**Target Platform**: Windows development host plus Linux SQL container; evergreen desktop browser

**Project Type**: Full-stack web application and operational validation tooling

**Performance Goals**: Feed page <=25, academic student page <=50, bounded validation runtime, no orphan processes

**Constraints**: No blocking `dotnet run`; no tracked secrets; no feature expansion; cleanup in `finally`; no false `[V]`

**Scale/Scope**: Specs 186-194, six institutional roles, canonical demo database and optional external providers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Decoupled contracts**: PASS. Business smokes use GraphQL; binary fixtures use the authorized upload endpoint.
- **Security**: PASS. Adversarial checks avoid logging credentials and do not relax authorization, CORS or file controls.
- **Input validation**: PASS. Upload and Magic Link boundaries are tested with bounded fixtures and request counts.
- **Relational integrity**: PASS. No EF model change is planned; fixtures are cleaned or existing demo data is read-only.
- **Session security**: PASS. Browser acceptance explicitly tests identity/cache/WebSocket isolation.
- **Evidence-based completion**: PASS. `[V]` requires executed runtime/browser evidence; external absence remains `[B]`.

## Project Structure

### Documentation (this feature)

```text
specs/194-final-operational-acceptance/
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
├── OneITB/                 # HTTP/GraphQL host
├── Services/               # business services
└── Tests/Services.Tests/   # backend regression suites
FrontEnd/OneItb-FE/
├── src/                    # application and component tests
└── package.json
scripts/
└── validate-predefense.ps1 # bounded automated release gate
docs/audit/
├── RUNBOOK_DEV.md
├── FINAL_AUDIT_REPORT.md
├── DEVELOPMENT_LOG.md
└── DOCUMENTATION_STATUS.md
```

**Structure Decision**: Keep production code in the established backend/frontend boundaries. Add only one tracked operational script under `scripts/`; detailed raw evidence remains in the ignored Spec 194 directory.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
No constitutional violations or new architectural layers are required.
