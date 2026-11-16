# Evidence: Local Visual Asset Resilience

**Status**: Implemented `[I]`; offline/browser/print matrix pending  
**Created**: 2026-08-04

## Triggering Observation

Firefox repeatedly reported failed downloads for Google Inter and cdnjs Font Awesome
after Microsoft returned to OneITB. The application continued, confirming these requests
are visual dependencies rather than the SSO failure cause.

## Static Findings

- `index.html` includes Font Awesome 6.6.0 from cdnjs and Google Inter.
- `src/index.css` imports Google Inter again.
- A local Font Awesome web bundle with WOFF2 files exists under `src/assets/fonts`.
- `index.html` still declares `lang="en"`, the Vite favicon and `One Itb` title.

## Implementation

- Removed Google Fonts and cdnjs from `index.html` and the duplicate Google import from
  `index.css`.
- Imported the repository-owned Font Awesome bundle through Vite and replaced unsupported
  `fa-search`/`fa-shield-check` aliases with compatible local glyphs.
- Applied a system typography stack and explicit print fallbacks without adding packages.
- Set Spanish metadata, OneITB title and a repository-owned favicon.
- Removed runtime `ui-avatars.com` fallbacks from Header/Profile and replaced them with
  accessible local initials, including failed-image handling in the profile.
- Added `visualAssets.test.js` to guard remote visual sources, icon compatibility,
  metadata and remote avatar regressions.

## Automated Evidence

| Check | Result |
|---|---|
| Speckit QA preflight | PASS, frontend Vite baseline |
| Focused navigation/brand/assets tests | PASS, 27/27 in 8 files |
| Complete frontend suite | PASS, 205/205 in 51 files |
| Vite production build | PASS, 558 modules, 3.88 s in the final concurrent gate |
| Generated local fonts | `fa-solid`, `fa-regular`, `fa-brands` and compatibility WOFF2 emitted under `dist/assets` |
| Production artifact scan | PASS: no Google Fonts, gstatic, cdnjs or `ui-avatars.com` reference in `dist` |
| `npm audit --omit=dev` | 2 moderate React Router advisories retained under accepted risk `RR-09` |

## Manual Acceptance Still Required

### Partial browser evidence - 2026-08-04

- Landing, feed, profile, profile editor and admin were rendered from the local runtime
  across 320-1440 px with readable text, local icons and no horizontal overflow.
- The page reported `lang="es"`, the OneITB title and no external visual source for the
  inspected application images. Local initials rendered for profiles without an avatar.
- Public light mode and authenticated dark mode retained legible atomic branding without
  relying on Google Fonts, cdnjs or `ui-avatars.com`.

This browser pass used a connected local runtime. It did not emulate network-offline
reloads and did not open the operating-system print preview. T016 therefore remains open;
T017 shares the remaining keyboard/zoom/reduced-motion checks recorded by Spec 206.

Offline reloads of Login, feed, academic, jobs, profile and admin, plus CV print preview,
remain required before `[V]`; Microsoft-owned page warnings and development tool banners
remain outside this application's ownership.

### Static print and motion follow-up - 2026-08-04

- The shared print stylesheet fixes A4 dimensions, removes the global decorative
  background, forces readable black-on-white output and disables editor chrome.
- Both `/profile` and `/profile/edit` render the shared `CVPrintTemplate`; the editor
  keeps that template hidden on screen and visible under `print`, while the profile
  preview invokes `window.print()` from the isolated CV surface.
- Header, footer and notification chrome carry explicit print hiding.
- The focused navigation/branding test rerun passed: 5 files, 19 tests. A second focused
  visual-assets/navigation run passed 13/13, including the new print/motion guard.

These checks prove the print contract exists but do not replace inspection in the
operating-system print preview. T016 remains open together with true offline reloads.

### CV pre-print browser acceptance - 2026-08-04

- `/profile` opened the dedicated `Previsualizacion de CV` surface without navigation,
  footer or chat content inside the reusable curriculum template.
- The template rendered the same canonical identity, role, contact and professional
  summary exposed by `/profile/edit`.
- `/profile/edit` loaded the complete editor and its shared CV preview without provisional
  identity values or console errors.

The application-owned pre-print flow therefore passes. The native operating-system
print/PDF dialog and final pagination remain a manual gate because opening that modal can
block the controlled browser session.
