# Implementation Plan: Student Enrollment Onboarding

## Summary

Introduce a dedicated, role-aware academic enrollment boundary. The UI becomes a
single-choice plus confirmation flow; the API enforces the same invariant and performs
an atomic replacement. A provider interface documents the future institutional lookup
without fabricating an external integration.

## Current Baseline

- `AcademicOnboarding.jsx` uses checkboxes and sends `careerIds`.
- `Mutation.LinkUserToCareers` accepts any non-empty list for every role.
- `CvEditorProfile.tsx` also submits a list of careers.
- Feed, academic resources and search scope derive from `UserCareer`.
- `ISiuIntegrationService` currently models grade synchronization, not enrollment.

## Design

1. Add an academic enrollment service that resolves the current user and role.
2. Expose a dedicated `confirmStudentCareer(careerId)` mutation or equivalent typed
   service entry point. Keep legacy list mutation role-aware during migration.
3. Use a serializable or otherwise atomic transaction to replace links only after all
   validation passes.
4. Extend the onboarding guard: `0` links means initial setup; `>1` links means explicit
   reconciliation; `1` link means complete.
5. Replace checkboxes with an accessible radio group and an in-app confirmation dialog.
6. Reuse the cardinality helper in profile editing so Student cannot reintroduce several
   associations.
7. Preserve a non-interactive authentication/loading shell during the Microsoft-to-
   onboarding handoff so Login recovery never appears as a second sign-in request.
8. Add `IInstitutionalEnrollmentProvider` and a manual/unavailable implementation selected
   by configuration. The interface returns normalized career/subject external keys and a
   status, but no production adapter is enabled without a real contract.
9. Document the future flow in architecture and final-delivery material as an extension
   point, not a completed external integration.

## Files Expected To Change

- `API Graphql/OneITB/GraphQL/Mutation.cs`
- `API Graphql/OneITB/Startup.cs`
- `API Graphql/Services/Academic/*`
- backend tests for enrollment authorization/cardinality
- `FrontEnd/OneItb-FE/src/Components/onboarding/*`
- `FrontEnd/OneItb-FE/src/Components/auth/MicrosoftRedirectCallback.jsx`
- `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
- `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
- Apollo career mutations and focused tests
- canonical architecture, roadmap, audit and delivery documents

## Risk Controls

| Risk | Control |
|---|---|
| Client bypass assigns several careers | Server-side role/cardinality validation |
| Existing multi-career Student loses links silently | Forced reconciliation and explicit confirmation |
| Feed becomes visible before refetch | Navigate only after `me` confirms exactly one link |
| Provider outage blocks local demo | Manual fallback is explicit and default in Development |
| Mock SIU is confused with real integration | Separate interfaces, naming and documentation |
| Concurrent submissions create duplicate links | Transaction plus existing composite key/index |

## Validation Strategy

- Backend unit/integration tests for 0/1/2 IDs, inactive careers, wrong role and rollback.
- Frontend tests for radio behavior, confirmation, cancel, loading and persisted refetch.
- Complete backend/frontend suites and builds.
- Runtime acceptance with the institutional Student: select one, cancel once, confirm,
  inspect profile and feed scope, logout and repeat without onboarding.
