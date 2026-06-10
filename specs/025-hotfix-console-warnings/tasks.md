# Tasks: Hotfix Console Warnings (025)

**Input**: Design documents from `/specs/025-hotfix-console-warnings/`

## Phase 1: Setup
- [x] T001 Identify the CSS links and script execution patterns in FrontEnd/OneItb-FE/index.html

## Phase 2: Foundational Changes (P1)
- [x] T002 Configure FrontEnd/OneItb-FE/index.html to load Font Awesome without SRI checking (removing integrity/crossorigin attributes).

## Phase 3: Performant DOM measurements (P2)
- [x] T003 [US2] Update FrontEnd/OneItb-FE/src/Components/resume/ResumePreview.tsx to query scrollHeight measurements inside a requestAnimationFrame wrapper inside its useEffect.

## Phase 4: Polish & Verification
- [x] T004 Build validation run using `powershell -ExecutionPolicy Bypass -Command "npm run build"` to verify clean production compile.
