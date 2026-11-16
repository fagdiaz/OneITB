# Quickstart: Presentation Runtime Baseline

## Goal

Prove whether the project can be started and demonstrated without local console filtering.

## Validation Flow

1. Confirm active code and pending changes:
   - `git status --short`
   - `.specify/feature.json`
2. Build backend:
   - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`
3. Build frontend:
   - from `FrontEnd/OneItb-FE`, run `npm.cmd run build`
4. Start backend using documented local configuration.
5. Start frontend using documented local configuration.
6. Open a clean browser profile.
7. Execute:
   - login
   - authenticated feed load
   - rich media card with YouTube/link preview if seed data exists
   - upload display if seed data exists
   - mini chat collapsed
   - mini chat or full chat open
8. Record console findings in `evidence.md` as application-owned, external, fixed, or blocked.

## Pass Criteria

- No application-owned console errors remain during login and authenticated feed load.
- Any remaining third-party/browser warnings are classified with source evidence.
- Startup blockers are documented with remediation rather than hidden.
