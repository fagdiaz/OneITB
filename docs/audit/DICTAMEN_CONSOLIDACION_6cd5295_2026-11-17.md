# Dictamen de consolidación — 6cd5295 — 17/11/2026

## Dictamen ejecutivo

**REQUIERE AJUSTES para ratificar el cierre integral de 221–228.**
**Conformidad para iniciar la preparación académica DF-01 a DF-08**, sin declarar todavía aprobado el paquete definitivo ni trasladar al nuevo código la certificación histórica de otro corte.

La extracción de UserAvatar es acotada y no muestra modificaciones de operaciones GraphQL en el diff revisado. Se ejecutaron 18 tests de UserAvatar y 6 de Feed.interactions: **24/24 PASS**, exit 0. No se repitieron backend, frontend completo, SQL, preflight, navegador ni CI remoto. Las cifras 396/407 de la suite completa siguen siendo las informadas por AGY, no resultados de esta sesión.

Es razonable **diferir 229**: ORG-14 era una mejora opcional, no un bloqueo de la entrega. No requiere reestructurar Startup ni DI ahora. No se reabre CF-05.

## Corte y procedencia

- HEAD local: 6cd5295d7768c34c32d37d54e0aad3d01f4749f6.
- Ref local origin/feature/2026-11-01-debugger-cv-builder: mismo SHA. Eso no sustituye una consulta remota actual.
- Tag local v1.0.0-rc: objeto anotado 9faddd97ba39415fbe3d0a93306fefa17ba5b9ae; destino d806822102eb7eec7542318c3d134eadadd390ea.
- Consulta git ls-remote del tag: **BLOCKED por resolución de red**, getaddrinfo() thread failed to start. Publicación remota no verificada independientemente; no se pone en duda como hecho contrario.
- Puntero observado: specs/220-core-closure-and-application-hardening.
- Árbol al iniciar: prompt.txt modificado. La afirmación de limpieza pudo corresponder a un instante anterior; no describe el estado de recepción.
- Diff 37ed360..HEAD: backend sin cambios; frontend modifica Feed.jsx y añade UserAvatar.jsx/UserAvatar.test.jsx.
- 88faa50 incluye 1048 archivos cambiados, no solo unos pocos documentos; parte importante es la incorporación de specs antes ignoradas. Se revisó el alcance por nombres/diff, no se certificó el saneamiento integral de todo ese material.
- Se aplicó agent-auditor-architect/SKILL.md y se consultaron constitución, spec activa, roadmap, framework, manifiesto, índice y artefactos pertinentes.

## Matriz de hallazgos

| ID | Prioridad | Componente / vector de fallo | Evidencia y riesgo |
|---|---|---|---|
| CONS-01 | P1 | Identidad del candidato y baseline | CANDIDATE_MANIFEST_RC.md:7,32–33,119 continúa declarando código/tests inmutables en 37ed360 y 785 pruebas. HEAD tiene cambios de frontend y AGY informa 396+407=803. Preflight:11–12 sigue usando defaults 396/389. Se mezclan un candidato histórico y una revisión posterior. |
| CONS-02 | P1 | Despliegue sin control equivalente en todas las entradas | Los workflows incorporan workflow_run y head_sha, mejora válida; ambos conservan workflow_dispatch como condición suficiente. El frontend además acepta pull_request sin depender del resultado de Quality Gates. Por ello no está acreditado el cierre completo del contrato de gating. |
| CONS-03 | P2 | Aserciones insuficientes de aislamiento/cleanup | tests/test_runner_isolation.ps1:113–123 verifica dos cadenas del archivo histórico, no su hash ni dos ejecuciones separadas. El runner:244–280 espera procesos, pero ignora fallos y puede agotar retries de borrado sin reportar fallo. Eso no demuestra el teardown garantizado y la preservación por hashes declarados. |
| CONS-04 | P2 | Procedencia y aceptación editorial | EXPORT_CHECKLIST nuevo deja los dos hashes de memoria como “Registrado en entorno de compilación”; el hash de defense-content.json difiere del archivo actual. Marcas de aceptación visual no se sostienen en esta revisión. El FIGURE_MANIFEST existente no tiene delta entre d806822 y HEAD, aunque el handoff lo describe reconciliado. |
| CONS-05 | P2 | Cierre procedimental no trazado | El puntero entregado sigue en 220; tasks de 228 marca actualización a 228 como completada. 221–224 tienen spec/tasks pero no plan ni evidencia propia en sus directorios; los siete cierres se agrupan en 88faa50. EVIDENCE228 afirma 9 casos, handoff 12, ejecución real 18. ROADMAP no registra explícitamente estos cierres 221–228 ni la nueva baseline 407. No basta marcar casillas para certificar ocho ciclos. |

