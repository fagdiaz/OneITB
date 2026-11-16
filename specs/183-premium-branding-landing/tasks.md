# Tasks: Premium Branding and Landing

**Input**: Design documents from `specs/183-premium-branding-landing/`

**Tests**: Required for asset selection, accessible branding, reduced-motion fallback and production build integrity.

## Phase 1: Baseline and Specification

- [x] T001 Record branch, dirty baseline, asset inventory, prompt corrections and pre-implementation gates in `specs/183-premium-branding-landing/evidence.md`
- [x] T002 Complete and cross-check spec, research, UI contract, plan, quickstart and task artifacts

## Phase 2: Asset and Motion Foundation

- [x] T003 Normalize the four approved PNG files to canonical space-free paths under `FrontEnd/OneItb-FE/src/assets/`
- [x] T004 [P] Add focused brand and reveal tests in `Components/branding/BrandLogo.test.jsx` and `Components/common/RevealOnScroll.test.jsx`
- [x] T005 Implement reusable `BrandLogo.jsx` with approved transparent assets and resilient image semantics
- [x] T006 Implement `usePointerSpotlight.js` with RAF throttling, pointer/reduced-motion guards and cleanup
- [x] T007 Implement `RevealOnScroll.jsx` with one-shot observation, fallback visibility and cleanup

## Phase 3: User Story 1 - Definitive Identity

- [x] T008 [US1] Replace the static Header wordmark with the approved symbol and preserve all search/navigation/authentication contracts in `Header.jsx`
- [x] T009 [US1] Replace the comparison laboratory with one semantic production landing in `Components/user/Landing.jsx`
- [x] T010 [US1] Use the complete transparent brand in hero/footer and exclude multi-megabyte background variants from runtime imports in favor of CSS contrast surfaces

## Phase 4: User Stories 2 and 3 - Theme and Interaction Polish

- [x] T011 [US2] Apply softened Clean Tech / Tech Noir surfaces, contrast-safe typography and responsive layouts without pure main black/white backgrounds
- [x] T012 [US3] Apply the global theme-aware pointer spotlight without pointer interception or React render churn
- [x] T013 [US3] Add one-shot scroll reveals, reduced-motion behavior, visible focus states and decorative image semantics
- [x] T014 [US2] Add responsive glass/elevation behavior to the Header while preserving its corporate dark identity in both themes

## Phase 5: Validation and Documentation

- [x] T015 Run focused/full frontend tests, production build, dependency-diff scan, source scan and `git diff --check`; record exact outputs in `evidence.md`
- [x] T016 Assess browser visual smoke availability and record completed checks or explicit manual presentation-browser gate
- [x] T017 Update `ROADMAP.md` without inflating checklist count, update `DOCUMENTATION_STATUS.md`, and add exactly one newest-first Spec 183 entry to `DEVELOPMENT_LOG.md`
- [x] T018 Verify all tasks, requirements, evidence and documentation are mutually consistent

## Definition Of Done

- [x] All required tasks are marked `[x]`.
- [x] No temporary identity-laboratory copy or imports remain in the runtime landing.
- [x] Header branding, motion fallback and CTA semantics have focused automated coverage.
- [x] Frontend tests and Vite production build pass.
- [x] No new dependency was added.
- [x] Browser visual behavior is verified or explicitly left as a manual gate.
- [x] Documentation remains newest-first and evidence-based.
