# Research: Local Infrastructure and Moderator Acceptance

## Existing Baseline

- Development Compose currently contains only SQL Server.
- Production Compose already uses Redis service `oneitb-redis`.
- `Startup.ConfigureSubscriptionProvider` selects Redis when
  `ConnectionStrings:Redis` is present and otherwise uses in-memory subscriptions.
- `RedisMagicLinkRateLimiter` shares the same configured multiplexer.
- `SmtpEmailService` uses the framework SMTP client; Development otherwise uses a local
  pickup directory.
- `EnterpriseDemoSeeder` has stable accounts for five roles but aliases
  `DbInitializer.ModeratorId` to the second Administrator.
- Authorization tests already enforce canonical role attributes and ownership rules.
- React/Apollo tests already exercise store cleanup, epoch invalidation and logout.

## Decisions

### D1 - Separate acceptance overlay

Create `docker-compose.acceptance.yml` with services `oneitb-redis` and
`oneitb-mailpit`. Compose it with the canonical Development file but start only those
services. Use fixed image versions, no persistent volumes and bounded healthchecks.

### D2 - Stable dedicated Moderator

Add `moderador1@itbeltran.com.ar` to the enterprise seed graph with a stable GUID and
canonical Spanish role. Preserve current seeder semantics: accounts are inserted only
when absent, so user-managed passwords are never reset.

### D3 - Direct infrastructure integration tests

Use the existing test project and package graph. Redis tests connect to the real
container, create two independent service providers with HotChocolate Redis
subscriptions and prove cross-provider delivery. SMTP tests instantiate the production
adapter, then inspect Mailpit through its HTTP API.

Tests execute only when `ONEITB_RUN_INFRA_TESTS=true`; otherwise they return immediately
without passing off a mock as integration evidence.

### D4 - No network server claim

The tests do not start Kestrel or Vite. If HotChocolate's event receiver/sender can prove
cross-provider delivery through Redis, mark Pub/Sub local verified. Do not mark the
GraphQL WebSocket network handshake verified unless an in-process TestServer can execute
it without a listening socket.

### D5 - Finite orchestrator

`scripts/validate-local-infrastructure.ps1` owns Compose startup, waits for service
health, exports process-only settings, runs tests/builds/model checks and always removes
only acceptance services unless `-KeepContainers` is explicitly supplied.

### D6 - Evidence vocabulary

Use existing roadmap statuses:

- `[V]`: executed local behavior, explicitly labeled local where provider equivalence
  matters.
- `[I]`: implemented but not runtime verified.
- `[B]`: exact environmental or external dependency absent.

Do not invent a new checklist syntax.

## Rejected Alternatives

- Modifying `docker-compose.prod.yml`: risks changing production topology for a local gate.
- Using `latest` tags: prevents reproducible academic evidence.
- Starting API/Vite: explicitly prohibited and unnecessary for adapter/provider tests.
- Calling Redis `PING` only: proves the container, not HotChocolate cross-provider delivery.
- Treating Mailpit as production SMTP: overstates provider verification.
- Resetting SQL: destructive and hides seeder idempotency defects.
- Adding Playwright/Testcontainers: unnecessary dependency expansion for this bounded gate.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Docker/network unavailable | Record exact blocker; do not alter provider status |
| Ports occupied | Configurable ports and preflight ownership check |
| Mailpit authentication mismatch | Configure acceptance-only credentials and no TLS |
| Redis subscriber race | Subscribe before publish, bounded delay and timeout |
| Duplicate events | Count payloads and fail when count is not exactly one |
| Seeder test cost | Run the stable full seed only in focused tests with isolated database |
| Secret leakage | Process-only settings, sanitized output and staged-diff scan |
| Cleanup failure | `finally`, exact project/services and post-cleanup port check |
