# Feature Specification: Microsoft Entra Institutional SSO

**Feature Branch**: `codex/197-microsoft-entra-sso`

**Created**: 2026-07-30

**Status**: Approved

**Input**: Replace the unimplemented Google SSO plan with Microsoft Entra ID,
matching the institute's Microsoft 365 identity platform while preserving local
password login and employer Magic Link.

## User Scenarios & Testing

### User Story 1 - Institutional sign-in (Priority: P1)

As a member of Instituto Tecnologico Beltran, I can authenticate with my authorized
Microsoft 365 account and receive the same OneITB session used by the rest of the SPA.

**Independent Test**: Validate a tenant-issued API access token and execute
`microsoftLogin`; the response contains only the canonical OneITB JWT and local user.

**Acceptance Scenarios**:

1. **Given** a valid access token issued by the configured Entra tenant for the
   configured OneITB API audience and scope, **When** `microsoftLogin` executes,
   **Then** signature, issuer, audience, lifetime, tenant, subject, scope and
   institutional email are validated before a local session is issued.
2. **Given** an expired, unsigned, malformed, wrong-tenant, wrong-audience,
   wrong-scope or non-institutional token, **When** login is attempted, **Then** the
   operation fails with a controlled GraphQL error and no account is created or linked.
3. **Given** Entra is not configured, **When** the login page renders, **Then** the
   Microsoft action is hidden and local password login remains functional.

### User Story 2 - Safe identity linking and provisioning (Priority: P1)

As an existing institutional user, I can link my validated Microsoft identity without
duplicating my account; a new institutional user can be provisioned without receiving
privileged roles.

**Independent Test**: Execute the service with validated claims for an existing email,
then for a new email, and verify uniqueness, role and password state.

**Acceptance Scenarios**:

1. **Given** a validated Entra identity whose normalized email matches one local
   account, **When** it signs in for the first time, **Then** the account is linked to
   provider, tenant and immutable object ID inside one transaction.
2. **Given** a validated identity with no local account, **When** it signs in, **Then**
   a new active Student account is created with no local password and no Admin,
   Moderator, Professor or Employer privilege.
3. **Given** an identity already linked to another local account, **When** linking is
   attempted, **Then** the operation fails closed without modifying either account.
4. **Given** an SSO-only account, **When** local password login is attempted, **Then**
   the normal generic invalid-credentials response is returned without null crashes.

### User Story 3 - Session isolation and traceability (Priority: P1)

As a security reviewer, I can prove that Microsoft credentials never become the
application session and that successful/rejected attempts are auditable without
recording sensitive token material.

**Independent Test**: Inspect storage, GraphQL payloads and persisted audit records
after successful and rejected login attempts.

**Acceptance Scenarios**:

1. **Given** a successful Entra exchange, **When** React establishes the session,
   **Then** only the OneITB JWT and local user use the canonical session boundary.
2. **Given** logout or session replacement, **When** termination completes, **Then**
   Apollo cache/WebSocket state and the MSAL session cache are cleared.
3. **Given** any login outcome, **When** an audit record is written, **Then** it contains
   provider/outcome/correlation metadata but no access token, refresh token, ID token,
   JWT, password, authorization code or raw claim set.

### User Story 4 - Operational configuration (Priority: P2)

As an operator, I can configure Entra using environment variables and an app
registration runbook without committing tenant-specific credentials.

**Independent Test**: Start with configuration absent and present; validate graceful
disablement and strict startup validation respectively.

## Requirements

### Functional Requirements

- **FR-001**: The frontend MUST use MSAL React/browser with Authorization Code + PKCE.
- **FR-002**: The SPA MUST request an access token for the OneITB API scope, not a
  Microsoft Graph token or an ID token for API authorization.
- **FR-003**: The backend MUST validate cryptographic signature, issuer, API audience,
  lifetime, tenant ID, object ID, required delegated scope and institutional email.
- **FR-004**: The authority MUST be tenant-specific; `common`, `organizations`,
  consumers and personal Microsoft accounts are forbidden.
- **FR-005**: `microsoftLogin(accessToken)` MUST be public but independently rate
  limited by client IP and validated external identity.
- **FR-006**: Successful external authentication MUST issue the canonical OneITB JWT
  through `IJwtTokenService`; external tokens MUST NOT authorize OneITB resolvers.
- **FR-007**: Existing local password login and employer Magic Link MUST remain.
- **FR-008**: Existing accounts MUST link by normalized institutional email only after
  full token validation and under a transaction.
- **FR-009**: New SSO accounts MUST default to Student and require normal profile/career
  completion; privileged roles MUST never be derived from external claims.
- **FR-009A**: First-time email linking MUST be rejected for existing Administrator,
  Moderator, Professor and Employer accounts unless their external identity was
  previously approved and persisted by an administrative process.
- **FR-010**: External-only accounts MUST support a null local password hash; local
  password login and admin password verification MUST reject them safely.
- **FR-011**: The database MUST enforce a unique filtered external identity index.
- **FR-012**: Provider, tenant, immutable subject and last external login timestamp MAY
  be persisted; access/ID/refresh tokens and authorization codes MUST NOT be persisted.
- **FR-013**: MSAL cache MUST use `sessionStorage`; no Microsoft credential may enter
  `localStorage`, logs, Apollo cache, documentation or evidence.
- **FR-014**: Logout/session replacement MUST purge Apollo, WebSocket and MSAL state.
- **FR-015**: The own profile MUST expose only a Boolean institutional-link indicator,
  not external subject or tenant identifiers.
- **FR-016**: Successful and rejected SSO attempts MUST create sanitized persistent
  audit records with a correlation ID when persistence is available.
- **FR-017**: Configuration MUST use `EntraId:*` and `VITE_ENTRA_*` environment values,
  fail closed on partial backend configuration, and disable the frontend action when
  client configuration is absent.
- **FR-018**: Active Google SSO code, packages, environment variables and operating
  instructions MUST be removed or explicitly marked as superseded history.

### Non-Functional Requirements

- **NFR-001**: Metadata/signing keys MUST be cached and support automatic refresh.
- **NFR-002**: Token input length, claim lengths and configuration values MUST be bounded.
- **NFR-003**: Database operations MUST be async and receive `CancellationToken`.
- **NFR-004**: Errors MUST use stable codes and avoid identity-enumeration details.
- **NFR-005**: No client secret may be exposed to or required by the SPA.

## Success Criteria

- **SC-001**: Unit/integration tests cover valid, expired, wrong-audience, wrong-tenant,
  wrong-scope, invalid-domain, linking conflict, new user and SSO-only password login.
- **SC-002**: Two concurrent first logins cannot create duplicate external identities.
- **SC-003**: Backend tests/build, frontend tests/build and EF drift checks pass.
- **SC-004**: Runtime GraphQL schema exposes `microsoftLogin` and a finite smoke test
  proves controlled rejection without leaking token data.
- **SC-005**: Repository search finds no active Google SSO dependency/configuration.

## Out Of Scope

- Personal Microsoft accounts or multi-tenant access.
- Microsoft Graph business data.
- Automatic role mapping from Entra groups.
- Production tenant registration or real institutional credentials.
- Removal of local password login or employer Magic Link.
