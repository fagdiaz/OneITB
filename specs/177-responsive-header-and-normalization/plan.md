# Implementation Plan: Responsive Header and Registration Normalization

**Branch**: `177-responsive-header-and-normalization` | **Date**: 2026-07-10 | **Spec**: specs/177-responsive-header-and-normalization/spec.md

## Technical Context

**Backend**: .NET 8, ASP.NET Core, HotChocolate 14, EF Core 8
**Frontend**: React 18, React Router v6, Apollo Client, Tailwind CSS v4
**Persistence**: SQL Server, no schema change required
**Scope**: Header responsiveness, router future flags, registration normalization and static upload response headers

## Constitution Check

- Business operations remain GraphQL-only; no new REST business endpoint.
- Binary/static file exception remains `/api/upload` and `/uploads/{file}`.
- Input validation and normalization are backend-enforced.
- No secrets, migrations or unrelated feature expansion.
- Completion requires build/test evidence and one top `DEVELOPMENT_LOG.md` entry.

## Design Decisions

- Keep desktop navigation unchanged where space allows.
- Add compact navigation for sub-`lg` screens with hamburger menu and active route states.
- Keep notification bell and avatar outside the hamburger so session-critical actions remain visible.
- Enable React Router future flags on `BrowserRouter`.
- Normalize registration email both client-side and server-side; backend is authoritative.
- Add static file cross-origin headers only to static file responses.

## Validation

- Backend build.
- Backend services tests for registration normalization.
- Frontend Vite build.
- `git diff --check`.
- Manual browser QA remains recommended for visual header behavior.
