# Implementation Plan: Header UX & CV Profile (022)

**Branch**: `022-header-ux-cv-profile` | **Date**: 2026-06-09 | **Spec**: [spec.md](file:///F:/React/OneITB23/specs/022-header-ux-cv-profile/spec.md)

## Summary
Update navbar link mappings, logo redirects, and structure the profile page to handle dual column view with public details.

## Technical Context
- **Language/Version**: React 18, Vite

## Project Structure
```text
specs/022-header-ux-cv-profile/
├── spec.md
├── plan.md
└── tasks.md
```

## Implementation Strategy
1. **Logo Link Configuration**: Link "ONEITB" title in `Header.jsx` to `/social`.
2. **Navigation Cleanup**:
   - Link "Inicio" to `/social/feed`.
   - Remove "Timeline" links.
   - Build a dropdown menu with profile, settings, and logout.
3. **Dual Column Profile**:
   - Refactor `UserProfile.jsx` into two columns: Left Column has the profile details (Avatar, Email, Bio, Social links) and Right Column has the edit profile form.
4. **Validation**: Run production build to ensure clean compilation.

