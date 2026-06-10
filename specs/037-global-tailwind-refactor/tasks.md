# Tasks: Global Tailwind Refactor — Social Layer (037)

## Phase 1: Setup
- [x] T001 Update AGENTS.md + .specify/feature.json → `specs/037-global-tailwind-refactor/plan.md`

## Phase 2: Core Social Components
- [x] T002 Rewrite Nav.jsx — eliminated all BEM classes + inline styles; full Tailwind nav + avatar w-9 h-9 rounded-full + proper click-outside dropdown
- [x] T003 Rewrite Feed.jsx — eliminated 15+ BEM classes; post cards bg-white rounded-xl shadow-sm; avatars strictly w-10 h-10 rounded-full object-cover; mock posts array replacing duplicated JSX blocks

## Phase 3: Additional Legacy Components (discovered during QA grep)
- [x] T004 Rewrite Login.jsx — eliminated content__header, form-login, form-group, btn, alert classes; centered card layout with styled inputs
- [x] T005 Rewrite Register.jsx — same as Login, preserved all validation logic verbatim
- [x] T006 Rewrite EditProfile.jsx — eliminated content__header, form-login, form-group, inline styles; card form with social icons; fixed stale /social/profile redirect → /profile

## Phase 4: Verification
- [x] T007 `npm run build` → 0 errors, 293 modules, 4.77s ✅
- [x] T008 Update DEVELOPMENT_LOG.md
