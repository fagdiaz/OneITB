# Evidence: Spec 217

**Status**: Implemented `[I]`; perceptual dark/reduced-motion and final keyboard pass remain in `CF-04`.

## Source review

- Official source: `https://www.ibeltran.com.ar/`, consulted 2026-08-05.
- Verified claims: ISFT No. 197, Avellaneda/Ezeiza, official SIU and Microsoft 365
  destinations, technological education, work and community context.
- No institutional text or image was copied verbatim. OneITB is labeled as a
  complementary academic project and every external destination is explicit.

## Automated evidence

```text
npm.cmd run test -- --run \
  src/context/ThemeContext.test.jsx \
  src/visualAssets.test.js \
  src/Components/user/Landing.test.jsx \
  src/Components/branding/BrandLogo.test.jsx \
  src/Components/branding/BrandLockup.test.jsx
Result: PASS, 5 files / 17 tests.

npm.cmd run test -- --run
Result: PASS, 58 files / 251 tests.

npm.cmd run build
Result: PASS, Vite 8.0.16, 565 modules, final run 627 ms.
```

The regression suite proves the synchronized 1300 ms timer, cleanup, reduced-motion
suppression, print suppression, institutional copy, exact HTTPS destinations and
`target="_blank" rel="noopener noreferrer"`.

## Browser acceptance

- Existing local runtime was used; no server was started or restarted.
- Home rendered the new institutional section and three external cards.
- Initial 320 px inspection found a clipped Hero heading despite no horizontal scroll.
  The grid was changed to `minmax(0, ...)` and retested.
- Final 320, 768 and 1440 px checks: no horizontal overflow and no heading outside the
  viewport.
- Desktop Hero visual review: hierarchy, OneITB branding, CTA and content PASS.
- Browser console: zero warnings/errors owned by the page.
- Automated keyboard focus capture in the in-app browser was inconclusive because focus
  remained on `body`; semantic anchors, accessible names and focus-visible styles are
  covered statically, but the final native keyboard pass remains open.

## Residual acceptance

- Compare light/dark contrast perceptually on the frozen candidate.
- Confirm the 1300 ms transition and zero-motion behavior using native OS/browser
  reduced-motion settings.
- Complete native keyboard focus traversal. These gates prevent promotion to `[V]` but
  do not invalidate implementation evidence.
