# STABILIZATION REPORT: OneITB23

**Fecha**: {{TIMESTAMP}}  
**Feature Activa**: `{{FEATURE_DIR}}`  
**Estado General**: `BLOCKED`

---

## 1. Resumen de Compuertas

| Compuerta | Estado | Severidad | Resumen / Diagnóstico |
| :--- | :--- | :--- | :--- |
| `git-diff-check` | {{STATUS_GATE_1}} | P1 | {{SUMMARY_GATE_1}} |
| `secret-leak-and-untracked-configs` | {{STATUS_GATE_2}} | P0 | {{SUMMARY_GATE_2}} |
| `backend-dotnet-build` | {{STATUS_GATE_3}} | P0 | {{SUMMARY_GATE_3}} |
| `frontend-vite-build` | {{STATUS_GATE_4}} | P0 | {{SUMMARY_GATE_4}} |
| `backend-regression-suite` | {{STATUS_GATE_5}} | P0 | {{SUMMARY_GATE_5}} |
| `frontend-regression-suite` | {{STATUS_GATE_6}} | P0 | {{SUMMARY_GATE_6}} |
| `ef-pending-model-changes` | {{STATUS_GATE_7}} | P1 | {{SUMMARY_GATE_7}} |
| `speckit-dod-compliance` | {{STATUS_GATE_8}} | P2 | {{SUMMARY_GATE_8}} |

---

## 2. Hallazgos Detallados y Remediación

{{DETAILED_FINDINGS}}

---

## 3. Acciones Requeridas para Desbloqueo

- [ ] Resolver errores de compilación o pruebas.
- [ ] Asegurar que ningún secreto esté en el diff.
- [ ] Completar las tareas pendientes en `tasks.md`.
