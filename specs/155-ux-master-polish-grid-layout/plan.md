# Implementation Plan: Spec 155 UX Master Polish & Grid Layout

## Technical Context

- Frontend: React 18, React Router, Apollo Client, Tailwind CSS v4, Vite 8.
- Backend: untouched.
- Routes audited:
  - `/profile` renders `UserProfile.tsx`.
  - `/profile/edit` renders `CvEditorProfile.tsx`.
- The canonical print component is `CVPrintTemplate.tsx`.
- `docs/project_docs/REQUERIMIENTOS.md` and `docs/project_docs/PLAN_DE_MITIGACION_EVALUACION.md` are not present after documentation normalization; alignment uses `docs/project_docs/scope-and-requirements.md`, `docs/project_docs/architecture-and-design.md`, `docs/project_docs/ROADMAP.md` and the constitution.

## Constitution Check

- Decoupled contracts: PASS. No GraphQL or REST contract changes.
- Security/session: PASS. No auth or token logic changes.
- Input validation: PASS. WhatsApp URL strips non-digits from already persisted phone value.
- Relational integrity: PASS. No EF or database work.
- Evidence-based completion: PASS pending Vite build and evidence entry.

## Design Decisions

1. Use React Router `NavLink` active state for persistent navigation glow.
2. Keep `GlobalSearch` as a Header component, but make it expandable so the closed state remains compact and the open state exposes a professional input.
3. Keep a single print source through `CVPrintTemplate` and pass sanitized role/career data from both profile views.
4. Apply broad dark-mode utility coverage in `/profile/edit` without changing its data flow or GraphQL mutation.

## Files

- `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
- `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx`
- `docs/audit/DEVELOPMENT_LOG.md`
- `docs/audit/DOCUMENTATION_STATUS.md`

## Validation Plan

1. Run `npm.cmd run build` from `FrontEnd/OneItb-FE`.
2. Record build output and any blocked browser checks in `evidence.md`.
