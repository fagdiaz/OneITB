# Feature Specification: Final Audit Closure

**Feature Branch**: `codex/199-ux-b2b-academic-onboarding`  
**Created**: 2026-08-03  
**Status**: In progress  
**Source**: `docs/audit/temp_audit_review.md`

## Objective

Convert the temporary documentation audit into an evidence-backed release decision. Close the security and authorization gaps that can be remediated without destabilizing the academic-demo baseline, preserve external/manual dependencies as explicit gates, and synchronize every canonical document with the same verified state.

## User Scenarios

### US1 - Safe institutional registration (P0)

An anonymous person can request a public student registration only with an institutional email and an active career. The API, not only the UI, enforces the domain and role policy, applies bounded abuse protection, and does not disclose whether an account already exists.

### US2 - Scoped academic management (P0)

An administrator can manage every subject. A professor can create or moderate resources, list students, and update progress only for subjects belonging to a career linked to the professor. Other roles cannot perform those operations.

### US3 - Private profile isolation (P0)

A private profile exposes sensitive CV and contact data only to its owner or an administrator/moderator. A unilateral Follow interaction never grants access.

### US4 - Honest production boundary (P1)

The production template fails closed for unverifiable SQL TLS and documents the local-public upload limitation. Health, correlation and structured logs remain available; external monitoring acceptance remains a deployment gate.

### US5 - Reproducible academic delivery (P0 documentation)

The team can identify which figures and documents are technically ready, which still require visual/manual approval, and which exact artifacts must be frozen for printing and defense. No manual action is represented as executed without evidence.

## Functional Requirements

- **FR-001**: Backend registration MUST normalize email before policy checks.
- **FR-002**: Public registration MUST accept only `Estudiante` and an email in the configured institutional domain.
- **FR-003**: Duplicate and non-existent registration outcomes MUST use a stable public error contract that does not expose account existence.
- **FR-004**: Public registration MUST be rate limited per source and normalized identity with local-memory and Redis-compatible behavior.
- **FR-005**: Professor academic write/list operations MUST be scoped to careers explicitly linked through `UserCareer`; administrators retain global scope.
- **FR-006**: Student/graduate access to academic resources MUST remain read-only and career-scoped.
- **FR-007**: Follow MUST NOT grant access to private profile data.
- **FR-008**: Production SQL configuration MUST NOT default to `TrustServerCertificate=True`; the connection string must be injected as a secret.
- **FR-009**: Static local upload delivery MUST be documented as a controlled demo/development boundary unless an object-authorized delivery mechanism is available.
- **FR-010**: Existing correlation, health and structured logging controls MUST be verified before adding infrastructure.
- **FR-011**: UI source MUST be checked for replacement characters and corrected where present.
- **FR-012**: Release evidence MUST distinguish current worktree validation from a same-SHA candidate release.

## Non-Functional Requirements

- All EF Core I/O remains asynchronous and cancellation-aware.
- Authorization decisions occur in backend services, independent of UI visibility.
- Public errors are stable and sanitized; detailed causes remain server-side.
- Bounded data access and existing pagination contracts are preserved.
- No server, watcher or blocking process is started for validation.
- No commit or push is performed by this specification.

## Acceptance Criteria

1. Unit/integration tests prove institutional registration, public role restriction, duplicate anti-enumeration, cancellation and rate limiting.
2. Tests prove a professor cannot manage a subject outside their linked careers and a student cannot create resources.
3. GraphQL tests prove a follower still receives a masked private profile.
4. The production compose file requires an injected encrypted SQL connection string without a trust-bypass default.
5. Backend build, frontend build, backend tests, frontend tests, EF pending-model check and `git diff --check` complete successfully, or any failure is recorded verbatim as a blocker.
6. ROADMAP, FINAL_AUDIT_REPORT, DOCUMENTATION_STATUS, DEVELOPMENT_LOG, canonical architecture/requirements/runbook and final-delivery documents agree on status and limitations.
7. `QA-DOC-01`, `QA-DIAG-01`, `REL-001` and `DEL-001` remain open until their human or same-SHA evidence actually exists.

## Out of Scope

- Replacing local static upload delivery with a new signed-URL/object gateway during the freeze.
- Configuring real SMTP, Cloudinary, Microsoft Entra tenant consent or central observability credentials.
- Claiming visual browser, printing or diagrams approval without human inspection.
- Git commit, push or release tagging.

## Dependencies

- Canonical Constitution v1.5.0.
- Existing `UserCareer`, public profile DTO and privacy toggle.
- Existing Redis/in-memory rate-limiter pattern.
- Existing health and correlation middleware.
- Owner decisions and external credentials for manual gates.
