# Evidence: Adaptive Navigation and Brand Lockup

**Status**: Implemented `[I]`; browser matrix pending  
**Created**: 2026-08-04

## Triggering Observations

- A Student with only Mensajes, Académico and Empleos still sees the hamburger while
  sufficient header space remains.
- Full raster logos in dark mode require a visible bloom because their embedded text is
  too dark.
- The mismatch is visible in the private footer and public Hero/identity/footer areas.

## Static Findings

- `Nav.jsx` switches all authenticated links at the fixed `lg` breakpoint.
- `Footer.jsx` uses `<BrandLogo variant="full">`.
- `BrandLogo` applies a dark drop-shadow by default.
- The private header already uses the approved transparent symbol, making it the correct
  base for an atomic text lockup.

## Implementation

- `navigationItems.js` centralizes route, role, priority, active state and badge semantics.
- `useProgressiveNavigation.js` measures the actual available container with a bounded
  `ResizeObserver`/animation-frame lifecycle and renders the largest fitting prefix.
- `Nav.jsx` uses one descriptor source for direct and overflow destinations. The menu
  closes on Escape, outside click, route selection and session/route transitions while
  preserving focus and unread badges.
- `BrandLockup.jsx` composes the transparent OneITB symbol with the DOM wordmark `oneITB`.
  Header, Landing and Footer use this atomic unit; the default raster bloom was removed.

## Automated Evidence

| Check | Result |
|---|---|
| Speckit QA preflight | PASS, frontend Vite baseline |
| Focused navigation/brand/assets tests | PASS, 27/27 in 8 files |
| Complete frontend suite | PASS, 205/205 in 51 files |
| Vite production build | PASS, 558 modules, 3.88 s in the final concurrent gate |
| `npm audit --omit=dev` | 2 moderate React Router 6.30.4 advisories; accepted as `RR-09`, fix requires breaking v7 migration |

## Manual Acceptance Still Required

### Browser matrix executed - 2026-08-04

The final local-font build was exercised in a real browser at 320, 375, 768, 1024, 1280
and 1440 CSS pixels. No tested viewport produced horizontal document overflow.

| Identity | 320/375 px | 768 px | 1024 px and wider | Result |
|---|---|---|---|---|
| Anonymous | Compact public hamburger | B2B/Login/Register direct | B2B/Login/Register direct | PASS |
| Student | Search + overflow + notifications + user | Mensajes/Académico/Empleos direct | Same direct set | PASS |
| Employer | Search + overflow + notifications + user | Mensajes/Académico/Empleos direct; Postulaciones in overflow | All four direct | PASS |
| Admin | Search + overflow + notifications + user | Mensajes/Académico/Empleos direct; Postulaciones/Admin in overflow | All five direct | PASS |

The Admin overflow menu exposed `Postulaciones` and `Admin`; activating `Admin`
navigated to `/admin`, rendered `Panel de administracion`, closed the menu and retained
`overflowX=false`. The Employer dark-theme pass showed the same atomic lockup in header
and footer without the former raster bloom. The public light-theme Landing also retained
the atomic symbol/wordmark.

T021 remains open as a whole because zoom, keyboard focus restoration and an emulated
`prefers-reduced-motion` pass were not executed. The matrix above closes the role/width,
route and sampled light/dark portions only.

### Focused accessibility follow-up - 2026-08-04

- `npm.cmd run test -- --run` over `Nav`, `Header`, `BrandLockup`, `BrandLogo` and
  `useProgressiveNavigation` passed: 5 files, 19 tests.
- The overflow trigger is a native `button` with `aria-expanded`, `aria-haspopup` and
  `aria-controls`; the opened collection exposes `role="menu"`/`role="menuitem"`.
- Automated coverage confirms close on Escape with focus restoration, outside click,
  destination selection and route transitions.
- `index.css` disables theme-transition duration under
  `prefers-reduced-motion: reduce`, so the implemented fallback is statically present.

The connected browser-control surface did not produce a reliable native Enter/Space
activation event, so this attempt is not treated as either PASS or product failure.
Real keyboard activation, browser zoom and OS-level reduced-motion emulation remain in
T021 for user-controlled acceptance.

No `[V]` claim is made until the remaining keyboard, zoom and reduced-motion checks are
recorded.
