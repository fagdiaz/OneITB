# Implementation Plan: Spec 162 Session Boundary and Header Identity Fix

**Branch**: `137-siu-notifications` | **Date**: 2026-07-04 | **Spec**: `specs/162-session-boundary-header-fix/spec.md`

## Summary

The header identity leak is caused by an inconsistent logout path and unguarded cached `me` data. The existing `/logout` component clears local storage directly and only calls `setAuth({})`, leaving `isAuthenticated`, `token`, Apollo cache and session-owned queries alive long enough to render previous-user data. This plan centralizes login/logout in `AuthContext`, removes the partial-state logout path, and hardens `GET_USER_PROFILE` consumers so stale `me` results are ignored unless they match the active `auth.id`.

## Technical Context

**Language/Version**: React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4

**Primary Dependencies**: React Router, Apollo Client, existing AuthContext

**Storage**: Browser `localStorage` for canonical `token` and `user`; Apollo in-memory cache for GraphQL data

**Testing**: `npm.cmd run build` from `FrontEnd/OneItb-FE`; static source checks for direct session mutation; browser runtime if available

**Target Platform**: Web browser frontend

**Project Type**: Frontend hardening over existing full-stack app

**Performance Goals**: Avoid hard reloads; avoid broad refetch loops; clear session cache only on login/logout/expiration

**Constraints**: No dependencies, no backend schema change, no `localStorage.clear()`, preserve theme storage

## Constitution Check

- **Decoupled Application Contracts**: PASS. No transport or backend contract changes.
- **Security and Password Hashing**: PASS. Session isolation is strengthened.
- **Input Validation and ReDoS Protection**: PASS. No new external inputs.
- **Relational Integrity and Soft Delete**: PASS. No persistence changes.
- **Secure Session and Token Management**: PASS. This spec directly fixes session boundary leakage.
- **Evidence-Based Completion**: PASS with frontend build and documented runtime limitations.

## Project Structure

```text
FrontEnd/OneItb-FE/src/context/AuthContext.jsx
FrontEnd/OneItb-FE/src/Components/user/Login.jsx
FrontEnd/OneItb-FE/src/Components/user/Logout.jsx
FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx
FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx
FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx
FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js
```

## Phase 0 Research

See `research.md`.

## Phase 1 Design

See `data-model.md`, `contracts/session-boundary-contract.md`, and `quickstart.md`.

## Post-Design Constitution Check

PASS. The design narrows session state mutation and does not introduce new architecture exceptions.
