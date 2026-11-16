# Evidence: UX B2B and Academic Onboarding

## Baseline audit

- Branch isolated as `codex/199-ux-b2b-academic-onboarding`.
- Existing backend career mutation inspected; no schema/migration change required.
- Existing Apollo mutation return selection found inconsistent with backend.
- Mounted public navigation identified as the shared private Header/Nav.
- Existing AuthContext session invalidation and profile identity fields confirmed.

## Pre-implementation QA

- Risk: HIGH because shared authentication configuration, routing, and Apollo session
  state are affected.
- Speckit QA preflight: PASS.
- Backend Release baseline: 0 warnings, 0 errors.
- Frontend Vite baseline: PASS in 979 ms.
- `git diff --check`: PASS.
- Requirement checklist: 17/17 complete.

## Automated validation

- Targeted Vitest: 34/34 PASS across Entra configuration, Login visibility, public
  navigation, Landing, role guard, state helpers, and onboarding.
- Full frontend suite after final hardening: 39 files, 118/118 tests PASS.
- Vite production build: PASS, 549 modules transformed in 686 ms.
- State synchronization: no optimistic `me` write or hard reload; the mutation result
  is checked and a network profile refetch is required before navigation.
- Backend Release baseline from preflight: 0 warnings, 0 errors. No backend source was
  changed.

## Runtime and browser validation

Not executed. The user explicitly prohibited starting Vite or backend servers. This
must remain a manual regression item and is not evidence of failure.

## Final static gates

- `git diff --check`: PASS.
- Development Log: Spec 199 is the first of 149 entries; dates are monotonically
  descending.
- Secret scan in affected source: no browser secret/client secret reference.
- Canonical terminology scan: no current `single-tenant` claim remains.
- Speckit Analyze: PASS with 15 functional requirements, 5 non-functional
  requirements, 5 success criteria, 26 completed tasks, and no critical/high/medium
  inconsistency or unmapped requirement.
- Roadmap remains 117/117 because this spec hardens existing identity, career, and B2B
  items rather than adding a new module item.
