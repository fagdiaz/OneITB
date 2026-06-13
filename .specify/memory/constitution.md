<!--
SYNC IMPACT REPORT
- Version change: 1.2.0 -> 1.3.0
- List of modified principles:
  * [PRINCIPLE_1_NAME] -> I. Decoupled GraphQL Architecture
  * [PRINCIPLE_2_NAME] -> II. Strict Security & Password Hashing
  * [PRINCIPLE_3_NAME] -> III. Input Validation & ReDoS Protection (NON-NEGOTIABLE)
  * [PRINCIPLE_4_NAME] -> IV. Relational Integrity Restrictions
  * [PRINCIPLE_5_NAME] -> V. Secure Session & Token Management
- Added sections:
  * Security & Environment Constraints
  * Development Workflow & Quality Gates
- Removed sections: None
- Templates requiring updates:
  * .specify/templates/plan-template.md (✅ updated)
  * .specify/templates/spec-template.md (✅ updated)
  * .specify/templates/tasks-template.md (✅ updated)
- Follow-up TODOs: Stabilize the feed and close the active security gaps recorded in
  docs/audit/fix-roadmap-13-06-2026.md.
-->

# OneITB23 Constitution

## Core Principles

### I. Decoupled GraphQL Architecture
The system MUST maintain a strict separation between the Frontend (React/Vite) and Backend (.NET 8 API). All communication MUST happen exclusively through the single GraphQL endpoint (`/graphql`). No direct database access or separate REST endpoints are permitted for standard operations. Resolvers in HotChocolate MUST delegate logic to service layers to maintain clean architectural decoupling.

### II. Strict Security & Password Hashing
All user passwords MUST be hashed using BCrypt (`BCrypt.Net-Next`) with a physical column format of exactly `char(60)` in the database. Direct text/plain validation or persistence of passwords is strictly forbidden. Sensitive fields like passwords MUST be ignored by GraphQL using `[GraphQLIgnore]`.

### III. Input Validation & ReDoS Protection (NON-NEGOTIABLE)
All external inputs, especially email and search parameters, MUST undergo compiled, time-constrained regular expression validation. Email validation MUST use a timeout of exactly 250ms (`TimeSpan.FromMilliseconds(250)`) to prevent Regular Expression Denial of Service (ReDoS) vulnerabilities.

### IV. Relational Integrity Restrictions
Key database relationships (such as between Consultas, Users, and Materias) MUST be protected against accidental cascade deletions. Model configurations MUST explicitly set `DeleteBehavior.Restrict` instead of relying on default cascade deletes.

### V. Secure Session & Token Management
JWT access tokens MUST have a strict expiration time (e.g. 2 hours) and the pipeline MUST enforce authentication (`app.UseAuthentication()`) prior to authorization (`app.UseAuthorization()`) with `ValidateLifetime = true`. The frontend must use a secure `authLink` to inject the token in the Apollo Client headers.

## Security & Environment Constraints

- CORS must be restricted to specific allowed origins matching the frontend deployment (e.g., `http://localhost:5173`) rather than a wildcard `*`.
- Frontend local storage must be the unified source of truth for session management, avoiding fragmented session keys (standardizing on `token` and `user`).

## Development Workflow & Quality Gates

- **Local Environment**: Local development SQL Server instances must configure `TrustServerCertificate=True` in `appsettings.Development.json`.
- **Database Migrations**: Database schema updates must be managed using Code-First migrations with the command: `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`.
- **Smoke Testing**: Any PR or deployment must pass the 35 pre-defined smoke tests outlined in the development runbook (`docs/audit/RUNBOOK_DEV.md`).
- **Evidence-Based Completion**: Compilation is necessary but not sufficient. GraphQL
  contracts, persistence, authentication, cache updates, and browser workflows MUST be
  validated at runtime when affected. Unverified behavior MUST NOT be reported as complete.
- **Roadmap & Logs**: Every completed spec MUST recalculate module percentages from the
  checklists in `docs/project_docs/ROADMAP.md`, add a reverse-chronological entry to
  `docs/audit/DEVELOPMENT_LOG.md`, and update
  `docs/audit/DOCUMENTATION_STATUS.md` when canonical status changes.

## Governance

- The OneITB23 Constitution is the supreme design document. Any modifications to structural guidelines require a version bump.
- PR reviews must verify compliance with this constitution. No code violating security principles (like text-plain password handling or wildcards CORS) will be merged.
- **Git Branch Protection (STRICT)**: The `main` (and `master`) branch MUST NEVER be committed to directly, and the agent must never propose or suggest direct merges or checkouts to these branches. All integrations must go through intermediary development branches.
- Git auto-commits via speckit extensions MUST remain disabled to keep the commit tree clean and readable, relying instead on manual, feature-scoped commits.
- Developers should refer to `docs/audit/RUNBOOK_DEV.md` for local setup and testing procedures.

**Version**: 1.3.0 | **Ratified**: 2026-06-05 | **Last Amended**: 2026-06-13
