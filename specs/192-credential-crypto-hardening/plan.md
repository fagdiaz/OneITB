# Implementation Plan: Credential Delivery and Cryptographic Policy Hardening

## Summary

Move Magic Link delivery out of GraphQL, store only token digests, add environment-safe email delivery, centralize BCrypt policy with rehash compatibility and remove tracked JWT signing material.

## Technical Context

- Backend: .NET 8, HotChocolate 14.2, EF Core 8, BCrypt.Net-Next, existing email adapters.
- Frontend: React 18, Apollo Client, employer login route.
- Primary paths: employer auth service/interface, Mutation, email services/DI, password creation/login services, seeder bootstrap, frontend mutation/component, settings/runbook.
- Migration: none expected unless a property/column rename is selected.
- Risk: CRITICAL (credential exposure and authentication compatibility).

## Constitution Check

- **Security**: PASS; credentials leave GraphQL/logs and at-rest token becomes non-reversible.
- **Compatibility**: CONDITIONAL; request payload/frontend must deploy atomically.
- **Secrets**: PASS; user-secrets/environment replace tracked signing key.
- **Architecture**: PASS; email and hashing use injected adapters.
- **Evidence**: PASS; replay, delivery, rehash and startup-negative tests required.

## Implementation Phases

1. Add failing GraphQL/frontend tests proving raw token exposure.
2. Add fake email sender tests and token digest/replay tests.
3. Change request service contract to generic payload and inject email delivery.
4. Generate raw token, persist digest, compose fragment-based frontend link and discard raw value.
5. Add Development pickup sender, production SMTP requirement and metadata-only logging.
6. Update EmployerLogin to request, instruct, consume fragment and purge URL.
7. Add password hashing abstraction/options with explicit cost and `NeedsRehash`.
8. Migrate registration, employer placeholder and seeder hash creation to policy.
9. Upgrade weak hashes after successful password login without changing failure timing/messages.
10. Remove tracked JWT key and document user-secrets/environment setup.
11. Run secret/log scans, tests, builds, EF drift and runtime SMTP/pickup login.

## Planned Touchpoints

- `API Graphql/Services/Auth/IEmployerAuthService.cs` and `EmployerAuthService.cs`: payload, digest and delivery orchestration.
- `API Graphql/OneITB/GraphQL/Mutation.cs`: public request contract.
- `API Graphql/Entities/Models/MagicLink.cs` and `OneItbContext.cs`: digest semantics/mapping only if needed.
- `API Graphql/OneITB/Services/Email/`: safe SMTP, pickup and test delivery behavior.
- `API Graphql/Services/Users/UsersService.cs`, `Accounts/AccountsService.cs` and auth interfaces: password hashing policy/rehash.
- `API Graphql/Data/EnterpriseDemoSeeder.cs` and startup seed orchestration: policy-compliant demo hashes.
- `API Graphql/OneITB/Startup.cs`, `appsettings*.json`, `.env.example` and `RUNBOOK_DEV.md`: provider/secret validation.
- `FrontEnd/OneItb-FE/src/data/graphql/mutations/employer.js` and `Components/auth/EmployerLogin.jsx`: generic request and fragment redemption.
- Backend auth/email/GraphQL tests and EmployerLogin component tests.

## Test Strategy

- GraphQL contract test asserts no token-shaped data in request response.
- Fake sender captures exactly one link and verifies recipient/subject without logging.
- Hash-at-rest and concurrent one-time redemption tests.
- Expiry/replay/invalid-token generic error tests.
- Existing BCrypt cost verification and successful rehash upgrade.
- Production startup failures for weak/missing JWT and missing Magic Link email provider.
- Development pickup test with ignored path.
- Frontend test for fragment consumption and URL cleanup.

## Deployment Notes

Backend and frontend deploy together because the request payload changes. In-flight old Magic Links may be invalidated for at most the configured 15-minute lifetime. Required secrets are provisioned before process start.

## Definition of Done

No raw one-time credential appears in GraphQL, storage or logs; password/JWT policies are explicit and compatible; real/development delivery paths are verified.
