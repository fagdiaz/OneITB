# Implementation Plan: Spec 161 Session Cache, Search and Avatar Hardening

**Branch**: `137-siu-notifications` | **Date**: 2026-07-04 | **Spec**: `specs/161-session-cache-search-avatar-hardening/spec.md`

**Input**: Feature specification from `/specs/161-session-cache-search-avatar-hardening/spec.md`

## Summary

This hardening spec closes presentation-critical issues around Apollo session memory, cache replacement warnings, profile search by institutional email, registration/auth localization, institutional email validation, and avatar canvas export fidelity. The implementation stays within existing GraphQL contracts, adds no database schema, and preserves the Spec 159/160 search scope, chat unread state and registration flow.

## Technical Context

**Language/Version**: .NET 8, C# 12, React 18, JavaScript/TypeScript, Vite 8

**Primary Dependencies**: HotChocolate 14.2.0, EF Core 8.0.6, Apollo Client 3.7, Tailwind CSS 4

**Storage**: SQL Server via EF Core; no new tables or migrations

**Testing**: `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`; `npm.cmd run build` from `FrontEnd/OneItb-FE`

**Target Platform**: Web browser frontend and ASP.NET Core backend

**Project Type**: Full-stack web application

**Performance Goals**: Logout cache clearing must be bounded; cache field policies must avoid stale cross-filter result mixing; search by email must reuse existing bounded profile query

**Constraints**: No third-party dependencies; no schema migrations; no administrative role registration; preserve backend career scoping

**Scale/Scope**: QA hardening over identity/session, Apollo cache, global profile search and avatar editor

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Decoupled Application Contracts**: PASS. Business operations remain GraphQL; no REST expansion.
- **Security and Password Hashing**: PASS. Public registration still excludes administrative roles; logout cache purge reduces session bleed risk.
- **Input Validation and ReDoS Protection**: PASS. Registration regex is bounded and client-side only; backend validation remains in existing services.
- **Relational Integrity and Soft Delete**: PASS. No data model or migration change.
- **Secure Session and Token Management**: PASS. Apollo memory is cleared on logout and existing expiration interception remains.
- **Evidence-Based Completion**: PASS with required backend/frontend builds; runtime/browser checks will be recorded as executed or unverified.

## Project Structure

### Documentation

```text
specs/161-session-cache-search-avatar-hardening/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/
|   `-- cache-and-search-contract.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code

```text
API Graphql/OneITB/GraphQL/Query.cs
FrontEnd/OneItb-FE/src/context/AuthContext.jsx
FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js
FrontEnd/OneItb-FE/src/Components/user/Register.jsx
FrontEnd/OneItb-FE/src/Components/user/Login.jsx
FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.jsx
```

**Structure Decision**: Apply surgical changes in existing files. Do not introduce new runtime modules unless the current provider cannot expose cache clearing cleanly.

**Canonical Docs Note**: The upstream plan skill references `docs/project_docs/REQUERIMIENTOS.md` and `docs/project_docs/PLAN_DE_MITIGACION_EVALUACION.md`; those files are no longer present. Current source of truth is `.specify/memory/constitution.md`, `docs/project_docs/ROADMAP.md`, `docs/project_docs/scope-and-requirements.md`, and `docs/project_docs/architecture-and-design.md`.

## Phase 0 Research

See `research.md`.

## Phase 1 Design

See `data-model.md`, `contracts/cache-and-search-contract.md`, and `quickstart.md`.

## Post-Design Constitution Check

- **Decoupled Application Contracts**: PASS.
- **Security and Password Hashing**: PASS.
- **Input Validation and ReDoS Protection**: PASS.
- **Relational Integrity and Soft Delete**: PASS.
- **Secure Session and Token Management**: PASS.
- **Evidence-Based Completion**: PASS, pending actual command evidence.

## Complexity Tracking

No constitution violations.
