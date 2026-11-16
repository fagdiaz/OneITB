# Feature Specification: Frontend Employer & Moderation (046)

**Feature Branch**: `046-frontend-employer-and-moderation`
**Created**: 2026-06-10
**Scope**: Frontend React (Tailwind v4)

## Problem Statement
The backend now supports Passwordless Employer login (Magic Link) and Community Reporting, but the frontend lacks the necessary UI to consume these features. We need a modern, responsive login interface for employers and a moderation reporting modal for the social feed.

## Proposed Solution
1. **Employer Login Interface**: Create `EmployerLogin.tsx` where users can input their email and CUIT to request a Magic Link, and a separate route to process the token.
2. **GraphQL Integration**: Define `RequestMagicLink`, `LoginWithMagicLink`, and `ReportContent` mutations in Apollo Client.
3. **Moderation Modal**: Create `ReportModal.tsx` for users to report inappropriate posts/comments.

## Success Criteria
- SC-001: The Employer Login view functions and handles loading/error states.
- SC-002: A Report button is available on posts (or mock post component) and opens the Report Modal.
- SC-003: UI uses Tailwind CSS v4 and looks professional.
