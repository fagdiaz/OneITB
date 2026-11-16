# Evidence: QA Master Polish and Layout

## Baseline

- Date: 2026-07-12
- Branch: `184-qa-master-polish-and-layout`
- Base commit: `611aa60`
- Worktree inherited uncommitted product changes from Specs 181-183; they will be preserved, validated and included only if they form part of the coherent release candidate.
- `Background.png`: 6,116,670 bytes. It will be referenced once as a low-opacity global texture; no duplicate component import.
- Prompt correction: mentions are identity-backed through existing `ReplyToUserId`; free-text username lookup is intentionally rejected as ambiguous.
- Prompt correction: job focus requires backend ActionUrl target IDs, so this is not frontend-only.

## Preflight

- Requirements checklist: PASS, 10/10.
- Constitution/spec/plan/research/contracts/tasks cross-check: PASS; no ambiguity or contract conflict remained.
- Speckit QA pre-implementation: PASS.
- Backend Release baseline: PASS, 0 warnings / 0 errors in 9.95 s.
- Frontend Vite baseline: PASS in 842 ms.
- `git diff --check`: PASS; only Windows LF/CRLF conversion notices.

## Validation

- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 63/63.
- `npm.cmd run test -- --run --configLoader runner`: PASS, 18 files / 39 tests.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings / 0 errors in 2.33 s.
- `npm.cmd run build`: PASS, 374 modules in 1.07 s in the final execution.
- `npm.cmd audit --audit-level=high`: PASS, 0 vulnerabilities.
- Runtime GraphQL on isolated `http://127.0.0.1:5099/graphql`: HTTP 200. The actual schema exposes `Comment.replyToUser` and the affected mutation surface. The temporary process was stopped after validation.
- Source scan: no `fetchPriority` casing remains in the brand DOM and no `Inicio` navigation action remains.
- `git diff --check`: PASS; only expected Windows line-ending notices.
- Browser visual regression is not executable from the available toolset. Auto-hide/reveal, global texture, mixed media mosaic, drawer and job focus remain an explicit manual presentation gate; component tests cover behavior contracts.

## Delivery

- Canonical ROADMAP, DOCUMENTATION_STATUS, FINAL_AUDIT_REPORT and newest-first DEVELOPMENT_LOG updated without changing the evidence-based 106/108 count.
- Git scope review: PASS. Only coherent product code, tests, migrations, documentation and approved assets from Specs 181-184 are eligible; specs/tooling, runtime keys and local diagnostics remain ignored.
- Commit: `a57ed89` (`Complete social media and visual stabilization`), 90 product files from Specs 181-184.
- Push target: `origin/184-qa-master-polish-and-layout`.
