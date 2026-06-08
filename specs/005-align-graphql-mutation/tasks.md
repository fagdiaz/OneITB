# Tasks: align-graphql-mutation

**Input**: Design documents from `/specs/005-align-graphql-mutation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

---

## Phase 1: Foundational (Blocking Prerequisites)

- [x] T001 Update `addUser.js` mutation in `FrontEnd/OneItb-FE/src/data/graphql/mutations/addUser.js` to call `registerUser` with variable `$input` of type `RegisterInput!`.
- [x] T002 Update variables structure in `Register.jsx` (`FrontEnd/OneItb-FE/src/Components/user/Register.jsx`) to pass the mapped input variables: `username: form.alias || form.name`, `email: form.email`, and `password: form.password`.

---

## Phase 2: Polish & Logs Update

- [x] T003 Update the ROADMAP.md progress percentages.
- [x] T004 Add development log entry to DEVELOPMENT_LOG.md.
