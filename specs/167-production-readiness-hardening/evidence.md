# Evidence: Production Readiness Hardening

**Date**: 2026-07-06

## Audit Inputs

- Canonical contracts and roadmap reviewed.
- Startup, GraphQL query/mutation registration, social service loading, Apollo cache policies, and remaining roadmap gaps inspected.

## Commands

| Command | Result | Notes |
|---|---|---|
| `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore` | BLOCKED | Failed before compilation because `project.assets.json` referenced missing fallback folder `C:\Users\CodexSandboxOffline\.nuget\packages`. |
| `$env:NUGET_PACKAGES="$env:USERPROFILE\.nuget\packages"; dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true` | PASS | Host compiled successfully. Six `NU1900` warnings remained because nuget.org vulnerability metadata is not reachable from this environment; no source warnings or errors. |
| `$env:NUGET_PACKAGES="$env:USERPROFILE\.nuget\packages"; dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore` | PASS | 34/34 tests passed. `NU1900` vulnerability metadata warnings remained due network boundary. |
| `dotnet dev-certs https --check --trust` | PASS | Trusted localhost development certificate exists in the main session. |
| Runtime smoke over HTTPS launch profile | BLOCKED | `Start-Job` host could not access the HTTPS development certificate and failed with "default developer certificate could not be found or is out of date." |
| Runtime smoke over HTTP local profile | PASS | Backend started against Docker SQL with process-scoped connection string, `POST /graphql` returned HTTP 200 for `{ __typename }`, response body `{"data":{"__typename":"Query"}}`, and `X-Correlation-ID: audit-smoke-167`. |
| Runtime correlation log check | PASS | Captured backend output contained `HTTP POST /graphql responded 200` and `audit-smoke-167`. |
| Runtime metric GraphQL smoke | PASS | Admin login succeeded; `users { totalPosts totalComments totalLikesReceived totalReportsReceived }` returned 53 users; `inquiriesPage(first: 5) { items { reportCount user { ...metrics } } totalCount }` returned 5 items over 154 total. |
| `npm.cmd run build` from `FrontEnd/OneItb-FE` | PASS | 341 modules transformed, production build completed in 2.40s. No frontend source changed in this spec; this was a regression gate. |
| `git diff --check` | PASS | Exit code 0. Git emitted line-ending conversion warnings only. |

## Blockers

- Host `.NET` build may require `dotnet restore` with network because spec 166 recorded a NuGet/restore boundary after EF model-check attempts.
- Browser/admin/runtime regression requires local backend/frontend sessions and cannot be marked verified from static inspection.
- Distributed pub/sub requires an external transport decision and package/infrastructure; this spec does not fake that milestone.

## Implementation Notes

- Added `CorrelationIdMiddleware` to propagate and log `X-Correlation-ID`.
- Configured simple console logging with single-line output and explicit correlation value in the structured log message.
- Replaced per-parent social metric count resolvers with HotChocolate/GreenDonut DataLoaders backed by grouped EF Core queries.
- No EF schema change or migration was introduced.
