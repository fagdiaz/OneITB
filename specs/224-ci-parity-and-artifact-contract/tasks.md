# Tareas de Spec 224

- [x] **A — Calidad reproducible en CI:** Restore explícito de `Services.Tests`, replicación de filtros de categorías y adición de `oxlint@0.15.11` en frontend.
- [x] **B — Desacoplamiento de despliegue:** Sustitución de `push: [main]` ciego por `workflow_run` dependiente de `Quality Gates` (`conclusion == 'success'`) con checkout anclado a `head_sha`.
- [x] **C — Fijación de herramientas y log:** Versión de `oxlint@0.15.11` fijada en `preflight_stabilize.ps1`, registro en `DEVELOPMENT_LOG.md` y actualización del plan.
