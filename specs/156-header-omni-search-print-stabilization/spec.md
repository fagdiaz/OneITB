# Spec 156: Header Omni-Search & CV Print Stabilization

## Objective

Stabilize the Header hierarchy, omni-search interaction, profile avatar hydration and `/profile` CV print preview so the UX is production-ready and does not block navigation.

## Requirements

- The `ONEITB` brand link must be visually static and must not reuse utility-button glow/ring effects.
- Header search must not push navigation items while expanded.
- Search overlays must not intercept unrelated Router navigation.
- The Header must expose a single omni-search input for publications and public profiles.
- Profile search must use a safe public GraphQL contract and must not call the Admin-only `users` query.
- Search filters must derive the authenticated user's careers from `me`; visual filters must focus on subjects for those careers.
- Header avatar must resolve the persisted `avatarUrl` from backend uploads.
- `/profile` print must open a preview modal using the shared `CVPrintTemplate` and print only that template.
- Print palette must remain institutional and avoid residual purple/violet accents.

## Non-Goals

- No database schema changes.
- No migrations.
- No business REST endpoints.
- No unrelated design expansion.

## Validation

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`
- `npm.cmd run build` from `FrontEnd/OneItb-FE`
