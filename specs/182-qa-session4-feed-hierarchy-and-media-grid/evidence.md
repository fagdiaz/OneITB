# Evidence: Spec 182

## Prompt audit

- Corrected duplicated scope: existing `UserInteraction`, followed-first feed ordering, widget badge, and backdrop-close behavior will be reused and hardened.
- Rejected global framing/header relaxation and a CDN PDF worker.
- Selected lazy local PDF.js first-page rendering with explicit worker and cleanup.
- Added server-derived directed reply targets to prevent arbitrary mention notifications.
- Added social-edge uniqueness normalization so Follow no longer overwrites Mute/Block.

## Pre-implementation gates

- Mandatory `speckit-git-feature` hook created/switched to `182-qa-session4-feed-hierarchy-and-media-grid` and synchronized `.specify/feature.json`/`AGENTS.md`.
- `speckit-qa` preflight with `-RunBuilds -CheckEf`: PASS after normalizing the generated snapshot line endings; requirements checklist 16/16, backend build 0 warnings/0 errors, frontend build PASS (878 ms), EF model drift absent.
- Risk classified HIGH because the change adds a nullable FK, changes a unique social index, modifies authenticated GraphQL contracts and touches realtime/Apollo state.

## Implementation evidence

### Prompt corrections and quick wins

- Reused `UserInteraction`, existing followed-first ordering, the chat badge and notification dialog instead of adding parallel models/components.
- Normalized social uniqueness from observer/target to observer/target/type so Follow and Mute can coexist; Block removes incompatible edges atomically.
- Kept `X-Frame-Options: DENY`; PDF covers use local lazy PDF.js canvas rendering and the full viewer keeps the abortable/revocable Blob URL path.
- Added `ReplyToUserId`, with the server deriving the canonical root and recipient from a visible comment in the same inquiry. The client cannot forge arbitrary notification recipients.
- Split PDF.js into its own Vite chunk so the feed does not pay the parser cost before a PDF cover is needed.

### Database and backend

- Migration: `20260712215518_AddDirectedRepliesAndSocialGraphIndex`.
- `dotnet ef database update ... --configuration Release`: PASS against healthy Docker SQL Server.
- `dotnet ef migrations has-pending-model-changes ... --configuration Release`: PASS, no pending changes.
- Migration review: nullable `Comments.ReplyToUserId`, restrictive FK, explicit index, replacement of pair unique index with triple unique index. No cascade and no destructive data rewrite.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 62/62.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errors.

### Frontend

- `npm.cmd run test -- --run`: PASS, 12 files / 25 tests.
- `npm.cmd run build`: PASS, 368 modules in 1.12 s.
- Output includes independent `pdfjs` (406.44 kB) and `pdf.worker` (1,244.25 kB) assets; PDF.js is not merged into the initial vendor chunk.
- `npm.cmd audit --omit=dev --audit-level=high`: PASS, 0 vulnerabilities.
- Source scan: no PDF CDN/remote worker and no `mozPressure`/`mozInputSource` references in first-party source.
- `git -c core.autocrlf=false diff --check`: PASS after normalizing generated lockfile/snapshot line endings.
- Final `speckit-qa` preflight: PASS; checklist 16/16, diff-check PASS, backend build 0/0, Vite build 805 ms and EF model drift absent.

### Runtime GraphQL

- Docker SQL: healthy.
- Runtime schema smoke (`http://localhost:5088`, loopback-only temporary profile): `Query`, `myFollowedUserIds`, `inquiriesPage`, `addComment`, `followUser`, and `unfollowUser` exposed.
- Authenticated smoke using the configured demo secret without printing it:
  - login: PASS;
  - follow mutation + followed-ID readback: PASS;
  - directed reply stores canonical root and `replyToUserId`: PASS;
  - smoke comment immediately soft-deactivated: PASS;
  - unfollow mutation + readback absence: PASS.
- HTTPS was also proven able to bind with an explicitly exported temporary development certificate. The sandbox could not resolve the trusted certificate automatically from the Windows store, so no repository security setting was weakened and the temporary PFX was deleted.

### Browser/manual status

- No browser automation connector was available in this execution context. The authenticated visual checks for PDF mosaic, gallery overflow, comment highlight, minimized realtime badge, compact preferences, and Follow controls remain explicitly pending in the defense/manual checklist.
