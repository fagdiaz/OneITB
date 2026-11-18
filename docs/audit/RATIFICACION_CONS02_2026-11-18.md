# Ratificación CONS-02 — 18/11/2026

**DICTAMEN: APROBADO CON OBSERVACIONES, en alcance de revisión local de código/configuración y pruebas de política.** Se ratifica la resolución de los bloqueos CI-01/A, CI-01/B y CI-01/C y del defecto de pruebas CI-05. Se conservan las conformidades previas de CI-02/03/04. CONS-02 puede cerrarse como remediación local revisada; no se certifica ejecución remota ni despliegue productivo.

Base HEAD: 6cd5295d7768c34c32d37d54e0aad3d01f4749f6; rama feature/2026-11-01-debugger-cv-builder; spec activa 220. Los archivos revisados siguen como delta sin commit: las huellas SHA-256 de la evidencia adjunta, no HEAD por sí solo, identifican esta remediación.

## Verificación de cierre

| Ítem | Evidencia | Dictamen local |
|---|---|---|
| CI-01/A: success retrasado | workflow_run ahora consulta API y aplica SHA, main, repositorio, estado y conclusión vigentes. Casos 9/10 rechazan fallo y ejecución en curso; caso 11 admite control positivo y registra run/attempt. | Resuelto |
| CI-01/B: procedencia de política | Ambos verify_quality_gate fijan checkout ref main. Dispatch feature se rechaza. Ambos jobs productivos exigen un evento permitido y main para dispatch, independientemente del output. | Resuelto en configuración |
| CI-01/C: timeout | fetch recibe AbortSignal; temporizador se limpia en finally y fallback execSync retirado. Caso 14 usa una promesa detenida que rechaza al abortarse; ambos jobs tienen timeout-minutes 15. | Resuelto |
| CI-05: un único motor | Suite importa el módulo realmente invocado por los workflows; 18/18 casos ejecutados, exit 0, stderr vacío. | Resuelto en casos evaluados |
| Integridad local | git diff --check exit 0; git diff --numstat HEAD -- API Graphql / FrontEnd vacío. | PASS |

## Comprobación adicional del guard productivo

Se extrajo el texto de if de deploy/backend y deploy_production/frontend y se evaluaron sus operadores booleanos en un contexto JavaScript controlado. Cinco escenarios por workflow, siempre con outputs Production y target_sha no vacío: PR => false; dispatch feature => false; dispatch con ref vacío => false; dispatch main => true; workflow_run => true. **10/10 resultados esperados.**

Es una comprobación local de las expresiones efectivamente escritas, no una ejecución del scheduler de GitHub ni un parser integral de YAML. Los controles positivos suponen cumplidas las dependencias needs; no afirman que un job se ejecute si esas dependencias fallan. Estos diez escenarios no se suman a la baseline core 803 ni se presentan como nueva suite del producto.

## Observaciones no bloqueantes y límites

| ID | Severidad | Observación / tratamiento |
|---|---|---|
| OBS-CI-01 | P3 | El módulo aislado aún admite GITHUB_REF ausente o el alias main en dispatch (línea 165); no coincide con la afirmación de comparación estricta del handoff. Se reprodujo allowed:true sin ref con evidencia válida. Ambos guards productivos rechazan ese contexto, por lo que no es un bypass de despliegue en esta composición. Registrar límite; si se reutiliza el módulo sin esos guards, exigir exactamente refs/heads/main. No obliga a otra ronda del lote actual. |
| OBS-CI-02 | P3 / aceptación externa | ref main identifica la fuente de política, pero no prueba protección de rama, presencia del nuevo script en main ni activación remota. En la integración autorizada registrar SHA real del checkout de política y confirmar que main contiene el motor. No usar target_sha del candidato como fuente del juez. |
| OBS-CI-03 | P3 / alcance de evidencia | No se ejecutaron parser/actionlint integral, GitHub Actions, consulta API real, wrapper PS1 ni Azure. La suite contiene comprobaciones textuales y pruebas del módulo con fixtures; no llamarla certificación total de YAML/proveedor. Antes de activar despliegues validar workflows y protecciones en el entorno remoto sin publicar producto. |

Los 40 intentos no equivalen a 600 segundos de tiempo total: también cuentan peticiones HTTP. El límite global efectivo es el timeout del job de 15 minutos; una secuencia de timeouts puede ser cancelada por GitHub antes de llegar al último intento. No afecta al bloqueo seguro.

No hay vulnerabilidad productiva demostrada pendiente dentro de los tres bloqueos revisados. Esta afirmación se limita a los escenarios y configuración examinados; no es garantía de ausencia universal de defectos.

## Evidencias y operaciones

- node tests/test_ci_gating.mjs: 18/18 PASS, exit 0.
- git diff --check: exit 0; avisos LF/CRLF distinguidos de errores.
- git diff --numstat HEAD -- 'API Graphql' FrontEnd: vacío.
- git rev-parse HEAD: base indicada.
- Escenarios de guards y control de ref ausente registrados en RATIFICACION_CONS02_2026-11-18.checks.json junto con stdout/stderr y hashes.
- Sin cambios de workflows, motor, tests ni producto por auditoría. Sin servicios, Git remoto, commits, pushes o tags.

## Continuidad autorizada por este dictamen

Local AGY puede reconciliar spec224/tasks y documentación: CONS-02 ratificado localmente con observaciones; activación remota pendiente. Preservar historial y no declarar despliegue aprobado/ejecutado.

Siguiente lote técnico: CONS-03 (aislamiento y cleanup de runners), acotado a hashes antes/después, dos runId aislados y fallo explícito ante proceso/perfil/puerto residual. No repetir auditoría CF-05 ni abrir Spec 229. CONS-01 conserva preflight 803 pendiente y verificación independiente del tag remoto; preparación DF-01 a DF-08 habilitada. Git sigue sujeto a autorización explícita del usuario.

**Destino: Local AGY · Gemini 3.8 Flash High · Nativo.**
