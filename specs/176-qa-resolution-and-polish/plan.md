# Implementation Plan: QA Resolution and UX Polish

**Spec**: `specs/176-qa-resolution-and-polish/spec.md`  
**Date**: 2026-07-08  
**Risk**: MEDIUM/HIGH because it touches GraphQL server limits, registration contract behavior and shared layout components.

## Technical Context

- Backend: .NET 8, HotChocolate 14.2, EF Core 8.
- Frontend: React 18, Apollo Client, Vite 8, Tailwind CSS 4.
- Transport: `/graphql` for business operations.
- No EF schema migration is required.
- User-facing UI text remains Spanish; source identifiers remain English.

## Constitution Check

- GraphQL remains canonical; no REST business endpoint added.
- Security is not weakened: execution depth remains bounded and parser node cap remains explicit.
- No secrets or local runtime artifacts will be committed.
- Completion requires backend build, frontend build, diff check and documentation update.

## Scope

1. Tune GraphQL complexity/depth protection for valid jobs queries without disabling controls.
2. Remove Alias from registration UI dependency and generate username internally.
3. Fix header/layout overflow and selected filter contrast.
4. Redirect after profile save.
5. Close mini chat on route/outside click.
6. Preserve password input focus when toggling visibility.
7. Record Spec 176 in development log.

## Out of Scope

- Database column removal for legacy username/alias fields.
- Full browser visual regression automation.
- Broad mojibake/text encoding cleanup outside touched strings.

## Artifacts

- `research.md`
- `quickstart.md`
- `tasks.md`
- `evidence.md`
