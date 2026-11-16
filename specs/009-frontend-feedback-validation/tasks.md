# Tasks: frontend-feedback-validation

**Input**: Design documents from `/specs/009-frontend-feedback-validation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

---

## Phase 1: Foundational (Blocking Prerequisites)

- [x] T001 Define state `errorMessage` and `setErrorMessage` in `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`.
- [x] T002 Modify `saveUser` function in `Register.jsx` to set `errorMessage` and set `saved` to `"error_validation"` for validations (empty checks, username minimum 3 chars, password minimum 8 chars, email domain matching `@itbeltran.com.ar`).
- [x] T003 Update JSX return in `Register.jsx` to render the error banner containing `errorMessage`.

---

## Phase 2: Polish & Logs Update

- [x] T004 Update ROADMAP.md progress percentages.
- [x] T005 Add development log entry to DEVELOPMENT_LOG.md.
