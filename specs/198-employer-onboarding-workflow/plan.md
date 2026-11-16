# Implementation Plan: Employer Onboarding Workflow

**Branch**: `codex/198-employer-onboarding-workflow` | **Date**: 2026-07-30

## Summary

Replace anonymous employer auto-provisioning with an approval workflow. Persist
normalized requests, create Magic-Link-only Employer accounts under a serializable
transaction, enqueue non-sensitive welcome work, deliver outside SQL through a bounded
hosted service, and expose public/admin React flows.

## Technical Context

**Backend**: .NET 8, EF Core 8.0.6, HotChocolate 14.2.0, SQL Server

**Frontend**: React 18, Apollo Client 3.7, Tailwind CSS 4, Vite 8

**Existing reuse**: `EmployerAuthService`, digest-only `MagicLink`, `IEmailSender`,
Mailpit/pickup fallback, `AuditLog`, Redis/in-memory limiter pattern, Admin tabs

**Testing**: xUnit/Moq, EF relational SQL smoke, HotChocolate schema tests,
Vitest/Testing Library, finite runtime and browser flow

## Constitution Check

- GraphQL remains the business contract: PASS.
- Sensitive credentials remain hashed/non-persisted: PASS.
- Inputs are bounded; CUIT/email validation is deterministic: PASS.
- All new FKs use Restrict and no shadows: PASS.
- JWT Administrator authorization is backend-enforced: PASS.
- Runtime evidence and external SMTP distinction are mandatory: PASS.

## Architecture

1. `EmployerRequestService` owns normalization, state transitions and transaction.
2. `EmployerRequest` keeps personal/company request data behind Admin-only GraphQL.
3. `EmployerOnboardingOutboxMessage` stores only request ID and delivery metadata.
4. `EmployerOnboardingHostedService` claims pending work, calls the secure welcome-link
   method and persists Delivered/Failed with bounded retry.
5. `EmployerAuthService` no longer creates users from public Magic Link requests.
6. `Account.MagicLinkEnabled` makes passwordless Employer accounts explicit.
7. React adds `/empleos/solicitud` and an Admin tab without duplicating `/empleos`.
8. Honeypot handling precedes business-field validation, and public submission/Magic
   Link responses remain indistinguishable across existing, unknown and transport-error
   cases.
9. Rejection preserves the bounded reason on the Admin-only request while the
   transversal audit records only `ReasonProvided`.

## Transaction Boundary

Approval uses serializable isolation and one `SaveChangesAsync` for request, Account,
User, AuditLog and Outbox. SMTP executes only after commit. A database conflict maps to
one stable user error. Repeated approval returns the existing provisioned result.

## Outbox Semantics

- One Outbox row per request.
- Pending rows become Processing with a lease timestamp.
- Expired leases are reclaimable after restart.
- Delivery invalidates prior unused onboarding links before creating the next digest.
- Failure increments attempts and schedules exponential backoff.
- After the configured maximum, status is Failed until Admin resend resets it.
- At-least-once email delivery is accepted; only the latest link remains usable.

## Data Migration

Migration `AddEmployerOnboardingWorkflow`:

- add `Accounts.MagicLinkEnabled`, default false;
- backfill existing active Employer accounts to true;
- replace authentication credential check constraint;
- add request/outbox tables, indexes, checks, rowversion and Restrict FKs;
- change MagicLink FK from Cascade to Restrict;
- Down aborts if Magic-Link-only accounts would become credentialless.

## Source Structure

```text
API Graphql/Entities/Models/
  EmployerRequest*.cs
  EmployerOnboardingOutboxMessage.cs
API Graphql/Services/EmployerOnboarding/
  IEmployerRequestService.cs
  EmployerRequestService.cs
  EmployerRequestContracts.cs
API Graphql/OneITB/Services/Security/
  EmployerRequestRateLimiting.cs
API Graphql/OneITB/Infrastructure/
  EmployerOnboardingHostedService.cs
FrontEnd/OneItb-FE/src/Components/jobs/
  EmployerRequestForm.jsx
FrontEnd/OneItb-FE/src/Components/admin/
  EmployerRequestManagement.jsx
FrontEnd/OneItb-FE/src/data/graphql/employerRequests.js
```

## Validation Order

1. Baseline QA.
2. Models/context/migration inspection.
3. Backend service and security tests.
4. GraphQL schema and authorization tests.
5. React tests and build.
6. Apply migration and zero-drift check.
7. Finite API/outbox/Mailpit or pickup smoke.
8. Browser flow when available.
9. Documentation/evidence reconciliation.
