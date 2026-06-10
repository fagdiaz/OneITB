# Implementation Plan: Router Fix & CV Layout (023)

**Branch**: `023-router-fix-and-cv-layout` | **Date**: 2026-06-09 | **Spec**: [spec.md](file:///F:/React/OneITB23/specs/023-router-fix-and-cv-layout/spec.md)

**Input**: Feature specification from `/specs/023-router-fix-and-cv-layout/spec.md`

## Summary
Correct the routing config in the React Frontend to remove the `/social` prefix, set up the Welcome Landing Page at the home path `/`, map navbar links accurately, and consolidate the user profile to a single dual-column profile layout (CV preview on the left, update form on the right) in `/profile`, eliminating `/profile/edit`.

## Technical Context
- **Language/Version**: React 18, Vite
- **Primary Dependencies**: React Router DOM v6, Apollo Client
- **Testing**: Manual verification + production build compiling check
- **Target Platform**: Web browser
- **Project Type**: Web application frontend

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Decoupled GraphQL Architecture**: Yes, communication remains on `/graphql`.
2. **Strict Security & Password Hashing**: N/A for these changes.
3. **Input Validation**: Verified. Form updates use standard clean client validation.
4. **Secure Session & Token Management**: Verified. JWT is injected in headers correctly.
5. **Git Policy & Branch Protection**: Verified. We are working on feature branch `023-router-fix-and-cv-layout` and avoiding staging or commits.

## Project Structure
### Documentation (this feature)
```text
specs/023-router-fix-and-cv-layout/
├── spec.md              # Feature specification
├── plan.md              # This plan file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)
```text
FrontEnd/OneItb-FE/src/
├── Components/
│   ├── layout/
│   │   ├── private/
│   │   │   ├── Header.jsx
│   │   │   ├── Nav.jsx
│   │   │   └── PrivateLayout.jsx
│   │   └── public/
│   │       ├── Header.jsx
│   │       └── PublicLayout.jsx
│   ├── profile/
│   │   └── UserProfile.jsx
│   └── user/
│       ├── Landing.jsx
│       └── Login.jsx
└── router/
    └── Routing.jsx
```

## Implementation Strategy
1. **Routing config**: Configure `Routing.jsx` to mount `Landing` at `/`, and map private routes directly under `/` (e.g. `/feed`, `/profile`, `/logout`).
2. **Nav Links**: Ensure the main "ONEITB" title links navigate to `/` for public header and `/feed` or `/` for private headers. Update "Inicio" to go to `/feed` instead of `/social/feed`.
3. **Consolidate Profile Layout**: Delete `EditProfile.jsx` or disable its route. Implement double column structure inside `UserProfile.jsx` with CV on the left and form on the right.
