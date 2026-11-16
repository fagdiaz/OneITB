# Implementation Plan: Theme Logo Asset Contract

**Risk**: LOW-MEDIUM. Shared visual component with broad surface reach; no backend,
GraphQL, persistence, authorization or session contract changes.

## Design

1. `BrandLogo` keeps the symbol branch theme-independent and delegates the full branch
   to a small component that reads `effectiveTheme` from `ThemeProvider`.
2. Only one full `<img>` is mounted, avoiding duplicate accessible images and stale CSS
   theme selection.
3. `BrandLockup` becomes an accessible viewport for the complete themed asset. Its
   centered crop compensates for the square transparent/background canvas while
   preserving the image aspect ratio.
4. `Header` consumes `BrandLogo variant="symbol"` directly and remains independent of
   the theme provider for its source.
5. Existing Landing, onboarding and footer consumers remain shared and automatically
   receive the correct complete asset.

## Files

- `FrontEnd/OneItb-FE/src/Components/branding/BrandLogo.jsx`
- `FrontEnd/OneItb-FE/src/Components/branding/BrandLockup.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- Focused component tests for those files.
- Canonical Roadmap, Development Log and Documentation Status.

## Validation

1. Focused Vitest branding/Header suite.
2. Full frontend test suite.
3. Vite production build.
4. Static audit for obsolete composed wordmarks and image filters.
5. Manual light/dark visual acceptance remains explicit if no browser pass is run.

