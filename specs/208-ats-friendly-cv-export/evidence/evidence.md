# Evidence: ATS-Friendly CV Export

**Status**: Implemented `[I]`; native PDF acceptance blocked  
**Created**: 2026-08-04

## Baseline Finding

- Current OneITB print template is selectable DOM text but uses fixed A4 height,
  `overflow-hidden`, avatar/chips and two-column grids.
- Browser pre-print parity passed for the existing template; native PDF extraction has
  not been evidenced.
- Reference review identified a proven extraction workflow in `F:/React/cv-builder`.

## Implementation Evidence

| Gate | Result |
|---|---|
| Speckit QA | PASS - MEDIUM risk planning gate |
| Focused semantic tests | PASS - 23/23 |
| Full frontend suite | PASS - 217/217 in 55 files |
| Vite production build | PASS - 559 modules, 2.17 s |
| Browser route parity | PASS - seeded Student, same sections/values and semantic root |
| Long two-page CV | BLOCKED - no approved disposable long profile/native print artifact |
| Native PDF generated | BLOCKED - native print flow unavailable in this execution |
| Poppler extraction/order/A4/fonts/encryption | BLOCKED - `pdftotext` and `pdffonts` missing |
| Production dependency audit | 2 moderate React Router advisories; accepted `RR-09`, breaking fix deferred |

No universal ATS compatibility claim is made. The implemented label is `PDF optimizado
para ATS` and `[V]` remains gated by the real PDF artifact.

## Planning And QA Gate - 2026-08-04

- Active feature prerequisite: PASS; `FEATURE_DIR` resolved to this directory and all
  required design artifacts were present.
- Requirements checklist: 13/13 complete.
- Speckit QA preflight: PASS; `git diff --check` reported no whitespace errors. Existing
  LF/CRLF conversion notices are repository line-ending notices, not content failures.
- Risk: MEDIUM. The implementation changes a shared React document/print flow and local
  QA tooling, but does not alter backend, GraphQL, EF Core, authentication or persistence.
- Existing source baseline reused for planning only: frontend 205/205 and Vite 558 modules
  in 3.88 s were recorded before this spec; both commands must be rerun after implementation.

## Current-Flow Audit

- `/profile` renders `CVPrintTemplate` and invokes global `window.print()`.
- `/profile/edit` renders both `ResumePreview` and `CVPrintTemplate`, then invokes global
  `window.print()`.
- Current print CSS fixes the CV to 297 mm and hides overflow, which can truncate long CVs.
- `react-to-print` 3.3.0 is already installed and can isolate the canonical document.
- The reference project demonstrates useful artifact checks with Poppler, but its
  development-only PDF endpoint and extra CV features are intentionally not copied.

## Speckit Analyze

- Requirements and measurable criteria: 18.
- Dependency-ordered tasks: 25; 3 planning tasks complete and 22 implementation/closure
  tasks open.
- Requirement coverage: 100%; no unmapped requirement or task was identified.
- Constitution alignment: PASS. No new REST endpoint, dependency, persistence model,
  sensitive log or universal compatibility claim is planned.
- Critical/high findings: none.
- Planning fixes applied before this result: the visible editor preview was included in
  the canonical migration, the analyzer received a package command, and automated
  fixtures were separated from native-PDF acceptance using approved profile data.
- Residual risk: browser/PDF-driver behavior remains unverified until implementation and
  the native artifact gate run; this is explicitly represented by T017-T020.

### Post-implementation rerun

- Inventory: 12 functional requirements, 6 measurable success criteria and 25 tasks.
- Coverage: 100%; no requirement or implementation task is unmapped.
- Constitution alignment: PASS; the implementation remains frontend-only and preserves
  privacy, authorization, persistence and service boundaries.
- Findings: no critical/high issue. Two documentary inconsistencies were remediated:
  `spec.md` no longer reports Draft status and `plan.md` identifies 205/205 as the
  pre-change baseline rather than the final result.
