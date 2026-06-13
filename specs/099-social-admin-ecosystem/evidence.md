# Evidence: Social and Administration Ecosystem

**Feature**: `099-social-admin-ecosystem`  
**Verified**: 2026-06-13

## Build and database

- Backend Release build: completed with 0 errors and 0 warnings.
- Frontend production build: completed with Vite 8 and 0 errors.
- Migration `20260613214128_AddSocialEcosystem` generated and applied successfully.
- `dotnet ef migrations has-pending-model-changes`: no pending model changes.
- New social foreign keys are explicit and use `DeleteBehavior.Restrict`.
- Feed reads use HotChocolate projections and EF Core split-query behavior.

## Deterministic seed

The initializer was executed twice. Managed seed counts remained stable:

| Dataset | Count |
|---|---:|
| Users | 10 |
| Subjects | 5 |
| Inquiries | 30 |
| Reactions | 90 |
| Comments | 45 |
| First-level replies | 15 |
| Pending reports | 2 |

All managed accounts authenticate with BCrypt password `Test1234!`. Roles include
`Estudiante`, `Profesor`, `Moderador`, `Administrador` and `Empleador`.

## GraphQL runtime

Validated against `http://127.0.0.1:5099/graphql`:

- Valid administrator and student logins returned JWTs and the expected roles.
- Invalid login returned a controlled GraphQL error and no token.
- Unauthenticated `addInquiry` was rejected.
- Student access to the protected users query was rejected.
- Administrator access returned 10 users and the moderation query returned live reports.
- `Account` introspection does not expose `passwordHash`.
- An authenticated publication, root comment, nested reply and report were persisted.
- A duplicate pending report by the same reporter was rejected.
- Reaction toggle removed the test reaction (`0`, `false`) and restored it (`1`, `true`).
- The feed query returned the created publication with its author, subject, reactions and
  two-level comment graph.

The runtime validation created two additional non-seed publications and one additional
report. Therefore, the final local database totals observed during browser verification
were 32 publications and 3 reports; the deterministic managed seed remains 30 and 2.

## Browser runtime

Validated in the local React application:

- Administrator login opened the feed successfully.
- The feed rendered subjects, realistic seeded publications and canonical authors.
- A publication was created from the UI and appeared immediately without a page reload.
- Its reaction count changed from 0 to 1.
- The report confirmation modal opened and closed correctly.
- Nested comments rendered under the GraphQL validation publication.
- `/admin` displayed the tabbed dashboard.
- Users showed 10 records, Subjects showed 5 records, and Moderation showed 3 pending
  reports after runtime validation.
- No React hook-order error was observed while switching dashboard tabs.

## Runbook coverage

All 20 stabilization smoke checks in `docs/audit/RUNBOOK_DEV.md` are supported by
build, code, GraphQL, database or browser evidence for this feature.
