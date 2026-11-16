# Tasks: Literal CV Transplant to /profile (035)

**Input**: Design documents from `/specs/035-literal-cv-transplant/`

## Phase 1: Setup
- [x] T001 Update AGENTS.md and .specify/feature.json to point to `specs/035-literal-cv-transplant/plan.md`

## Phase 2: Layout Overflow Fix
- [x] T002 Fix `PrivateLayout.jsx` — changed `<main className="flex-1 overflow-y-auto px-4 py-2 md:px-6">` to `<main className="flex-1 overflow-hidden">` so UserProfile controls its own scroll.

## Phase 3: Literal Transplant of UserProfile
- [x] T003 [US1] Rewrote `UserProfile.tsx` (renamed from .jsx) with the exact JSX structure from `_temp_cv_reference/App.tsx` — same root wrapper, same main grid, same section classes.
- [x] T004 [US2] Injected exact `initialData` as inline constant (verbatim copy from reference `initialData.ts`).
- [x] T005 [US2] Wired all five editor forms: `PersonalForm`, `ExperienceForm`, `EducationForm`, `ProjectsForm`, `SkillsLanguagesForm` with correct prop names.
- [x] T006 Wired `ResumePreview` with `ref={resumeRef}`, `data={cvData}`, `activeTheme={activeTheme}`.
- [x] T007 Added `activeTheme` state + four theme swatch buttons (graphite/deepTeal/navyInk/mutedOlive).
- [x] T008 Added print button using `window.print()` (no external dependency).

## Phase 4: Polish & Verification
- [x] T009 Fixed `types/resume.ts` — made `hidden` optional on all interfaces to match reference types and allow `initialData` to compile without `hidden` fields.
- [x] T010 Renamed `UserProfile.jsx` → `UserProfile.tsx` to allow TypeScript type annotations.
- [x] T011 `npm run build` → 0 errors, 297 modules transformed, built in 459ms. ✅
