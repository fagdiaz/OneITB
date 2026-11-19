# DOC-07 · Ronda 2 · CIERRE PARCIAL / REQUIERE AJUSTE EDITORIAL

Fecha: 2026-11-19. HEAD: `088d1aaff0acbf2fa3f3d2a2efc0e7320c17b83e`.

## Hallazgos anteriores resueltos

DOC07-01 a DOC07-04 quedan ratificados: índice poblado (páginas 3/4), ausencia de comandos newpage/width en texto exportado, encabezados institucionales sin los marcadores anteriores y fecha Noviembre 2026, y conciliación de Moderador/WebSockets en el cuerpo. No reabrir estos cuatro puntos.

SHA-256 independiente DOCX: `67c31fc4525f1846c9e92b1912f7a29acba7a2b0997eeab95fbbbdf57190ad04`.
SHA-256 independiente PDF: `f1b1a939d76ba596d203eed70bbccb554a24393f27550bada6e5341e711c3f83`.
Ambos coinciden con EXPORT_CHECKLIST.md. DOCUMENTATION_STATUS.md refleja el inventario, no una segunda tabla de estos hashes. PDF de 60 páginas A4. Inspección OOXML confirma 803 y ausencia de instrucciones crudas en el texto del DOCX.

## Único lote pendiente: DOC07-05 (P2), paginación y geometría editorial

El renderizado de las 60 páginas y su revisión mediante hojas de contacto permite observar:

- Títulos de figura separados de su imagen: Figura 2 al pie de página 16 y su imagen en 17; Figura M1 en 27 y su imagen en 28; patrón repetido en varios mockups. Mantener juntos número, título e imagen, con nota asociada cuando quepa. No basta que exista la imagen.
- Filas cortadas con continuación sin identificador: inicio de página 16 con final de RNF sin código/categoría y continuación de prueba frontend entre páginas 46/47. Desactivar división entre páginas para filas que caben completas, conservando encabezados repetidos.
- Márgenes OOXML de 1417 twips (aproximadamente 2,5 cm), frente a los 2,54 cm exigidos por EXPORT_CHECKLIST.md. Aplicar 1440 twips o documentar una excepción institucional acreditada; la aproximación no satisface una declaración de valor estricto.

Corregir estos tres aspectos en una pasada de maquetación, exportar de nuevo, actualizar TOC y hashes después de la paginación final. El número de páginas puede cambiar. Comprobar visualmente las figuras y tablas afectadas y revisar el conjunto antes de declarar listo para imprenta. No requiere nuevas suites ni cambios de producto.

## Alcance y estado final

Inspección global a escala reducida mediante seis hojas de contacto y comprobación ampliada de página 16; no equivale a certificación de legibilidad de cada rótulo de diagramas ni revisión APA exhaustiva. No se ejecutó render independiente de DOCX ni prueba física de impresión. Evidencia en `tmp/pdfs/doc07-r2/`.

Diff de producto y /specs vacío, sin inspeccionar contenido de /specs. Diff-check aprobado con avisos LF/CRLF. Readiness informado por AGY no se repitió.

Ratificada la subsanación de los cuatro hallazgos originales y la integridad de esta exportación. DF-05/DF-06 conservan pendiente la aceptación editorial por DOC07-05. No corresponde emitir aceptación final de imprenta ni autorización de commit/push en nombre del usuario. No se realizaron operaciones Git ni cambios de binarios.

Destino: Local AGY · Gemini 3.8 Flash High · Nativo.
