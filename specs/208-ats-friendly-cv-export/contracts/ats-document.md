# Contract: ATS Document and Print Flow

## UI Contract

- User-facing label: `PDF optimizado para ATS`.
- Both `/profile` and `/profile/edit` invoke the same canonical ATS document.
- Preview controls are outside the printable root.
- The printable root is one `article[role="document"]` reading flow with semantic
  `header`, `section`, nested `article`, `h1`, `h2`, `h3`, `p`, `ul`, `li` and `a`
  elements. It MUST NOT create a nested `<main>` inside either profile route.
- No table, canvas, mandatory icon, two-column print grid or avatar exists in that root.

## Section Order

`Identity -> Contact -> Summary -> Skills -> Experience -> Projects -> Education -> Languages`

## Print Contract

- A4 portrait with 12-15 mm safe margins.
- Content height is automatic; no fixed 297 mm height, max height or hidden overflow.
- Section headings avoid orphaning from their first entry where the browser supports it.
- Entries avoid internal breaks where feasible; long entries may split rather than vanish.
- Arial/Helvetica/system sans-serif fallback.
- Screen theme cannot change print text contrast.

## Artifact Acceptance

The generated PDF is accepted only when:

1. `pdftotext -layout -enc UTF-8` returns non-empty, non-corrupt text.
2. Required section headings and the expected terms supplied for that inspected artifact
   are present. Automated DOM tests use deterministic fixtures; PDF checks receive only
   non-sensitive expected terms at invocation time and do not persist extracted CV text.
3. `pdfinfo` reports A4 and `Encrypted: no`.
4. `pdffonts` identifies usable embedded or substituted fonts.
5. URLs remain visible; link annotations are checked when the selected PDF driver emits
   them.

Tagged PDF is desirable but browser/driver dependent. Its absence is recorded and does
not override failed extraction or ordering checks.
