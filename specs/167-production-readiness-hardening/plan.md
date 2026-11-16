# Implementation Plan: Production Readiness Hardening

**Branch**: `167-production-readiness-hardening` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/167-production-readiness-hardening/spec.md`

## Summary

Harden the production-readiness layer without inventing infrastructure: add HTTP correlation logging, remove N+1-prone metric field resolvers by using batched GraphQL loading, and produce honest evidence/reporting for the remaining roadmap gaps.

## Technical Context

**Language/Version**: C#/.NET 8, React 18 where documentation references frontend state

**Primary Dependencies**: ASP.NET Core middleware, HotChocolate 14.2.0, EF Core 8.0.6, existing Apollo Client 3.7

**Storage**: SQL Server through existing `OneItbContext`

**Testing**: Existing xUnit service tests, backend build when restore permits, frontend build only if frontend files change

**Target Platform**: Local Docker SQL runtime and later Azure App Service/Azure SQL target

**Project Type**: Full-stack web application

**Performance Goals**: Avoid per-parent metric queries for GraphQL lists; keep request logging lightweight

**Constraints**: No new packages, no secrets, no new REST business endpoints, no roadmap inflation without runtime evidence

**Scale/Scope**: Final hardening increment for roadmap quality and production audit readiness

## Constitution Check

- Decoupled contracts: PASS. No new business REST endpoint is introduced.
- Security/session: PASS. No secret or auth weakening is introduced.
- Input validation: PASS. Correlation header is bounded and sanitized.
- Relational integrity: PASS. No EF model changes are introduced.
- Evidence-based completion: PASS. Blocked checks remain explicitly documented.

## Project Structure

### Documentation (this feature)

```text
specs/167-production-readiness-hardening/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code

```text
API Graphql/OneITB/
|-- Infrastructure/
|   |-- CorrelationIdMiddleware.cs
|   `-- GraphQLMetricsDataLoaders.cs
`-- Startup.cs

docs/
|-- audit/
|   |-- DEVELOPMENT_LOG.md
|   |-- DOCUMENTATION_STATUS.md
|   `-- FINAL_AUDIT_REPORT.md
`-- project_docs/ROADMAP.md
```

**Structure Decision**: Use the existing host project for middleware and GraphQL-specific DataLoaders. Avoid moving service-layer code during this hardening pass.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
