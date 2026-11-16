# Evidence: Microsoft Entra Institutional SSO

**Status**: Implemented and verified locally; real-tenant acceptance blocked externally

## Baseline

- Branch created while preserving existing uncommitted Spec 196 work.
- No active Google SSO package or implementation existed before this spec.
- Existing local password, Magic Link and canonical OneITB JWT flows identified.
- No commit or push was executed.

## Implemented controls

- Authorization Code + PKCE through pinned MSAL browser/react packages.
- Tenant-specific access-token validation for signature, RS256 algorithm, issuer,
  audience, lifetime, tenant, immutable object ID, delegated scope and institutional
  domain.
- Signing-key metadata cache with one forced refresh/retry for key rotation.
- Bounded IP and external-identity rate limiting with Redis when configured and
  in-memory fallback for local development.
- Serializable account linking/provisioning, all-or-none external-identity constraint
  and unique filtered provider/tenant/subject index.
- New external accounts default to Student. Existing unlinked Administrator,
  Moderator, Professor and Employer accounts fail closed.
- External tokens are exchanged for the canonical OneITB JWT and are never persisted,
  logged or used to authorize application resolvers.
- Apollo, GraphQL WebSocket and MSAL state are purged on logout/session replacement.
- Public `userById` was removed because it bypassed profile privacy masking; public
  third-party access uses `publicProfile`.

## Automated validation

| Gate | Command/result |
|---|---|
| Backend tests | `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release`: **174/174 passed**, 0 skipped |
| Backend build | `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: **0 warnings, 0 errors** |
| Frontend tests | `npm.cmd run test -- --run`: **32 files, 82/82 passed** |
| Frontend build | `npm.cmd run build`: **539 modules**, 0 errors, 850 ms |
| EF migrations | `dotnet ef migrations list`: **33 migrations**, latest `20260730032643_AddMicrosoftEntraIdentity` |
| EF model drift | `dotnet ef migrations has-pending-model-changes`: no pending model changes |
| Local database | `AddMicrosoftEntraIdentity` applied successfully to the Docker SQL Server database |
| Dependency audit | `npm audit`: 0 critical/high; 2 moderate advisories in pre-existing React Router 6.30.4. The suggested forced upgrade is React Router 7 and was not applied during this spec. |
| Speckit QA | Final preflight: **PASS**, 11/11 requirement checks closed and `git-diff-check` passed |
| Repository hygiene | No active Google SSO implementation/configuration, no literal API key/JWT/private key in changed files and no open Spec 197 tasks |
| Speckit Analyze | 19 functional requirements (including FR-009A), 5 success criteria and 37 tasks reviewed; no placeholders, open tasks, constitution conflicts or unmapped implementation areas |

Backend coverage includes valid and invalid tokens, expiration, audience, tenant, scope,
domain, ID-token rejection, signing-key refresh, partial configuration, rate limiting,
new Student provisioning, existing Egresado linking, privileged-account rejection,
identity conflict, idempotent repeated login, sanitized audit rejection, SSO-only
password login, authorization matrix and public-profile schema privacy.

Frontend coverage includes successful/failed institutional exchange, graceful disabled
configuration and MSAL/Apollo/WebSocket cleanup through the shared session boundary.

## Finite runtime smoke

The Release API binary was started as a finite background PowerShell job on
`http://127.0.0.1:5010`, queried, and stopped in `finally`. No `dotnet run`, watcher or
blocking server was left active.

| Assertion | Result |
|---|---|
| GraphQL HTTP response | 200 |
| Mutation count | 43 |
| `microsoftLogin` | present |
| `me` / `publicProfile` | present |
| public `userById` | absent |
| Disabled integration rejection | `ENTRA_NOT_CONFIGURED` with generic Spanish message |
| Listener after cleanup | false |

The normal HTTPS development profile also starts, but the current Windows machine does
not trust its development certificate. The contract smoke therefore used isolated HTTP;
`dotnet dev-certs https --trust` remains the local workstation remedy and is not an
application security bypass.

The QA preflight was corrected to respect Git's configured Windows line-ending
normalization. Its previous forced `core.autocrlf=false` treated legitimate CRLF from
EF-generated files as trailing whitespace; the standard `git diff --check` still
detects actual whitespace defects and now passes.

## Concurrency statement

Duplicate external identities are prevented by a SQL Server unique filtered index and
first-link writes execute under a serializable transaction. Automated tests prove
identity conflict handling and repeated-login idempotency. A real simultaneous
first-login race against the institutional tenant was not claimed because tenant
credentials are outside the repository.

## External acceptance boundary

Production tenant consent and a real institutional Microsoft 365 account are external
to the repository. Static, automated and controlled runtime validation remain required;
real-tenant acceptance will be marked blocked until those values are supplied.

The external acceptance checklist is:

1. Create and approve the API and SPA app registrations.
2. Confirm v2 access tokens for the OneITB API audience and `access_as_user` scope.
3. Sign in with an authorized `@itbeltran.com.ar` account.
4. Verify first link/new Student provisioning, logout and a second isolated session.
5. Confirm rejection for a non-institutional or wrong-tenant account.
