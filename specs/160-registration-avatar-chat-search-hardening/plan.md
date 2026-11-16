# Implementation Plan: Spec 160 Registration, Avatar, Chat and Search Hardening

**Branch**: `137-siu-notifications` | **Date**: 2026-07-03 | **Spec**: `specs/160-registration-avatar-chat-search-hardening/spec.md`

**Input**: Feature specification from `/specs/160-registration-avatar-chat-search-hardening/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command.

## Summary

This hardening spec fixes four QA-critical areas: complete registration with non-admin role and career selection, avatar retention and bounded canvas editing, chat unread/avatar/presence consistency, and smart academic search filters. The implementation will update the existing GraphQL registration input/service, React registration form, profile editor save/canvas math, chat GraphQL fragments/components, and global search filter behavior while preserving Spec 159 backend career scoping.

## Technical Context

**Language/Version**: .NET 8, C# 12, React 18, JavaScript/TypeScript, Vite 8

**Primary Dependencies**: HotChocolate 14.2.0, EF Core 8.0.6, Apollo Client 3.7, Tailwind CSS 4, FontAwesome

**Storage**: SQL Server via EF Core; no new tables expected

**Testing**: `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`; `npm.cmd run build` from `FrontEnd/OneItb-FE`

**Target Platform**: Web browser frontend and ASP.NET Core backend

**Project Type**: Full-stack web application

**Performance Goals**: Header queries remain bounded and skipped for anonymous users; chat unread badge uses existing paged contacts query

**Constraints**: No administrative roles in public registration; no new REST business endpoints; no new avatar editor dependencies; preserve backend career scoping

**Scale/Scope**: QA hardening over identity, profile, chat and search modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Decoupled Application Contracts**: PASS. Business changes use GraphQL; no REST expansion.
- **Security and Password Hashing**: PASS. Public role choices explicitly exclude administrative roles; backend validates role regardless of UI.
- **Input Validation and ReDoS Protection**: PASS. Registration validation remains bounded; no new untrusted regex beyond existing email validation.
- **Relational Integrity and Soft Delete**: PASS. Registration only creates `UserCareer` links over existing explicit FK model; no schema migration expected.
- **Secure Session and Token Management**: PASS. Header/search skips anonymous operations.
- **Evidence-Based Completion**: PASS with build evidence; browser runtime will be recorded if unavailable.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Use existing OneITB23 directories:

```text
API Graphql/Services/DTOs.cs
API Graphql/Services/Users/UsersService.cs
API Graphql/Services/Messaging/IMessagingService.cs
API Graphql/Services/Messaging/MessagingService.cs
FrontEnd/OneItb-FE/src/Components/user/Register.jsx
FrontEnd/OneItb-FE/src/Components/user/Login.jsx
FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx
FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx
FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx
FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.jsx
FrontEnd/OneItb-FE/src/Components/chat/*
FrontEnd/OneItb-FE/src/data/graphql/*
```

The plan skill references `docs/project_docs/REQUERIMIENTOS.md` and `PLAN_DE_MITIGACION_EVALUACION.md`, but the canonical current repository documents are `scope-and-requirements.md`, `architecture-and-design.md`, `ROADMAP.md`, and `.specify/memory/constitution.md`. Those are used as source of truth for this plan.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
