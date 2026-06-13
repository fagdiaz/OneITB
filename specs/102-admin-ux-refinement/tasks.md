# Tasks: Admin UX Refinement

## 1. Refactor UI Materias (Edit Modal)
- [x] Create `isModalOpen` local state.
- [x] Implement a dedicated modal component overlaying the screen using Tailwind v4 (`bg-black/50`, `z-50`).
- [x] Populate modal with the form data of the subject being edited or blank for a new subject.

## 2. Refactor UI Reportes (Split View)
- [x] Ensure network query is not filtered.
- [x] Split the view state between `Pending` and `History`.
- [x] Map active action buttons only to `Pending` view, and hide them in `History` view.

## 3. QA Validation
- [x] Frontend compiles successfully via `npm run build`.
- [x] Backend continues to compile.
