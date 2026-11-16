# Evidence: Spec 214

**Status**: Implemented `[I]` on 2026-08-05. Browser acceptance remains open.

## Implemented controls

- `IUserCareerAssignmentService` owns active-catalog validation and replacement staging.
- `StudentEnrollmentService` preserves serializable SQL replacement and JWT-derived actor.
- `UsersService.UpdateProfileAsync` uses the same assignment layer; public registration
  creates the initial link under the same single-career policy.
- Onboarding and profile editor use radio selection, explicit confirmation and exact
  post-mutation `me` verification.
- Apollo evicts `me`, `myCareers`, `subjects`, `inquiriesPage`, academic resources and
  progress variants, then restores only the server-confirmed `me` payload.
- `SelfDeclaredInstitutionalEnrollmentProvider` exposes status, source and UTC timestamp
  without fabricating institutional enrollment. SIU mock remains grades-only.

## Commands and results

| Command | Result |
|---|---|
| Focused backend tests (enrollment/provider/users) | PASS, 21/21 before final additions |
| Focused frontend tests (onboarding/cache/profile) | PASS, 26/26 |
| `dotnet test ... -c Release --no-restore` | PASS, 218/218 |
| `npm.cmd run test -- --run` | PASS, 237/237 |
| `dotnet build ... -c Release` | PASS, 0 warnings / 0 errors |
| `npm.cmd run build` | PASS, 562 modules, 1.04 s |
| `dotnet ef migrations has-pending-model-changes ... --no-build` | PASS, no model drift |
| GraphQL contract and authorization tests inside backend suite | PASS; dedicated single-ID mutation, multi-ID denial and non-Student denial covered |
| `npm.cmd audit --omit=dev` | 2 moderate React Router advisories; breaking 7.x-only automatic fix, accepted under `RR-09` |

The first combined .NET attempt ran tests and EF tooling concurrently and failed at build
coordination. Both commands were repeated sequentially and passed; this was not a source
or contract failure.

## Pending acceptance

- Browser path Microsoft/onboarding -> selected-career feed -> profile/editor must be
  repeated against the frozen runtime candidate.
- Until that evidence exists, Roadmap state remains `[I]`, not `[V]`.
