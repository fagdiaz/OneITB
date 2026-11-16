# Research: Final Audit Closure

## Decision 1 - Public registration

**Decision**: public self-registration is limited to students with institutional email. Professor, graduate, employer, moderator and administrator identities require trusted onboarding or administrative provisioning.

**Reason**: a client can bypass frontend validation. Allowing professor self-assertion creates an authorization-escalation path even if privileged mutations also check roles.

## Decision 2 - Professor scope

**Decision**: use `UserCareer` as the freeze-safe equivalent policy for Professor-to-Subject scope. A professor may manage a subject only when linked to that subject's career.

**Reason**: an explicit ProfessorSubject table would be more granular, but requires schema, seeding and administrative UI changes immediately before delivery. Career scope closes cross-career privilege while reusing an established relation and can later be tightened to subject assignment.

## Decision 3 - Private profiles

**Decision**: remove Follow as an authorization grant. Private data is visible only to owner, administrator or moderator.

**Reason**: Follow is unilateral and therefore cannot represent consent.

## Decision 4 - Local uploads

**Decision**: do not replace media delivery during code freeze. Treat public local URLs as demo/development storage and require private storage or object-authorized delivery before public production.

**Reason**: existing images, PDF viewers and downloads rely on direct URLs. A correct redesign requires authenticated binary fetches or signed object URLs across every media surface and cannot be safely introduced as a quick patch.

## Decision 5 - Production SQL TLS

**Decision**: tracked production compose accepts an externally supplied complete connection string and does not embed `TrustServerCertificate=True`.

**Reason**: certificate trust is environment-specific and belongs in secret deployment configuration. Development remains unchanged.

## Decision 6 - Observability

**Decision**: retain existing health, correlation and structured request logging as the application baseline. Central collection, alerts and incident response remain an external production-acceptance gate.

## Alternatives rejected

- Frontend-only domain/role checks: bypassable.
- Follow-based private access: no approval semantics.
- Broad Professor role as academic manager: violates least privilege.
- Late signed-URL retrofit: too large and destabilizing for current freeze.
- Self-signed production SQL with trust bypass: not production-grade TLS verification.
