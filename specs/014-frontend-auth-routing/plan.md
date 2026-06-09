# Implementation Plan: Frontend Auth and Routing (014)

**Branch**: `014-frontend-auth-routing` | **Date**: 2026-06-09 | **Spec**: [spec.md](file:///F:/React/OneITB23/specs/014-frontend-auth-routing/spec.md)

## Summary
Add `setContext` from `@apollo/client/link/context` to `GraphqlProvider.js` to automatically attach the JWT token from `localStorage` (`access_token`) to all outgoing requests. Update redirects on Login page using `useNavigate('/social')`.

## Technical Context
- **Language/Version**: React, Apollo Client
- **Apollo Setup**: `createHttpLink`, `setContext` (authLink).
- **Global Context**: `AuthProvider.jsx` handles local storage validation and updates global state.

## Project Structure
```text
specs/014-frontend-auth-routing/
├── spec.md
├── plan.md
└── tasks.md
```
