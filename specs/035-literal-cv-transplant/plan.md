# Implementation Plan: Literal CV Transplant to /profile (035)

**Branch**: `035-literal-cv-transplant` | **Date**: 2026-06-10 | **Spec**: [spec.md](file:///F:/React/OneITB23/specs/035-literal-cv-transplant/spec.md)

## Summary
Copy the **exact** JSX structure of `_temp_cv_reference/cv-builder/src/App.tsx` into `UserProfile.jsx`.
Use the **exact** `initialData` object. Use all five editor form components + ResumePreview.
Fix `PrivateLayout.jsx` so its `<main>` does not clip UserProfile's internal scroll regions.

## Technical Context
- **Language/Version**: React 18 (JSX), Tailwind CSS v4, Vite 5
- **Reference file**: `FrontEnd/OneItb-FE/src/_temp_cv_reference/cv-builder/src/App.tsx`
- **Target**: `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`

## Root Cause of Overlapping (Diagnosis)
The previous refactor placed `UserProfile` inside a `<main className="flex-1 overflow-y-auto">` in
`PrivateLayout`. That outer `overflow-y-auto` combined with the inner `overflow-hidden` + `h-[calc(100vh-...)]`
on the CV workspace grid creates a clipping conflict: both containers fight for scroll ownership,
causing the inner panels to overflow visually and overlap.

**Fix**: Change PrivateLayout's `<main>` from `overflow-y-auto` → `overflow-hidden` (let UserProfile own scroll).

## Files to Modify
```
FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx      ← full rewrite
FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx  ← overflow fix
```

## Files Read-Only (no changes)
```
FrontEnd/OneItb-FE/src/Components/editor/*          ← already transplanted
FrontEnd/OneItb-FE/src/Components/resume/*          ← already transplanted
FrontEnd/OneItb-FE/src/Components/ui/*              ← already transplanted
FrontEnd/OneItb-FE/src/types/resume.ts              ← already present
```

## Implementation Strategy

### Step 1 — Fix PrivateLayout overflow conflict
Change `<main className="flex-1 overflow-y-auto ...">` to `<main className="flex-1 overflow-hidden">`.
This gives UserProfile full control of its own scroll areas.

### Step 2 — Rewrite UserProfile.jsx as literal transplant of App.tsx
- Root: `<div className="min-h-screen bg-slate-50 flex flex-col font-sans">`
- No outer header (PrivateLayout already has it) — start directly with the split `<main>`
- Main: `<main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-56px)]">`
  - h offset = 56px (height of PrivateLayout's `h-14` navbar)
- Left: editor section with all 5 forms + theme switcher
- Right: ResumePreview section
- State: `cvData` initialized from `initialData` (exact copy), `activeTheme` state
- Print: `window.print()` (no react-to-print dependency needed in OneITB)
- GraphQL mutations: PRESERVED but not wired to cvData (cvData is local state only)
