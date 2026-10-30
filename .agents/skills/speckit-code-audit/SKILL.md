---
name: "speckit-code-audit"
description: "Universal autonomous deep-audit engine for full-stack applications. Traces UI buttons, components, and routes to API/GraphQL contracts, backend resolvers, services, and database persistence. Identifies broken flows, missing backend wiring, security mismatches, dead code, redundant boilerplate, and code reduction opportunities. Operates strictly read-only on production code with resilient incremental checkpointing."
compatibility: "Cross-platform (Node.js, .NET, Python, React, Vue, SQL). Requires standard filesystem access for reading code and writing markdown/json audit reports."
metadata:
  author: "github-spec-kit"
  version: "1.0.0"
  type: "auditor"
---

# Speckit Code Audit - Autonomous Deep Engine

An autonomous, multi-tier audit engine that inspects full-stack applications from UI to persistence, identifying operational gaps, incomplete wiring, security risks, dead code, and code reduction opportunities.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SPECKIT AUTONOMOUS CODE AUDIT                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 1. State Ingestion & Checkpoint Discovery                     │
    │    Reads `audit_state.json` -> Identifies pending module      │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 2. Traceability Triangulation (Per View / Component)          │
    │    [UI / Button / JSX] ➔ [API / GraphQL Hook] ➔              │
    │    [Backend Endpoint/Resolver] ➔ [Service Domain & DB]        │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 3. Deep Analysis & Classification                             │
    │    - Status: Operativo / Mock / Desconectado / Roto           │
    │    - Seguridad: RBAC, Claims, Atributos de Autorización       │
    │    - Optimización: Dead code, Boilerplate, Líneas a reducir   │
    │    - Resiliencia UI: Empty state, Loading, Error handling     │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 4. Incremental Checkpoint & State Flush                       │
    │    Writes module report: `docs/audit/full_audit/MODULE_*.md`   │
    │    Updates `audit_state.json` -> Advances to next batch       │
    └───────────────────────────────────────────────────────────────┘
```

---

## 1. Operating Rules & Guardrails

1. **Strictly Read-Only on Application Code**:
   The auditor must NEVER modify, reformat, or delete application source files (`.cs`, `.jsx`, `.js`, `.ts`, `.tsx`, `.sql`, etc.). Its write permissions are strictly confined to `docs/audit/full_audit/` and `audit_state.json`.
2. **Ground Truth Over Spec Claims**:
   Never accept that a feature "works" just because a doc says it does. The code must be inspected:
   - Does the button trigger an active hook?
   - Does the backend resolver actually exist?
   - Does the EF Core query persist or is it a mock stub returning `true`?
3. **Token & Quota Economy**:
   - Inspect files batch-by-batch (module by module).
   - Do NOT dump full directories into memory. Read specific files with targeted line ranges or regex checks.
   - Update `audit_state.json` after every single module to guarantee zero progress loss upon context restart or quota exhaustion.
4. **Actionable Recommendations**:
   Every finding must have a concrete, minimal "Propuesta de Cierre" (how to fix or close it with minimum complexity respecting Code Freeze).

---

## 2. Triangulation Checklist (The 5 Dimensions)

For every component, view, and button:

### Dimension A: UI / UX Presence & States
- **Ruta & Ubicación:** Archivo exacto y número de línea.
- **Estados interactivos:** ¿Maneja `loading`, `disabled` durante mutaciones, y feedback de `error`?
- **Empty States:** ¿Qué ocurre si la consulta retorna un arreglo vacío `[]` o `null`? ¿Muestra mensaje amigable o pantalla blanca?

### Dimension B: Contrato API / GraphQL
- **Wiring Real:** ¿Llama a un `useQuery` / `useMutation` real o es un `console.log` / `alert` / handler vacío?
- **Sincronización de Caché:** Tras una mutación, ¿invalida la query, actualiza Apollo cache (`update`), o requiere un refresh manual?
- **Schema Drift:** ¿Los campos pedidos en la query coinciden exactamente con los tipos del backend?

### Dimension C: Backend, Dominio y Base de Datos
- **Resolver & Capa de Servicio:** ¿El resolver es un mero adaptador y delega en un servicio de dominio o tiene lógica acoplada?
- **Persistencia EF Core:** ¿Usa transacciones atómicas donde corresponde? ¿Usa `.AsNoTracking()` en consultas de solo lectura?
- **Riesgo N+1:** ¿Hay loops haciendo queries a la base de datos o llamadas sin proyección adecuada?

### Dimension D: Seguridad y Control de Acceso (RBAC)
- **Frontend vs Backend Alignment:** Si la UI oculta algo según el rol (`role === 'Administrador'`), ¿el backend tiene el atributo `[Authorize(Roles = ...)]` equivalente?
- **Inyección de Claims:** ¿El servicio toma el ID del usuario autenticado desde el `ClaimsPrincipal` o confía ciegamente en un parámetro que envía el cliente?

### Dimension E: Reducción de Líneas y Código Innecesario
- **Dead Code:** Componentes huérfanos, hooks sin uso, imports innecesarios.
- **Boilerplate Reducible:** Lógica de 40 líneas que puede simplificarse a 10 líneas limpias.
- **Mocks Residuales:** Variables `mockData`, fixtures de prueba o logs comentados en archivos de producción.

---

## 3. Severity Classification Matrix

Categorize every finding into one of three tiers:
- 🔴 **CRITICAL (Blocker):** Funcionalidad rota, botón sin acción, error 500 no capturado, omisión de autorización en backend, pantalla blanca ante datos vacíos.
- 🟡 **WARNING (Incompleteness / UX Gap):** Datos hardcodeados parciales, falta de feedback de carga/error, caché desincronizada tras mutación, query sin `.AsNoTracking()`.
- 🟢 **OPPORTUNITY (Optimization & Cleanliness):** Código muerto, boilerplate redundante, funciones condensables, imports sin uso.

---

## 4. Execution Workflow

1. Check `docs/audit/full_audit/audit_state.json`.
2. Determine current pending module from `modules_queue`.
3. For the active module:
   - Identify all associated routes in React Router (`App.jsx` or router configuration).
   - Trace each view's interactive elements down to GraphQL operations.
   - Inspect corresponding .NET resolvers, services, and EF Core models.
   - Run tests associated with the module if available.
4. Generate the module report in `docs/audit/full_audit/MODULE_XX_[NAME].md` using `report-template.md`.
5. Update `audit_state.json` marking the module as `COMPLETED` and setting the next module as `ACTIVE`.
6. Repeat until all modules in `modules_queue` are completed.
7. Generate the Master Audit Summary: `docs/audit/full_audit/MASTER_AUDIT_REPORT.md`.

---

## 5. Forensic Micro-Interactions Mode (MOD-10)

When auditing micro-interactions (secondary and tertiary UI actions), evaluate:
1. **Modales y Diálogos:**
   - Botón de cierre "X", botón "Cancelar", click fuera (backdrop) y tecla `Escape`.
   - Limpieza de estado local al cerrar el modal (que no quede texto viejo al reabrirlo).
2. **Menús, Dropdowns y Notificaciones:**
   - Despliegue de `NotificationBell` y cierre al clickear afuera.
   - Menús contextuales de publicaciones y comentarios (Editar, Eliminar, Reportar).
3. **Paginación y Scroll:**
   - Botones "Cargar más" / scroll infinito (manejo de fin de lista vs carga continua).
4. **Micro-Feedback y Accesibilidad:**
   - Iconos de acción sin etiqueta (`aria-label`).
   - Indicadores de cursor (`cursor-pointer` vs `cursor-not-allowed`).
