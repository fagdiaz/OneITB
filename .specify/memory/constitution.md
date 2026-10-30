<!--
SYNC IMPACT REPORT
- Version change: 1.5.0 -> 1.6.0
- Amendment type: MINOR; formalizes Single-Spec Execution Invariant, Model Workload Protocol,
  and mandatory speckit-stabilize dual-stack release closeout gate.
- Added principles:
  * IX. Single-Spec Execution Invariant and Deep Analysis Rule
  * X. Gemini 3.8 Flash High Maximization & Scaled Delegation Rule
- Modified governance:
  * Require speckit-stabilize as the authoritative quality and release closeout gate before commit/push.
- Dependent artifacts reviewed:
  * AGENTS.md - aligned with Single-Spec and Model Workload protocols
  * prompt.txt - standardized with modern execution and validation commands
-->

# OneITB23 Constitution

## Core Principles

### I. Contract-First Boundaries and Service Ownership

The React frontend and .NET backend MUST remain independently buildable applications.
Business reads, writes, and events MUST use the canonical GraphQL endpoint `/graphql`
over HTTP or WebSocket. Authenticated binary transfer MAY use `POST /api/upload`, and
stored objects MAY be delivered through an approved file-delivery route; these are the
only REST exceptions. A new REST business endpoint requires a constitutional amendment.

GraphQL resolvers MUST remain transport adapters. Non-trivial validation, authorization,
transactions, integration, and domain behavior MUST be delegated to services. Contracts
MUST use English technical identifiers; user-facing interface copy MUST use Spanish.
Changes to GraphQL, persistence, or integration contracts MUST include compatibility and
consumer impact in their plan.

### II. Identity, Authorization, and Privacy

Local passwords MUST be hashed with BCrypt and stored as `char(60)`. Plaintext storage,
logging, recovery, or comparison is forbidden. External identity tokens MUST be validated
cryptographically for signature, issuer, audience, lifetime, tenant, subject/object ID,
and required scope before OneITB issues its own JWT. External claims MUST NOT grant an
elevated OneITB role without an explicit trusted mapping and server-side policy.

Every protected GraphQL operation MUST declare authentication or role requirements and
MUST also enforce contextual authorization in the service layer when ownership, career,
subject, participant, resource state, or target identity matters. A client-supplied user
ID MUST NOT replace the authenticated actor from claims. Frontend controls are UX only,
never a security boundary.

Sensitive profile, academic, employment, messaging, and moderation data MUST be minimized
and masked server-side. Public flows MUST prevent account/email enumeration and MUST NOT
create `Administrador`, `Moderador`, or `Empleador` without an approved privileged flow.
Privacy access based on social relationships MUST require the explicit policy documented
in the product contract; a unilateral relationship MUST NOT silently expand sensitive
access in a public-production release.

### III. Input, Abuse, and File Security

All external input MUST be normalized, bounded, and validated on the backend. Regex used
for untrusted input MUST have an explicit timeout; email validation uses 250 ms. Public
and expensive operations MUST apply proportional rate limiting. GraphQL MUST retain
bounded depth, cost/parser controls, and global pagination limits.

Uploads MUST validate authentication, per-file and aggregate size, extension, declared
content type, magic bytes or structure, generated storage name, and persisted URL prefix.
Original names are display metadata only and MUST NOT determine storage paths. File URLs
from external storage MUST use an allowlist. Untrusted active content MUST NOT execute in
the application origin.

Protected file delivery MUST authorize the requesting identity against the referenced
domain object. Until object-aware delivery or signed private URLs are implemented, static
`/uploads/{file}` delivery is restricted to controlled local/academic environments and
MUST NOT be represented as ready for an untrusted public-production deployment.

### IV. Relational Integrity and Data Lifecycle

Foreign keys MUST be explicit and EF Core shadow properties are forbidden. Social,
academic, messaging, employment, moderation, and identity relationships MUST use
`DeleteBehavior.Restrict` unless an aggregate boundary is documented, migrated, and
tested. `Inquiry` and `Comment` MUST use soft delete; moderation hiding MUST preserve a
separate audit trail and MUST NOT rewrite another user's content.

Database constraints and unique indexes MUST enforce invariants that cannot safely depend
on application code alone, including mutually exclusive relationships. Multi-entity
provisioning and state transitions MUST be transactional and idempotent. External side
effects that follow a committed transaction MUST use a recoverable mechanism such as an
Outbox when loss or duplication is material. Operational timestamps MUST be stored in UTC.

