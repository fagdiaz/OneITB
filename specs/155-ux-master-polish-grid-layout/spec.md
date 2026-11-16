# Spec 155: UX Master Polish & Grid Layout

## Objective

Polish the authenticated frontend UX for the Header, Profile, Profile Edit and CV print flows so the Clean Tech / Tech Noir system feels consistent, compact and presentation-ready.

## User Stories

1. As an authenticated user, I want the Header to keep a clear navigation hierarchy so search, navigation and profile actions are easy to find.
2. As a user browsing a profile, I want the profile cards to use available desktop space efficiently and contact data to be readable one row at a time.
3. As a user editing my profile/CV, I want `/profile/edit` to respect the active dark theme like the rest of the app.
4. As a user printing my CV, I want the same formal print design from `/profile` and `/profile/edit`, without watermark labels or system-role noise.

## Scope

- Frontend only.
- Real rendered routes:
  - `/profile` -> `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `/profile/edit` -> `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- Header files:
  - `Header.jsx`
  - `Nav.jsx`
  - `GlobalSearch.jsx`
- Shared print file:
  - `CVPrintTemplate.tsx`

## Requirements

- Header order must be: logo, search, flexible space, navigation, user/profile actions.
- Search must feel integrated into the Header and preserve the blue glow while open or when `/feed` has active search parameters.
- Nav active states must be route-based and visibly persistent, not only focus-based.
- Profile contact data must render as stacked rows; phone must link to WhatsApp using a `wa.me` URL based on digits only.
- Profile card layout must use a responsive two-column structure on larger screens.
- `/profile/edit` must include dark mode variants for page, panels, form fields, preview rail and status states.
- CV print must use `CVPrintTemplate` consistently and must not print "perfil academico", "curriculum institucional" or system role `user`.
- Career information must print as a styled tag in the CV template.

## Non-Goals

- No backend, GraphQL or database changes.
- No routing expansion.
- No new dependencies.

## Validation

- `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- Manual visual browser validation remains recommended for Header active route glow, theme switch, and print preview.
