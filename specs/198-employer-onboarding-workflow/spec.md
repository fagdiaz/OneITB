# Feature Specification: Employer Onboarding Workflow

**Feature Branch**: `codex/198-employer-onboarding-workflow`

**Created**: 2026-07-30

**Status**: Implemented; browser regression pending manual QA

## User Scenarios & Testing

### User Story 1 - Public company request (Priority: P1)

As an external company representative, I can submit a bounded onboarding request and
receive a reference without obtaining an account before administrative review.

**Acceptance Scenarios**:

1. A valid company, contact, email, phone, CUIT and privacy consent create one Pending
   request with normalized identifiers.
2. Invalid CUIT checksum, malformed email, missing consent or oversized input creates
   no reviewable request and returns a controlled validation error.
3. Honeypot content is handled before field validation, creates no reviewable request
   and receives the same generic accepted response used for a valid submission.
4. Repeated active email/CUIT or an existing account receives the same generic accepted
   response and does not disclose which record exists.
4. Operation-specific limits apply by client source and opaque email/CUIT fingerprint.

### User Story 2 - Administrative review (Priority: P1)

As an Administrator, I can page and filter requests, approve one atomically, or reject
it with a reason while retaining traceability.

**Acceptance Scenarios**:

1. Only Administrators can list or process requests.
2. Approval atomically creates exactly one Employer user/account, marks the request,
   records the actor/audit and enqueues welcome delivery.
3. Concurrent or repeated approval cannot duplicate the account or outbound work.
4. Rejection stores bounded reason, actor and time without creating an account.

### User Story 3 - Reliable welcome delivery (Priority: P1)

As an approved Employer, I receive a single-use expiring Magic Link; an operator can
observe and retry failed delivery without recreating my account.

**Acceptance Scenarios**:

1. SMTP is never called inside the approval transaction.
2. A pending Outbox item generates a Magic Link whose raw credential is never persisted.
3. Delivery is reflected as Pending, Delivered or Failed; UI never claims delivery
   before Delivered.
4. Retry invalidates prior unused onboarding links and reuses the same account/request.

### User Story 4 - Usable public/admin interface (Priority: P2)

As a company or Administrator, I can complete the appropriate flow from an accessible,
responsive interface with loading, success and controlled error states.

## Edge Cases

- Existing non-Employer account with the requested email.
- Existing approved request replay.
- Account creation conflict after another transaction commits.
- SMTP unavailable or application restart while an Outbox item is processing.
- Expired, replayed or superseded Magic Link.
- Redis unavailable: public submission fails closed when distributed limiting was
  selected; bounded memory fallback remains available for local development.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST normalize email and CUIT and validate the Argentine CUIT
  checksum before persistence.
- **FR-002**: Active requests MUST be unique by normalized email and CUIT.
- **FR-003**: Public submission MUST require privacy consent, bounded text and a
  honeypot check.
- **FR-004**: Submission MUST use operation-specific rate limiting without storing raw
  personal data in limiter keys.
- **FR-005**: Administrative queries/actions MUST require the canonical Administrator
  role on the backend.
- **FR-006**: Approval MUST be idempotent and transactional for request, Employer
  account/user, audit and Outbox state.
- **FR-007**: The canonical persisted role MUST be `Empleador`; external input cannot
  choose a role.
- **FR-008**: Magic-Link-only accounts MUST be represented explicitly and MUST NOT use
  a random unknown password.
- **FR-009**: Public Magic Link request MUST never provision an account.
- **FR-010**: SMTP delivery MUST occur outside the approval transaction and expose an
  accurate delivery status.
- **FR-011**: Raw Magic Link credentials, passwords and SMTP secrets MUST NOT be stored
  in Outbox, audit records, logs or GraphQL payloads.
- **FR-012**: Administrators MUST be able to retry failed welcome delivery safely.
- **FR-013**: Rejection MUST preserve reason, actor and timestamp without hard delete.
- **FR-014**: Admin listing MUST be paginated, sorted newest-first and free from N+1.
- **FR-015**: The public route MUST use `/empleos/solicitud`; the existing protected
  employment routes remain unchanged.
- **FR-016**: Demo requests MUST only be seeded when demo data is explicitly enabled.
- **FR-017**: Public Magic Link request MUST return the same accepted response for
  unknown, ineligible and delivery-unavailable identities.
- **FR-018**: Rejection audit MUST record that a reason was provided but MUST NOT copy
  the reason or request PII into the audit snapshot.

### Non-Functional Requirements

- **NFR-001**: All database and GraphQL operations MUST accept cancellation.
- **NFR-002**: Foreign keys MUST be explicit and use `DeleteBehavior.Restrict`.
- **NFR-003**: Errors MUST use stable codes and hide SQL, SMTP and account-enumeration
  details.
- **NFR-004**: Outbox processing MUST be bounded, retryable and safe across restarts.
- **NFR-005**: Public/admin UI MUST be keyboard accessible and prevent duplicate submit.

## Key Entities

- **EmployerRequest**: normalized B2B request, processing actor/result and delivery state.
- **EmployerOnboardingOutboxMessage**: non-sensitive durable request for welcome delivery.
- **Account**: existing account extended with explicit Magic Link capability.
- **MagicLink**: existing single-use, expiring, digest-only credential.

## Success Criteria

- **SC-001**: Valid public submission can be completed in under three minutes and
  returns one reference.
- **SC-002**: Repeated or concurrent approval produces exactly one Employer account.
- **SC-003**: Delivery failure leaves an approved, consistent account and a visible
  retryable state.
- **SC-004**: Unauthorized users receive no request/contact data.
- **SC-005**: Automated suites, builds, migration drift and finite runtime flow pass.

## Assumptions

- External employers are not required to use `@itbeltran.com.ar`.
- SMTP may be tested through Mailpit/pickup locally; this is not production SMTP proof.
- Outbound delivery uses at-least-once semantics and only the latest unused onboarding
  Magic Link remains valid.

## Out Of Scope

- Corporate document uploads, legal verification providers, CAPTCHA service and CRM.
- Automatic approval, arbitrary role assignment or public request status lookup.
- Production SMTP acceptance without external credentials.
