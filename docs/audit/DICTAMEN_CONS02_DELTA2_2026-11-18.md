# CONS-02 — Motor compartido / Delta 2 — 18/11/2026

**Dictamen: REQUIERE AJUSTES ACOTADOS EN CI-01.** CI-05: corregidos el motor paralelo y el caso contradictorio; suite focalizada ejecutada independientemente, **15/15 PASS, exit 0**. Esto no equivale a certificación remota del pipeline. Se conserva la conformidad previa sobre CI-02/03/04 en su alcance documental/estático.

Base HEAD: 6cd5295d7768c34c32d37d54e0aad3d01f4749f6. Rama feature/2026-11-01-debugger-cv-builder; puntero 220. El lote sigue sin commit: los hashes del artefacto de evidencia identifican los archivos realmente revisados.

## Mejoras ratificadas en este alcance

- Workflows invocan scripts/verify-ci-gating.mjs; tests importan evaluateGatingPolicy del mismo módulo. PS1 delega en Node y propaga el código de salida, según inspección.
- Inputs por env, validación hexadecimal, rechazo de repositorios vacíos y distintos, salida target_sha/deploy_env.
- Dispatch evalúa el run de mayor ID aplicable, incluidos estados no completados, sin buscar un éxito histórico cualquiera.
- Pruebas de política real: fallo posterior, ejecución pendiente, control positivo, error de API simulado, polling y fork. Sin afirmación de cobertura universal o ejecución de Azure.
- git diff --check PASS; producto sin cambios locales respecto a HEAD.

## Hallazgos pendientes

| ID | Severidad | Componente | Riesgo y demostración |
|---|---|---|---|
| CI-01/A | P1 | verify-ci-gating.mjs:91-114 | workflow_run retorna allowed:true sin consultar el estado vigente. Inyectada una fuente con run 102 failure posterior al success del evento, el motor devuelve Production/allowed:true y fetchCalls:0. La regla contra éxito obsoleto solo protege dispatch. |
| CI-01/B | P1 | backend workflow:31-32; frontend:36-37,60-63; script:117 | El checkout del verificador no fija referencia confiable: usa la referencia del evento. Un PR o dispatch en feature puede cambiar el propio juez. Production frontend depende únicamente de deploy_env devuelto por ese juez. Además, dispatch en refs/heads/feature/example con target main aprobado devuelve allowed:true; no se valida el contexto main exigido por production_branch. |
| CI-01/C | P2 operativa | verify-ci-gating.mjs:45-46,186-230 | El límite de intentos no limita una petición fetch pendiente. No hay AbortSignal/plazo explícito por solicitud; el fallback execSync tampoco tiene timeout. Las pruebas actuales simulan rechazo inmediato, no una conexión detenida. |

### Corrección mínima de A

Reutilizar la verificación de evidencia vigente en ambas entradas productivas, conservando el rechazo inicial del evento no exitoso o de origen incorrecto. Registrar run_id/run_attempt autorizados. Un evento success retrasado no debe autorizar si la consulta vigente devuelve failure, queued o in_progress. Si la API no permite verificarlo, bloquear. No repetir suites de producto.

### Corrección mínima de B

Separar la procedencia de la política de la del candidato. Cargar el verificador desde una referencia aprobada de main o un SHA confiable fijado por la gobernanza, registrando su SHA; nunca desde el head/merge de PR ni desde la entrada target_sha. Mantener el checkout del producto anclado al SHA validado.

Para dispatch productivo exigir refs/heads/main antes de ejecutar política/código del candidato. Añadir en los jobs productivos una condición explícita de evento/contexto permitido independiente de deploy_env: pull_request nunca entra en Production, aun con output falsificado. La rama/ref del evento y el SHA del código candidato son conceptos distintos.

Esto evita la autorreferencia introducida al extraer el script compartido. No se afirma explotación en Azure ni ausencia de protecciones remotas: los GitHub Environments y permisos reales no se inspeccionaron. Mantenerlos como aceptación externa. Un guard local no sustituye protección remota de workflows/main.

### Corrección operativa de C

Usar un plazo explícito por petición (AbortSignal/AbortController), más un límite global coherente para el polling y timeout-minutes del job. Eliminar el fallback gh si Node 20 es requisito, o darle ejecución sin shell y timeout. Probar una petición que no responde y comprobar rechazo dentro del presupuesto; no basta lanzar un Error instantáneo en un mock.

## Criterios fijos para la próxima revisión

1. Conservar las 15 pruebas PASS; extender el MISMO motor con workflow_run success antiguo + estado vigente failure/pending => bloqueo; success vigente correcto => permite SHA exacto y registra run/attempt. API caída => bloqueo.
2. Dispatch desde feature => rechazo; desde main con SHA main acreditado => permite. Verificar que el checkout del juez procede de la referencia confiable y que PR con deploy_env falsificado a Production no habilita jobs productivos. Validar el grafo/condiciones del YAML, no solo buscar strings globales.
3. Timeout real de la capa HTTP mediante fixture controlado y sin conexión externa: petición sin respuesta termina dentro del plazo, con salida bloqueante y cleanup. Parser/validador YAML y comprobación de formato antes de informar cierre.

No se requieren despliegues ni API de producción para estas regresiones. Entregar un único delta con resultados reales; mantener D de spec224 pendiente hasta ratificación. No reabrir Lote 1, CF-05 o las correcciones estáticas ya aceptadas. CONS-03 separado; preflight 803 pendiente; DF habilitado.

## Evidencia y límites

- node tests/test_ci_gating.mjs: 15/15 PASS, exit 0, stderr vacío.
- Casos adversariales ejecutados contra el módulo real en proceso Node independiente con fetchRuns inyectado; sin red: A devuelve allowed:true sin consultar; dispatch en feature también allowed:true. Inspección de opciones de fetch confirma ausencia de signal.
- Primer intento de importar el módulo dentro del REPL falló porque process no está expuesto en ese entorno; se repitió correctamente en proceso Node. No fue un fallo del motor.
- git diff --check exit 0 (avisos LF/CRLF preservados); git diff --numstat HEAD -- API Graphql / FrontEnd vacío; SHA confirmado.
- No se ejecutaron PS1, validación integral YAML/actionlint, GitHub Actions remoto, Azure, suites funcionales ni preflight. No commits/push/tag ni cambios de producto/workflows/tests. Se escriben solo dictamen, evidencia y prompt.
- Fuente primaria sobre checkout por defecto: [actions/checkout v4](https://github.com/actions/checkout/blob/v4/README.md), referencia/SHA del evento cuando no se fija ref.

**Destino: Local AGY · Gemini 3.8 Flash High · Nativo.**