- Closure: 22/25 tasks complete. T017, T018 and T020 remain explicitly `BLOCKED` pending
  browser/native-PDF execution and complete Poppler tooling; this prevents promotion to
  `[V]` without invalidating the implemented `[I]` state.
- Hygiene: `git diff --check` PASS on the exact worktree validated below.

## Implemented Contract

- `CVATSPrintTemplate` is the only preview/print document consumed by `/profile` and
  `/profile/edit`.
- `ResumePreview` and `CVPrintTemplate` were removed after migration; no production
  consumer retains `window.print()` for profile CVs.
- The print root is `article[role="document"]` with deterministic sections and real text.
- Hidden/empty values are omitted; all bounded CV arrays are rendered without slicing.
- Screen themes affect accents only; print CSS forces readable institutional colors.
- Print height is content-driven. No 297 mm fixed height, max-height, translated page copy
  or hidden overflow remains in the CV flow.
- `useCvAtsPrint` clones only the canonical root and maps unavailable/driver errors to
  recoverable Spanish messages.
- `analyzeAtsPdf.mjs` bounds input to 25 MB, commands to 15 seconds and output to 2 MB;
  extracted text lives in an OS temporary directory and is removed in `finally`.

## Commands And Results

```text
npm.cmd run test -- --run <six focused files>
PASS: 6 files, 23 tests

npm.cmd run test -- --run
PASS: 55 files, 217 tests

npm.cmd run build
PASS: Vite 8.0.16, 559 modules, 2.17 s

npm.cmd audit --omit=dev
NON-ZERO: 2 moderate advisories in React Router 6.30.4; fix requires 7.18.2 and is
deferred under accepted RR-09.
```

Tool discovery returned `pdfinfo` only. `pdftotext` and `pdffonts` were absent. No server
was started solely for this gate, so T017, T018 and T020 remain visibly blocked rather
than being represented as PASS.

## Partial Browser Acceptance - 2026-08-04 23:00 ART

Environment: branch `codex/199-ux-b2b-academic-onboarding`, HEAD `62da9ae`, dirty
multi-spec worktree, healthy Docker SQL, pre-existing backend process on `44397/5000`
and current Vite source on `5173`. The backend process predated this validation, so its
presence is recorded for reproducibility and is not treated as a new backend build gate.

- Local login with the canonical seeded Student succeeded and reached `/feed`. The feed
  exposed the three subjects of `Analisis de Sistemas` and did not repeat onboarding.
- `/profile` and `/profile/edit` each exposed exactly one
  `article[role="document"]`. Their DOM snapshots exposed the same values, both measured
  828 normalized text characters and retained the same section order: Contacto, Perfil
  profesional, Habilidades, Experiencia laboral, Proyectos, Formación académica and
  Idiomas.
- The canonical document contained zero `img`, `canvas` and `table` elements, used no
  CSS columns and reported `overflow: visible`. The profile modal contained no second CV
  representation.
- The editor's first observable render contained the complete institutional identity,
  biography, selected career and CV arrays; no provisional partial-name/empty-career
  state was observed.
- Student navigation was exercised at 320, 375, 768, 1024, 1280 and 1440 CSS pixels.
  No viewport had horizontal document overflow. At 320/375 the three destinations moved
  to the compact menu; from 768 onward Mensajes, Académico and Empleos remained direct.
- Opening the compact menu and pressing Escape closed it and restored focus to
  `Abrir más opciones de navegación`. Programmatic Enter activation remains an
  unsupported signal in the connected browser-control surface and is not classified as
  either product PASS or failure.
- Tech Noir rendered `rgb(30, 41, 59)` as the body background and retained the atomic
  `oneITB` lockup. The application console contained zero warning/error entries during
  the profile, editor, theme and responsive pass.
- No profile field, avatar or persisted association was modified during acceptance.

This closes browser parity and the application-owned semantic/pre-print surface for the
seeded Student. T017/T018 remain blocked by the missing native PDF and Poppler tools.
T020 remains partially blocked because no approved empty/long two-page fixture was used
and the operating-system print dialog cannot be controlled by this browser surface.
