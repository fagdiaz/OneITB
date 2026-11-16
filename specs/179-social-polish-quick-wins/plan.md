# Implementation Plan: Social Polish Quick Wins

**Branch**: `179-social-polish-quick-wins` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/179-social-polish-quick-wins/spec.md`

## Summary

Apply low-risk polish to the recently completed social/feed specs: stable copyable post links, drag-and-drop attachment selection, modal accessibility cleanup, defensive media fallbacks, and focused frontend regression coverage. The implementation stays frontend-only and reuses existing GraphQL/feed/upload contracts.

## Technical Context

**Language/Version**: React 18 / JavaScript, Vite 8, Tailwind CSS 4

**Primary Dependencies**: Apollo Client 3.7, React Router, FontAwesome already present

**Storage**: Existing backend persistence only; no schema changes

**Testing**: Vitest and React Testing Library for component behavior; Vite production build

**Target Platform**: Web browser

**Project Type**: Full-stack web app; this feature changes only frontend components and docs

**Performance Goals**: No extra network requests for share/drag interactions; no bundle dependency added

**Constraints**: Do not alter GraphQL schema, EF model, migrations, auth/session behavior or backend business services

**Scale/Scope**: Feed cards, attachment picker, media viewer, reaction modal and documentation closeout

## Constitution Check

- Decoupled Application Contracts: PASS. No new REST or GraphQL business endpoint.
- Strict Security and Password Hashing: PASS. No auth/password surface changed.
- Input Validation and ReDoS Protection: PASS. Drag-and-drop reuses existing upload validation.
- Relational Integrity and Soft Delete: PASS. No database changes.
- Secure Session and Token Management: PASS. No session changes.
- Evidence-Based Completion: PASS. Component tests and frontend build are required; browser/manual limitations are documented if present.

## Project Structure

### Documentation (this feature)

```text
specs/179-social-polish-quick-wins/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- tasks.md
`-- checklists/requirements.md
```

### Source Code (repository root)

```text
FrontEnd/OneItb-FE/src/
|-- Components/publication/
|   |-- AttachmentDraftPicker.jsx
|   |-- AttachmentDraftPicker.test.jsx
|   |-- Feed.jsx
|   |-- MediaAttachment.jsx
|   |-- MediaComponent.test.jsx
|   |-- MediaViewerModal.jsx
|   `-- ReactionUsersModal.jsx
docs/
|-- audit/
`-- project_docs/
```

**Structure Decision**: Keep improvements in the existing publication component boundary. No new shared framework or dependency is justified for these quick wins.

## Complexity Tracking

No constitution violations.
