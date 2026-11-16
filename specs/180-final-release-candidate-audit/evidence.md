# Evidence: Final Release Candidate Audit

**Date**: 2026-07-12  
**Spec**: `180-final-release-candidate-audit`  
**Mode**: Release candidate audit with surgical fixes only.

## Source Of Truth Reviewed

- `.specify/feature.json`: active feature set to `specs/180-final-release-candidate-audit`.
- `.specify/memory/constitution.md`.
- `docs/project_docs/ROADMAP.md`.
- `docs/project_docs/scope-and-requirements.md`.
- `docs/project_docs/architecture-and-design.md`.
- `docs/audit/DOCUMENTATION_STATUS.md`.
- `docs/audit/FINAL_AUDIT_REPORT.md`.

## Git Hygiene

- `git status --short --ignored`: intentional tracked changes from Spec 179 plus this Spec 180 backend seeder fix and documentation updates.
- `.gitignore` coverage confirmed for `.agents/`, `.specify/`, `AGENTS.md`, `specs/`, `.env`, upload directories, build outputs, logs and scratch audit files.
- `git diff --check`: PASS. Output contains only Windows LF/CRLF notices.

## Release Gates

| Gate | Result |
|---|---|
| `docker compose ps` | PASS: SQL Server container healthy and published on 1433 |
| `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` | PASS, 0 warnings, 0 errors |
| `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-build` | PASS, 47/47 |
| `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build` | PASS, no pending model changes |
| `npm.cmd run test -- --run --configLoader runner` | PASS, 4 files / 12 tests |
| `npm.cmd run build` | PASS, 357 modules, 743 ms on final run |
| Runtime GraphQL smoke | PASS: backend starts in `Development`, `POST http://localhost:5000/graphql` with `{ __typename }` returns HTTP 200 and `Query` |

## Findings And Fixes

### Fixed: EnterpriseDemoSeeder was not fully idempotent for job applications

Runtime smoke exposed a startup failure on an already seeded SQL Docker database:

```text
Violation of PRIMARY KEY constraint 'PK_JobApplications'.
Cannot insert duplicate key in object 'dbo.JobApplications'.
```

Root cause: `SeedJobApplicationsAsync` skipped only deterministic IDs, but did not protect against pre-existing rows with the same logical unique pair `JobOfferId + ApplicantId` created by previous runs.

Fix applied in `API Graphql/Data/EnterpriseDemoSeeder.cs`:

- Load existing rows by deterministic ID and by desired `JobOfferId + ApplicantId`.
- Track both `Id` and pair key while adding rows.
- Skip duplicates before adding to the EF Core change tracker.
- Preserve the existing unique index and `DeleteBehavior.Restrict` model; no migration required.

## Contract Audit

- Session/Apollo boundary: `AuthContext.logout()` clears local session and Apollo store; GraphQL error link handles auth expiration.
- Profile privacy: `publicProfile` and `searchPublicProfiles` mask sensitive data with backend-side authorization checks.
- Upload/static files: `/api/upload` enforces authentication, size limits and allowlist; static files include cross-origin resource policy headers.
- GraphQL hardening: depth, cost, parser and paging limits configured; rate limiter active.
- Sensitive mutations: role and ownership checks exist for user admin actions, job applications, academic operations and social operations.

## Roadmap Decision

No roadmap item was elevated from `[I]` to `[V]` during this audit except relying on the already documented `[V]` seed/runtime status. Remaining `[I]` items require authenticated browser or external-service evidence, not only compilation.

## Residual Manual QA

- Full browser regression for Admin panel.
- Authenticated browser regression for `/academic`, `/empleos` and `/empleos/mis-ofertas`.
- Manual validation of drag-and-drop file picker and media lightboxes on the defense browser.
- External SMTP/Redis/Cloudinary smoke with real secrets before production deployment.
