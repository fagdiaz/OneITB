# Research: Employer Onboarding Workflow

## Existing findings

- Canonical role value is `Empleador`; `GraphQlRoles.Employer` maps to it.
- Existing route is `/empleos`; public onboarding will be `/empleos/solicitud`.
- `EmployerAuthService.RequestMagicLinkAsync` currently auto-creates unknown employers
  with a random BCrypt password. This bypasses administrative approval and must stop.
- Magic Link stores SHA-256 digest, expires in 15 minutes and is atomically consumed.
- `IEmailSender` already selects SMTP in configured environments and pickup locally.
- No transactional Outbox exists.
- `Account` requires password or complete Entra identity, so an explicit Magic Link
  credential capability is necessary.

## Decisions

1. **Generic conflict**: public callers are not told whether email, CUIT, Account or
   active request caused the conflict.
2. **CUIT**: normalize to digits and validate the modulo-11 checksum.
3. **Concurrency**: rowversion + serializable transaction + filtered unique indexes.
4. **Outbox**: persist only request identity/status, never raw credentials or PII payload.
5. **Delivery**: hosted polling service with lease, backoff and explicit retry.
6. **Authorization**: declarative Admin attribute plus actor extraction in service.
7. **Magic Link request**: requires existing active approved Employer and matching CUIT.
8. **Demo**: requests exist only under the existing demo-data flag.

## Rejected alternatives

- SMTP inside transaction: external side effect cannot roll back atomically.
- Random unknown password: creates an unintended authentication credential.
- Public Account existence message: enables enumeration.
- EF InMemory as concurrency proof: does not enforce SQL indexes/transactions.
- New `/jobs` module or `Employer` role string: duplicates established contracts.