P1 se refiere a integridad del cierre y control de publicación, no a una vulnerabilidad explotada demostrada. No se atribuye al refactor un fallo funcional.

## Análisis y remediación mínima

### CONS-01 — Separar el release histórico de la revisión actual

1. Mantener v1.0.0-rc intacto en d806822. Sus 785 pruebas y evidencia continúan siendo historia válida.
2. Registrar 6cd5295 como revisión posterior con backend equivalente y delta frontend, evitando afirmar igualdad total con 37ed360.
3. Sincronizar estado actual en README, ROADMAP, manifiesto e índice: **803 core si se acredita 396/407**, y 11 SQL separados. No reemplazar métricas históricas de ejecuciones anteriores.
4. Hacer que el contrato de baseline vigente y el comando del preflight correspondan al corte. Los parámetros ya existen; no hacen falta nuevas suites de producto. Registrar valores esperados/configuración y SHA/herramienta junto a la salida.
5. Adjuntar el resultado original del preflight del corte actual y sus suites. Si no existe, ejecutarlo una vez; no presentar PREFLIGHT_CERTIFIED_91d57f9.json como ejecución de 6cd5295.
6. No es necesario emitir ahora otro tag para empezar a maquetar.

Aceptación falsable: con esperado 407, un resumen frontend 406 debe ser rechazado y 407 real puede aprobar si pasan las demás compuertas. La ejecución simulada nunca certifica. El manifiesto identifica inequívocamente qué versión se demostrará.

### CONS-02 — Delimitar y controlar las entradas de deploy

El restore explícito de Tests, los filtros de categorías y oxlint fijado a 1.94.0 son mejoras comprobadas en YAML. El checkout por head_sha también mejora el enlace con el evento exitoso.

Falta aplicar el contrato de autorización/calidad a la entrada manual o documentar una excepción deliberada con controles equivalentes. Separar preview de PR del destino de producción y comprobar los permisos/secretos asociados. No asumir que protecciones remotas existen: registrarlas o dejar esa parte pendiente.

Aceptación falsable, sin publicar a producción:
- Quality Gates falla para SHA X: ninguna vía habilita un despliegue productivo de X.
- Quality Gates pasa para Y: no autoriza X.
- Dispatch manual sin evidencia válida de X: bloqueo, o excepción expresamente definida y auditable.
- Preview de PR se identifica como tal y no puede promoverse por fuera de la política productiva.

No se solicita cambiar proveedor ni ejecutar una publicación para demostrarlo.

### CONS-03 — Ajustar el checker, no repetir toda la aceptación funcional

Conservar la instrumentación de puertos, Chrome configurable, TLS acotado y runId ya añadida. Completar:
- Hash antes/después de evidencia protegida, comparado realmente.
- Dos runId distintos con rutas no coincidentes; comprobar rechazo o aislamiento de un runId repetido.
- Fallo explícito cuando el proceso propio, puerto o perfil persiste tras el timeout de cleanup.
- Capturar comandos y resultados originales de estos controles.

El caso actual que busca una fecha y “100% PASS” no detecta alteraciones en el resto del archivo. Puede retenerse como comprobación de formato, pero no llamarse prueba de inmutabilidad. No hace falta repetir roles, SQL o CF05 completo por esta corrección del instrumento.

### CONS-04 — Hashes reales y estados editoriales honestos

Hashes calculados en esta sesión, sin modificación ni render de binarios:

