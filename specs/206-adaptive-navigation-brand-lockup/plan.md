# Implementation Plan: Adaptive Navigation and Brand Lockup

## Navigation Design

1. Define navigation descriptors with route, label, icon, badge and role predicate.
2. Render a hidden measurement row or use stable measured widths for descriptors.
3. Observe the available nav container and fixed control widths.
4. Compute the largest prefix that fits while reserving overflow-button width whenever
   at least one item overflows.
5. Render visible items directly and the remainder in one accessible menu.
6. Keep active-route and badge derivation on descriptors so moving an item does not reset
   semantic state.
7. Batch measurements with `requestAnimationFrame`; disconnect observer on unmount.

## Brand Design

Refactor `BrandLogo` into or complement it with `BrandLockup`:

- one approved transparent symbol;
- one DOM wordmark (`one` + emphasized `ITB`) with theme-aware colors;
- atomic inline-flex alignment and fixed aspect-safe symbol size;
- variants `symbol`, `compact` and `full` where `full` is still composed, not a second
  dark-text raster;
- no dark glow; focus styling belongs to the enclosing link.

Replace full raster usages in the private footer and landing Hero/identity/footer while
keeping decorative semantics and accessible names correct.

## Expected Files

- `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
- `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- `FrontEnd/OneItb-FE/src/Components/branding/BrandLogo.jsx`
- new `BrandLockup`/navigation helper and tests
- `FrontEnd/OneItb-FE/src/Components/layout/Footer.jsx`
- landing Home sections using the full logo

## Risks

| Risk | Control |
|---|---|
| Resize loop/oscillation | Stable reservation and RAF-batched updates |
| First-paint flash | Conservative CSS fallback until first measurement |
| Badge lost in overflow | Descriptor owns badge; both renderers consume it |
| Keyboard trap | Native button/menu semantics, Escape and focus restoration |
| Logo alignment differs by page | One lockup component and variant tokens |

## Validation

Focused component tests mock `ResizeObserver` at threshold boundaries. Browser acceptance
uses widths 320, 375, 768, split-screen, 1024, 1280 and 1440 for Student, Employer and
Admin, in both themes.

