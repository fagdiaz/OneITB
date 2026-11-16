# Implementation Plan: Final Release Candidate Audit

**Branch**: `179-social-polish-quick-wins` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/180-final-release-candidate-audit/spec.md`

## Summary

Run a final release candidate audit over the current codebase, including uncommitted Spec 179 quick wins. Validate Git hygiene, backend and frontend gates, EF model drift, runtime GraphQL where available, frontend console/browser where available, security contracts, and documentation. Implement only low-risk fixes tied to concrete findings.

## Technical Context

**Language/Version**: .NET 8, EF Core 8, HotChocolate 14.2, React 18, Apollo Client 3.7, Vite 8, Tailwind v4

**Primary Dependencies**: SQL Server Docker, Vitest, xUnit, GraphQL endpoint, authenticated `/api/upload`

**Storage**: SQL Server Docker local; no planned schema changes

**Testing**: `dotnet build`, backend tests, EF drift check, Vitest, Vite build, optional runtime smoke/browser QA

**Target Platform**: Local release candidate environment and browser

**Project Type**: Full-stack web application

**Performance Goals**: Keep validation deterministic; avoid adding dependencies or long-running background state beyond smoke tests

**Constraints**: No new features, no commit/push, no secrets, no roadmap verification without evidence

**Scale/Scope**: Entire repo audit with surgical fixes only

## Constitution Check

- Decoupled Application Contracts: PASS. Audit does not introduce new business transport.
- Strict Security and Password Hashing: PASS. Security validation is read/fix-only.
- Input Validation and ReDoS Protection: PASS. Existing upload/login/GraphQL guards are inspected.
- Relational Integrity and Soft Delete: PASS. EF drift is checked; no schema change planned.
- Secure Session and Token Management: PASS. Session/cache/logout and JWT boundaries are inspected.
- Evidence-Based Completion: PASS. All claims must be backed by commands or explicit blocker notes.

## Project Structure

```text
specs/180-final-release-candidate-audit/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

Source areas inspected:

```text
API Graphql/
FrontEnd/OneItb-FE/
docs/
.github/
docker-compose*.yml
.gitignore
```

**Structure Decision**: Use the existing repo layout and validation commands. Do not introduce new project structure.

## Complexity Tracking

No constitution violations.