| Archivo | SHA256 actual | Resultado |
|---|---|---|
| Memoria v2_OFICIAL_IMPRENTA.docx | 5bcf62a8cc03ee069f733c2e2dbaee328c3c5409f134747b4548ad2413a4f46e | Existe; el checklist debe consignarlo |
| Memoria v2_OFICIAL_IMPRENTA.pdf | bf81883523912abeb7cf6c72bc45534fd49c4f96e028196fd83bcc9a48a03437 | Existe; el checklist debe consignarlo |
| OneITB23-Diapositivas.pdf | cd42be9ccf71a7fd387dcd783e9e1f0e2bc7d353c764baadf84720fbb2eefbc6 | Coincide con checklist |
| OneITB23-Defensa.pptx | 70e8f5f6b4e195697e80b396ca1d29e8c6b80a0dad38c8992709775007319acf | Coincide con checklist |
| OneITB23-Paquete-maestro.pdf | c1c34069d859ee7f43f22ab149ec3b70059bb01e28d162de2cedf158d9c935be | Coincide con checklist |
| defense-content.json | f505cdf98ce0d442bf13da602bf65f03a48581b18ad098e0ca27adbcb53ec51c | NO coincide con 26a5189… citado |

Un hash coincidente acredita identidad de archivo, no calidad visual ni sincronización con la fuente actual. Antes de reemplazar el hash de JSON, averiguar si cambió la fuente después de generar PPTX/PDF y qué salidas deben regenerarse. No actualizar checksums para esconder una divergencia de contenido.

Completar la matriz fuente→salida→ejecución/revisión. Si APA/A4 y figuras aún están por revisar en DF, etiquetarlas pendientes, en lugar de sostener aprobación por casillas. No se exige terminar la maquetación como requisito para empezarla.

### CONS-05 — Regularizar el registro sin inventar historia

Registrar el trabajo como realmente ocurrió: lotes agrupados en 88faa50 y extracción posterior en 6cd5295. Aclarar si se aceptaron como lotes de la spec 220 o como specs independientes con una excepción de proceso; conservar evidencias existentes y fechas reales. No crear retrospectivamente ocho certificados ficticios ni cambiar el puntero solo para aparentar un ciclo cumplido.

Corregir el conteo UserAvatar a **18** (la parametrización de seis roles expande un caso), y el artefacto EVIDENCE.md, que además no contiene salida original ni comando de suite completa. Corregir tareas de 224 que todavía citan oxlint@0.15.11 aunque código usa 1.94.0. Registrar en ROADMAP el resultado y las salvedades, con un puntero activo compatible con el próximo trabajo.

El lote documental único puede cerrar CONS-01/04/05 conjuntamente; CI y runner se corrigen en lotes independientes y breves. No implementar 229 para resolver este dictamen.

## Verificación independiente realizada

Comando lógico:
node node_modules/vitest/vitest.mjs run src/Components/publication/UserAvatar.test.jsx src/Components/publication/Feed.interactions.test.jsx

Se ejecutó desde FrontEnd/OneItb-FE. El primer intento falló antes del descubrimiento por EPERM al renombrar temporales en el sandbox: 0 tests ejecutados. Se reintentó con TMP/TEMP del proceso hijo en .tmp/ratification-6cd5295, sin cambiar código/configuración del producto:
- UserAvatar: 18/18.
- Feed.interactions: 6/6.
- Total: 24/24, 2 archivos, exit 0.
- Vitest 4.1.10; duración informada 3.54 s.
- Dos avisos de React Router Future Flag en stderr; no se ocultaron ni se clasifican como fallos de assertions.
- git diff --check pasó antes de redactar este dictamen.

No se abrieron servidores ni navegadores. Los archivos temporales se usan solo para el runner de pruebas, no como evidencia de aceptación de release.

## Decisión operativa

- Refactor de avatar: **conformidad acotada al diff y las 24 pruebas ejecutadas**.
- Backend 229: **diferimiento aceptable**, deuda menor post-defensa.
- Preparación de memoria/figuras/diapositivas/guion: **puede avanzar**.
- Cierre integral “221–228 100% certificadas” y aprobación final de entrega: **no ratificados hasta resolver CONS-01 a CONS-05**.
- No repetir auditoría general ni CF05. La siguiente revisión se limita a estos cinco puntos, sus deltas y su evidencia.

Salida literal de la ejecución focalizada: [artefacto JSON](DICTAMEN_CONSOLIDACION_6cd5295_2026-11-17.tests.json).

