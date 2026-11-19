# DOC-02 · Ronda 1 · REQUIERE AJUSTE

Fecha: 2026-11-19. Revisión documental independiente del árbol de trabajo.
HEAD observado mediante Git: `94a52afad0cd2bca4f59a526364d0b8594ccb1e9`.
El SHA completo del handoff (`94a52afaeebc2759e94bf65251a24d0840b3cb15`) no coincide con HEAD.

## Comprobaciones conformes

- Constitución vigente v1.8.0.
- `PREFLIGHT_CERTIFIED_6cd5295.json` registra 396 backend y 407 frontend, 803 core, 9/9 gates, cero fallos y omisiones. Registra también `WorkingTreeClean: false`, 17 archivos modificados y SHA `6cd5295d7768c34c32d37d54e0aad3d01f4749f6`.
- Inventario local: 38 migraciones fuente con prefijo temporal, excluyendo archivos Designer y snapshot.
- Los cambios reconocen CF-04/CF-05 y mantienen pendiente la revisión visual DF-07 y la aceptación productiva externa.
- `git diff --name-only HEAD -- "API Graphql" FrontEnd` vacío. `git diff --check` con salida 0; aviso LF/CRLF en prompt.txt.
- `DOCUMENTO_MAQUETACION.md` existe y contiene la tabla actualizada, pero está excluido de Git. Es un derivado efímero, no una segunda fuente canónica.

## Matriz de ajustes documentales

| ID / severidad | Documento y sección | Afirmación observada | Evidencia y corrección mínima |
| --- | --- | --- | --- |
| DOC02-01 / P2 | Handoff; memoria introducción y §5.3; guía preámbulo; overview §1.8 | SHA completo incorrecto y 803 pruebas atribuidas genéricamente al candidato junto al tag histórico | Corregir HEAD. Añadir una nota común de procedencia: 803 acreditadas en preflight sobre 6cd5295 con árbol modificado, consolidadas posteriormente con producto idéntico; tag histórico de 785 sobre d806822, código candidato 37ed360. No atribuir una nueva corrida a HEAD. SQL 11 conserva evidencia histórica separada en a62c4e3. |
| DOC02-02 / P2 | Memoria §5.3, copia de maquetación y guía tabla de contraste | «38 migraciones canónicas aplicadas», «sin drift de persistencia» y respaldo/seed histórico elevado a 38 | El conteo de archivos acredita migraciones disponibles. `has-pending-model-changes` contrasta modelo EF con snapshot, no consulta migraciones aplicadas en una base. Redactar «38 migraciones fuente; modelo sin cambios respecto al snapshot según preflight». Mantener backup/seed con su fecha y evidencia original; no cambiar el número histórico de Spec 196 a 38 por arrastre. No hace falta ejecutar ni modificar una base para cerrar este ajuste. |
| DOC02-03 / P2 | Overview §1.9, memoria introducción; DOCUMENTATION_STATUS fila manifiesto; referencias canónicas de CF-06 | Convocatoria de mesa asociada a CF-06; estado remoto pendiente pese a ratificación posterior | CF-06 es consolidación/congelamiento, no convocatoria académica. Separar esa logística sin inventar fecha. Identificar tag -> d806822 y código candidato -> 37ed360. Usar RATIFICACION_TAG_ORIGIN_RC_2026-11-18.md para estado remoto ya verificado. Conciliar las frases vigentes contradictorias en Roadmap (fila CF-06 y párrafo de cierre) e índice documental, conservando los registros históricos. |
| DOC02-04 / P3 | Memoria §5.3 y copia derivada | Suite SQL identificada como `Concurrency.Tests` | Las clases inspeccionadas están en `API Graphql/Tests/Services.Tests/Hardening/Gob12` con categoría `GOB12SqlConcurrency`. Usar ese proyecto/categoría y vincular SQL_CONCURRENCY_RESULTS.md. |

## Criterio finito de cierre

Un solo lote editorial con los cuatro ajustes anteriores, sin código de producto ni cambios de evidencias históricas. Sincronizar primero la fuente maestra y después su copia efímera. No reemplazar indiscriminadamente «34» por «38»: la referencia histórica de reconstrucción de Spec 196 debe conservar su procedencia.

Revisar que introducción, tabla, overview y guía distingan las dos líneas base y que el índice refleje la evidencia posterior. Corregir el SHA del handoff y ejecutar `git diff --check`. Entregar el delta para ratificación; no se solicitan nuevas suites, nuevas exportaciones ni pruebas de base de datos en DOC-02.

No se ejecutaron suites, runtime, consultas SQL ni renderizado DOCX/PDF en esta auditoría documental. La aceptación visual y material sigue en sus compuertas DF. No se efectuaron commits, pushes ni movimientos de tags.

Destino: Local AGY · Gemini 3.8 Flash High · Nativo.
