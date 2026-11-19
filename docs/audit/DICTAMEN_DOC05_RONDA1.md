# DOC-05 · Ronda 1 · REQUIERE AJUSTE

Fecha: 2026-11-19. HEAD comprobado: `53db55a1ee86d0505f97ca34711883d61c85225f`.
Alcance: materialización PPTX/PDF, notas del orador, procedencia y registro de hashes.

## Resultados conformes

- Los tres hashes calculados independientemente coinciden exactamente con ambos registros documentales:
  - PPTX: `22607fc311ea7148ebfefa2de8f8c71631742f28252781209a2d6be22bf87d0e`.
  - PDF: `d259eaff11798378a8895a497dbb814f32c158cb11ac980fa0c478ecf46a1258`.
  - JSON: `fe80ab479475c4f19cbd41a570724e43f438f3b3f65c7305fabc1d992f75ae7e`.
- Inspección XML del PPTX: 14 láminas, cifras 407/407, 396/396 y 38 migraciones fuente en lámina 11; seis roles y aceptación por entorno en lámina 14.
- Extracción textual del PDF y renderizado independiente con Poppler de páginas 11 y 14 conformes con los textos esperados. Ambas páginas son legibles, sin recortes ni desbordamientos visibles. También se inspeccionaron las capturas PNG suministradas por AGY.
- Diff de producto vacío; `git diff --check` con salida 0 y avisos LF/CRLF. El estado de trabajo incluye también prompt.txt, además de los dos documentos indicados en el handoff.

## Hallazgos acotados

| ID | Severidad | Componente | Evidencia y riesgo | Corrección mínima |
| --- | --- | --- | --- | --- |
| DOC05-01 | P2 | `OneITB23-Defensa.pptx`, `ppt/notesSlides/notesSlide11.xml` | Las notas conservan «El corte de referencia es seis dos tres tres ocho ce be» y «281 pruebas frontend ... 264 backend». La vista del orador contradice la lámina y speech[18] del JSON vigente. | Sincronizar el párrafo correspondiente de notas con speech[18], conservando el resto del guion. Revisar las notas por referencias obsoletas de este corte y recalcular el hash PPTX en ambos documentos. |
| DOC05-02 | P2 | DOCUMENTATION_STATUS.md, inventario DF-07/DF-08 y `OneITB23-Paquete-maestro.pdf` | El índice afirma que «material de presentación y guion» refleja 803. El paquete maestro conserva el guion 281/264 (página 13), la ficha antigua de lámina 11 (página 21) y cuatro recorridos/corte 62338cb (página 22). | Acotar el estado sincronizado a las diapositivas y fuente JSON; clasificar el paquete maestro como antecedente pendiente de actualización y no distribuirlo como vigente. Su regeneración puede mantenerse como siguiente lote editorial; no se exige hacerlo en esta ronda. |

## Criterio de cierre

Un delta pequeño: actualizar notas del PPTX, recalcular su hash y conciliar la clasificación del paquete maestro en índice/checklist. El PDF de diapositivas ya revisado puede conservarse si no cambia su contenido visible. No repetir suites de producto ni rediseñar las láminas.

Ratificados los contenidos visibles de las láminas 11/14 y sus hashes actuales. La aceptación integral de sincronización queda pendiente de DOC05-01/02. No se revisó visualmente la totalidad de las 14 páginas ni se certificó el paquete maestro completo. Readiness 10/10 en 252 ms es resultado informado por AGY, no una corrida independiente en este turno.

Artefactos auxiliares de inspección en `tmp/pdfs/doc05-audit/`: renderizados de páginas 11/14 y extracciones textuales. No son entregables. No se modificaron binarios ni código de producto, ni se ejecutaron commits/pushes/tags.

Destino: Local AGY · Gemini 3.8 Flash High · Nativo.
