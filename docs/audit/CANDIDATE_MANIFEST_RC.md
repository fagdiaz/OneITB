# Manifiesto Oficial del Release Candidate (Spec 220)

- **Fecha de emisión:** 2026-11-15
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **Tracking remoto:** `origin/feature/2026-11-01-debugger-cv-builder`
- **Especificación activa:** `specs/220-core-closure-and-application-hardening`
- **SHA del Código Candidato (Producción y Pruebas):** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a` (incorpora remediación técnica RC-04 y prueba adversarial)
- **Commit HEAD Documental Actual:** `a62c4e3642bf356b728f6fb7b1494b0d4966b294` (código de producción y pruebas idéntico a `37ed360`)
- **Base previa revisada por Astra:** `fd403c86ed63a31cb1b8090cb082a73a0d29b409`
- **Estado:** Release Candidate Académico — Core Feature Complete y Code Freeze Operativo (Certificación Integral Pendiente)

---

## 1. Declaración de Runtimes y Entorno

- **Sistema Operativo:** Microsoft Windows 10.0.26200 (x64)
- **.NET SDK / Runtime:** .NET 8.0.27 (SDK 9.0.314 con target net8.0)
- **Node.js / npm:** Node v22.13.0, npm v10.8.2
- **Base de Datos Local:** Microsoft SQL Server 2022 (`mcr.microsoft.com/mssql/server:2022-latest`, contenedor `oneitb23-sql` Up/healthy en `127.0.0.1:1433`)
- **Herramientas de Análisis:** Oxlint (96 reglas en 8 hilos), Vitest v4.1.10, HotChocolate 14.2.0

---

## 2. Inventario Reconciliado de Suites Automatizadas

Conforme a la Constitución §IX y a la reconciliación oficial de [ROADMAP.md](../project_docs/ROADMAP.md):

| Categoría | Total | Pasadas | Falladas | Omitidas | Duración | Comando / Filtro |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **Backend Ordinario (xUnit Release)** | **396** | **396** | 0 | 0 | 39 s | `dotnet test Services.Tests.csproj -c Release --no-restore --filter "Category!=GOB12SqlConcurrency&Category!=GOB15BcryptBenchmark&Category!=VendorAdvisoryGHSA"` |
| **Frontend Ordinario (Vitest)** | **389** | **389** | 0 | 0 | 38 s | `npm.cmd run test -- --run` (70 suites en verde) |
| **Subtotal Línea Base Core** | **785** | **785** | **0** | **0** | **1m 17s** | **100% PASS** |
| **Opt-in: Concurrencia SQL (GOB12)** | **11** | **11** | 0 | 0 | 14 s | `dotnet test --filter "Category=GOB12SqlConcurrency"` (SQL Server 2022 real, aislamiento serializable, ganador atómico, validación de ReceiverId en RC-04 y RowVersion) |
| **Opt-in: Canario Upstream (GHSA)** | **1** | **0** | 1 | 0 | 2 ms | `dotnet test --filter "Category=VendorAdvisoryGHSA"` (Aviso canario upstream HotChocolate 14.2.0 / GHSA-qr3m-xw4c-jqw3; conservado formalmente como FAIL documentado. Requiere actualización vendor de HotChocolate a 14.3.1+ que incorpore ParserOptions.MaxAllowedRecursionDepth; riesgo aceptado para demo académica local sin exposición pública directa) |
| **Herramienta: Calibración BCrypt (GOB15)** | N/A | N/A | N/A | N/A | 15 s | `Invoke-BCryptWorkFactorBenchmark.ps1 -EffectiveWorkFactor 12` (Benchmark standalone: dictamen `PASS_SCREENING`, factor 12) |

---

## 3. Compuertas de Preflight y Certificación Oficial (speckit-stabilize)

Ejecución histórica mediante `.agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1`:

* **Veredicto Histórico:** **PASS** (9/9 compuertas técnicas en dicho worktree)
* **Salida Histórica Persistida:** [`./PREFLIGHT_CERTIFIED_9a61e73.json`](./PREFLIGHT_CERTIFIED_9a61e73.json) (capturado históricamente sobre el worktree modificado `607dce7` previo al commit `9a61e73`, con 4 modificaciones registradas en el JSON original; no representa una ejecución limpia sobre el candidato `37ed360`).
* **Disposición de Certificación Oficial:** Las comprobaciones técnicas de bajo nivel (diff, secretos, builds, regresión ordinaria, oxlint y modelo EF) pasaron satisfactoriamente en el corte histórico; no obstante, la certificación integral del Release Candidate conforme a Constitución §IX permanece **abierta y no certificada** hasta vincular el SHA definitivo, ejecutar las suites obligatorias sobre árbol limpio y completar la aceptación manual pendiente (CF-03 a CF-06).

| N.º | Compuerta | Severidad | Estado | Respaldo / Detalle |
|---|---|:---:|:---:|---|
| 1 | `git-diff-check` | P1 | **PASS** | 0 conflictos de formato o saltos de línea. |
| 2 | `secret-leak-and-untracked-configs` | P0 | **PASS** | 0 tokens JWT, contraseñas planas o archivos `.env` en seguimiento. |
| 3 | `backend-dotnet-build` | P0 | **PASS** | Compilación Release net8.0: 0 errores / 0 advertencias. |
| 4 | `frontend-vite-build` | P0 | **PASS** | Empaquetado de producción Vite en 638 ms (569 módulos). |
| 5 | `backend-regression-suite` | P0 | **PASS** | 396/396 xUnit superadas sin omisiones. |
| 6 | `frontend-regression-suite` | P0 | **PASS** | 389/389 Vitest superadas en 70 suites. |
| 7 | `frontend-oxlint-check` | P1 | **PASS** | 0 advertencias y 0 errores sobre 218 archivos analizados. |
| 8 | `ef-pending-model-changes` | P1 | **PASS** | 0 cambios pendientes entre modelo de entidades EF Core 8 y la última migración compilada. |
| 9 | `speckit-dod-compliance` | P0 | **PASS** | 100% de tareas completas en `tasks.md`, branch autorizado y bitácora trazable. |

---

## 4. Estado y Seguimiento de Compuertas de Release Candidate (CF-03 a CF-06)

Conforme a la gobernanza de [ROADMAP.md](../project_docs/ROADMAP.md):

### CF-03: Gates Integrales, Infraestructura Local y Base Demo
- **Estado:** `[PARCIAL]` (Regresión automatizada core 785/785 PASS, suite opt-in SQL concurrente 11/11 PASS sobre SQL Server 2022, BCrypt calibrado; suites de aceptación manual/infraestructura en vivo pendientes de vinculación final sobre el candidato).
- **Evidencias adjuntas:**
  * Contenedor Docker `oneitb23-sql` verificado (puerto 1433 Up/healthy).
  * Suite opt-in de concurrencia SQL (`GOB12SqlConcurrency`) ejecutada con **11/11 PASS** sobre SQL Server 2022 ([`./SQL_CONCURRENCY_RESULTS.md`](./SQL_CONCURRENCY_RESULTS.md); ejecutada el 15/11/2026 sobre árbol limpio en HEAD `a62c4e3`, código idéntico a `37ed360`).
  * Calibración BCrypt (`GOB15BcryptBenchmark`) con dictamen `PASS_SCREENING` ([`./bcrypt-report.json`](./bcrypt-report.json)).
  * Verificador `Test-DefenseDemoReadiness.ps1` ejecutado en 478 ms con 10/10 pilares en PASS.

### CF-04: Recorrido Guiado por Roles (Seis Roles Institucionales)
- **Estado:** `[PENDIENTE]` (Aceptación manual coordinada con checklist firmado y capturas saneadas en vivo pendiente de ejecución sobre el candidato).
- **Respaldos automatizados previos:**
  * Backend: `RoleAuthorizationMatrixTests.cs` (111/111 PASS) validando operaciones a través de `Estudiante`, `Profesor`, `Egresado`, `Empleador`, `Moderador`, `Administrador` y anónimo.
  * Frontend: `roleRoutingMatrix.test.jsx` (83/83 PASS) evaluando rutas protegidas (`/admin`, `/moderacion`, etc.) para los 6 roles.
  * Auditoría visual E2E en runtime documentada en [VISUAL_AUDIT_REPORT.md](./full_audit/VISUAL_AUDIT_REPORT.md) (estimación indicativa de madurez visual del 98.50% promedio / 98.67% proporción según muestreo).

### CF-05: Validación Realtime y Aislamiento Multi-Sesión
- **Estado:** `[PENDIENTE]` (Prueba de dos navegadores reales simultáneos pendiente de ejecución sobre el runtime en vivo).
- **Respaldos automatizados previos:**
  * Suite `privateChatRecovery.gob12.test.jsx` (6/6 PASS): verificación de reconexión tras desconexión 1006, inversión de tramas replay/http, aislamiento de topic, descarte de echos y purga de caché Apollo en logout/reemplazo de usuario.

### CF-06: Manifiesto Consolidado y Congelamiento del Candidato
- **Estado:** `[ABIERTO]` (Sujeto a la satisfacción de las dependencias CF-01 a CF-05 antes del congelamiento y etiquetado final del candidato).
- **Dictamen:** Se formaliza este manifiesto vinculando SHA, métricas, suites, salidas y salvedades con total transparencia documental.

---

## 5. Delimitación de F05 y Alcance de Demo

- **Hallazgo F05 (Gestión de Comisiones y Notas):**
  * **Estado:** `[PENDIENTE DE INTEGRACIÓN UI / DECISIÓN DE ALCANCE]`.
  * **Backend:** 100% implementado, migrado y probado en xUnit (`SaveSectionGradeAsync`, comisiones, concurrencia optimista `RowVersion` y `ConcurrencyConflict`).
  * **Frontend:** La interfaz actual opera de forma freeze-safe con el alcance de carrera validado institucionalmente (`UserCareer`). La selección granular por comisión permanece clasificada como integración UI pendiente para demo académica, sin comprometer la integridad de datos ni los contratos probados.

---

## 6. Brechas Externas Residuales (Sin Alteración de Código)

- `GAP-AUTH-01`, `GAP-AUTH-02`, `GAP-PRIV-01`: Remediadas en Spec 201 y ratificadas en Delta 4.
- `GAP-FILE-01`: Abierta; descarga estática en `/uploads` sin autorización por objeto (aceptación exclusiva para demo académica local).
- `GAP-INFRA-01`: Abierta; provisión de certificados TLS del destino productivo.
- `GAP-OPS-01`: Abierta; integración con plataforma centralizada de observabilidad cloud.
