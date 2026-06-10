# Tasks: Router Fix & CV Layout (023)

**Input**: Design documents from `/specs/023-router-fix-and-cv-layout/`

## Phase 1: Setup
- [x] T001 Verify project directory structure and clear active route path patterns in FrontEnd/OneItb-FE/src/router/Routing.jsx

## Phase 2: Foundational Changes
- [x] T002 Configure FrontEnd/OneItb-FE/src/router/Routing.jsx to remove all nested /social prefixes and set Login/Register paths cleanly under public layouts.

## Phase 3: Public Landing Page (P1)
- [x] T003 [US1] Create FrontEnd/OneItb-FE/src/Components/user/Landing.jsx containing institutional summary and access buttons.
- [x] T004 [US1] Route index path '/' to Landing page and update Header logo link in FrontEnd/OneItb-FE/src/Components/layout/public/Header.jsx

## Phase 4: Integrated Dual-Column Profile (P2)
- [x] T005 [US2] Update FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx to display a two-column layout: Left Column has the CV Resume details card, Right Column has the edit profile form.
- [x] T006 [US2] Clean up navigation menu to target '/profile' and remove references to '/profile/edit' or '/social/profile/edit' in FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx

## Phase 5: Verification & Polish
- [x] T007 Run validation check using `powershell -ExecutionPolicy Bypass -Command "npm run build"` to verify compile output.
