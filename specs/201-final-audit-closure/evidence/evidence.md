# Evidence: Final Audit Closure

## Baseline

- Date: 2026-08-03
- Branch: `codex/199-ux-b2b-academic-onboarding`
- Baseline HEAD: `9f5dabd76145587cf92f032bbc8deb2360e4e696`
- Worktree: dirty before Spec 201; unrelated changes preserved.

## Finding disposition

| Finding | Initial state | Final disposition |
|---|---|---|
| GAP-AUTH-01 | Open | Closed: institutional Student-only registration, anti-enumeration and dedicated limiter |
| GAP-AUTH-02 | Open | Closed with tested `UserCareer`-based Professor scope |
| GAP-PRIV-01 | Open | Closed: Follow no longer reveals private profile fields |
| GAP-FILE-01 | Open | Accepted only for controlled local demo; blocks open pilot/production |
| GAP-INFRA-01 | Open | Tracked template remediated; real TLS target acceptance remains external |
| GAP-OPS-01 | Open | Live/readiness and correlation verified statically/build; central platform remains external |
| QA-UI-001 | Open | Closed: replacement character corrected and source scan clean |
| QA-DOC-01 | Open | Pending manual DOCX/PDF render and page review |
| QA-DIAG-01 | Open | Pending Mermaid/SVG render and visual review |
| REL-001 | Open | Pending same-SHA gate after explicit Git integration |
| DEL-001 | Open | Pending owner/print-provider execution |

## Implemented controls

- `PublicRegistrationPolicy` enforces `@itbeltran.com.ar` and Student-only public role.
- Public registration has HMAC-keyed per-source/per-identity limits with bounded memory
  fallback and atomic Redis evaluation.
- Duplicate identities and concurrent uniqueness failures use a generic GraphQL contract.
- Professor academic reads/writes are scoped to linked careers; Administrator remains
  global; students cannot create, toggle or delete academic resources, including legacy
  resources they uploaded.
- Public profile queries mask sensitive fields from ordinary followers.
- Production Compose requires an injected encrypted SQL connection string with a
  verifiable certificate instead of embedding `TrustServerCertificate=True`.
- `/health/live` checks process liveness and `/health/ready` checks cancellable database
  connectivity. Aggregate `/health` remains available.

## Executed commands and results

| Check | Result |
|---|---|
| Speckit QA preflight | PASS; requirements checklist 10/10 |
| Focused backend tests | PASS, 32/32 |
| `dotnet build API Graphql/OneITB/GraphQL.csproj -c Release --no-restore` | PASS, 0 warnings, 0 errors, 1.94 s |
| Full backend tests | PASS, 198/198, 3 s test execution |
| `npm.cmd run build` | PASS, Vite 8.0.16, 551 modules, 776 ms |
| `npm.cmd test -- --run` | PASS, 41 files and 144/144 tests |
| EF pending-model check | PASS, no model changes since the last migration |
| `docker compose -f docker-compose.prod.yml config --quiet` | PASS with process-local dummy values; no service started |
| UTF-8 replacement-character scan | PASS for C# and React source |
| Ignore/tracked-artifact review | Spec 201 and temporary audit ignored; local `.env` and secret helper ignored |
| `git diff --check` | PASS; only informational LF/CRLF conversion warnings |
| Markdown structural check | PASS, 19 files, 31 Mermaid blocks, balanced fences and valid local links outside examples |

## Explicitly unperformed or external

- No server, container or destructive database workflow was started.
- No browser regression, two-session WebSocket test or six-role manual walkthrough was
  performed in this closure.
- No real Microsoft Entra, SMTP, managed Redis, Cloudinary, SQL TLS or centralized
  observability acceptance was possible without destination configuration.
- No DOCX/PDF or Mermaid/SVG visual acceptance was performed.
- The static `/uploads` boundary remains unsuitable for confidential files in an open
  pilot; production requires private storage, signed URLs or an authorized gateway.
- No commit or push was requested or executed. Evidence belongs to the dirty worktree,
  not yet to a frozen candidate SHA.

## Release recommendation

| Target | Decision |
|---|---|
| Controlled local academic demo | Conditional GO after candidate-SHA and manual gates |
| Candidate freeze | Temporary NO-GO until Git integration and same-SHA rerun |
| Print package | Temporary NO-GO until diagram, DOCX/PDF and visual acceptance |
| Open institutional pilot | NO-GO while object-level file delivery remains open |
| Public production | NO-GO until external identity/infrastructure/operations acceptance |
