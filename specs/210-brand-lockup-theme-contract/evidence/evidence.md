# Evidence: Brand Lockup and Theme Contract

## Automated execution - 2026-08-04

| Gate | Result | Evidence |
|---|---|---|
| Focused frontend regression | PASS | `BrandLockup`, `ThemeContext`, `Header` and academic onboarding: 20/20 |
| Full frontend suite | PASS | 55 files, 223/223 tests, 28.84 s |
| Vite production build | PASS | 559 modules, 1.31 s, zero build errors |
| Shared lockup consumer audit | PASS | Header, Landing Hero/identity/footer and private Footer use `BrandLockup` |
| Persisted preference isolation | PASS | Stored dark remains `dark` while onboarding renders effective light and restores dark on unmount |
| Logo filter guard | PASS | Default symbol classes reject `filter`, `brightness` and `drop-shadow` |

## Scope and deviations

- No backend, GraphQL, EF Core, database, provider configuration or runtime process was
  modified by this spec.
- The already running backend from Spec 209 was left untouched.
- No commit or push was performed.

## Residual acceptance

Manual browser QA at 320, 375, 768, 1024, 1280 and 1440 px remains open. It must verify
direct reload of `/onboarding/academic`, entry/exit restoration, light and dark lockups,
zoom and reduced motion before the spec can be promoted from `[I]` to `[V]`.
