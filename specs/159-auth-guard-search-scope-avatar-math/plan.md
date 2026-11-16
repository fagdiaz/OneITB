# Implementation Plan: Spec 159 Auth Guard, Search Scope, CV Consistency and Avatar Math

**Branch**: `137-siu-notifications` | **Date**: 2026-07-03 | **Spec**: `specs/159-auth-guard-search-scope-avatar-math/spec.md`

**Input**: QA findings for authenticated header guards, subject filter UX, cross-career publication scoping, CV print consistency and avatar editor canvas math.

## Summary

Spec 159 hardens existing behavior without adding persistence. The backend enforces career-based publication visibility for normal users inside `SocialService`, while Admin/Moderador preserve global moderation scope. The frontend hides omni-search for anonymous users, prevents unauthorized header profile queries, fixes subject filtering semantics, unifies CV print contact rows through `CVPrintTemplate`, and improves `AvatarEditorModal` with square crop, lower zoom and pointer drag-to-pan.

## Technical Context

**Language/Version**: .NET 8, C# 12, React 18, JavaScript/TypeScript, Vite 8.

**Primary Dependencies**: HotChocolate 14.2.0, EF Core 8.0.6, Apollo Client 3.7, Tailwind CSS 4, FontAwesome 6.6.0.

**Storage**: SQL Server via EF Core. No schema change for this spec.

**Testing**: `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`; `npm.cmd run build` from `FrontEnd/OneItb-FE`. Runtime GraphQL/browser validation recommended when backend is running.

**Target Platform**: Web browser and local .NET API over Docker SQL.

**Project Type**: Full-stack web app.

**Performance Goals**: Keep feed search paginated and EF-filtered server-side; avoid client-side filtering for security scoping.

**Constraints**:
- Business operations must stay on `/graphql`.
- No new REST endpoint.
- No canvas/crop npm package.
- Publication scoping must be backend-enforced, not only React-enforced.
- Admin/Moderador need global visibility for institutional operations.

**Scale/Scope**: Existing OneITB23 MVP/social-academic platform.

## Canonical Context

The skill references legacy filenames `docs/project_docs/REQUERIMIENTOS.md` and `docs/project_docs/PLAN_DE_MITIGACION_EVALUACION.md`; those files are not present after documentation normalization. Current canonical replacements read for this plan:

- `docs/project_docs/scope-and-requirements.md`
- `docs/project_docs/architecture-and-design.md`
- `docs/project_docs/ROADMAP.md`
- `.specify/memory/constitution.md`

## Constitution Check

*GATE: Passed before Phase 0 research. Re-check after Phase 1 design.*

- Decoupled contracts: Pass. Backend changes extend GraphQL only; uploads continue through existing REST exception.
- Security: Pass. Search guard and backend scoping avoid unauthorized data exposure.
- Input validation/ReDoS: Pass. No new regex on untrusted input; existing bounded search string remains in service query.
- Relational integrity/soft delete: Pass. No model or migration changes.
- Session/token management: Pass. Header and search skip anonymous query execution.
- Evidence-based completion: Pass. Build validation and evidence updates are required.

## Project Structure

### Documentation

```text
specs/159-auth-guard-search-scope-avatar-math/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/
|   `-- graphql-search-scope.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code

```text
API Graphql/
|-- OneITB/GraphQL/Query.cs
`-- Services/Social/SocialService.cs

FrontEnd/OneItb-FE/src/
|-- Components/layout/private/Header.jsx
|-- Components/layout/private/GlobalSearch.jsx
|-- Components/layout/private/Nav.jsx
|-- Components/profile/UserProfile.tsx
|-- Components/profile/CvEditorProfile.tsx
|-- Components/profile/AvatarEditorModal.jsx
|-- Components/resume/CVPrintTemplate.tsx
`-- Components/publication/Feed.jsx
```

**Structure Decision**: Apply scoped edits to existing service/resolver/component files. No new project, no migration, no dependency.

## Complexity Tracking

No constitution violations.
