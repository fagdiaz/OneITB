# Research: Employer Authentication JWT Remediation

## Audited Baseline

- FINAL_AUDIT_REPORT.md points to a mock return in the committed EmployerAuthService.
- The current working tree contains an uncommitted direct JwtSecurityTokenHandler implementation. It is a partial candidate, not verified completion.
- Services/Accounts/AccountsService.cs independently creates two-hour JWTs.
- Services/Users/UsersService.cs exposes GenerateToken and returns token_placeholder.
- Employer token lifetime in the partial patch is 24 hours, while password login uses two hours.
- Existing magic-link redemption reads IsUsed == false and updates later, allowing a concurrent replay race.

## Recommended Design

Introduce a stateless IJwtTokenService backed by validated JWT options. AccountsService and EmployerAuthService call IssueAccessToken(User user). The service owns claim mapping, time source, signing credentials and lifetime. Magic-link consumption must be atomic before token issuance; a conditional update returning one affected row is preferred over read-then-write.

Reference shape:

~~~csharp
public interface IJwtTokenService
{
    string IssueAccessToken(User user);
}
~~~

## Security Decisions

- Use the existing symmetric HMAC algorithm unless the project-wide JWT architecture is separately migrated.
- Validate options at startup and never silently substitute a development key.
- Keep ownership and role checks server-side after authentication.
- Use stable error codes and sanitize internals through the existing error filter.

## Rejected Alternatives

- **Keep two token generators**: claims and expiry have already diverged.
- **Treat the partial working-tree patch as complete**: it lacks replay, configuration, tests and runtime evidence.
- **Store access JWTs in SQL Server**: adds exposure without solving bearer revocation.
- **Generate tokens in GraphQL resolver code**: violates the service boundary.

## Acceptance Research Gate

Implementation may start only after tests define the canonical claim set and token lifetime. Any GraphQL contract change for magic-link requests must be recorded in the contract and frontend callers.
