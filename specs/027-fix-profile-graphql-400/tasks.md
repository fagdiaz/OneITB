# Tasks: Fix Profile GraphQL 400 (027)

**Input**: Design documents from `/specs/027-fix-profile-graphql-400/`

## Phase 1: Setup
- [x] T001 Identify the location of the profile query and inspect its signature and parameters.

## Phase 2: Foundational Changes (P1)
- [x] T002 Configure FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js to match the backend Query schema, removing the unused ($id: ID!) variable block.

## Phase 3: Alignment (P2)
- [x] T003 [US1] Match the query parameters to use the schema property 'alias' instead of rename syntax.

## Phase 4: Polish & Verification
- [x] T004 Build validation run using `powershell -ExecutionPolicy Bypass -Command "npm run build"` to verify compile output.
