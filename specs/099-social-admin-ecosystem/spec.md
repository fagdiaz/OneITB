# Feature Specification: Social and Administration Ecosystem

**Feature Branch**: `099-social-admin-ecosystem`

**Created**: 2026-06-13

**Status**: Complete

**Input**: User description: "Populate the application with realistic data, implement likes, nested comments and inquiry reports, and provide a tabbed administration dashboard."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interact with the academic feed (Priority: P1)

An authenticated community member can browse an active feed, create a publication, like or unlike it, open its discussion, add a comment, reply to an existing comment, and report inappropriate content.

**Why this priority**: The feed is the current product bottleneck and the primary social workflow.

**Independent Test**: Sign in as a seeded student, create a publication, toggle its reaction, add a top-level comment and a reply, report the publication, reload the page, and verify that all resulting state remains visible.

**Acceptance Scenarios**:

1. **Given** an authenticated user and an existing publication, **When** the user likes it, **Then** the reaction count increases once and the action can be reversed without duplicate reactions.
2. **Given** an existing publication, **When** the user submits a valid comment or reply, **Then** it appears under the correct publication and parent comment after reload.
3. **Given** an existing publication, **When** the user submits a report with a reason, **Then** one pending moderation record is created for that user and publication.
4. **Given** a valid publication form, **When** the user publishes it, **Then** the new publication appears in the feed without a full page reload.

---

### User Story 2 - Start with a realistic demonstration environment (Priority: P1)

A developer or evaluator can start the application against an empty or partially populated database and immediately exercise the main roles and social workflows with coherent demonstration data.

**Why this priority**: An empty database prevents validation of the current application and administration flows.

**Independent Test**: Apply migrations and start the backend twice; verify that at least five subjects, ten users across required roles, thirty publications, reactions, nested comments, and two reports exist without duplicated records.

**Acceptance Scenarios**:

1. **Given** an empty database, **When** initialization completes, **Then** all minimum demonstration datasets are present and every seeded account accepts the documented test password.
2. **Given** a partially populated database, **When** initialization completes, **Then** missing demonstration records are added without deleting or duplicating existing records.
3. **Given** a database already initialized, **When** the application starts again, **Then** seeded record counts remain stable.

---

### User Story 3 - Administer users, subjects and reports (Priority: P2)

An administrator can use one dashboard to switch between user management, subject visibility, and pending community reports without violating stable component rendering rules.

**Why this priority**: Moderation data has no operational value unless authorized staff can inspect it, while existing user administration must remain available.

**Independent Test**: Sign in as an administrator, open the dashboard, switch through all three tabs, update a user, inspect subjects and review pending reports without rendering or hook-order errors.

**Acceptance Scenarios**:

1. **Given** an authorized administrator, **When** the dashboard opens, **Then** the Users tab is shown and existing role and status actions remain usable.
2. **Given** the dashboard, **When** the administrator changes tabs, **Then** Subjects and Moderation display live data without navigation reloads.
3. **Given** a non-administrator, **When** protected administration data is requested, **Then** access is rejected.

### Edge Cases

- A reply references a comment from another publication.
- A user tries to react twice concurrently to the same publication.
- A user reports the same publication more than once while a report is pending.
- A publication, user, subject, or parent comment referenced by a mutation no longer exists.
- Initialization runs against a database containing only some of the fixed demonstration records.
- A publication has no reactions or comments.
- A discussion contains several reply levels or malformed parent relationships.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store comments linked explicitly to one publication and one author.
- **FR-002**: A comment MUST optionally reference one parent comment and MUST reject a parent from another publication.
- **FR-003**: The system MUST store at most one reaction per user and publication.
- **FR-004**: Users MUST be able to toggle their reaction and receive the resulting state and count.
- **FR-005**: The system MUST store publication reports linked explicitly to the reporter and publication.
- **FR-006**: The system MUST prevent duplicate pending reports by the same reporter for the same publication.
- **FR-007**: All social relationships MUST be explicit and protected from accidental cascade deletion.
- **FR-008**: Feed reads MUST return authors, subjects, reactions and nested discussions without issuing one independent database request per related record.
- **FR-009**: Social write operations MUST require authentication and derive the acting user from the authenticated session.
- **FR-010**: Moderation and administration reads MUST require an administrator or moderator role as appropriate.
- **FR-011**: Initialization MUST provide at least five real curriculum subjects and ten test users covering Student, Professor, Moderator and Administrator roles.
- **FR-012**: Every seeded user MUST own three publications and all seeded passwords MUST use the documented test password through secure hashing.
- **FR-013**: Initialization MUST distribute reactions, top-level comments, first-level replies and at least two pending publication reports.
- **FR-014**: Initialization MUST be deterministic and idempotent for empty, partial and already initialized databases.
- **FR-015**: The feed MUST support creating publications, toggling reactions, opening discussions, adding comments and replies, and reporting publications.
- **FR-016**: The feed MUST provide inline loading, success and error feedback and update visible state without a full page reload.
- **FR-017**: The administration dashboard MUST provide Users, Subjects and Moderation tabs.
- **FR-018**: All reactive hooks MUST execute in a stable unconditional order on every component render.
- **FR-019**: New user-interface styling MUST use the project's existing utility CSS system and remain responsive.
- **FR-020**: Existing user administration behavior MUST remain available after dashboard integration.

### Key Entities

- **Comment**: A message authored by a user on one publication, optionally replying to another comment on the same publication.
- **Reaction**: A unique positive reaction by one user to one publication.
- **Community Report**: A moderation request made by one user against one publication, with reason, status, and creation time.
- **Inquiry**: An academic publication that owns its comments, reactions and reports.
- **Subject**: The academic context assigned to publications and visible in the administration dashboard.
- **User**: The authenticated actor who publishes, comments, reacts, reports, or administers the platform.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new environment contains at least 5 subjects, 10 users, 30 publications, social interactions and 2 reports after one startup.
- **SC-002**: Running initialization twice produces no duplicate fixed users, subjects, publications, reactions, comments, or reports.
- **SC-003**: A signed-in user completes the publication, reaction, comment, reply and report workflow without a page reload.
- **SC-004**: Social state remains correct after browser and backend reloads.
- **SC-005**: An administrator reaches each dashboard area in one tab selection and no hook-order runtime error is emitted.
- **SC-006**: Unauthorized administration requests are rejected in every tested case.
- **SC-007**: All affected backend and frontend builds complete with zero errors.

## Assumptions

- Existing JWT authentication and the current user identity are reused for all social writes.
- Reports in this scope target publications only; reporting comments can be added in a later feature.
- Comments may be nested to multiple levels, while demonstration data includes at least one reply level.
- Seed data is for local development and evaluation and is not inserted into production environments unless explicitly enabled.
- Subject administration in this increment is read-only; creation and editing can follow as a separate independently authorized feature.
