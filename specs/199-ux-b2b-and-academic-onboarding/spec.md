# Feature Specification: UX B2B and Academic Onboarding

**Feature Branch**: `codex/199-ux-b2b-academic-onboarding`

**Created**: 2026-07-31

**Status**: Implemented; browser and real-tenant acceptance pending

## User Scenarios & Testing

### User Story 1 - Institutional Microsoft access (Priority: P1)

As an institutional user, I can see and use Microsoft 365 access when the canonical
Entra configuration is complete, regardless of whether the temporary legacy client ID
alias is still present.

**Acceptance Scenarios**:

1. `VITE_ENTRA_CLIENT_ID` takes precedence over `VITE_MICROSOFT_CLIENT_ID`.
2. A blank canonical value falls back to a non-blank legacy value.
3. A GUID tenant or the explicit multi-tenant authority `common` is accepted.
4. Missing tenant, client ID, API scope, or redirect URI keeps Microsoft access hidden.
5. The provider and the Login button consume the same resolved immutable configuration.
6. No client secret or confidential credential is read by the browser application.

### User Story 2 - Visible company onboarding entry point (Priority: P1)

As an external company representative, I can reach the existing employer request flow
from the public header on desktop and mobile without searching through the Landing body.

**Acceptance Scenarios**:

1. The public header exposes `Soy empresa` next to Login and Registration on desktop.
2. The mobile menu exposes the same action and closes after navigation.
3. Header and Landing reuse the same route and product terminology.
4. The CTA keeps keyboard focus, contrast, and Clean Tech / Tech Noir consistency.

### User Story 3 - Mandatory academic identity setup (Priority: P1)

As a Student without linked careers, I must choose at least one active career before
accessing authenticated application modules so that the feed is not empty by default.

**Acceptance Scenarios**:

1. Only the canonical `Estudiante` role with zero careers is redirected to
   `/onboarding/academic`.
2. Administrator, Moderator, Professor, Graduate, Employer, anonymous, loading, and
   query-error states are never misclassified as incomplete Students.
3. The setup route cannot be dismissed by click-outside, Escape, browser back into a
   protected route, or a local-only state update.
4. The screen offers active careers, requires at least one unique integer ID, prevents
   duplicate submission, and preserves the selection after mutation failure.
5. Success awaits a canonical `me` refetch matching the authenticated user and
   containing at least one career before restoring the original internal destination
   or `/feed`.
6. Query failure offers Retry and Logout; an empty institutional career catalog offers
   Retry and does not allow submission.
7. Expired sessions continue through the existing global termination flow.

## Edge Cases

- Canonical and legacy Entra client IDs are both present but differ.
- Tenant is `common` with surrounding whitespace or an unsupported authority alias.
- Apollo briefly exposes a `me` record belonging to a previous session.
- The authenticated user changes while the onboarding query is in flight.
- Careers are returned with duplicate IDs, inactive entries, or string IDs.
- The save mutation succeeds but the profile refetch fails or still reports no careers.
- The requested destination is external, `/login`, or the onboarding route itself.
- The authenticated Student opens `/onboarding/academic` after already linking a career.

## Functional Requirements

- **FR-001**: Entra browser configuration MUST be resolved in one pure module.
- **FR-002**: `VITE_ENTRA_CLIENT_ID` MUST be canonical and the legacy alias temporary.
- **FR-003**: Client ID MUST be a GUID; tenant MUST be a GUID or literal `common`.
- **FR-004**: Microsoft UI MUST be hidden unless all public configuration is valid.
- **FR-005**: The public header MUST expose the employer request CTA on desktop/mobile.
- **FR-006**: Employer CTA route/text MUST have a single frontend source of truth.
- **FR-007**: A route guard MUST use authenticated `me`, not local form state, to decide.
- **FR-008**: Mandatory setup MUST apply exclusively to `Estudiante` with no careers.
- **FR-009**: `me.id` MUST equal the authenticated session user ID before any decision.
- **FR-010**: Setup MUST persist through the existing `linkUserToCareers` mutation.
- **FR-011**: Career IDs MUST be unique integers and reference active catalog entries.
- **FR-012**: Unlock MUST await a successful canonical profile refetch.
- **FR-013**: Original destinations MUST be internal and sanitized before restoration.
- **FR-014**: Loading, error, empty, submitting, and success states MUST be explicit.
- **FR-015**: The setup screen MUST provide a working Logout escape for account changes.

## Non-Functional Requirements

- **NFR-001**: No backend schema, EF model, migration, or new dependency is required.
- **NFR-002**: Components MUST be keyboard accessible and dual-theme.
- **NFR-003**: Apollo data from another identity MUST never unlock or block the route.
- **NFR-004**: Tests MUST cover configuration precedence and the authorization matrix.
- **NFR-005**: Validation uses finite tests/builds only; no development server is started.

## Success Criteria

- **SC-001**: Microsoft configuration cases pass deterministic unit tests.
- **SC-002**: Employer CTA is discoverable in both responsive navigation states.
- **SC-003**: All canonical roles pass route-guard tests with correct outcomes.
- **SC-004**: Mutation failure, profile query failure, empty catalog, and success are
  covered by component tests.
- **SC-005**: The complete frontend suite and Vite production build finish with zero
  errors.

## Out Of Scope

- Tenant consent, App Registration creation, and real Microsoft login acceptance.
- New profile/career backend contracts or changes to role provisioning.
- Employer approval workflow changes.
- Runtime/browser validation that requires starting Vite or the backend.
