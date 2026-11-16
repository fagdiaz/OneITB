# Implementation Plan: Auth UX Fixes

**Branch**: `141-auth-ux-fixes` | **Date**: 2026-06-29 | **Spec**: `specs/141-auth-ux-fixes/spec.md`

## Technical Context

**Backend**: .NET 8, HotChocolate  
**Frontend**: React 18, Apollo Client, React Router, Tailwind v4  
**Relevant files**:

- `API Graphql/Services/Accounts/AccountsService.cs`
- `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
- `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`

## Constitution Check

- Security: PASS. No relaxation of authentication or route protection.
- Evidence: PASS. Build evidence recorded in `evidence.md` from executed validation.

## Design

- Hydrate auth state before route authorization decisions.
- Convert expected login failures into GraphQL-safe exceptions.
- Surface Apollo GraphQL errors in the login UI.
