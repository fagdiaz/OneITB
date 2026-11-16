# Implementation Plan: Theme & CSS Supremacy (036)

**Branch**: `036-theme-and-css-supremacy` | **Date**: 2026-06-10

## Summary
Three surgical strikes:
1. **Overwrite** `src/index.css` with the exact content from `_temp_cv_reference/index.css` (removing the old shadcn-style `:root` variables block that doesn't belong).
2. **Disconnect** legacy CSS imports from `src/main.jsx` (`normalize.css`, `styles.css`, `responsive.css`).
3. **Empty** the zombie CSS files so they cannot be re-imported accidentally.

## Diagnosis
- `main.jsx` imports 3 legacy files: `normalize.css`, `styles.css`, `responsive.css`.
- `styles.css` contains global overrides (`form { max-width: 300px }`, `input[type="text"]` resets, `button` resets) that fight Tailwind's utility classes on the CV editor forms.
- `index.css` currently has an old `:root` block with shadcn-style variables (`--primary`, `--background`, `--card`, etc.) that are not used by any component and pollute the custom property namespace.
- `index.html` already has Inter + Font Awesome — no changes needed.

## Files Modified
```
src/index.css          ← overwrite with reference content (exact copy)
src/main.jsx           ← remove 3 zombie CSS imports
src/assets/css/styles.css    ← empty (deprecation tombstone only)
src/assets/css/responsive.css ← empty (deprecation tombstone only)
src/assets/css/normalize.css  ← empty (deprecation tombstone only)
```
