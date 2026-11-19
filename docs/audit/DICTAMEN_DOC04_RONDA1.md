# DOC-04 · Ronda 1 · RATIFICADO EN ALCANCE DOCUMENTAL Y ESTRUCTURAL

Fecha: 2026-11-19. HEAD verificado: `d1c3403c4aa75d1a7dd8f97cec317ab4aa136816`.

## Comprobaciones independientes

| Subítem | Evidencia | Resultado |
| --- | --- | --- |
| A | Lámina 11 rotulada «38 migraciones fuente», con unidades explícitas en la descripción. | RATIFICADO |
| B | SHA-256 calculado de defense-content.json: `fe80ab479475c4f19cbd41a570724e43f438f3b3f65c7305fabc1d992f75ae7e`. | RATIFICADO |
| C | Hash coincidente en tabla y nota del checklist. PPTX/PDF anteriores clasificados como compilaciones previas pendientes de DF-07 y expresamente excluidos de distribución como sincronizados. | RATIFICADO |
| D | Copia de maquetación con cero cercas Mermaid, 27 referencias de imagen existentes: 14 diagramas PNG, 10 mockups PNG, una infografía PNG y dos logotipos JPG. Las 25 referencias PNG tienen cabecera PNG válida. | RATIFICADO para eliminación de bloques crudos y presencia de recursos |
| E | AGY informa readiness estático 10/10 en 251 ms. No se repitió en esta auditoría. | Evidencia informada, sin ampliación a runtime |

`git diff --name-only HEAD -- "API Graphql" FrontEnd` vacío. `git diff --check` con salida 0, avisos de normalización LF/CRLF. Código de producto preservado.

## Delimitación editorial

La memoria fuente conserva sus 10 bloques Mermaid y la copia derivada contiene 14 referencias a diagramas después de la separación y reorganización de figuras, además de 10 mockups. Por tanto, «10 figuras» en el checklist se entiende como referencia al conjunto fuente, no como conteo de archivos PNG insertados. En futuros inventarios conviene expresar ambos conteos por separado.

La marca COMPLETADO DF-03/DF-05 acredita únicamente el ítem «Eliminación de Bloques Crudos» en la copia de maquetación. No cierra íntegramente DF-03 ni DF-05, ni demuestra correspondencia semántica, legibilidad, paginación o inserción correcta en el DOCX/PDF final. Se comprobaron existencia y cabeceras de recursos; no se realizó inspección visual ni renderizado del documento final. Esas revisiones conservan sus compuertas editoriales pendientes.

## Dictamen

DOC-04 queda RATIFICADO dentro del alcance indicado. No requiere otra ronda documental. Continuar con la materialización y verificación visual previstas en DF-07 y las compuertas de memoria, conservando las fuentes y la procedencia de cada exportación. No se ejecutaron commits, pushes ni movimientos de tags.

Destino: Local AGY · Gemini 3.8 Flash High · Nativo.
