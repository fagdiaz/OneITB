# Implementation Plan: UX B2B and Academic Onboarding

**Branch**: `codex/199-ux-b2b-academic-onboarding` | **Date**: 2026-07-31

## Summary

Centralize public Entra configuration with canonical/legacy precedence, surface the
existing B2B request route in the actual shared public navigation, and introduce a
route-level academic onboarding gate for Students without careers. Persist through the
existing GraphQL mutation and unlock only after a matching `me` refetch.

## Technical Context

**Frontend**: React 18, React Router 6.30, Apollo Client 3.7, MSAL Browser/React,
Tailwind CSS 4, Vite 8

**Existing contracts**:

- `GET_USER_PROFILE` returns `me.id`, `me.role`, and `me.userCareers.career`.
- `GET_CAREERS` returns `id`, `name`, `code`, and `isActive`.
- `linkUserToCareers(careerIds)` returns the persisted active `Career` list.
- `AuthContext` owns the canonical session and invalidates Apollo on identity changes.
- `/empleos/solicitud` already hosts the public employer request form.

## Constitution Check

- Business writes continue through `/graphql`: PASS.
- No secret is introduced into Vite configuration: PASS.
- Existing authenticated backend mutation remains authoritative: PASS.
- Session identity is checked before consuming Apollo `me`: PASS.
- Completion is based on tests/build and honest browser evidence: PASS.

## Architecture

1. `microsoftEntraConfig.js` is a pure resolver for environment/origin values.
2. `microsoftEntra.js` creates MSAL exclusively from the resolved object.
3. `employerNavigation.js` owns B2B path and visible labels.
4. The shared Header/Nav used by `PublicLayout` renders the CTA responsively.
5. `academicOnboardingState.js` owns role/career/destination normalization helpers.
6. `RequireAcademicOnboarding` guards all private routes before `PrivateLayout`.
7. `AcademicOnboarding` is a dedicated protected route outside the private shell.
8. Both guard and page validate `me.id === auth.id`; stale data is treated as loading.
9. Save uses `LINK_USER_TO_CAREERS`, awaits `GET_USER_PROFILE` refetch, validates the
   persisted graph, then restores a sanitized internal destination.

## State Machine

```text
session-loading
  -> anonymous (redirect /login)
  -> profile-loading
  -> profile-error (retry/logout)
  -> allowed (render protected outlet)
  -> onboarding-required (redirect /onboarding/academic)

onboarding-loading
  -> query-error (retry/logout)
  -> empty-catalog (retry/logout)
  -> selecting
  -> submitting
  -> refetching
  -> persisted (redirect original route or /feed)
  -> save-error (selection retained)
```

## Security and State Controls

- The role comparison is exact against canonical `Estudiante`.
- A mismatched `me.id` never produces an authorization decision.
- The redirect target must start with `/` and rejects protocol-relative/external paths.
- Career payloads are normalized to unique positive integers.
- UI state does not write a synthetic `me` record.
- Logout remains available from every blocking error/setup state.
- `common` is accepted only as tenant authority; client ID remains a GUID.

## Validation Order

1. Speckit QA contract/security review.
2. Pure configuration/helper tests.
3. Header/Landing CTA tests.
4. Guard authorization matrix tests.
5. Onboarding loading/error/empty/failure/success tests.
6. Full frontend test suite.
7. Vite production build.
8. `git diff --check`, Speckit Analyze, docs/evidence reconciliation.
9. Browser regression recorded as pending because servers are prohibited.
