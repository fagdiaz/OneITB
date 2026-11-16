# Implementation Plan: Profile as a CV

**Branch**: `[142-profile-as-cv]` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/142-profile-as-cv/spec.md`

## Summary

Refactor the authenticated profile screen into a CV/portfolio-style presentation using the existing public profile, feed activity and owner-only academic progress data. The implementation is frontend-only unless a GraphQL contract mismatch is detected. The main risk is accidentally exposing owner-only academic information on public profile views, so ownership checks drive all edit/private sections.

## Technical Context

**Language/Version**: React 18 with JSX/TSX in the Vite frontend.

**Primary Dependencies**: Apollo Client, React Router, Tailwind CSS v4, FontAwesome.

**Storage**: Existing backend persistence only; no new storage.

**Testing**: `npm.cmd run build`; browser/runtime validation when the local app is available.

**Target Platform**: Authenticated web browser.

**Project Type**: Frontend web application inside `FrontEnd/OneItb-FE`.

**Performance Goals**: Keep profile rendering lightweight; avoid new libraries or heavyweight media.

**Constraints**: Do not expose private academic progress on public profiles; Tailwind v4 only; no backend business change.

**Scale/Scope**: One profile screen and its Apollo query contract.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Decoupled application contracts: PASS. Uses existing GraphQL profile/feed/academic queries; no REST business endpoint.
- Security and session: PASS. Owner-only edit/private academic sections are frontend-gated and do not expand backend access.
- Input validation/ReDoS: PASS. No new untrusted parsing beyond safe URL normalization for display links.
- Relational integrity: PASS. No database or migration change.
- Evidence-based completion: PASS. Frontend build and documented checks required.

## Project Structure

### Documentation (this feature)

```text
specs/142-profile-as-cv/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- profile-cv-ui.md
`-- tasks.md
```

### Source Code (repository root)

```text
FrontEnd/OneItb-FE/src/
|-- Components/profile/UserProfile.tsx
|-- data/graphql/queries/publicProfile.js
`-- data/graphql/queries/academic.js
```

**Structure Decision**: Reuse the existing `Components/profile` route component and Apollo query files. No new component library or CSS file is introduced.

## Complexity Tracking

No constitution violations.
