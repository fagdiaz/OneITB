# DOC-07 · Ronda 1 · REQUIERE AJUSTE

Fecha: 2026-11-19. HEAD verificado: `088d1aaff0acbf2fa3f3d2a2efc0e7320c17b83e`.
Alcance: materialización de memoria, integridad, contenido y muestreo visual del PDF exportado por Word.

## Evidencia conforme

- SHA-256 DOCX `2b35bce5f96f97e66abfa71794ba2b2644a8768419ea8dfac12c2628fcfc7467` y PDF `8efaed7a00005667f453ea3e96fac80e47074a910221551341794b95e77eb5f5`, calculados independientemente y coincidentes con EXPORT_CHECKLIST.md.
- PDF de 45 páginas, tamaño declarado A4 (595.32 x 842.04 puntos), producido por Word. La página 38 contiene 803 core, 396/407, 38 migraciones fuente, procedencia 6cd5295 con árbol modificado y distinción del tag histórico. No se encontraron 234/234 o 252/252 en la extracción del PDF.
- Code Freeze: diff de producto y /specs respecto a HEAD vacío. No se inspeccionó contenido de /specs. `git diff --check` con código 0 y avisos LF/CRLF.

## Hallazgos visuales y de consistencia

| ID | Severidad | Evidencia reproducible | Corrección y criterio de aceptación |
| --- | --- | --- | --- |
| DOC07-01 | P1 editorial | Página 1: «Table of Contents» seguido de «No se encontraron entradas de tabla de contenido». El índice no fue regenerado con entradas válidas. | Corregir mapeo de títulos a estilos de encabezado y configuración del TOC. Actualizar campos y exportar. El índice debe contener títulos reales y números de página correctos, sin mensaje de error. |
| DOC07-02 | P1 editorial | Página 1 muestra literalmente `{width="4.8in"}`, `{width="2.3in"}` y `\newpage`. Portada, alcance y comienzo del capítulo quedan en una misma página. La extracción detecta atributos width también junto a otras figuras. | Corregir el procesamiento de atributos y saltos en el compilador para DOCX, no limpiar solo el PDF. Exportación sin instrucciones visibles; portada separada y figuras con tamaños efectivos. |
| DOC07-03 | P2 | Encabezados visibles en páginas 38/39 contienen `{Logo del proyecto}`, `{Nombre del proyecto}`, `{comisión}` y `20{año}`. Portada conserva corte «Octubre de 2026». | Completar los datos institucionales conocidos y fecha real del corte editorial; no inventar comisión. Si falta un dato, dejarlo como pendiente explícito fuera de una declaración de listo para imprenta. Eliminar marcadores de plantilla antes de aceptación final. |
| DOC07-04 | P2 | Página 39 aún afirma pendiente el recorrido visual del Moderador y el handshake WebSocket con dos navegadores. Contradice CF-04/CF-05 y la página 38. README/Roadmap hablan de consolidación para imprenta pese a los defectos anteriores. | Conciliar esos párrafos en la fuente preservando riesgos externos vigentes. Clasificar binarios como generados y métricamente sincronizados, con QA editorial pendiente hasta corregir y verificar. No cerrar DF-05/DF-06 por existencia o hash. |

## Plan de cierre acotado

1. Corregir conversión de títulos, atributos y saltos, junto con datos de plantilla. Preservar producto y evidencia histórica.
2. Conciliar los dos pendientes obsoletos en la fuente y regenerar DOCX/PDF. El total de páginas puede cambiar legítimamente; no forzar 45.
3. Revisar visualmente todas las páginas del nuevo PDF, especialmente índice, portada, figuras y cortes de tablas. Comprobar ausencia de instrucciones crudas y placeholders, y exactitud del índice. Solo entonces actualizar hashes, tamaños, páginas y estados de aceptación.

No se requieren suites de producto ni nuevas pruebas de runtime. DOCUMENTATION_STATUS.md registra tamaños y estados; los hashes nuevos se verificaron en EXPORT_CHECKLIST.md. Mantener esa distinción si el handoff afirma hashes en ambos archivos.

## Límites y artefactos

Se extrajo texto mediante Poppler y se renderizaron páginas 1, 2, 38 y 39; se inspeccionaron visualmente 1, 38 y 39. No se certificó visualmente el resto ni se realizó un render independiente del DOCX. Los defectos del PDF entregable ya bastan para impedir aceptación de imprenta. Evidencia auxiliar en `tmp/pdfs/doc07-audit/` (cover.png, page-38.png, page-39.png y memoria.txt).

Readiness 10/10 en 271 ms es informado por AGY; su alcance estático no detecta estos defectos. Auditoría sin cambios de binarios o producto, commits, pushes o tags.

Destino: Local AGY · Gemini 3.8 Flash High · Nativo.
