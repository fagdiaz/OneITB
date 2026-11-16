# Evidence: Premium Branding and Landing

## Baseline

- Date: 2026-07-12
- Branch: `183-premium-branding-landing`
- Active feature before specification: `specs/182-qa-session4-feed-hierarchy-and-media-grid`
- Worktree: dirty with existing Specs 181/182 implementation and final logo assets; no unrelated change will be reverted.
- Prompt correction: approved files were present under `src/assets/img/` with spaces and names that did not match the requested canonical imports.
- Dependency decision: Framer Motion is not installed and is not required; native browser APIs are sufficient.
- Performance finding: background-bearing PNGs are approximately 4.5 MB and 5.1 MB, so they must not be part of the critical hero path.

## Pre-implementation gate

- Initial Speckit QA preflight: FAIL because the temporary `Landing.jsx` imported six comparison images no longer present in the workspace. `git diff --check` passed; the frontend build correctly exposed six unresolved imports.
- Resolution: the runtime landing was replaced with the four approved canonical assets and no compatibility alias or fake placeholder was introduced.
- Final Speckit QA preflight with builds: PASS. Scope detected as frontend/security; required artifacts and 16/16 requirement-checklist items present; `git-diff-check` PASS; Vite build PASS in 1.06 s.

## Automated validation

- Focused component tests: `npm.cmd run test -- --run ... --configLoader runner` -> PASS, 4 files / 6 tests.
- Full frontend regression: `npm.cmd run test -- --run --configLoader runner` -> PASS, 16 files / 31 tests.
- Production build: `npm.cmd run build` -> PASS, 373 modules, 941 ms in the final standalone run.
- Runtime dependency audit: `npm.cmd audit --omit=dev --audit-level=high` -> PASS, 0 vulnerabilities.
- `git diff --check`: PASS after removing one trailing blank line.
- Source scans: PASS; no temporary Gemini/Logo-edit imports, comparison copy, Framer Motion, pure black/white main backgrounds, or imports of the multi-megabyte background variants in affected runtime files.
- Bundle evidence: only `logo-oneitb.png` (70.28 kB) and `only-logo.png` (206.27 kB) are emitted. The 4.47 MB and 5.12 MB background variants remain available as approved source assets but are excluded from the build.
- Dependency evidence: Spec 183 changed no package manifest. The visible `pdfjs-dist` manifest diff predates this spec and belongs to the dirty Spec 182 baseline.

## Browser validation

- No browser automation connector is available in this execution environment, so responsive/light-dark/spotlight visual sign-off was not fabricated.
- Manual gate: verify `/` at 320 px, tablet and desktop widths in both themes, keyboard focus, pointer spotlight, reduced motion, header elevation and CTA navigation using the presentation browser.
- Automated component semantics, reduced-motion fallback, observer cleanup, header brand link and responsive production compilation are verified.
