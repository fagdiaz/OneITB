# Feature Specification: Candidate Freeze and Pre-Defense Gate

**Feature Branch**: `codex/199-ux-b2b-academic-onboarding`

**Created**: 2026-08-05

**Status**: In Progress

**Input**: Consolidar un unico candidato demostrable de OneITB23, ejecutar los gates
tecnicos y funcionales sobre el mismo corte, registrar los bloqueos reales y congelar
un SHA solo cuando la evidencia sea coherente y reproducible.

## User Scenarios & Testing

### User Story 1 - Candidate content is unambiguous (Priority: P1)

As project owner, the student needs every intended source and document change identified,
with local residue and secrets excluded, before presenting a release candidate.

**Why this priority**: No build or test result can support a candidate whose exact content
is unknown or whose repository state contains unclassified files.

**Independent Test**: Review the candidate manifest and repository report and verify that
every changed or untracked path has an explicit disposition and that no secret or runtime
artifact is included.

**Acceptance Scenarios**:

1. **Given** a worktree containing changes from several completed specs, **When** the
   candidate inventory is produced, **Then** each path is mapped to its owning spec,
   retained deliverable, ignored local artifact, or unresolved blocker.
2. **Given** a tracked-content security scan, **When** a credential-shaped value is found,
   **Then** the candidate is blocked until the value is removed or proven to be a safe
   placeholder.
3. **Given** unclassified or unrelated changes, **When** candidate readiness is evaluated,
   **Then** no SHA or completion claim is issued.

---

### User Story 2 - Automated gate is reproducible (Priority: P1)

As evaluator or maintainer, a person needs one finite evidence package showing builds,
tests, data-model consistency, dependency review, and local infrastructure checks from
the same candidate content.

**Why this priority**: Historical green results from different cuts do not establish the
quality of the version used in the defense.

**Independent Test**: Execute the documented finite commands against one immutable
candidate identity and compare all results with the minimum accepted baselines.

**Acceptance Scenarios**:

1. **Given** a candidate identity, **When** backend and frontend automated gates run,
   **Then** all commands terminate, report their exact counts, and preserve the local
   environment.
2. **Given** database and local infrastructure validation, **When** a required dependency
   is unavailable, **Then** the check is recorded as blocked rather than passed.
3. **Given** any failing gate, **When** results are consolidated, **Then** the candidate
   remains unfrozen and the failure includes a reproducible remediation path.

---

### User Story 3 - Defense-critical journeys are evidenced (Priority: P2)

As presenter, the student needs a controlled manual regression for institutional roles,
session isolation, realtime communication, uploads, and the principal demonstration
journeys before relying on the system in front of the academic board.

**Why this priority**: Automated checks cannot prove browser rendering, two-session
behavior, projector-ready responsiveness, or the clarity of role-specific workflows.

**Independent Test**: Complete the role and two-session matrices in isolated browser
profiles and attach outcome, console, cleanup, and deviation evidence for every row.

**Acceptance Scenarios**:

1. **Given** the six canonical roles, **When** each role enters the application, **Then**
   allowed navigation works and at least one protected denial is confirmed.
2. **Given** two isolated sessions, **When** chat and notification events are exchanged,
   **Then** identity, topics, unread state, logout cleanup, and reconnect are isolated.
3. **Given** the defense display widths and both themes, **When** primary journeys are
   reviewed, **Then** no blocking overflow, stale identity, inaccessible control, or owned
   console error remains.

---

### User Story 4 - Candidate freeze is honest and recoverable (Priority: P3)

As project owner, the student needs the accepted candidate identified by a unique SHA,
with a rollback snapshot and explicit residual risks, so the defense can be reproduced
without last-minute ambiguity.

**Why this priority**: Freezing before evidence is complete creates a false release claim;
freezing after acceptance protects the demonstrated version.

**Independent Test**: Starting from the recorded SHA and runbook, a reviewer can identify
the exact content, evidence package, remaining external gates, and recovery materials.

**Acceptance Scenarios**:

1. **Given** all mandatory technical and manual gates are approved, **When** the candidate
   is frozen, **Then** the recorded SHA matches the tested content and repository state.
2. **Given** an unresolved mandatory gate, **When** freeze is requested, **Then** the
   operation is refused and the blocking dependency remains visible.