Schema changes MUST use reviewed EF Core migrations. Destructive reset, reseeding, or
data repair requires an explicit target, backup decision, and verification plan.

### V. Session and Realtime Identity Isolation

JWT access tokens MUST expire, and the backend pipeline MUST authenticate before it
authorizes. CORS MUST list approved origins. Apollo MUST inject the bearer token for
protected HTTP operations and the authenticated WebSocket connection. Frontend session
state MUST use the canonical `token` and `user` keys.

Logout, token expiry, and account replacement MUST stop session-bound transports,
dispose subscriptions, purge Apollo cache, clear local identity state, and hydrate only
the new account. Realtime topics MUST derive from authenticated identity and MUST NOT
trust a caller-selected participant ID. Reconnect, optimistic updates, and subscription
delivery MUST be idempotent or deduplicated. Tokens and provider credentials MUST NOT be
logged, placed in URLs, or persisted in diagnostic metadata.

### VI. Bounded Performance and Operational Resilience

Request paths MUST use asynchronous I/O and propagate `CancellationToken` through EF Core,
network, and service operations. Read-only queries SHOULD use `AsNoTracking()`; graph
loading MUST use bounded pagination, projections, split queries, or DataLoaders as
appropriate. List queries and nested relations MUST NOT introduce unbounded reads or N+1
behavior.

Background work MUST be bounded, cancellation-aware, idempotent, and observable. Retry
policies MUST have finite limits and avoid multiplying side effects; distributed work
MUST use ownership, lease, or equivalent concurrency protection when duplicate execution
is possible. User-facing React flows MUST expose loading, empty, error, and recovery
states, and effects/subscriptions MUST clean up on unmount or identity change.

Failures MUST be mapped to controlled GraphQL/HTTP responses and structured logs with a
correlation identifier. Internal stack traces, secrets, message contents, CV data, and
other unnecessary PII MUST NOT be exposed to clients or logs.

### VII. Evidence-Based Completion and Release Truth

Compilation is necessary but insufficient. Affected GraphQL contracts, authorization,
cache behavior, persistence, migrations, integrations, and browser workflows MUST be
executed when the environment permits. Positive and negative cases MUST be proportional
to the change risk. Blocked checks MUST name the missing credential, provider, runtime,
browser, or approval and MUST NOT be reported as verified.

`[I]` means implemented with code/build/migration/test evidence. `[V]` requires runtime
evidence for the affected actor, contract, and environment. Baselines from different
commits or dates MUST NOT be combined as if they were one release run. A release claim
MUST identify the candidate commit and record commands, environment, results, deviations,
and process cleanup on that same cut.

During Code Freeze, new functionality requires explicit approval. Accepted changes SHOULD
be the smallest repair for a reproducible defect and MUST add a proportional regression
check. “Feature complete”, “production-ready”, and “zero debt” MUST be qualified by the
actual evidence and residual risks.

### VIII. External Adapters and Environment Safety

SMTP, storage, Pub/Sub, institutional identity, SIU, and future providers MUST be behind
interfaces so business rules remain provider-independent. Configuration and secrets MUST
come from approved environment variables, user-secrets, or secret stores and MUST NOT
enter tracked files, documentation, test output, or screenshots.

Development fallbacks MAY use local disk, pickup email, in-memory Pub/Sub, mock SIU, or
Docker services only when their scope is explicit. Production MUST fail closed when a
required security-sensitive integration is absent or incomplete; it MUST NOT silently
fall back to demo behavior. Health checks and logs MUST identify the selected adapter
without exposing credentials.

Production MUST NOT use wildcard CORS, trust arbitrary SQL Server certificates, expose
development secrets, or enable debug error detail. Local certificate exceptions MUST
remain environment-scoped. External-provider acceptance requires real configuration and
an executed smoke; conditional registration or a mock is implementation evidence only.

### IX. Single-Spec Execution Invariant & Pre-Implementation Deep Analysis Rule

At any given moment, **AT MOST ONE SPEC MAY BE ACTIVELY IMPLEMENTED OR MODIFIED IN CODE**.
1. **Sequential Atomic Lifecycle**: While multiple future specs may be designed, drafted, and planned in advance (`spec.md`, `plan.md`, `tasks.md`), code implementation and production modifications are strictly sequential.
2. **No Spec Cross-Contamination**: Agents and models MUST NOT mix, merge, or implement changes belonging to multiple specs within the same turn or branch. The Git branch name MUST stay aligned with the active specification in `.specify/feature.json`.
3. **Full Spec Closeout Gate**: Before activating a new spec for code modification in `.specify/feature.json`, the preceding active spec MUST complete its entire lifecycle:
   - 100% of tasks checked in `tasks.md`.
   - Comprehensive test validation (234 backend xUnit tests + 252 frontend Vitest tests PASS, 0 failures, 0 regressions).
   - Preflight verification and documentary normalization via `speckit-stabilize`.
   - Recording in `docs/audit/DEVELOPMENT_LOG.md`.
   - Feature-scoped commit.
