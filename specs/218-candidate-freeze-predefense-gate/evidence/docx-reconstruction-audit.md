# DOCX Reconstruction Audit — 2026-08-08

## Classification

- Output: `docs/entrega_final/salida/OneITB23_Memoria_Tecnica_PP3_2026_v2.3_CODEX_BORRADOR_TEXTO.docx`.
- Status: `BORRADOR_TEXTO_ESTRUCTURAL`.
- This artifact is not a final DOCX, PDF, presented version, candidate-SHA artifact,
  T023 PASS, or CF-06 evidence.
- The defense planned for 2026-08-07 at 09:00 did not occur; no new date is documented.

## Sources and preservation

| Input | SHA-256 | Use |
|---|---|---|
| Retained v2.2 snapshot | `e02d463f4db292ca700297f0cce141356442eeb6ad0f7049878e0f6d8870de3d` | Institutional cover, A4 page system, styles, headers, images and relationships only |
| `DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md` | `7fd1d046b187faa7ca38a835e4c3cae93eea10852a38b5b9b00705b55965e0c0` | Canonical memory text and reconciled state |
| `docs/academic/03-use-cases.md` | `2022328cd8d9604f68cd19351ba3c723169e918ba6483678fed7d456006fe241` | Complete CU-01 to CU-26 catalog |

The original v2.2 file was not edited. A stable snapshot with the same hash was used.
The mixed body after the institutional cover was removed only in the working copy and
reconstructed from the two canonical Markdown sources. The cover now states that the
originally planned defense was not held and that no new date is documented.

## Output inventory

| Check | Result |
|---|---|
| SHA-256 | `b3ffe5036639fb71df16d4da8500bfa9a80baabe16668b4a739a59ac2a3143f2` |
| Size | 208774 bytes |
| OOXML ZIP integrity | PASS |
| Section geometry | PASS: 1 A4 portrait section; margins and different-first-page behavior preserved |
| Body structure | 782 paragraphs; Heading 1/2/3/4 counts 9/36/20/28 |
| Tables | 38; `tblW`, `tblInd`, `tblGrid` and every `tcW` agree |
| Cases of use | PASS: CU-01 through CU-26 exactly once as headings; no missing/duplicate ID |
| Figures | 13 ordered numbered reservations; separate unnumbered class-diagram requirement |
| Word fields | 1 TOC and 1 PAGE field; `w:updateFields=true`; Ctrl+A/F9 remains required in Word |
| Images | 3 body images plus 1 header image preserved; alt/title text present |
| Accessibility audit | PASS: 0 high, 0 medium, 0 low findings |
| Comments/content controls/footnotes | None |
| Tracked changes | None |
| Baselines and release truth | PASS: 234/234, 252/252, missed defense, no final SHA/tag and open CF-06 retained |
| Mermaid code in DOCX | None; code blocks were replaced by explicit figure reservations |
| Deterministic rebuild | PASS: two consecutive builds produced the same SHA-256 |

The stored page-count property is intentionally zero because no renderer refreshed final
pagination. Word must update fields and properties after figures are inserted; no page
count is claimed by this audit.

## Render gate

`render_docx.py --emit_pdf --verbose` was attempted for the reference and final draft.
Both attempts ended with `FileNotFoundError: [WinError 2]` because LibreOffice/`soffice`
is not installed in the workspace runtime. No PDF or page PNGs were produced and no page
was visually approved. The preserved floating cover image remains a known Word-versus-
LibreOffice layout risk until the file is rendered and reviewed.

## Remaining work

1. Resolve the definitive class diagram and the three management-figure sources.
2. Render/export the ten Mermaid memory sources plus the three management figures.
3. Insert figures, update TOC/PAGE fields in Word, and re-run structural audits.
4. Render every DOCX page, inspect at 100%, fix layout, then export and audit the PDF.
5. Keep T022 and T023 open until their independent manual acceptance criteria execute.
6. Do not freeze a SHA, tag, or CF-06 until the clean-tree integral gate is complete.
