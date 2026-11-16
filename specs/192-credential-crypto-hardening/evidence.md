# Evidence: Credential Delivery and Cryptographic Policy Hardening

## Planning Baseline (2026-07-27)

- Confirmed: `requestMagicLink` returns the raw 64-character credential.
- Confirmed: `EmployerLogin.jsx` inserts that credential directly into component state.
- Confirmed: Magic Link storage currently contains the raw credential.
- Confirmed: `ConsoleEmailService` logs complete message bodies.
- Confirmed: three production paths call BCrypt hashing without an explicit cost.
- Confirmed: base `appsettings.json` contains a concrete JWT signing key.
- Positive baseline: Magic Link randomness, 15-minute expiry, atomic consumption and centralized JWT issuance already exist and must be preserved.

## Added Planning Quick Wins

- Digest Magic Link credentials at rest.
- Use URL fragments and immediate browser URL cleanup.
- Replace credential-bearing console logs with a local ignored mail pickup in Development.
- Remove tracked JWT signing material and validate production secret strength.

## Implementation Evidence (2026-07-27)

### Contract and storage

- `requestMagicLink` now returns `MagicLinkRequestPayload { accepted, message }`; `MagicLinkContractTests` executes the real HotChocolate schema and confirms those are the only response fields.
- The 256-bit credential is delivered in `{FrontendBaseUrl}/employer-login#token=...`; SQL stores only the lowercase SHA-256 digest.
- `EmployerLogin` validates the 64-character fragment, moves it to component memory and removes the fragment with `history.replaceState`; no credential input is rendered.
- Atomic `ExecuteUpdateAsync`, 15-minute expiry and replay rejection remain intact.
- Existing non-employer accounts receive the same generic payload without delivery, avoiding an account-existence signal.
- A delivery failure removes the just-created link and returns the stable `AUTH_MAGIC_LINK_DELIVERY_UNAVAILABLE` error.

### Email and environment

- `IEmailSender` moved to the service contract layer; SMTP and pickup remain host adapters.
- Development without SMTP writes ignored `.eml` files to `App_Data/MailDrop`; message bodies and recipients are not logged.
- Production and partial SMTP configurations fail closed.
- `docker-compose.prod.yml` requires SMTP, JWT issuer/audience/key and the HTTPS Magic Link frontend URL.

### Cryptography

- `IPasswordHasher` and `BcryptPasswordHasher` centralize BCrypt with configurable work factor 12, accepted range 10-14.
- Registration, administrator password verification, employer placeholder creation and enterprise seeding share that policy.
- Successful login upgrades weaker hashes but never downgrades a stronger existing hash.
- The tracked JWT key was removed; startup rejects missing, short or low-diversity keys.
- Demo seeding receives the hashing function from the composition root and has no hardcoded development password.

### Commands and results

~~~text
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
PASS: 141/141

npm.cmd test -- --run
PASS: 27 files / 61 tests

dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
PASS: 0 warnings / 0 errors

npm.cmd run build
PASS: 376 modules, 762 ms

dotnet ef migrations has-pending-model-changes --no-build --configuration Release ...
PASS: No changes have been made to the model since the last migration.

docker compose -f docker-compose.prod.yml config --quiet
PASS with ephemeral validation variables.

git diff --check
PASS (line-ending notices only).
~~~

The first EF attempt failed because the tracked JWT key had been removed and no local user-secret existed. This is expected fail-closed behavior. The gate was repeated with a process-only test key after restoring NuGet metadata; no secret was persisted.

### Leakage checks

- Production `BCrypt` calls exist only inside `BcryptPasswordHasher`.
- No `return magicLink.Token`, request-response token assignment, console email adapter or body log remains.
- `appsettings*.json` contain no `Jwt:Key`.
- `App_Data/MailDrop` and `*.eml` are ignored and no pickup artifact is tracked.
- The automated pickup test requests the link, reads the `.eml`, redeems it for a signed JWT and verifies replay rejection.

## Deferred Evidence

- Real SMTP smoke: not executed because no provider secret or authorized test recipient was supplied.
- Browser navigation: not executed; no web server was started, per the explicit operational instruction.

## Status

**Implemented `[I]`**. Security contracts, automated pickup flow, schema, tests, builds, compose and EF drift pass. Elevation to `[V]` requires real SMTP and browser smoke.
