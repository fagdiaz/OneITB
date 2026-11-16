# Implementation Plan: Spec 166 Roadmap Quality Closure

**Branch**: current worktree (`137-siu-notifications`, dirty) | **Date**: 2026-07-06 | **Spec**: `specs/166-roadmap-quality-closure/spec.md`

## Summary

Close the highest-value remaining roadmap gaps that can be validated locally without pretending cloud/mobile/distributed infrastructure exists: backend auth/feed regression tests, CI quality gates, and canonical documentation alignment.

## Technical Context

**Language/Version**: .NET 8, EF Core 8.0.6, HotChocolate 14.2.0, React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4  
**Primary Dependencies**: xUnit, Moq, EF Core InMemory, GitHub Actions, existing services (`UsersService`, `AccountsService`, `SocialService`)  
**Storage**: InMemory database for service regression tests; SQL Server Docker remains runtime/integration target  
**Testing**: `dotnet test`, `dotnet build -c Release`, `npm.cmd run build`, CI workflow syntax review  
**Target Platform**: Local Windows dev and GitHub-hosted CI runners  
**Project Type**: Full-stack quality hardening  
**Performance Goals**: Tests run deterministically without external services; CI avoids Docker SQL unless a dedicated integration harness is added  
**Constraints**: No plaintext secrets, no new frontend test dependency unless necessary, no fake verification, no business REST endpoints  
**Scale/Scope**: Roadmap quality closure for P0/P8, not cloud/mobile/distributed feature delivery

## Constitution Check

- **Decoupled Application Contracts**: PASS. No new REST business endpoints.
- **Strict Security and Password Hashing**: PASS. Auth tests verify BCrypt and admin protection.
- **Input Validation and ReDoS Protection**: PASS. No new regex runtime path.
- **Relational Integrity and Soft Delete**: PASS. No schema change planned.
- **Secure Session and Token Management**: PASS. Tests cover JWT login payload and inactive-account boundaries.
- **Evidence-Based Completion**: PASS. Roadmap changes only follow test/build/CI/docs evidence.

## Project Structure

### Documentation (this feature)

```text
specs/166-roadmap-quality-closure/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/
|   `-- quality-gates.md
|-- quickstart.md
|-- tasks.md
|-- evidence.md
`-- audit/
    |-- initial-audit.md
    `-- final-audit.md
```

### Source Code

```text
API Graphql/
|-- Tests/Services.Tests/
|   |-- Auth/
|   |-- Social/
|   `-- TestSupport/ServiceTestData.cs

.github/workflows/
`-- quality-gates.yml

docs/project_docs/
|-- ROADMAP.md
|-- scope-and-requirements.md
`-- architecture-and-design.md

docs/audit/
|-- DEVELOPMENT_LOG.md
`-- DOCUMENTATION_STATUS.md
```

**Structure Decision**: Add focused backend tests in the existing test project; add CI as a repository workflow; update canonical docs in place.

## Project Alignment Notes

- `docs/project_docs/REQUERIMIENTOS.md` and `PLAN_DE_MITIGACION_EVALUACION.md` no longer exist after documentation normalization. The active equivalents are `scope-and-requirements.md`, `architecture-and-design.md`, `ROADMAP.md`, and the constitution.
- `ROADMAP.md` is authoritative for status. This spec may mark automated auth/feed tests and CI as implemented if evidence passes. It must not mark SQL integration, frontend component tests, distributed pub/sub, cloud storage, deployment or mobile as complete.

## Complexity Tracking

No constitution violations.

## Post-Design Constitution Check

- **Decoupled Application Contracts**: PASS. No new REST business endpoints.
- **Strict Security and Password Hashing**: PASS. Tests verify BCrypt persistence, login JWT and inactive-account rejection.
- **Input Validation and ReDoS Protection**: PASS. No new regex path; feed search normalization is bounded by existing query inputs.
- **Relational Integrity and Soft Delete**: PASS. No production schema changes.
- **Secure Session and Token Management**: PASS. Login now rejects inactive users before issuing JWT.
- **Evidence-Based Completion**: PASS with recorded boundary. Backend service tests passed; final host build was blocked by NuGet/network after EF restore attempt and is documented rather than reported as verified.
