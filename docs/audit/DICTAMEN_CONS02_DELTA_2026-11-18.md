# CONS-02 — Revisión del delta del 18/11/2026

**Dictamen: REQUIERE AJUSTES ACOTADOS.** Base HEAD 6cd5295d7768c34c32d37d54e0aad3d01f4749f6; cambios de workflows y tests sin commit. No es una ejecución remota de GitHub/Azure. Se aplica agent-auditor-architect, Constitución VII/IX y precedencia de evidencia ejecutable.

## Mejoras aceptadas por inspección

- CI-02: corregida la expresión con negación en frontend línea 30. No reabrir este defecto. No equivale a una validación integral con parser/actionlint, que no se ejecutó.
- CI-03: ambos checkouts de QG usan el head de PR, igual que preview; agregado polling de hasta 40 intentos/15 s y rechazo de forks identificados. Remediación implementada; falta probar el mecanismo real con fixtures.
- CI-04: retirados los named environments Production/Preview; producción declara production_branch main y preview/close usan el contexto nativo de PR. Conforme en configuración; no afirmar despliegue ni teardown ejecutados en Azure. El contexto real del dispatch debe ser main para que production_branch no clasifique el evento como preview.
- CI-01: inputs por env y regex SHA-40, sin interpolación del input en run; filtro de main añadido al dispatch.
- CI-05: error de sintaxis Node corregido; estado de spec224 ahora pendiente de ratificación. git diff --check PASS (exit 0; avisos de conversión LF/CRLF conservados, no confundirlos con errores).

## Pendientes de los mismos hallazgos

| ID previo | Severidad | Evidencia local | Corrección de cierre |
|---|---|---|---|
| CI-05 | P2 | test_ci_gating.mjs:63-73 exige que INPUT_TARGET_SHA contenga la expresión de GitHub y simultáneamente niega su presencia en todo el archivo. La corrida real termina exit 1 en Caso 3, después de dos PASS. test_ci_gating.ps1:59-65 repite la contradicción. | Comprobar ausencia de interpolación solo en los bloques run, permitiendo env. Ejecutar la suite final y guardar stdout/stderr/código real. |
| CI-05 | P2 | evaluateGatingContract (mjs:128-240) y Evaluate-Gating (ps1:98-134) son implementaciones paralelas, no llamadas al Bash de los workflows. El caso 15 muta otra función, no el gate real. El PS1 contiene 13 llamadas Assert-GateTest, no 15. | Un solo ejecutor de política compartido por workflows/tests, o extraer y ejecutar los bloques Bash reales con gh simulado y jq real. Puede usarse Node sin dependencias nuevas. PS1 puede ser un wrapper del mismo ejecutor y propagar exit code. No mantener dos motores desconectados. |
| CI-01 | P1 | Backend:79/104 y frontend:94/120 rechazan repositorio distinto solo si no está vacío. Frontend:128 hace lo mismo con PR_HEAD_REPO. Identidad ausente pasa el control. | Comparación estricta de igualdad con repositorio confiable: ausente, null o vacío bloquean. En la respuesta comprobar SHA exacto, origen y tipo de evento autorizado, además de rama y conclusión. |
| CI-01 | P1 | Backend:86 y frontend:102 primero filtran status=completed y luego success. Un éxito histórico de X sigue siendo elegible aunque exista un intento posterior fallido o pendiente de X. | Seleccionar primero la ejecución/intento aplicable más reciente de la política confiable para X; después evaluar status/conclusion. No buscar cualquier éxito histórico. Registrar run_id/run_attempt. |

El rechazo de datos ausentes es parte de la procedencia exigida anteriormente; la exclusión de éxitos antiguos corresponde a los criterios ya fijados de fallo/pendiente bloqueante. No se abre una auditoría nueva.

### Ejemplos falsables para cerrar sin desplegar

1. Mismos SHA/repo/main: run 102 failure (más reciente) y run 101 success (anterior) => BLOCKED. Repetir con run 102 in_progress. Un único run válido completed/success => ALLOWED para ese SHA exacto.
2. Repo vacío/null/ausente o distinto => BLOCKED en dispatch, workflow_run y origen del PR. Respuesta success de Y frente a petición X => BLOCKED.
3. Probar por el mismo ejecutor usado por los workflows: main válido, feature rechazada, inputs inválidos, API 403/500/JSON inválido, pendiente→success, failure y timeout. Datos inválidos no deben llegar a checkout/deploy.
4. Mutar en memoria o copia temporal el chequeo real de main, SHA y dependencia needs; la regresión debe fallar. No cambiar los workflows de trabajo para esta prueba. Validar YAML/job graph con parser/validador, además de la política ejecutable.
5. Mantener los controles ya definidos de dos PRs/destinos y close del PR correcto; sin llamada Azure. Alinear el contexto main de dispatch productivo con production_branch main.

Para evitar otra ronda: recomendar un script Node único de decisión bajo scripts/ (fuera de producto), invocado por ambos workflows, con fixtures inyectadas en sus dependencias de API/reloj. Un wrapper PS1 no necesita reimplementar la política. La modificación queda dentro de CONS-02. Si se conserva Bash, probar el programa real incluyendo serialización de gh/jq y selección del objeto; no simular solo la intención del filtro.

## Evidencia ejecutada

- node tests/test_ci_gating.mjs: exit 1; Caso 1 PASS, Caso 2 PASS, Caso 3 FAIL; restantes no ejecutados. No acredita 15/15.
- git diff --check: exit 0.
- git rev-parse HEAD: base indicada.
- git diff --numstat HEAD -- 'API Graphql' FrontEnd: vacío.
- Lectura del handoff adjunto, tres workflows, ambas suites, contexto activo, constitución y documentos canónicos. Hashes y stdout/stderr en DICTAMEN_CONS02_DELTA_2026-11-18.checks.json.
- No se ejecutó PS1: inspección identifica la misma contradicción; el entorno de auditoría tenía timeout de arranque documentado. No se atribuye PASS ni resultado ejecutado a ese script.
- No se ejecutaron Bash remoto, API GitHub, Azure, suites de producto ni preflight completo. Sin commits/push/tag, cambios de producto o servicios persistentes.

## Continuidad

Conservar las correcciones aceptadas. Resolver CI-01 y CI-05 como un único delta pequeño, con pruebas que ejecuten la política real. CONS-02 sigue abierto hasta esa evidencia; CONS-03 separado; preflight 803 pendiente; DF habilitado. No reabrir Lote 1 ni CF-05.

Local AGY · Gemini 3.8 Flash High · Nativo.
