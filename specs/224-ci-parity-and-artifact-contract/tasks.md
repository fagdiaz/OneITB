# Tareas de Spec 224

- [x] **A — Calidad reproducible en CI:** Restore explícito de `Services.Tests`, replicación de filtros de categorías y adición de `oxlint@1.94.0` en frontend.
- [x] **B — Desacoplamiento de despliegue:** Sustitución de `push: [main]` ciego por `workflow_run` dependiente de `Quality Gates` (`conclusion == 'success'`) con checkout anclado a `head_sha`.
- [x] **C — Fijación de herramientas y log:** Versión de `oxlint@1.94.0` fijada en `preflight_stabilize.ps1`, registro en `DEVELOPMENT_LOG.md` y actualización del plan.
- [x] **D — Gating estricto de entradas y segregación de entornos (CONS-02):** Ratificado localmente con observaciones por Auditor Principal Astra (DICTAMEN RATIFICACION_CONS02_2026-11-18.md). 18/18 tests PASS, 10/10 guards booleanos, procedencia de juez desde ref: main, motor scripts/verify-ci-gating.mjs, timeouts AbortSignal. Activación remota en Azure/GitHub documentada como aceptación externa pendiente.
