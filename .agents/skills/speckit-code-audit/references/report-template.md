# Reporte de Auditoría: Módulo {{MODULE_ID}} - {{MODULE_NAME}}

**Fecha y Hora:** {{TIMESTAMP}}  
**Estado del Módulo:** {{STATUS}} (Auditado al 100%)  
**Archivos Inspeccionados:** {{FILE_COUNT}} archivos (Frontend + Backend)

---

## 1. Resumen Ejecutivo del Módulo

| Métrica | Cantidad |
| :--- | :---: |
| Vistas / Pantallas Analizadas | {{VIEWS_COUNT}} |
| Botones y Acciones Interactivas | {{BUTTONS_COUNT}} |
| 🔴 Hallazgos Críticos (Bloqueantes / Rotos) | {{CRITICAL_COUNT}} |
| 🟡 Advertencias (Gaps / UX / Incompletos) | {{WARNING_COUNT}} |
| 🟢 Oportunidades de Reducción de Código | {{OPPORTUNITY_COUNT}} |

---

## 2. Matriz Detallada de Componentes y Botones

### Vista: `{{VIEW_NAME}}` (`{{FILE_PATH}}`)
* **Ruta de Acceso:** `{{ROUTE}}`
* **Roles Autorizados:** `{{ROLES}}`

#### Botón / Acción: `{{ACTION_NAME}}`
* **Ubicación:** Línea `{{LINE_NUMBER}}` en `{{COMPONENT_FILE}}`
* **Comportamiento en UI:**
  * Estado de carga (Loading): [Sí / No / Parcial]
  * Manejo de error: [Sí / No]
  * Empty State: [Sí / No]
* **Contrato GraphQL:**
  * Operación: `{{OPERATION_NAME}}` (`mutation` o `query`)
  * Hook: `{{HOOK_NAME}}`
  * Caché de Apollo: [Invalida / Cache Update / Sin actualizar]
* **Backend (.NET / HotChocolate):**
  * Resolver: `{{RESOLVER_CLASS}}.cs` -> `{{METHOD_NAME}}`
  * Autorización: `{{AUTH_ATTRIBUTE}}`
  * Servicio de Dominio: `{{SERVICE_CLASS}}.cs`
  * Persistencia: `{{DB_CONTEXT_OPERATION}}`
* **Diagnóstico y Estado:**
  * **Categoría:** [🔴 CRITICAL | 🟡 WARNING | 🟢 OK | ⚪ MOCK]
  * **Detalle:** {{ISSUE_DESCRIPTION}}
  * **Propuesta de Cierre (Rápida & Segura):** {{FIX_PROPOSAL}}

---

## 3. Oportunidades de Optimización y Reducción de Líneas

### A. Código Muerto / Huérfano
* `{{FILE_PATH}}#L{{LINE}}`: {{DESCRIPTION}}

### B. Boilerplate y Simplificación
* `{{FILE_PATH}}#L{{LINE}}`: {{DESCRIPTION}}
  * *Potencial de reducción:* De ~{{ORIGINAL_LINES}} líneas a ~{{REDUCED_LINES}} líneas.

### C. Mocks y Logs Residuales
* `{{FILE_PATH}}#L{{LINE}}`: `{{CODE_SNIPPET}}`

---

## 4. Conclusiones y Próximos Pasos para este Módulo
{{CONCLUSIONS}}
