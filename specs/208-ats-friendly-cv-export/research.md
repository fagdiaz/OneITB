# Research: ATS-Friendly CV Export

## Decision 1 - Measurable compatibility instead of a universal claim

**Decision**: Define ATS readiness through selectable/extractable text, deterministic
reading order, valid Unicode, A4, non-encrypted output, recognizable fonts and links.

**Rationale**: ATS products differ and no local implementation can guarantee universal
parsing. The reference project validates the artifact with Poppler instead of relying on
visual inspection.

**Alternatives considered**:

- Claim `100% ATS compatible`: rejected as unverifiable.
- Visual browser inspection only: rejected because a PDF can look correct but extract
  empty or reordered text.

## Decision 2 - One semantic column and no mandatory image content

**Decision**: The canonical print document uses a single DOM reading flow. Contact,
skills, education and all other sections remain textual and sequential. Avatar and
decorative accents are omitted from the ATS output.

**Rationale**: The current `CVPrintTemplate` uses two-column grids, chips, fixed A4 height
and `overflow-hidden`; these can reorder or truncate extracted content. The reference
implementation explicitly uses real text nodes and controlled section breaks.

**Alternatives considered**:

- Keep grids and rely on CSS visual order: rejected because PDF extraction order can vary.
- Render a flattened canvas: rejected because it destroys selectable text.

## Decision 3 - Shared canonical document

**Decision**: Extract a pure ATS document component used by both `/profile` and
`/profile/edit`, with preview wrappers owning only scale, modal and controls.

**Rationale**: It prevents route-specific drift and makes one component independently
testable. `CVData` remains the data contract.

## Decision 4 - Scoped native print for production

**Decision**: Reuse the installed `react-to-print` package to print only the canonical ATS
document. Do not copy the reference Vite `/api/export-pdf` plugin into OneITB.

**Rationale**: A Vite development plugin is not available behind the production Nginx
image. Adding a new REST business endpoint or a Chromium service would increase the
deployment surface during Code Freeze.

**Alternatives considered**:

- Vite-only PDF endpoint: rejected as non-production architecture.
- Backend Chromium/Puppeteer service: deferred; operationally heavy and unnecessary for
  the academic release candidate.
- Existing global `window.print()`: rejected because it relies on global hide/show rules
  and is less isolated than printing a specific ref.

## Decision 5 - Two-tier validation

**Decision**: Use Vitest for semantic DOM/order/parity and a finite local analyzer for a
user-generated PDF with `pdftotext`, `pdfinfo` and `pdffonts` when available.

**Rationale**: Component tests catch regressions cheaply; artifact tools prove the actual
PDF. Missing tools remain an explicit blocked gate.

## Reference Boundary

Reviewed from `F:/React/cv-builder`: `docs/PDF_EXPORT.md`, `tests/ats-pdf.test.mjs`,
`scripts/analyzeAtsPdf.mjs`, `scripts/atsPdfPlugin.ts`, `scripts/exportPresetPdf.mjs`,
`src/components/resume/ResumePreview.tsx` and print CSS. Opportunity, LinkedIn, preset and
storage features are intentionally excluded.