## Revisión de Lote 1 — 17/11/2026

**Resultado: CONS-04 resuelto en procedencia documental; CONS-01 y CONS-05 parcialmente resueltos.** Preparación académica habilitada; CONS-02/03 permanecen abiertos y no se revisaron en este lote.

Comprobación independiente: HEAD permanece 6cd5295; nueve archivos tracked modificados contando prompt.txt, más los dos artefactos de auditoría anteriores sin versionar. No hay diff de producto. git diff --check PASS. No se repitieron tests.

Los dos hashes de memoria coinciden al recalcularlos. Git show de defense-content.json confirma: padre de 31854e4 = 26a5189b0ba3659614bd053a6e9b7efb3c36c506b5be985ddf48b1b67cf407a2; 31854e4, HEAD y disco actual = f505cdf98ce0d442bf13da602bf65f03a48581b18ad098e0ca27adbcb53ec51c. La revisión visual y la regeneración de derivados siguen pendientes en DF. No se certifica por estos hashes el contenido visual.

Lista cerrada de pendientes documentales:
1. En CANDIDATE_MANIFEST_RC.md se documentan -ExpectedBackendCount/-ExpectedFrontendCount, que NO existen. El script declara -ExpectedBackendBaseline/-ExpectedFrontendBaseline. Usar los nombres reales con 396/407 y conservar el resultado como informado hasta vincular el preflight real del corte.
2. El manifiesto afirma vinculación con ejecución completa, pero no enlaza su salida original para 6cd5295. Enlazarla si existe; si falta, registrar pendiente y ejecutar una vez cuando corresponda certificar. SQL11 debe mantener su corte original salvo que exista una corrida nueva, no presentarlo por arrastre como ejecución actual.
3. tasks228 mantiene [x] actualizar puntero a228, incompatible con el estado entregado220 sin explicación de transición/restauración. Registrar lo ocurrido o la excepción aceptada, no inventar activación. ROADMAP no debe certificar ocho ciclos secuenciales por registrar dos commits. EVIDENCE228: son 12 pruebas simples más seis parametrizadas (13 declaraciones contando it.each), no 12 declaraciones en total. No declarar 100% de cobertura medida sin informe de coverage.
4. El manifiesto dice que no se ejecutó push del tag, mientras AGY informó que fue publicado. Esta revisión no verificó el remoto. Diferenciar publicación informada de verificación independiente pendiente; no transformar falta de acceso en prueba de que no se publicó.

No se agregan requisitos de producto ni otra auditoría integral. Con estas precisiones puede cerrarse el ajuste documental en su alcance; la certificación completa actual conserva su dependencia de evidencia real.

## Ratificación del ajuste documental de Lote 1 — 17/11/2026

**APROBADO en su alcance documental.** Se comprobaron en disco las cuatro precisiones solicitadas: parámetros reales del preflight, separación entre 803 pruebas informadas y acreditación pendiente, conservación del corte SQL original, trazabilidad de sub-lotes/puntero y desglose de 18 tests, además del estado remoto del tag como pendiente de verificación independiente.

- CONS-04: procedencia documental resuelta; revisión visual y regeneración de derivados permanecen en DF.
- CONS-05: conciliación del registro resuelta. Se reconoce la agrupación real como sub-lotes; no se certifican retrospectivamente ocho ciclos independientes ni se convierte la excepción registrada en regla general.
- CONS-01: conciliación documental resuelta. **La acreditación técnica completa de 6cd5295 continúa pendiente del preflight real del corte**; las 24 pruebas focalizadas no la sustituyen.
- CONS-02 y CONS-03: abiertos, fuera del alcance de este lote.
- Publicación remota del tag: informada por AGY, verificación independiente pendiente.

HEAD permanece 6cd5295. No hay modificaciones de producto ni del puntero. git diff --check PASS. Esta revisión no repitió suites, red, navegador ni render editorial. No se necesitan nuevas rondas sobre estas cuatro precisiones si no cambian los documentos revisados.

Siguiente lote técnico: CONS-02, control de entradas manual/PR de CI sin despliegue productivo. DF-01 a DF-08 puede avanzar en preparación. No se declara cierre global del release ni aprobación de imprenta.
