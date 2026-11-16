# Evidence: Spec 153 - Tech Noir & Clean Tech Theming System

## Commands

- `npm.cmd run build` from `FrontEnd/OneItb-FE`

## Runtime/Build Results

- Frontend build: PASS.
- Vite output: 340 modules transformed, built in 739ms.
- Known warning remains: `vite:react-babel` reports deprecated `esbuild` option; no compile error.

## Notes

- Backend is intentionally untouched for this frontend-only theming spec.
- `dark` mode is class-driven through `<html class="dark">`.
- Theme preference persists in `localStorage` as `oneitb-theme`.
- Pre-React bootstrap in `index.html` applies the theme before React mounts to avoid FOUC.
