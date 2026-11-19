# DOC-07 · Ronda 3 · RATIFICADO

Fecha: 2026-11-19. HEAD verificado: `088d1aaff0acbf2fa3f3d2a2efc0e7320c17b83e`.
Alcance: cierre de DOC07-05, conservando las ratificaciones de DOC07-01 a DOC07-04.

## Comprobaciones independientes

- OOXML del DOCX: márgenes superior, inferior, izquierdo y derecho de 1440 twips; 101 elementos cantSplit, 11 tblHeader y 82 keepNext.
- PDF: 63 páginas A4. Inspección visual de páginas 16, 19, 31, 50 y 51 renderizadas con Poppler. RNF-004 comienza con identificador y encabezado repetido, las filas examinadas permanecen completas, Figura 2 y Figura M1 incluyen número, título, imagen y nota en la misma página. La continuación de tabla en página 51 repite el encabezado.
- SHA-256 DOCX: `71837741e44c01ff5a57ae397813d43be9c2111b720099ab1f580d3d3d98ccd3`.
- SHA-256 PDF: `b7a339af91e5a19c7dae51388737ebf3f3810353766b4841d55020d496cf8d9c`.
- Ambos hashes coinciden con EXPORT_CHECKLIST.md. DOCUMENTATION_STATUS.md refleja 63 páginas y controles geométricos, pero no contiene estos hashes; el registro criptográfico canónico comprobado es EXPORT_CHECKLIST.md. README y Roadmap reflejan 63 páginas.
- Diff de producto y /specs respecto a HEAD vacío. No se inspeccionó contenido de /specs. Diff-check con código 0 y avisos LF/CRLF.

## Dictamen

DOC07-05 queda RATIFICADO. DOC-07 queda cerrado respecto de los cinco hallazgos editoriales auditados. No se requieren más rondas sobre estos puntos.

La revisión visual de esta exportación fue focalizada en las páginas afectadas, complementada por la revisión global de la ronda previa y los controles OOXML actuales. No equivale a una certificación APA exhaustiva, inspección al detalle de todos los diagramas ni prueba física de imprenta. Mantener los controles físicos/logísticos y cualquier revisión final no acreditada en sus compuertas, sin atribuir a este dictamen el cierre de toda la entrega académica.

Readiness 10/10 en 263 ms es informado por AGY; no se repitió. Evidencia auxiliar de este turno en `tmp/pdfs/doc07-r3/`.

El lote está técnicamente listo para revisión de archivos y commit/push conforme a la autorización explícita aplicable de Fran. Esta ratificación no otorga autorización Git en su nombre ni ejecuta commit, push o movimiento de tags. No se modificaron binarios ni código de producto por esta auditoría.

Destino: Local AGY · Gemini 3.8 Flash High · Nativo.
