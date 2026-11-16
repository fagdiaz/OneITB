# Evidence: Spec 157 Core UX, Session & Header Constraints

## Commands

- `npm.cmd run build` from `FrontEnd/OneItb-FE`

## Results

- PASS. Vite transformed 341 modules and completed production build in 3.82s.
- 0 compilation errors.
- Known tooling warnings remain:
  - `vite:react-babel` uses deprecated `esbuild` option and recommends `oxc`.
  - Rolldown plugin timing report shows most time in React Babel/JSX plugins.

## Notes

- Backend intentionally untouched.
- Browser validation is still recommended for live Header click-through, expired-session redirect and login/register password toggle behavior.
