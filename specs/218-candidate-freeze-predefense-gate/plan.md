# Implementation Plan: Candidate Freeze and Pre-Defense Gate

**Feature directory:** `specs/218-candidate-freeze-predefense-gate`  
**Branch:** `codex/199-ux-b2b-academic-onboarding`  
**Date:** 2026-08-05  
**Specification:** [spec.md](spec.md)  
**Risk:** HIGH  
**Code Freeze impact:** Allowed release validation and minimal blocking fixes only

## 1. Summary

Spec 218 converts the existing closure items CF-01 through CF-06 into one auditable
candidate workflow. It adds no product behavior. The work classifies repository content,
runs finite technical gates, preserves the demonstration database, drives manual role and
realtime matrices, and records a candidate SHA only after all mandatory evidence refers to
the same immutable content.

The current dirty worktree can support preflight validation but cannot be frozen. Git
integration, commit, push, pull request, and tag remain explicit user actions.

## 2. Technical Context

| Concern | Decision for this feature |
|---|---|
| Backend | .NET 8 release build and xUnit/HotChocolate/EF validation; no product change planned |
| Frontend | React 18, Apollo Client 3.7, Vite 8, Vitest/Testing Library; no product change planned |
| Persistence | SQL Server demo database is validated in place and never reset implicitly |
| GraphQL | Existing schema and representative role operations are exercised; no schema change |
| REST exception | Authenticated `POST /api/upload` smoke and cleanup |
| External integrations | Local Redis and Mailpit acceptance; real providers remain external gates |
| Testing | Full suites, builds, EF drift, dependency audit, guarded infrastructure/runtime scripts, browser matrices |
| Performance goals | All automation finite; no leaked processes; result sets and scripts retain existing bounds |
| Security/privacy | Secret scan, role denial cases, session isolation, upload controls, evidence redaction |
| Scale/scope | One academic release candidate and one local controlled demonstration environment |
| Unknowns | Final intended Git content and manual browser outcomes are unresolved until execution |

## 3. Change Classification and Blast Radius

| Dimension | Yes/No | Affected contract or risk |
|---|---:|---|
| User-visible behavior | No | Validation only unless a reproducible blocker requires a separately evidenced fix |
| GraphQL schema | No | Runtime schema inspection only |
| Authorization or privacy | Yes | Six-role allow/deny and session-isolation evidence |
| EF model or migration | No | Pending-model-change gate only |
| Apollo cache or session | Yes | Two-client identity, logout, reconnect, unread-state validation |
| Files or untrusted input | Yes | Upload smoke, tracked-content hygiene, secret classification |
| Background or concurrent work | Yes | Redis/realtime and temporary-process cleanup |
| External provider/configuration | Yes | Local adapters accepted; real provider gates remain blocked or pending |
| Deployment or operations | Yes | Docker Compose syntax, detached infrastructure, recovery evidence |
| Canonical documentation | Yes | Roadmap, runbook evidence, audit, status, and log synchronization |

**Affected users/roles:** Estudiante, Profesor, Egresado, Empleador, Moderador,
Administrador; Visitante for public-route checks.  
**Explicitly out of scope:** features, destructive seeding, provider credential entry,
automatic Git mutations, and public-production readiness claims.

## 4. Baseline and Inputs

- **Current behavior**: functional scope is recorded as 117/117; closure gates CF-01 to
  CF-06 remain open.
- **Reproduction/evidence**: current `git status --short` is non-empty and includes
  modifications/untracked paths from several specs.
- **Reusable automation**: `scripts/validate-predefense.ps1`,
  `scripts/validate-local-infrastructure.ps1`, and
  `scripts/validate-demo-database.ps1`.
- **Compatibility constraints**: preserve user secrets, Docker SQL data, existing ports,
  active user processes, and Code Freeze.
- **Candidate baseline**: backend >=234; frontend >=252; both builds PASS; EF drift zero.

## 5. Constitution Check

| Principle | Pre-design | Post-design | Plan evidence / decision |
|---|---|---|---|
| I. Contract-first boundaries and service ownership | PASS | PASS | No production contract change; evidence contract is explicit |
| II. Identity, authorization, and privacy | PASS | PASS | Six-role denials and two-session isolation are mandatory |
| III. Input, abuse, and file security | PASS | PASS | Secret scan and authenticated upload smoke |
| IV. Relational integrity and data lifecycle | PASS | PASS | Non-destructive DB integrity and model-drift gates |
| V. Session and realtime identity isolation | PASS | PASS | Two isolated clients required before freeze |
| VI. Bounded performance and resilience | PASS | PASS | Finite scripts, cancellation, deterministic cleanup |
| VII. Evidence and release truth | PASS | PASS | Same-SHA rule and BLOCKED classification |
| VIII. External adapters and environment safety | PASS | PASS | Local acceptance separated from real providers |

**Constitution result:** PASS.  
**Known gaps touched:** GAP-FILE-01, GAP-INFRA-01, and GAP-OPS-01 remain explicit and
cannot be closed by local acceptance alone.

## 6. Architecture and Ownership

### 6.1 Current flow

Evidence is distributed across successive specs and historical logs. The roadmap correctly
keeps candidate closure open, but no single package yet proves all layers on one SHA.

### 6.2 Proposed flow

1. Capture branch, status, remotes, tool versions, and candidate path inventory.
2. Classify every pending path and scan intended tracked content for secrets/residue.
3. Run static and automated gates without changing the database.
4. Run guarded local infrastructure and demo database checks with deterministic cleanup.
5. Execute six-role browser and two-session realtime matrices on the selected candidate.
6. Remediate only reproducible release blockers and rerun all invalidated gates.
7. With explicit user Git approval, produce the immutable candidate SHA.
8. Rerun or bind final evidence to that SHA, update canonical documents, and freeze.

