# Evidence: Student Enrollment Onboarding

**Status**: Implemented; institutional browser acceptance pending  
**Date**: 2026-08-04

## Scope and security result

- `StudentEnrollmentService` obtains the actor from the authenticated resolver context,
  validates an active `User`, enforces exactly one career for `Estudiante` and uses a
  serializable transaction on relational providers.
- Link replacement is differential and atomic: validation happens before mutation,
  existing valid links are retained, removed links and new links share one
  `SaveChangesAsync`, and all EF calls receive `CancellationToken`.
- `confirmStudentCareer(careerId)` is Student-only at the GraphQL attribute and service
  layers. The legacy list mutation, `updateProfile` and public registration fail closed
  when a Student attempts zero or multiple careers.
- Read-only user/career lookups use `AsNoTracking()`. No entity or migration changed.
- Non-Student roles retain compatible multi-career behavior.

## Institutional extension point

`IInstitutionalEnrollmentProvider` is separate from mock SIU grade synchronization.
`ManualInstitutionalEnrollmentProvider` reports only `ManualConfirmationRequired` or
`Unavailable`, returns no fabricated career/subject keys and propagates cancellation.
No live ITB/SIU contract, credential, HTTP call or provider acceptance is claimed.

## Automated evidence

| Gate | Result |
|---|---|
| Speckit QA preflight with builds | PASS; checklist 10/10, backend 0 warnings/errors, Vite 995 ms |
| Focused backend enrollment/users/provider tests | PASS 20/20 |
| Focused onboarding/profile/register tests | PASS 24/24 |
| Microsoft callback/Login/onboarding handoff tests | PASS 25/25 |
| Full backend suite | PASS 210/210 |
| Full frontend suite | PASS 172/172 across 43 files |
| Backend Release build | PASS, 0 warnings, 0 errors |
| Frontend Vite build | PASS, 552 modules, 787 ms |
| EF pending-model check | PASS, no model changes since the last migration |
| Real HotChocolate schema contract | PASS; `confirmStudentCareer(careerId)` and legacy argument shape asserted |
| Post-implementation Speckit consistency review | PASS; 13/13 functional requirements and 7/7 success criteria covered, with no constitution conflict or unmapped task |
| `git diff --check` | PASS; only line-ending notices |

Commands:

```powershell
& ".agents/skills/speckit-qa/scripts/preflight.ps1" -RunBuilds
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --no-build
cd "FrontEnd/OneItb-FE"
npm.cmd run test -- --run
npm.cmd run build
npm.cmd audit --omit=dev
```

`npm audit --omit=dev` reached the official registry and reported the two already
accepted moderate React Router 6.30.4 advisories. The available automated fix upgrades
to React Router 7 and is intentionally excluded from this Code Freeze; internal redirect
sanitization remains the compensating control recorded as `RR-09`.

## Browser acceptance still required

### Partial browser evidence - 2026-08-04

The coordinated browser pass used the canonical local runtime and the seeded account
`estudiante1.ads@itbeltran.com.ar`. It confirmed the following post-persistence states:

- `/profile` identified the actor as `Estudiante Sistemas Uno` and displayed exactly
  one career, `Analisis de Sistemas`.
- `/profile/edit` rendered career controls as a single-choice radio group: one option
  checked and the other eight active careers unchecked. The copy states that a Student
  selects the single career currently attended.
- The private feed opened without repeating onboarding after the canonical profile had
  exactly one association.

This is useful regression evidence for the persisted one-career invariant, but it does
not execute the zero/multiple-career reconciliation sequence itself. T024 therefore
remains open until a disposable Student is observed cancelling once, preserving its
links, confirming one career and retaining that result after logout/login.

The API process listening on `44397` during this turn had been started before the new
binary was compiled. It was not stopped or replaced while the user was conducting the
manual audit. The Microsoft institutional flow also requires the user's interactive
account. Therefore T024 is not represented as executed.

After restarting API and Vite from the runbook, perform the quickstart scenarios: use a
Student with several links, cancel confirmation and verify no change, confirm one career,
verify `/feed`, `/profile` and `/academic`, then logout/login and confirm onboarding does
not repeat. Successful completion promotes the feature from `[I]` to `[V]`.
