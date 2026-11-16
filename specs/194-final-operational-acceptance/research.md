# Research: Final Operational Acceptance

## Baseline

- Specs 186-189 are verified by runtime, schema and automated evidence.
- Specs 190-193 now have local runtime/browser evidence; external-provider and
  two-isolated-session gates remain blocked.
- SQL Server 2022 Docker is healthy and is the canonical persistence runtime.
- No backend or frontend development server was active at planning time.
- The repository has no tracked pre-defense orchestration script.
- Production SMTP, Redis and Cloudinary require non-versioned configuration; their absence must not be reported as success.

## Decisions

### D1 - One bounded orchestration entry point

Create `scripts/validate-predefense.ps1`. Its default path runs finite, non-runtime gates.
An explicit `-IncludeRuntime` option may start a hidden backend process only in an
approved maintenance window, polls readiness with a deadline and always stops the exact
process in `finally`. It must not recursively delete outside its own temporary directory.

### D2 - Separate baseline from authenticated acceptance

Builds/tests/model checks run without application startup. HTTP/GraphQL smokes run only after baseline succeeds. Browser regression follows only after HTTP health and schema checks pass.

### D3 - Use dedicated short-window test configuration

Magic Link runtime throttling uses process-only limits and a short window. Production defaults remain unchanged. Requests must use generated acceptance identities and never print email, CUIT, token, message body or JWT.

### D4 - Preserve the database unless cleanup is deterministic

Read-only role journeys reuse seeded accounts. New fixtures use deterministic acceptance prefixes and are removed through bounded cleanup. No migration or destructive database reset is allowed.

### D5 - External providers use a three-state result

- `VERIFIED`: real provider request succeeded.
- `BLOCKED`: required settings are absent.
- `FAILED`: settings exist but the provider check failed.

Configuration parsing or adapter unit tests are not substitutes for a real provider smoke.

### D6 - Browser automation is evidence, not aesthetic approval

Automate stable navigation, identity isolation, errors and console capture. Record institution-specific visual acceptance separately when human judgment is required.

## Rejected Alternatives

- Blocking `dotnet run`: can seize the terminal and violate cleanup guarantees.
- Starting additional SQL containers: duplicates the canonical runtime and increases failure surface.
- Hardcoding demo or provider credentials: violates security and repository hygiene.
- Marking an unavailable provider `[V]` based on mocks: creates false evidence.
- Resetting the demo database before validation: hides upgrade/idempotency defects and destroys useful state.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Port already occupied | Preflight port ownership and use a dedicated HTTP acceptance port |
| Child process survives | Track PID, stop in `finally`, verify process absence |
| Secret leakage in console | Redact values; log key presence only |
| Test fixture persistence | Dedicated temp directory and bounded database/file cleanup |
| Expected GraphQL errors fail script | Assert explicit error code/status per negative test |
| Browser cache contaminates role test | Clear session through product logout and isolated browser contexts where available |
| External provider unavailable | Record exact missing setting as `[B]` |
