# Evidence: Employer Authentication JWT Remediation

## Baseline

- Date: 2026-07-23.
- The worktree already contained a partial edit in `EmployerAuthService.cs`; it was preserved and audited rather than reverted.
- The committed design had three incompatible token paths: an employer mock token, a separate account issuer and `UsersService.GenerateToken()` returning `token_placeholder`.

## Implemented Controls

- `JwtTokenService` is the only application access-token issuer and validates key length, issuer, audience and lifetime at startup.
- `AccountsService` and `EmployerAuthService` issue the same HS256 JWT contract with canonical identity and role claims.
- `UsersService.GenerateToken()` and every placeholder/mock issuer were removed.
- Magic-link credentials use 32 cryptographic random bytes, expire after 15 minutes and are consumed atomically with relational `ExecuteUpdateAsync`.
- Existing inactive or non-employer identities are rejected with the stable generic code `AUTH_MAGIC_LINK_INVALID`.
- No JWT, magic credential or signing key is written to logs. The employer UI stores the JWT through `AuthContext` and never renders it.

## Automated Evidence

- Full backend suite: PASS, 82/82.
- Issuer tests cover signature, issuer, audience, claims, lifetime and malformed configuration.
- Employer tests cover issuance, replay, expiry, inactivity, wrong role and BCrypt account initialization.
- Backend Release build: PASS, 0 warnings and 0 errors.
- EF drift: PASS, no pending model changes.
- Source scan: no `token_placeholder`, mock-token issuer or duplicate `GenerateToken` remains in production code.

## Runtime Evidence

- SQL Server Docker container was healthy and `dotnet ef database update` reported the schema current.
- Magic-link request returned a 64-character one-time credential without logging it.
- The credential produced a signed JWT accepted by the configured bearer middleware; authenticated `me` returned role `Empleador`.
- Sequential replay was rejected with `AUTH_MAGIC_LINK_INVALID`.
- Two simultaneous login attempts against one credential produced exactly one success and one `AUTH_MAGIC_LINK_INVALID`, proving atomic consumption on SQL Server.
- `/employer-login` rendered the one-time-credential workflow in the browser with no console warnings or errors and without displaying a JWT.

## Residual Production Boundary

The current GraphQL contract returns the one-time credential to support the institutional demo. A public production deployment should deliver it out of band through an approved email provider and avoid returning it to the requesting client.

## Status

**Verified** for the current local Docker runtime and automated contract. No commit or push was performed.