### 6.3 Component responsibilities

| Component/service | Responsibility | Must not own |
|---|---|---|
| Git inventory | Candidate identity and path disposition | Product correctness claims |
| Automated gate | Builds, tests, drift, dependency and static checks | Manual UX claims |
| Infrastructure gate | Redis/Mailpit/container acceptance and cleanup | Real cloud-provider acceptance |
| Demo DB gate | Integrity, canonical roles, GraphQL and upload smoke | Destructive reseeding |
| Manual QA matrix | Browser, roles, accessibility, themes, session and realtime | Hidden code changes |
| Canonical documentation | Evidence-backed status and residual risk | Historical-result aggregation |

### 6.4 Authorization matrix

| Validation | Anonymous | Allowed roles | Scope rule | Expected denial |
|---|---:|---|---|---|
| Public routes | Yes | Visitor | Public content only | Protected routes redirect/deny |
| Role navigation | No | Six canonical roles | Menu and operation follow role contract | Hidden UI plus backend denial |
| Moderation | No | Moderador, Administrador | Contextual target/content rules | Controlled authorization error |
| Employer management | No | Empleador, Administrador | Own offer/application or admin scope | Controlled authorization error |
| Academic mutations | No | Role-specific | Career/subject/ownership contract | Controlled authorization error |

## 7. Data and EF Core Design

No model or data change. The gate verifies no pending model changes, relational integrity,
canonical role availability, and safe cleanup. Destructive reset is prohibited.

## 8. GraphQL and Backend Contract

No schema change. Runtime validation inspects and invokes existing operations using claims
from canonical logins. Any missing operation or authorization mismatch is a release blocker,
not a reason to weaken schema protections.

## 9. Frontend and Apollo Design

No planned UI change. Validation covers initial loading, empty/error recovery, active
identity, logout cache cleanup, navigation, responsive layout, Clean Tech/Tech Noir,
keyboard, reduced motion, print where applicable, and WebSocket reconnect behavior.

## 10. Security and Privacy Review

| Threat or misuse | Preventive control | Negative test | Residual risk |
|---|---|---|---|
| Secret committed in candidate | Tracked-content scan and staged review | Credential-shaped fixture classification | Provider secrets remain local |
| Stale or mixed evidence | Same-SHA evidence contract | Modify content after test and reject freeze | Human procedure must be followed |
| Cross-account cache leak | Isolated sessions and logout replacement test | Account B after account A logout | Browser extensions outside scope |
| Unauthorized role operation | Backend allow/deny matrix | Student invokes moderation/admin action | Known GAP-AUTH-02 remains explicit |
| Unsafe upload | Authenticated positive and invalid-content tests | Missing auth/magic mismatch/oversize | GAP-FILE-01 delivery authorization |
| Cleanup failure | PID/container/file snapshots and finally cleanup | Forced failed gate | Host-level failures require manual recovery |

## 11. Performance, Concurrency, and Resilience

- Full suites and builds use finite commands.
- Temporary APIs use dedicated ports and process identity, never broad process killing.
- Infrastructure containers are detached, health-checked, and removed unless explicitly
  retained.
- Realtime checks include reconnect, deduplication, unread state, and identity isolation.
- Failures remain visible with correlation and command context.

## 12. External Integrations and Configuration

| Environment | Adapter/config | Missing or invalid config | Verification |
|---|---|---|---|
| Development/Test | Docker SQL, Redis, Mailpit, local disk, Entra configured locally | BLOCKED with exact dependency | Finite scripts and manual browser |
| Academic defense | Same local stack plus offline snapshot | Switch to documented recovery path | Rehearsed runbook |
| Production | Managed SQL/Redis, SMTP, Cloudinary, Entra tenant, observability | No readiness claim | Separate provider acceptance |

Only configuration key names may appear in evidence. Values are redacted.

## 13. Test and Evidence Plan

| Layer/gate | Cases | Command or method | Expected status |
|---|---|---|---|
| Git hygiene | Branch, remotes, status, path disposition, secret scan | read-only Git and bounded scans | PASS before freeze |
| Backend | Full suite and Release build | canonical dotnet commands | >=234 PASS |
| Frontend | Full suite and production build | canonical npm commands | >=252 PASS |
| EF | Migration/model parity | pending-model-change command | zero drift |
| Dependencies | Runtime advisories | `npm audit --omit=dev` | PASS or accepted finding |
| Infrastructure | Redis/Mailpit and cleanup | guarded local infrastructure script | PASS/BLOCKED |
| Demo runtime | DB integrity, six logins, GraphQL, upload | guarded demo database script | PASS/BLOCKED |
| Roles/browser | Public plus six-role allow/deny matrix | isolated browser procedure | PASS/BLOCKED |
| Realtime/session | two-client chat/notification/logout/reconnect | two isolated profiles | PASS/BLOCKED |
| Cleanup | ports, processes, containers, temporary upload | before/after inventory | PASS |

## 14. Documentation and Rollback

- Record implementation history once, newest-first, in `docs/audit/DEVELOPMENT_LOG.md`.
- Keep open CF statuses until their own evidence is complete.
- Update `FINAL_AUDIT_REPORT.md` only when release recommendation materially changes.
- Update `DOCUMENTATION_STATUS.md` after canonical status changes.
- Candidate rollback is the previous known-good SHA plus the documented local/offline
  environment snapshot; no database rollback is performed by this spec.

## 15. Complexity and Exceptions

The principal complexity is procedural: evidence from source, database, browser, realtime,
and infrastructure must converge on one SHA. No architectural exception is introduced.
