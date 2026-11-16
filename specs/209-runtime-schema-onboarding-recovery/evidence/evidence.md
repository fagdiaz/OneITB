# Evidence: Runtime Schema Onboarding Recovery

## Baseline

- La fuente actual contiene y registra `confirmStudentCareer(careerId)`.
- La consola reportó ausencia del campo y variable no usada, evidencia de schema activo desactualizado.

## Execution - 2026-08-04

| Gate | Result | Evidence |
|---|---|---|
| Source/schema audit | PASS | `Mutation.ConfirmStudentCareer(int careerId)`, `AddMutationType<Mutation>()` and Apollo document agree |
| Stale runtime reproduction | FAIL as expected | PID 18376, Debug executable from this workspace started 2026-08-02, omitted `confirmStudentCareer` from introspection |
| Focused frontend | PASS | 16/16 tests |
| Backend schema contract | PASS | 1/1 `StudentEnrollmentGraphQLContractTests` |
| Full backend | PASS | 216/216 |
| Full frontend | PASS | 220/220 |
| Backend Release build | PASS | 0 warnings, 0 errors |
| Frontend build | PASS | 559 modules, 1.35 s |
| Current runtime schema | PASS | HTTP 200; `confirmStudentCareer` exposes exactly `careerId` after controlled replacement with PID 5908 |

The first restore attempt was blocked by sandbox network access. A reviewed NuGet restore
succeeded and the finite gates were repeated. No database reset, migration, SSO setting,
frontend server, commit or push was performed.

## Residual manual acceptance

The user must retry the already authenticated Student flow and confirm persistence plus
navigation. The schema blocker is removed, but that user-visible action is not inferred
from introspection alone.
