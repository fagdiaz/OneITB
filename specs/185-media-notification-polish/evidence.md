# Evidence: Media and Notification Polish

## Baseline

- Date: 2026-07-13
- Branch: `185-media-notification-polish`
- Base commit: `a57ed89`
- Worktree at branch creation: clean.
- Prompt hardening: YouTube limit is enforced server-side as well as in React.
- Prompt hardening: `AggregateCount` remains historical; unread badge uses only `IsRead == false`.
- Prompt hardening: PDF preview reuses local PDF.js worker and preserves anti-framing headers.

## Preflight

- Speckit prerequisite check: PASS; active feature artifacts are complete.
- Cross-artifact analysis: PASS; no contract, constitution or dependency-order conflict found.
- Risk-based QA with builds and EF drift check: PASS.
- Backend baseline: Release build, 0 warnings and 0 errors.
- Frontend baseline: Vite production build PASS.
- EF Core baseline: no pending model changes.

## Validation

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings and 0 errors.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 65/65.
- `npm.cmd run test -- --run`: PASS, 21 files and 49 tests.
- `npm.cmd run build`: PASS, 374 modules in 858 ms in the final Speckit gate.
- `dotnet ef migrations has-pending-model-changes`: PASS, no model drift.
- `npm.cmd audit --omit=dev --audit-level=high`: PASS, 0 vulnerabilities.
- `git diff --check` and own-source scans: PASS.
- Release runtime on isolated `http://127.0.0.1:5099`: `{ __typename }` returned HTTP 200.
- Runtime `addInquiry` without a token returned `AUTH_NOT_AUTHENTICATED`, confirming the affected operation remains protected. Create/edit limit behavior is covered by passing service tests with no partial persistence.
- Temporary PID 28628 was stopped. Existing Debug backend on 44397 was not modified.

## Manual QA

- Browser tooling was not available in this execution environment. Landscape cover, PDF top-page crop, dark logo edge, global texture and preferences drawer remain explicit manual presentation checks; they are not reported as browser-verified.
