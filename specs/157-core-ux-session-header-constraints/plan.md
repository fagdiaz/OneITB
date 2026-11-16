# Implementation Plan: Spec 157 Core UX, Session & Header Constraints

## Technical Context

- Frontend: React 18, React Router, Apollo Client, Tailwind CSS v4, Vite 8.
- Existing Header components: `Header.jsx`, `Nav.jsx`, `GlobalSearch.jsx`.
- Existing theme layer: `ThemeContext.jsx` plus anti-FOUC script in `index.html`.
- Existing auth storage: canonical `token` and `user` localStorage keys.
- Existing Apollo layer: `GraphqlProvider.js` with `errorLink`.

## Constitution Check

- Decoupled contracts: PASS. No backend or GraphQL contract changes.
- Security/session: PASS. Expired token now clears local session and redirects explicitly.
- Input validation: PASS. No new server inputs.
- Relational integrity: PASS. No database work.
- Evidence-based completion: PASS pending frontend build.

## Design

1. Make active Header styles explicit via `useLocation` in `Nav.jsx`.
2. Keep search overlay anchored below the search button with `top-full mt-2`.
3. Default theme to light when anonymous or no stored preference exists; stop using OS dark preference as implicit default.
4. Centralize expired-session handling in Apollo `errorLink`, guarded by presence of a stored token.
5. Add local password visibility state in Login/Register only.

## Validation Plan

1. Run `npm.cmd run build`.
2. Record results in `evidence.md`.