4. **Pre-Implementation Deep Analysis**: Before modifying code, models MUST analyze shared state, Apollo cache boundaries, EF Core relationships, and authorization contracts. Partial or unmigrated refactors are strictly forbidden.

### X. Gemini 3.8 Flash High Maximization & Scaled Delegation Rule

Gemini 3.8 Flash High (or Gemini 3.7 Flash High) MUST be prioritized as the primary engine for all tasks within its reasoning and context capacity: code reading, architecture analysis, pure domain logic, data contracts, schemas, comprehensive test suites (xUnit, Vitest, integration, benchmarks), documentation, SpecKit tracking, and bounded feature implementations. Tasks MUST be executed in iterative, bounded turns without asking for unbounded multi-file refactors in a single turn.

Higher-reasoning models MUST be invoked on-demand only when the specific task requires it:
1. **Claude Sonnet 4.6 (Thinking)**: Escalate ONLY when implementing or modifying live real-time concurrency (WebSockets, GraphQL subscriptions, SignalR hubs, multi-tab Apollo cache coordination) or complex multi-entity EF Core transaction lifecycles where race conditions risk state corruption.
2. **Claude Opus 4.6 (Thinking)**: Escalate STRICTLY as the terminal escalation option for persistent circular test failures, complex security vulnerabilities surviving Sonnet, or major cross-subsystem architectural redesigns.
Every model at the end of its session MUST leave an updated, ready-to-run prompt in `prompt.txt`.

## Development Workflow and Quality Gates

- Resolve the active feature from `.specify/feature.json`; do not hardcode a spec path.
- Read active spec artifacts, this Constitution, and `docs/project_docs/ROADMAP.md` before
  implementation.
- Use Specify, Clarify when needed, Plan, Tasks, Analyze, and risk-based QA before code.
- Apply schema changes through reviewed EF Core migrations and execute the relevant gates
  documented in `docs/audit/RUNBOOK_DEV.md`.
- Execute `speckit-stabilize` as the authoritative quality, dual-stack compilation (.NET 8 + React 18), test regression, and safe release closeout gate before final commit/push.
- Every completed spec MUST update tasks and evidence, the single Roadmap, exactly one
  reverse-chronological `DEVELOPMENT_LOG.md` entry, and `DOCUMENTATION_STATUS.md` when a
  canonical document or status changes.
- Documentation-only work MUST still validate links, terminology, metrics, formatting,
  and `git diff --check`.
- Prefer finite commands. A temporary server MUST have a captured PID/log, readiness
  check, bounded smoke, targeted shutdown, and recorded cleanup.
- Git auto-commits and auto-pushes MUST remain disabled. Commits are explicit,
  feature-scoped, reviewed, and requested by the user.

## Governance

This Constitution supersedes conflicting repository documentation. When non-constitutional
sources conflict, precedence is:

1. executable code, EF model/migrations, and runtime schema;
2. evidence produced on the relevant commit;
3. `docs/project_docs/ROADMAP.md` and canonical product/architecture contracts;
4. current audit and runbook;
5. development history, academic summaries, specs, and derived AI packages.

`docs/project_docs/ROADMAP.md` is the only progress and stabilization roadmap. Its
percentages MUST be calculated from its declared checklist universe. Historical logs and
checked spec tasks MUST NOT independently change current status.

Amendments MUST include a sync impact report and review dependent guidance. Versioning
follows semantic versioning: MAJOR for incompatible governance changes, MINOR for new or
materially expanded principles, and PATCH for clarifications. Exceptions MUST identify
scope, owner, risk, compensating control, expiration or review condition, and canonical
tracking location; undocumented exceptions are invalid.

Direct commits to `main` or `master` are forbidden. Integration uses a feature branch and
review. Existing gaps do not weaken a principle: they remain visible until remediated,
accepted with compensating controls, or removed from the deployment scope.

**Version**: 1.6.0 | **Ratified**: 2026-06-05 | **Last Amended**: 2026-10-27
