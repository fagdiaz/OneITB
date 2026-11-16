# Implementation Plan: Profile/CV Consolidation & Cleanup

**Branch**: `144-profile-cv-consolidation` | **Date**: 2026-06-29 | **Spec**: `specs/144-profile-cv-consolidation/spec.md`

## Technical Context

**Backend**: .NET 8, HotChocolate 14.2.0, EF Core 8, SQL Server  
**Frontend**: React 18, Apollo Client 3.7, Vite 8, Tailwind v4  
**Auth**: JWT claims with `ClaimTypes.NameIdentifier` and `ClaimTypes.Role`  
**Constraint**: Business operations stay in `/graphql`; no DB migration for this spec.

## Constitution Check

- Decoupled contracts: PASS. Uses GraphQL only.
- Security: PASS. `users` remains admin-only; edit flow moves to `me`.
- Input validation: PASS. Existing profile service handles payload; mutation enforces identity.
- Relational integrity: PASS. No persistence model changes.
- Evidence-based completion: PASS with build and static import validation; runtime GraphQL will be marked if not executed.

## Design Decisions

1. Add `Query.GetMe` instead of relaxing `GetUsers`.
2. Protect `Mutation.UpdateProfile` with `[Authorize]` and owner/admin enforcement.
3. Update Apollo `GET_USER_PROFILE` to request `me`.
4. Make `CvEditorProfile` the canonical edit surface and add a persistence panel for CV headline fields stored in the backend.
5. Delete `_temp_cv_reference` after confirming no production imports use it.

## Project Structure

- `API Graphql/OneITB/GraphQL/Query.cs`
- `API Graphql/OneITB/GraphQL/Mutation.cs`
- `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
- `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`
- `FrontEnd/OneItb-FE/src/types/resume.ts`
- `FrontEnd/OneItb-FE/src/_temp_cv_reference`

## Post-Design Constitution Check

No violations expected. Runtime GraphQL evidence remains preferred but compilation and query contract correction are sufficient to remove the known frontend authorization misuse.