3. **Given** external production providers are not accepted, **When** the academic
   candidate is declared, **Then** the declaration is limited to controlled local defense
   readiness and does not claim public-production readiness.

### Edge Cases

- Automated tests pass but the worktree changes afterward.
- A finite validation script starts temporary processes or containers and cleanup fails.
- The local demo database is healthy but contains unexpected role, lockout, or relational
  state from previous manual QA.
- A browser journey passes in one profile while a second profile leaks identity or cached
  data.
- A dependency audit reports advisories with no available non-breaking upgrade before the
  defense.
- The candidate includes ignored local files that are operationally required but absent
  from the runbook or backup package.

## Requirements

### Functional Requirements

- **FR-001**: The project MUST maintain a candidate manifest that identifies the exact
  repository content under evaluation.
- **FR-002**: Every changed and untracked path MUST have an explicit disposition before a
  candidate is frozen.
- **FR-003**: Tracked candidate content MUST be checked for secrets, generated runtime
  artifacts, patch residue, and unintended binaries.
- **FR-004**: Backend and frontend suites MUST execute on the same candidate content and
  meet or exceed the current recorded baselines of 234 and 252 passing tests respectively.
- **FR-005**: Backend and frontend production builds MUST complete successfully.
- **FR-006**: The data model MUST report no pending migration changes.
- **FR-007**: Dependency, whitespace, Compose configuration, and finite local
  infrastructure checks MUST record exact PASS, FAIL, or BLOCKED outcomes.
- **FR-008**: Validation procedures MUST preserve the approved local SQL database unless
  a destructive reset is separately approved.
- **FR-009**: Temporary processes, ports, files, environment values, and containers
  created by validation MUST be restored or explicitly reported as cleanup failures.
- **FR-010**: The six canonical institutional roles MUST receive a manual allowed-flow and
  denial-flow regression on the candidate.
- **FR-011**: Realtime and session behavior MUST be validated with two isolated clients.
- **FR-012**: Primary browser journeys MUST cover loading, empty, failure, keyboard,
  responsive, theme, and authorization states proportionally to their risk.
- **FR-013**: Every evidence record MUST identify date, candidate identity, environment,
  command or procedure, result, deviations, and cleanup.
- **FR-014**: A candidate SHA MUST NOT be declared while the worktree is dirty, mandatory
  evidence is missing, or any mandatory gate is failing.
- **FR-015**: The final release statement MUST distinguish academic local-defense
  readiness from externally accepted public-production readiness.
- **FR-016**: ROADMAP and audit documents MUST be updated only from evidence produced by
  this candidate process.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of changed and untracked paths have a documented disposition before
  freeze review.
- **SC-002**: All mandatory automated commands terminate and have an explicit result; no
  command is represented as successful through timeout, suppression, or partial output.
- **SC-003**: The candidate records at least 234 backend and 251 frontend passing tests,
  two successful production builds, and zero pending model changes.
- **SC-004**: All six roles complete their defined regression rows and two isolated
  sessions complete the realtime/session matrix without identity leakage.
- **SC-005**: 100% of temporary validation resources are cleaned up or are named as
  release blockers.
- **SC-006**: The frozen identity, evidence package, roadmap status, and audit conclusion
  refer to one and the same candidate content.
- **SC-007**: A reviewer can reproduce the candidate validation from the runbook without
  relying on undocumented credentials or destructive setup.

## Assumptions

- The current feature branch remains the integration branch until the user explicitly
  requests Git integration or a release branch.
- Local SQL, Redis, and Mailpit are approved acceptance substitutes for the controlled
  academic defense; real provider acceptance remains a separate production gate.
- No database reset, commit, push, tag, or branch mutation is implicit in this spec.
- Existing code freeze permits only evidence work and minimal fixes for reproducible
  release-blocking defects.
- The manual role matrix uses the canonical demo identities documented in the runbook,
  with credentials supplied outside tracked files.

## Out of Scope

- New functional modules or product scope.
- Production acceptance of Microsoft Entra, SMTP, Redis, Cloudinary, observability, or
  malware scanning without real configuration and evidence.
- Destructive reconstruction of the local demonstration database.
- Automatic Git commit, push, tag, merge, or pull-request creation.
