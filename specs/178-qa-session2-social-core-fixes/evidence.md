# Evidence: Spec 178 - QA Session 2 Social Core Fixes

**Date**: 2026-07-11  
**Risk**: HIGH - EF migration, GraphQL authorization, authenticated uploads, Apollo cache and persistent notifications.

## QA gate

- Requirement checklist: PASS, 16/16 complete.
- Initial preflight: backend/frontend/EF PASS; `git diff --check` found trailing whitespace in `Notification.cs`.
- Corrective action: whitespace removed and migration backfill capped legacy names with `LEFT(..., 255)`.
- Final decision: FIXED. No unresolved P0/P1 contract, authorization or migration issue.

## Data and migration

```powershell
docker compose ps
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build
```

Results:

- Docker SQL `oneitb23-sql`: healthy.
- Migration `20260711205348_AddSocialAttachmentsCommentReactionsAndNotificationGrouping`: applied.
- EF model drift: none.
- Migration is additive; rollback keeps legacy `Inquiry.FileUrl` and `Comment.FileUrl`.

## Automated verification

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-build

Set-Location "FrontEnd/OneItb-FE"
npm.cmd run test -- --run --configLoader runner
npm.cmd run build
```

Results:

- Backend Release: PASS, 0 warnings, 0 errors.
- Backend services: PASS, 47/47.
- Frontend components: PASS, 3 files / 6 tests.
- Vite production build: PASS, 356 modules, 1.07 s.
- `--configLoader runner` is the reproducible local Vitest path; the default loader can hit Windows `EPERM` in `.vite-temp`.

## Runtime contract smoke

The isolated Release API listened on `http://localhost:44401`; `runtime-validation.ps1` resolved the demo password from user-secrets in memory and never printed credentials or JWTs.

Verified against Docker SQL:

1. GraphQL health returned HTTP 200.
2. ADS student could publish in ADS and a forged CDIA subject was rejected.
3. Two authenticated REST uploads persisted as two named, ordered attachment descriptors.
4. Admin and professor comments generated one grouped comment notification with count 2.
5. Admin and professor reactions generated one grouped reaction notification with count 2.
6. Comment reaction persisted and returned active state/count.
7. Inquiry owner retrieved two reacting users through the bounded owner-authorized page.
8. Targeted `inquiriesPage(inquiryId)` returned attachments/comments and each notification used `/feed?inquiryId={id}`.
9. The runtime inquiry was soft-deactivated in cleanup; temporary local files and isolated processes were removed.

Result: PASS.

## Browser regression

- Authenticated `/feed` opened against the isolated Release API.
- Visible DOM confirmed the scoped subject selector and the multiple-attachment control.
- Visual inspection found a second legacy quick-post form with fake metrics in `SideBar.jsx`.
- `SideBar.jsx` was replaced by a real `me` summary and quick links; the duplicate composer was removed.
- Post-fix static scan found no `sidebar-post`/`sidebar-image`; frontend tests/build passed again.
- Final browser reload was blocked by the in-app browser URL policy after the first inspection. File picker, media modal and final sidebar visual confirmation remain a manual presentation-browser check; they are not marked `[V]` solely from build evidence.

## Residual risk

No known data/security/build blocker remains. Residual risk is limited to final manual visual interaction with native file selection and media viewers in the exact browser used for the defense.
