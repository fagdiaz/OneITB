# Evidence: Employer Onboarding Workflow

**Status**: Implemented. Automated and finite integration gates passed. Browser
regression remains manual by explicit user decision.

## Build and test evidence

| Gate | Result |
|---|---|
| Backend test suite | PASS, 183/183 |
| Backend Release build | PASS, 0 warnings / 0 errors |
| Frontend Vitest suite | PASS, 85/85 |
| Frontend Vite build | PASS, 0 errors |
| Migration `AddEmployerOnboardingWorkflow` | Applied to Docker SQL Server |
| EF pending model changes | None |

Coverage includes request normalization, CUIT checksum, duplicate suppression,
serializable/idempotent approval, rejection, fixed Employer role, Magic Link
eligibility, Outbox retry/lease behavior, Redis/local limiter, authorization schema and
the public/Admin React flows.

## Finite runtime evidence

A temporary finite process was used before the user stopped persistent server attempts.
The process was cleaned up after the checks.

1. GraphQL `__typename` and schema operations responded successfully.
2. `submitEmployerRequest` returned a generic accepted payload.
3. An authenticated Administrator listed the pending request.
4. `approveEmployerRequest` created the Employer identity and returned a pending email
   state without duplicating account/user data.
5. The Outbox processor advanced the delivery to `Delivered`.
6. Development pickup contained one `.eml` with subject
   `Bienvenida a OneITB para Empresas`.
7. Temporary ports were released after the finite validation.

## Security closure

- The honeypot check executes before normalization or validation of business fields.
- Public submission returns the same confirmation for new and conflicting identities.
- Public Magic Link returns the same accepted response for unknown, ineligible and
  delivery-unavailable identities.
- The rejection audit stores `ReasonProvided = true`; it does not copy the reason,
  email or TaxId.
- Rate-limit keys use HMAC fingerprints and never raw PII.
- Approval is Admin-only, fixes the role to `Empleador` and persists
  request/account/user/audit/Outbox in one serializable transaction.
- Outbox payload does not persist a token, email body or SMTP secret.

## Manual gate

The user explicitly requested that Codex not start backend or Vite during closure.
Therefore, the final browser walkthrough of `/empleos/solicitud` and the Admin
**Solicitudes de Empleadores** tab is pending and is not represented as executed.

## Repository state

The user created manual commit:

`a9a8d41 feat(employers): implement B2B employer onboarding workflow (Spec 198)`

Codex did not create or push a commit during this closure.

## Final static analysis

- Speckit prerequisites resolved the active feature to
  `specs/198-employer-onboarding-workflow`.
- Requirements analyzed: 18 functional and 5 non-functional.
- Tasks analyzed: 37.
- Requirement coverage: 23/23 (100%).
- Open tasks: 0.
- Constitution conflicts: 0.
- Critical/high inconsistencies: 0.
- `git diff --check`: PASS.
- Roadmap count: 117 checked items, consistent with `117/117`.
- Changed-document secret scan: PASS.
- Persistent server processes started during closure: none.
