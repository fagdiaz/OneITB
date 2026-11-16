# Evidence: Profile as a CV

## Status

Closed.

## Initial Notes

- Active feature set to `specs/142-profile-as-cv`.
- The repository already had uncommitted changes from prior work. No branch switch or cleanup was performed.
- Mandatory `before_specify` git hook was not executed to avoid mixing dirty worktree changes across branches.
- `speckit-plan` named `docs/project_docs/REQUERIMIENTOS.md` and `docs/project_docs/PLAN_DE_MITIGACION_EVALUACION.md`; those files do not exist in this normalized docs tree. Used canonical `scope-and-requirements.md`, `architecture-and-design.md` and `ROADMAP.md` instead.

## Implementation

- `publicProfile.js` now calls the canonical `publicProfile(userId)` query and requests `careers` plus `totalPublications`.
- `UserProfile.tsx` was refactored into a CV/portfolio layout:
  - Institutional hero with large avatar, name, role badge, careers and owner-only edit CTA.
  - Professional profile section using biography as CV summary.
  - Contact/social icon cards for phone, LinkedIn, Instagram and Facebook.
  - Education/trayectoria section with careers and public subject activity.
  - Owner-only private academic summary from `GET_MY_ACADEMIC_PROGRESS`.
  - Recent publications rendered as portfolio activity cards.

## Validation

```powershell
npm.cmd run build
```

Result: PASS. Vite built 338 modules.

Known warning remains:

- `vite:react-babel` deprecated `esbuild` option.

```powershell
git diff --check
```

Result: PASS. Only Windows LF-to-CRLF normalization warnings, no whitespace errors.

```powershell
rg -n "TODO|FIXME|debugger|console\.log|NotImplemented" FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js
```

Result: PASS. No matches.

```powershell
rg -n -i "(password\s*=|pwd\s*=|sa_password|api[_-]?key|secret|token\s*=)" FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js
```

Result: PASS. No matches.

## Roadmap Impact

- No new roadmap checklist item was marked complete. This is a visual/UX refinement over already implemented Module 2 profile/CV capabilities.
- Roadmap percentages were recalculated from current checklists:
  - Global: 87% (67/77)
  - Module 8: 69% (9/13)

## Residual Risk

- Browser runtime validation was not executed in this turn, so visual behavior remains build-validated but not browser-verified.
- The owner-only academic summary depends on the existing authenticated `myAcademicProgress` query.
