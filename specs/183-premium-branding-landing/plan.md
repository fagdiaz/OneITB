# Implementation Plan: Premium Branding and Landing

**Branch**: `183-premium-branding-landing` | **Date**: 2026-07-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/183-premium-branding-landing/spec.md`

## Summary

Replace the temporary logo-comparison home with one production landing, normalize approved assets, introduce reusable brand and reveal components, and extend the existing direct-CSS pointer spotlight pattern to the full home. Preserve ThemeContext, navigation contracts and bundle discipline by using React, Tailwind and browser APIs only.

## Technical Context

**Language/Version**: JavaScript/JSX, React 18

**Primary Dependencies**: React Router 6, Tailwind CSS 4; no new dependency

**Storage**: Static PNG assets; no persistence

**Testing**: Vitest, React Testing Library, Vite production build, source scans and browser visual smoke when available

**Target Platform**: Evergreen desktop/mobile browsers

**Project Type**: Existing React single-page application

**Performance Goals**: No state update per pointer event; one pending RAF maximum; multi-megabyte background variants excluded from runtime imports; reveals disconnect after first intersection

**Constraints**: Preserve Clean Tech / Tech Noir, anonymous light default, authenticated header behavior, print rules, existing route contracts and dirty worktree changes from Specs 181/182

**Scale/Scope**: Header branding and anonymous `/` landing only

## Constitution Check

- **Application contracts**: PASS. No backend or transport contract changes.
- **Security/input**: PASS. No external HTML, URLs or untrusted input introduced.
- **Relational integrity**: N/A. No persistence changes.
- **Session/token**: PASS. Existing authentication guards and Nav behavior remain untouched.
- **Evidence completion**: PASS. Focused tests, production build, scans and explicit browser status are required.

Post-design re-check: PASS. No constitutional exception is required.

## Project Structure

### Documentation

```text
specs/183-premium-branding-landing/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/ui-contract.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code

```text
FrontEnd/OneItb-FE/src/
|-- assets/{logo-oneitb,logo-oneitb-bg,only-logo,only-logo-bg}.png
|-- Components/branding/BrandLogo.jsx
|-- Components/common/RevealOnScroll.jsx
|-- Components/layout/private/Header.jsx
|-- Components/user/Landing.jsx
`-- hooks/usePointerSpotlight.js
```

**Structure Decision**: Keep the landing in its routed location, extract only behavior and brand primitives that remove real duplication, and avoid a new design-system layer for a narrowly scoped visual feature.

## Complexity Tracking

No constitutional violation or additional complexity requires justification.
