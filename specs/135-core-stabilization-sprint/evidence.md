# Evidence: Core Stabilization Sprint

## Status

Completed and runtime-verified against SQL Server 2022 running in Docker.

## Baseline

- `git status --short`: dirty worktree inherited from specs 134/135; no commits performed.
- Active feature: `specs/135-core-stabilization-sprint`.
- `.gitignore`: keeps `specs/`, `.specify/`, logs, runtime uploads, build output and local secrets out of Git.
- EF migration generated: `20260624045925_AddModerationAuditAndFeedPagination`.
- EF migration review: creates only `dbo.ModerationAudits` with explicit restricted FKs to users, inquiries, comments and community reports.

## Docker SQL Runtime

- `docker --version`: PASS, Docker Engine available.
- `docker compose version`: PASS, Docker Compose available.
- Added `docker-compose.yml` using `mcr.microsoft.com/mssql/server:2022-latest`, port `1433`, named volume `oneitb23_sql_data`, and `ONEITB_SQL_SA_PASSWORD` from local environment.
- Added `.env.example`; created local ignored `.env` with a generated strong SA password. The real password is not recorded in evidence or tracked files.
- Added `UserSecretsId` to `API Graphql/OneITB/GraphQL.csproj`.
- Local secret command executed with password read from ignored `.env`:

```powershell
$password = ((Get-Content .env | Where-Object { $_ -like 'ONEITB_SQL_SA_PASSWORD=*' }) -replace '^ONEITB_SQL_SA_PASSWORD=', '')
$connection = "Server=localhost,1433;Database=OneItb;User Id=sa;Password=$password;Encrypt=False;TrustServerCertificate=True;"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" $connection --project "API Graphql/OneITB/GraphQL.csproj"
```

- `docker compose up -d`: PASS; container `oneitb23-sql` reached Docker health status `healthy`.
- `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS against Docker SQL.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS after Docker config and runtime fix, 0 errors, 5 nullable warnings in pre-existing service files.

## Runtime Validation

### Completed before P1 implementation

- `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- Backend launched with profile `OneITB`; Kestrel listened on `https://localhost:44397` and `http://localhost:5000`.
- GraphQL smoke `query { __typename }`: PASS.
- Admin login using seeded admin: PASS; JWT acquired without recording password.
- Subjects query with `career`, `year` and `prerequisites`: PASS.
- `addSubject` with career, year and prerequisite: PASS.
- Admin status mutation against an Administrator target: rejected as expected.
- Authenticated `POST /api/upload`: PASS, returned `/uploads/...txt`.
- Initial `addInquiry(fileUrl)` found a runtime bug: GraphQL returned `Cannot return null for non-nullable field` at `addInquiry.subject`.
- Fix applied: `SocialService.AddInquiryAsync` and `AddCommentAsync` now reload their GraphQL graph before returning.
- Re-run `addInquiry(fileUrl)` and `addComment(fileUrl)`: PASS.

### Final Docker-backed runtime verification

- Backend launched from Release output with `ASPNETCORE_ENVIRONMENT=Development` and `ASPNETCORE_URLS=http://localhost:5000`.
- GraphQL smoke `query { __typename }`: PASS.
- Admin login using seeded admin: PASS; JWT acquired without recording password.
- `careers`: PASS, 9 active careers returned.
- `subjects(careerId)`: PASS, academic fields returned.
- Authenticated `POST /api/upload`: PASS, returned `/uploads/...txt`.
- `addInquiry(fileUrl)`: PASS, persisted inquiry `ec6a462f-37da-4f98-96b0-bea0f8a6412f`.
- `addComment(fileUrl)`: PASS, persisted comment `b41dbe11-fd3e-4090-ad8c-5f685807e8be`.
- `inquiriesPage(first: 2)` executed for three pages: PASS, page counts `2,2,2`, 6 unique IDs and no duplicates.
- `inquiriesPage(searchTerm, careerId, subjectIds)`: PASS, 3 filtered runtime results.
- Moderation actions executed through live GraphQL:
  - `updateUserStatus`: PASS.
  - `silenceUser`: PASS.
  - `toggleInquiryStatus`: PASS and restored active state.
- `moderationAudits(first: 20)`: PASS, returned action types `ToggleInquiryStatus`, `SilenceUser`, `UpdateUserStatus`.
- Upload cleanup validation: PASS. Startup cleanup log recorded `Scanned=9 Deleted=1 Preserved=8 Failed=0`, proving one old orphan upload was deleted and referenced uploads were preserved.
- Upload cleanup `.gitkeep` regression: PASS. A 48h-old orphan was deleted and the 48h-old `wwwroot/uploads/.gitkeep` placeholder was preserved.

## Bugs Found and Fixes

- Fixed runtime GraphQL return-shape bug in `SocialService.AddInquiryAsync` and `AddCommentAsync` by reloading `User`, `Subject`, `Comments` and related graph before returning.
- Fixed runtime GraphQL return-shape bug in `SocialService.GetInquiries` by loading `Subject.Career` for paginated feed responses that request career data.
- Replaced the Development fallback away from LocalDB with Docker SQL Server. The password is intentionally a placeholder in `appsettings.Development.json`; `dotnet user-secrets` supplies the real local secret.
- Added defensive upload cleanup hosted service logging so cleanup failures do not silently pass as successful deletion.
- Fixed upload cleanup to skip dotfiles such as `.gitkeep`, preventing cleanup from dirtying the tracked uploads directory placeholder.

## P1 Feature Evidence

- Feed pagination implemented through `InquiryPage`, `ISocialService.GetInquiriesPageAsync`, `Query.inquiriesPage`, Apollo `GET_INQUIRIES_PAGE` and `Feed.jsx` `fetchMore`/load-more UI.
- Orphan upload cleanup implemented through `IUploadCleanupService`, `UploadCleanupService`, `UploadCleanupHostedService` and `UploadCleanup` configuration.
- Persistent moderation audit implemented through `ModerationAudit`, restricted EF mapping, `IModerationService.RecordAuditAsync`, admin-only `moderationAudits` query and an Admin Dashboard audit tab.
- Runtime checks for pagination duplicates, cleanup delete/preserve and audit rows are verified against SQL Server Docker.

## Quality Gates

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errors, 5 nullable warnings in pre-existing service files.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS, Vite build completed; existing warnings for chunk size and deprecated `vite:react-babel` esbuild option.
- `dotnet ef migrations has-pending-model-changes --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS, no pending model changes.
- `speckit-qa` preflight: PASS after normalizing touched C#/migration files to avoid CRLF/BOM whitespace noise under `core.autocrlf=false`.
- Backend runtime final regression: PASS against Docker SQL Server.
