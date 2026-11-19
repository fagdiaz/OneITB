# DOC-05 · Ronda 2 · RATIFICADO

Fecha: 2026-11-19. HEAD verificado: `53db55a1ee86d0505f97ca34711883d61c85225f`.
Alcance: cierre de DOC05-01 y DOC05-02 del dictamen de Ronda 1.

| Hallazgo | Comprobación independiente | Estado |
| --- | --- | --- |
| DOC05-01 | Extracción directa de `ppt/notesSlides/notesSlide11.xml`: contiene literalmente el discurso `speech[18][3]` del JSON vigente. La búsqueda en todas las notas no encuentra 281, 264, 62338cb ni su transcripción oral antigua. | RATIFICADO |
| DOC05-02 | Checklist e índice clasifican el paquete maestro como antecedente pendiente de actualización, no vigente ni distribuible como sincronizado. La declaración de sincronización se acota a diapositivas y fuente JSON. | RATIFICADO |

## Integridad e higiene

Hashes SHA-256 calculados independientemente y coincidentes con los registros:

- PPTX: `e79ea19f8082636b542c1196af46c96ab131738c56844fb0ed454ce3ac8642d1`.
- PDF: `d259eaff11798378a8895a497dbb814f32c158cb11ac980fa0c478ecf46a1258`.
- JSON: `fe80ab479475c4f19cbd41a570724e43f438f3b3f65c7305fabc1d992f75ae7e`.

El PDF es byte a byte idéntico al ejemplar cuyas páginas 11 y 14 se renderizaron e inspeccionaron en Ronda 1. Esa evidencia visual se conserva, sin repetir renderizado. La modificación de notas queda comprobada en el PPTX actual.

`git diff --check` terminó con código 0 y avisos de normalización LF/CRLF. El diff de producto respecto a HEAD no mostró cambios. No se repitieron suites ni readiness: el resultado 10/10 en 259 ms corresponde al informe de AGY.

## Cierre

DOC-05 queda RATIFICADO dentro del alcance auditado de sincronización, notas, integridad y clasificación documental. No requiere otra ronda de estos dos hallazgos.

La regeneración del paquete maestro permanece para un lote editorial posterior. Este cierre no certifica el dossier antiguo, los ensayos ni toda la entrega académica. Se conserva el alcance visual de Ronda 1, limitado a las láminas modificadas 11/14.

Sin modificación de binarios o código de producto por esta auditoría. Sin commits, pushes ni movimientos de tags.

Destino: Local AGY · Gemini 3.8 Flash High · Nativo.
