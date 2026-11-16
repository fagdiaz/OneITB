# Implementation Plan: Admin UX Refinement

**Branch**: `[102-admin-ux-refinement]` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/102-admin-ux-refinement/spec.md`

## Summary

Implement a dedicated modal for editing subjects to prevent scroll displacement, and split the moderation view into "Pending" and "History" sections without altering network requests.

## Technical Context

**Language/Version**: React 18, Tailwind CSS v4

**Primary Dependencies**: Apollo Client

**Storage**: N/A

**Testing**: Manual QA

**Target Platform**: Web browser

**Project Type**: Web application

**Performance Goals**: N/A

**Constraints**: Tailwind v4 Only, Frontend Only (no backend changes)

**Scale/Scope**: Admin interface UX

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
Passes all gates. Uses only Tailwind v4 for the modal and relies on existing GraphQL queries.

## Project Structure

### Documentation (this feature)

```text
specs/102-admin-ux-refinement/
├── plan.md              # This file
└── spec.md              # Feature specification
```

### Source Code

```text
FrontEnd/OneItb-FE/src/
├── Components/admin/
│   ├── SubjectManagement.jsx
│   └── ModerationManagement.jsx
```

**Structure Decision**: Will update the existing React components directly.

## Complexity Tracking

No violations.
