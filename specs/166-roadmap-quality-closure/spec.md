# Feature Specification: Spec 166 Roadmap Quality Closure

**Feature Branch**: `166-roadmap-quality-closure`

**Created**: 2026-07-06

**Status**: Implemented

**Input**: User requested an exhaustive Speckit-driven pass to identify and implement the most valuable remaining work toward a complete roadmap, with zero technical-debt tolerance and perfect `/docs` alignment.

## User Scenarios & Testing

### User Story 1 - Core Auth Has Automated Regression Coverage (Priority: P1)

As the project team, we need authentication and account creation rules to be protected by automated tests so presentation-critical flows cannot regress silently.

**Why this priority**: The roadmap marks automated registration, login, expiration and authorization coverage as the main P0 gap. Auth failures block every private module.

**Independent Test**: Run the backend service test suite and verify that registration, login, inactive-account blocking and administrator-protection scenarios pass without depending on the browser.

**Acceptance Scenarios**:

1. **Given** an institutional user registering with valid data and active careers, **When** the registration service runs, **Then** the user, account, BCrypt hash and career links are persisted.
2. **Given** a login request with valid credentials, **When** the account service authenticates, **Then** it returns an authenticated payload and signed JWT.
3. **Given** a login request for an inactive user or a user with wrong credentials, **When** the account service authenticates, **Then** it rejects the request without returning a token.
4. **Given** a role/status update against an administrator account, **When** the user service runs, **Then** the operation is rejected.

---

### User Story 2 - Feed Has Automated Regression Coverage (Priority: P1)

As the project team, we need publication/comment/file/feed rules to be protected by automated tests so the social core remains stable after refactors.

**Why this priority**: The roadmap still marks automated publication, comments and files tests as pending. Feed regressions are visible immediately in demos.

**Independent Test**: Run the backend service test suite and verify that feed scoping, muted users, nested comments, reactions and file URL validation are covered.

**Acceptance Scenarios**:

1. **Given** a student belongs to one career, **When** the feed is queried, **Then** only publications from that career are returned.
2. **Given** a user is muted, **When** they attempt to publish or comment, **Then** the service rejects the operation.
3. **Given** a publication has a valid `/uploads/` attachment, **When** it is created, **Then** the attachment URL persists; invalid traversal URLs are rejected.
4. **Given** a top-level comment and reply, **When** the reply is added, **Then** it is linked to the same inquiry and returned with its author graph.
5. **Given** a reaction is toggled twice, **When** the service runs, **Then** it creates and then removes the reaction with accurate counts.

---

### User Story 3 - Quality Gates and Documentation Are Reproducible (Priority: P2)

As the project team, we need CI and canonical documents to match the real code state so the roadmap can be trusted by maintainers and evaluators.

**Why this priority**: A roadmap is only useful if future changes run the same gates and docs do not contradict implemented features.

**Independent Test**: Inspect the CI workflow and run the documented local commands; verify `/docs` no longer says implemented academic features are still planned.

**Acceptance Scenarios**:

1. **Given** a push or pull request, **When** CI runs, **Then** it builds backend/frontend and executes service tests without secrets in repository files.
2. **Given** the current codebase, **When** a maintainer reads `/docs/project_docs`, **Then** academic resources, SIU mock and notifications are described as implemented with remaining runtime boundaries stated explicitly.
3. **Given** a completed spec, **When** documentation is updated, **Then** `ROADMAP.md`, `DEVELOPMENT_LOG.md` and `DOCUMENTATION_STATUS.md` remain synchronized.

### Edge Cases

- CI must not require Docker SQL for service-unit tests; SQL integration remains a separate pending item unless implemented with safe secrets and container orchestration.
- Documentation must not mark browser/admin/runtime checks as verified without executed evidence.
- Secrets, database passwords and JWT keys must not be committed.

## Requirements

### Functional Requirements

- **FR-001**: System MUST include automated backend tests for registration with career association and BCrypt password persistence.
- **FR-002**: System MUST include automated backend tests for successful login, wrong-password rejection and inactive-account rejection.
- **FR-003**: System MUST include automated backend tests for administrator role/status protection.
- **FR-004**: System MUST include automated backend tests for feed career scoping and muted/blocked content constraints.
- **FR-005**: System MUST include automated backend tests for publication file URL validation, nested comments and reaction toggling.
- **FR-006**: System MUST provide a CI workflow that runs backend service tests, backend Release build and frontend production build.
- **FR-007**: Canonical documentation MUST describe the current implemented academic scope without contradicting `ROADMAP.md`.
- **FR-008**: `ROADMAP.md` MUST only promote items from pending to implemented/verified when the evidence created in this spec directly supports that promotion.

### Key Entities

- **Account/User**: Identity and role state protected by auth tests.
- **Career/Subject/UserCareer**: Academic scoping data used by registration and feed tests.
- **Inquiry/Comment/Reaction**: Feed entities protected by social regression tests.
- **Quality Gate Evidence**: Commands and outcomes recorded for roadmap/doc status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The backend service test suite includes at least 10 additional auth/feed tests and passes locally.
- **SC-002**: Backend Release build and frontend production build pass after implementation.
- **SC-003**: CI workflow contains no plaintext secrets and covers the same local gates used for completion.
- **SC-004**: `/docs/project_docs` contains no statement that implemented academic resource/SIU/notification features are merely planned.
- **SC-005**: Roadmap completion percentage is recalculated from checklists and not manually inflated.

## Assumptions

- SQL Server integration tests remain valuable but are not safe to fake; this spec may leave them pending if no deterministic Docker-backed test harness is implemented.
- Frontend component tests require new test dependencies; this spec will not add those dependencies unless the benefit clearly outweighs the lockfile/dependency churn.
- Specs are ignored by git in this repository and serve as local SDD evidence.
