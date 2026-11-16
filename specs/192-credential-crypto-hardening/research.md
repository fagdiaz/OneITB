# Research: Credential Delivery and Cryptographic Policy Hardening

## Audited Baseline

- `Mutation.RequestMagicLink` returns `Task<string>`.
- `EmployerAuthService.RequestMagicLinkAsync` returns the generated raw token.
- `EmployerLogin.jsx` assigns `data.requestMagicLink` directly into the credential input.
- `IEmailSender`, `SmtpEmailService` and `ConsoleEmailService` already exist.
- `ConsoleEmailService` logs recipient, subject and full body.
- `EmployerAuthService` stores the raw token and later compares it in the database.
- Token generation uses 32 cryptographically random bytes and atomic consumption is implemented correctly.
- `UsersService`, `EmployerAuthService` and `EnterpriseDemoSeeder` call `BCrypt.HashPassword` without an explicit work factor.
- `appsettings.json` contains a concrete JWT signing key even though secrets must not be tracked.

## Decisions

### D1 - Generic request payload

Target GraphQL response:

~~~graphql
type MagicLinkRequestPayload {
  accepted: Boolean!
  message: String!
}
~~~

The same response is returned for accepted requests without account enumeration. Operational failures use stable generic error codes.

### D2 - Token only in the email channel

Construct a link such as:

`https://frontend.example/employer-login#token=<credential>`

The fragment is not sent in HTTP requests/referrers. The frontend reads it once, stores it only in component memory and immediately removes it with `history.replaceState`.

### D3 - Store a digest, not the credential

Generate the raw 256-bit token, compute SHA-256 and persist only the normalized digest. Redemption hashes the submitted token before the atomic lookup/update. Existing unexpired plaintext rows are intentionally invalidated at rollout and expire naturally within 15 minutes.

### D4 - Safe environment-specific email behavior

- Production: SMTP (or future production provider) is mandatory for Magic Link.
- Development: local pickup-directory sender writes `.eml` files under ignored `App_Data/MailDrop`; no body is logged.
- Test: fake sender captures messages in process.

The generic `ConsoleEmailService` must not log sensitive bodies. If retained for non-sensitive notifications, it logs metadata only.

### D5 - Central BCrypt policy

Introduce an injectable password hashing abstraction with:

- explicit Production default cost 12;
- validated minimum 10 and bounded maximum;
- `Hash`, `Verify` and `NeedsRehash`;
- transparent upgrade after successful password login;
- test-only low-cost construction without production configuration.

### D6 - Secret ownership

Remove concrete JWT key values from tracked base settings. `JwtTokenOptions` validates issuer, audience and key strength. Development uses user-secrets; containers use environment variables/secrets.

## Rejected Alternatives

- Return the token only in Development GraphQL: contracts diverge and credentials remain browser/API-visible.
- Log the link to console: logs are frequently centralized and retained.
- Put the token in a query string: it leaks through history, access logs and referrers.
- Encrypt stored Magic Link tokens reversibly: no recovery is needed; a digest is safer.
- Hardcode BCrypt cost at each call site: drift returns.
- Force-rehash every account offline: plaintext passwords are unavailable.

## Compatibility

The request mutation response changes and requires coordinated frontend/tests. `loginWithMagicLink` continues returning the standard JWT. Existing passwords and Account `char(60)` remain compatible.

