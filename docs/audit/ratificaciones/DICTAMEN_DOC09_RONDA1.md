# DOC-09 · Ronda 1 · REQUIERE AJUSTES

Fecha: 2026-11-19. HEAD comprobado: `4629ba737722d81526a2ffa1a22f90198ec4cee9`.
Alcance: reorganización de docs/audit, referencias consumidoras y preservación de evidencia; exclusión de /specs.

## Hallazgos

| ID | Prioridad | Evidencia y efecto | Corrección acotada |
| --- | --- | --- | --- |
| DOC09-01 | P2 | El SHA completo del handoff no coincide con HEAD. | Usar el SHA completo indicado arriba. |
| DOC09-02 | P1 | Se eliminan DICTAMEN_DOC03_RONDA1.md, DICTAMEN_DOC04_RONDA1.md y DICTAMEN_DOC05_RONDA2.md como supuestas rondas intermedias. `git show HEAD:<ruta>` confirma encabezados de RATIFICADO y alcance final de esos lotes. | Recuperar desde HEAD y trasladar intactos a ratificaciones/. Clasificar por contenido, no por prefijo DICTAMEN. Revisar la lista de bajas antes de integrarla. |
| DOC09-03 | P1 | `node tests/test_runner_isolation.mjs` falla al inicio: evidencia histórica ausente. La línea 21 aún apunta a docs/audit/CF05_UI_AUTOMATED_RUNNER_OUTPUT.md. Los productores test_wrapper_contract.mjs y test_wrapper_consumer_fixtures.ps1 aún escriben EVIDENCIA_WRAPPER_FIXTURES_CONS03.json en la raíz. | Ajustar consumidores de rutas trasladadas y ubicar resultados nuevos conforme a la taxonomía. Mantener separado evidence/runs (corridas) de evidencias (archivo histórico), o migrar conjuntamente sus consumidores si se decide cambiarlo. Ejecutar las suites afectadas y registrar salidas reales. |
| DOC09-04 | P2 | CF05_UI_WALKTHROUGH.md y CF05_UI_WALKTHROUGH_TRACE.md conservan enlaces ./screenshots/ desde evidencias/, pero las capturas permanecen en docs/audit/screenshots/. La ratificación fundacional enlaza un .tests.json eliminado. CONS-03 cita y fija SHA-256 de EVIDENCIA_WRAPPER_FIXTURES_CONS03.json, también eliminado. | Reparar enlaces de navegación (../screenshots/ y rutas relativas correspondientes) y conservar las evidencias que sostienen ratificaciones vigentes. Restaurar los JSON de ejecución focalizada, cierre CONS-03 y otros soportes de cierre citados; archivarlos con su procedencia. Alternativamente, documentar un acceso explícito e inmutable a su blob histórico y verificarlo. Un resumen en DEVELOPMENT_LOG no sustituye esas salidas. |

## Resultado de la inspección

La estructura por subdirectorios es adecuada. Git identifica los 27 traslados declarados con cero líneas cambiadas, preservando sus contenidos. La raíz contiene los cinco documentos canónicos declarados al inspeccionarla. La clasificación de bajas y la reconciliación de consumidores no están completas: no procede ratificar el lote ni presentarlo como listo para commit/push todavía.

La eliminación de históricos no implica pérdida irreversible mientras estén en Git, pero exige conservar su acceso y trazabilidad. No es necesario restaurar indiscriminadamente todas las rondas intermedias: distinguir actas finales, soporte primario citado y antecedentes realmente prescindibles. No reescribir DEVELOPMENT_LOG ni logs literales para aparentar rutas originales diferentes; utilizar un índice de correspondencias cuando corresponda.

## Verificaciones y límites

- HEAD y estado staged inspeccionados; el lote está mayormente en el índice, por lo que `git diff` sin `--cached` no representa toda la revisión.
- `git diff --cached --check` y `git diff --check`: salida 0; aviso LF/CRLF en prompt.txt.
- `git diff HEAD --name-only -- "API Graphql" FrontEnd specs`: vacío.
- Suite Node de aislamiento ejecutada: fallo de precondición por ruta histórica ausente; no ejecuta sus 13 casos. No reinterpretar readiness 10/10 como validación de esta reorganización.
- No se ejecutaron suites de producto, navegadores, nuevas exportaciones ni consultas remotas. No se modificaron producto, /specs, índice Git, evidencias históricas o tags durante la auditoría.

## Próximo lote

AGY: corregir los cuatro puntos en este mismo DOC-09; aportar inventario de bajas con justificación, correspondencia origen/destino de actas y evidencias, comprobación de enlaces afectados y resultados de suites consumidoras. Preservar contenidos y hashes de evidencia literal. No ampliar el alcance editorial ni regenerar entregables por este traslado de archivos.

Destino: Local AGY · Modelo: Gemini 3.8 Flash High · Razonamiento: Nativo.
