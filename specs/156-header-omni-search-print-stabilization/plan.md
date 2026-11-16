# Implementation Plan: Spec 156 Header Omni-Search & CV Print Stabilization

## Technical Context

- Frontend: React 18, React Router, Apollo Client, Tailwind CSS v4, Vite 8.
- Backend: .NET 8, HotChocolate 14, EF Core 8.
- Existing `users` query is Admin-only, so omni-search needs a safe public profile-search query.
- Existing `me` query already exposes `avatarUrl` and `userCareers`.
- `CVPrintTemplate` is the canonical print template.

## Constitution Check

- Decoupled application contracts: PASS. Adds a GraphQL query, no REST business endpoint.
- Security: PASS. Public profile search returns only public metadata and never password/account secrets.
- Input validation: PASS. Search term is trimmed, bounded and parameterized through EF.
- Relational integrity: PASS. No DB changes.
- Evidence-based completion: PASS pending backend/frontend builds and evidence.

## Design

- Add `SearchPublicProfiles(searchTerm, first)` to GraphQL Query returning `PublicProfileSearchResult`.
- Add frontend query `SEARCH_PUBLIC_PROFILES`.
- Refactor `GlobalSearch` into one absolute overlay with a single input, profile result list and subject filters.
- Use `GET_USER_PROFILE` in Header search and Nav avatar hydration to avoid stale localStorage-only identity.
- Replace `/profile` direct print with modal preview + `window.print()` only after preview opens.

## Files

- `API Graphql/OneITB/GraphQL/Query.cs`
- `API Graphql/Services/DTOs.cs`
- `FrontEnd/OneItb-FE/src/data/graphql/queries/searchPublicProfiles.js`
- `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
- `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- `docs/audit/DEVELOPMENT_LOG.md`
- `docs/audit/DOCUMENTATION_STATUS.md`

## Validation Plan

1. Build backend Release.
2. Build frontend production bundle.
3. Record evidence and note browser validation if not executed.
