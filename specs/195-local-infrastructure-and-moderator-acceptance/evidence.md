# Evidence: Local Infrastructure and Moderator Acceptance

## Execution Context

- Date: 2026-07-28.
- Branch: `195-local-infrastructure-qa`.
- Base commit: `c39ad63`.
- Complete gate command:

~~~powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& "scripts/validate-local-infrastructure.ps1"
~~~

- Final exit code: `0`.
- No `dotnet run`, `npm run dev`, foreground API or Vite server was executed.
- Unrelated local file `prompt_modulo1.txt` was not read, staged or modified.

## Gate Matrix

| Gate | Status | Evidence |
|---|---|---|
| Moderator seed/idempotency | PASS | Canonical `moderador1@itbeltran.com.ar`; second seed preserved a changed BCrypt hash, retained exactly one account/user and did not rewrite the established 280-message demo graph |
| Moderator JWT | PASS | Signed token contains exactly the canonical `Moderador` role |
| Moderator authorization | PASS | Hide/restore persisted two audits without changing author text; declarative matrix permits moderation/silence and excludes Admin-only account mutations |
| Student -> Moderator session boundary | PASS | Focused Vitest run: 2 files, 5 tests; cache, identity and transport are cleared before role B |
| Redis health/PING | PASS | `redis:7.4.2-alpine` became healthy and real client PING completed below the bounded threshold |
| Redis cross-provider delivery | PASS | One event crossed two independently built HotChocolate providers exactly once |
| Private topic isolation | PASS | Unrelated topic observed zero events during the bounded collection window |
| SMTP Mailpit capture | PASS | `axllent/mailpit:v1.29.7` captured configuration, Reviewed and Rejected scenarios |
| SMTP content inspection | PASS | Recipient/subject matched and independent HTTP inspection found no password, access token, connection string or exception detail |
| Mail fixtures | PASS | Acceptance-owned message IDs were deleted through Mailpit API |
| Backend suite | PASS | 152/152 tests |
| Frontend suite | PASS | 31 files, 79/79 tests |
| Backend Release build | PASS | 0 warnings, 0 errors |
| Frontend Vite build | PASS | 380 modules, 0 errors, 669 ms |
| EF model consistency | PASS | `has-pending-model-changes`: no changes since latest migration |
| SQL isolation | PASS | SQL container ID/running state/start timestamp fingerprint unchanged |
| Compose/patch hygiene | PASS | Acceptance Compose config and `git diff --check` passed |
| Cleanup | PASS | Acceptance containers/network removed and ports 16379/11025/18025 released |
| Network WebSocket handshake | BLOCKED | Prohibited by the no-web-server constraint; Redis provider transport is verified, not the external HTTP upgrade |
| Production SMTP | BLOCKED | Public-provider credentials intentionally absent |
| Managed Redis | BLOCKED | Local Redis does not verify a managed cloud service |
| Cloudinary provider | BLOCKED | Credentials intentionally absent |
| Google SSO | BLOCKED | Credentials, callbacks and institutional approval absent |

## Diagnostic Iterations

1. The first run failed because the test-only HotChocolate query type was private.
   Cleanup completed; the fixture was made public without changing production schema.
2. The second run passed Redis/SMTP and failed only at EF design-time JWT configuration.
   Cleanup completed; Development profile and a random process-only JWT key were added.
3. A subsequent run reached `git diff --check`, which correctly detected a pre-existing
   documentation EOF whitespace change. The relevant audit document was normalized.
4. The final complete run passed every executable gate and cleanup.

## Security and Cleanup

- SMTP password and JWT key were generated per process and never printed or persisted.
- Redis connection and Mailpit endpoint existed only as process environment variables.
- Captured message bodies, tokens and connection strings are absent from this evidence.
- Compose owns no volume and removes only project `oneitb195acceptance`.
- Existing SQL container and database were not started, stopped, recreated or reset.
- The default runner restored every changed process environment variable.

## Non-Claims

- Mailpit proves the network SMTP adapter, not a public SMTP provider.
- Local Redis proves distributed HotChocolate provider behavior, not managed Redis.
- Provider-level pub/sub does not prove a network WebSocket handshake.
- Cloudinary and Google SSO remain blocked by external configuration/approval.

## Result

All locally controllable Spec 195 gates passed. External-provider and network-only gates
remain explicitly blocked and do not weaken the local Code Freeze decision.
