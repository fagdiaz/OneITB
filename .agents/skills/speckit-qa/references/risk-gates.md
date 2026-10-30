# Risk Gates

Read only for MEDIUM or HIGH QA. Apply relevant headings; do not turn this into a repository-wide audit.

## Security

- Enforce authorization, ownership, and participant checks on the backend; UI hiding is not security.
- Use BCrypt for passwords; never expose or log plaintext secrets/tokens.
- Ignore sensitive GraphQL fields.
- Bound input length, range, format, and error detail.
- Preserve JWT, CORS, and canonical session rules.
- For uploads require JWT, size/type allowlist, magic-byte or structural validation, per-file and aggregate limits, GUID storage names, original-name metadata, safe paths, object-level delivery authorization, and orphan cleanup.
- For rich content forbid `dangerouslySetInnerHTML` and allowlist external embed hosts.

Block unresolved privilege escalation, IDOR, secret exposure, or plaintext credentials.

## GraphQL and Data

- Trace frontend operation -> resolver -> service -> entity/context.
- Preserve nullable/backward-compatible arguments unless a breaking change is explicit.
- Prevent N+1 with projection, DataLoader, or deliberate include strategy.
- Model FKs explicitly and default to `DeleteBehavior.Restrict`.
- Check soft-delete filters and privileged `IgnoreQueryFilters` use.
- Review migrations for rename vs drop/add, backfill/nullability, indexes, and rollback.
- Require `database update` and `has-pending-model-changes` tasks.
- Require async EF Core operations and `CancellationToken` propagation on affected request and worker paths.

Block destructive migrations without a data strategy, shadow FK risk, or schema/client mismatch.

## React and Apollo

- Keep hooks unconditional and above early returns.
- Never write state/cache during render.
- Give effects/subscriptions correct dependencies and cleanup.
- Prevent duplicate submit and preserve useful drafts on failure.
- Prevent Apollo cache/refetch/optimistic duplicates and stale UI.
- Cover loading, empty, error, and unmounted-component paths.
- Use Tailwind v4 and existing shared primitives.

## Realtime

- Scope subscription topics to the authenticated user/conversation.
- Validate participants server-side independently of client variables.
- Plan reconnect, deduplication, cleanup, and stale-subscription behavior.
- Verify two-user isolation and unread-counter semantics rather than relying on a single-session happy path.

## External Identity and Adapters

- Validate issuer, audience, tenant policy, nonce/state, redirect URI, token lifetime, and account-linking rules for external identity.
- Keep SMTP, object storage, Redis, and institutional integrations behind interfaces with configuration validation, timeout, cancellation, and explicit local fallback behavior.
- Fail closed for identity and authorization. Development fallbacks must never silently activate in Production.
- Do not mark an external adapter verified without configured runtime evidence.

## Startup, Dependencies, and Configuration

- Check middleware order and service registration for startup changes.
- Pin compatible package versions and avoid unrelated upgrades.
- Keep secrets out of tracked configuration.
- Require rollback or recovery steps for configuration changes.
