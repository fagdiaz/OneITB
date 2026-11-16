# Implementation Plan: Presentation Runtime Baseline

**Branch**: `129-console-runtime-cleanup` | **Date**: 2026-06-23 | **Spec**: [spec.md](spec.md)

## Summary

Establish a presentation-grade runtime baseline by reproducing the current console findings, classifying every recurring entry by ownership, fixing only application-owned issues, and documenting a startup path that works without browser filters or local suppression.

## Technical Context

**Language/Version**: C# / .NET 8; JavaScript / React 18

**Primary Dependencies**: ASP.NET Core, HotChocolate 14.2, Entity Framework Core 8.0.6, Apollo Client 3.7, Vite 8, Tailwind CSS 4

**Storage**: SQL Server; no schema changes planned for this spec

**Testing**: Release builds, GraphQL runtime checks, browser console inspection, documented startup checks

**Target Platform**: Local Windows development environment and modern desktop browsers

**Project Type**: Full-stack web application

**Performance Goals**: Startup and feed validation complete without repeated console loops or hanging network retries

**Constraints**: No local warning suppression; `/graphql` remains the business API; `POST /api/upload` remains the only REST binary exception; existing spec 129 work must not be reverted

**Scale/Scope**: Presentation-critical runtime path only: backend startup, frontend startup, login/feed load, link preview/media classification, CORS/WebSocket validation

## Constitution Check

- PASS: No new REST business endpoint is introduced.
- PASS: Security issues are fixed at source and not hidden in UI or browser configuration.
- PASS: No data model or migration change is planned.
- PASS: Runtime evidence is mandatory and incomplete checks remain blocked.
- PASS: Documentation updates must follow newest-first development log rules.

## Project Structure

### Documentation

```text
specs/130-presentation-runtime-baseline/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code Under Review

```text
API Graphql/OneITB/
API Graphql/Services/LinkPreviews/
FrontEnd/OneItb-FE/src/Components/publication/
FrontEnd/OneItb-FE/src/Components/chat/
FrontEnd/OneItb-FE/src/data/graphql/
docs/audit/RUNBOOK_DEV.md
docs/project_docs/ROADMAP.md
```

**Structure Decision**: Treat this as a stabilization gate over the current codebase, not a feature expansion. Code changes are allowed only when a finding is proven application-owned.

## Spec Sequence

1. `130-presentation-runtime-baseline`: active gate for reproducible startup, ownership classification, and app-owned console cleanup.
2. `131-media-embed-console-contract`: dependent spec for YouTube/embed/media rendering hardening if 130 proves media integration is still app-owned noisy.
3. `132-realtime-chat-console-contract`: dependent spec for WebSocket lifecycle and chat runtime if 130 proves realtime is still app-owned noisy.

## Complexity Tracking

No constitutional violations are accepted.
