# Implementation Plan: Frontend Employer & Moderation (046)

1. Find the Apollo queries/mutations folder (e.g. `src/graphql/mutations.ts`).
2. Add `REQUEST_MAGIC_LINK`, `LOGIN_WITH_MAGIC_LINK`, `REPORT_CONTENT` mutations.
3. Create `src/components/auth/EmployerLogin.tsx`.
4. Create `src/components/moderation/ReportModal.tsx`.
5. Integrate them into the main React Router setup (`App.tsx` or similar router file).
