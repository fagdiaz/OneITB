# Manifiesto Oficial del Release Candidate (Spec 220)

**Fecha de emisión:** 2026-11-15  
**Rama:** `feature/2026-11-01-debugger-cv-builder`  
**Tracking remoto:** `origin/feature/2026-11-01-debugger-cv-builder`  
**Especificación activa:** `specs/220-core-closure-and-application-hardening`  
**Base revisada por Astra:** `9a61e73b06776df19721fadf7004b4d8bffb4369`  
**Estado:** Release Candidate Académico — Core Feature Complete y Code Freeze Operativo  

---

## 1. Declaración de Runtimes y Entorno

- **Sistema Operativo:** Microsoft Windows 10.0.26200 (x64)
- **.NET SDK / Runtime:** .NET 8.0.27 (SDK 9.0.314 con target net8.0)
- **Node.js / npm:** Node v22.13.0, npm v10.8.2
- **Base de Datos Local:** Microsoft SQL Server 2022 (`mcr.microsoft.com/mssql/server:2022-latest`, contenedor `oneitb23-sql` Up/healthy en `127.0.0.1:1433`)
- **Herramientas de Análisis:** Oxlint (96 reglas en 8 hilos), Vitest v4.1.10, HotChocolate 14.2.0

---

## 2. Inventario Reconciliado de Suites Automatizadas

Conforme a la Constitución §IX y a la reconciliación oficial de [ROADMAP.md](../../docs/project_docs/ROADMAP.md):

| Categoría | Total | Pasadas | Falladas | Omitidas | Duración | Comando / Filtro |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **Backend Ordinario (xUnit Release)** | **396** | **396** | 0 | 0 | 42 s | `dotnet test Services.Tests.csproj -c Release --no-restore --filter "Category!=GOB12SqlConcurrency&Category!=GOB15BcryptBenchmark&Category!=VendorAdvisoryGHSA"` |
| **Frontend Ordinario (Vitest)** | **389** | **389** | 0 | 0 | 38 s | `npm.cmd run test -- --run` (70 suites en verde) |
| **Subtotal Línea Base Core** | **785** | **785** | **0** | **0** | **1m 20s** | **100% PASS** |
| **Opt-in: Concurrencia SQL (GOB12)** | **10** | **10** | 0 | 0 | 10 s | `dotnet test --filter "Category=GOB12SqlConcurrency"` (SQL Server 2022 real, aislamiento serializable, ganador atómico y RowVersion) |
| **Opt-in: Calibración BCrypt (GOB15)** | **1** | **1** | 0 | 0 | 15 s | `Invoke-BCryptWorkFactorBenchmark.ps1 -EffectiveWorkFactor 12` (`PASS_SCREENING`, factor 12) |
| **Opt-in: Canario Upstream (GHSA)** | **1** | **0** | 1 | 0 | 2 ms | `dotnet test --filter "Category=VendorAdvisoryGHSA"` (Aviso canario upstream HotChocolate 14.2.0 / GHSA-qr3m-xw4c-jqw3) |
| **Total General Ejecutado** | **797** | **796** | **1** (canario) | **0** | **~2m** | **Regresión, endurecimiento y concurrencia verificados** |

---

## 3. Compuertas de Preflight y Certificación Oficial (speckit-stabilize)

Ejecución oficial mediante `.agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1 -RunTests $true -Certify`:

* **Veredicto Global:** **PASS**
* **Certificación:** `Certified: true`
* **Salida Persistida:** [`preflight-task-6136.json`](./preflight-task-6136.json)

| N.º | Compuerta | Severidad | Estado | Respaldo / Detalle |
|---|---|:---:|:---:|---|
| 1 | `git-diff-check` | P1 | **PASS** | 0 conflictos de formato o saltos de línea. |
| 2 | `secret-leak-and-untracked-configs` | P0 | **PASS** | 0 tokens JWT, contraseñas planas o archivos `.env` en seguimiento. |
| 3 | `backend-dotnet-build` | P0 | **PASS** | Compilación Release net8.0: 0 errores / 0 advertencias. |
| 4 | `frontend-vite-build` | P0 | **PASS** | Empaquetado de producción Vite en 596 ms (569 módulos). |
| 5 | `backend-regression-suite` | P0 | **PASS** | 396/396 xUnit superadas sin omisiones. |
| 6 | `frontend-regression-suite` | P0 | **PASS** | 389/389 Vitest superadas en 70 suites. |
| 7 | `frontend-oxlint-check` | P1 | **PASS** | 0 advertencias y 0 errores sobre 218 archivos analizados. |
| 8 | `ef-pending-model-changes` | P1 | **PASS** | 0 cambios pendientes entre entidades EF Core 8 y base de datos. |
| 9 | `speckit-dod-compliance` | P0 | **PASS** | 100% de tareas completas en `tasks.md`, branch autorizado y bitácora al día. |

---

## 4. Estado y Cierre de Compuertas de Release Candidate (CF-03 a CF-06)

### CF-03: Gates Integrales, Infraestructura Local y Base Demo
- **Estado:** **SATISFECHO / COMPLETO**.
- **Evidencias:**
  * Salud del contenedor Docker `oneitb23-sql` verificada (puerto 1433 Up/healthy).
  * Verificador `Test-DefenseDemoReadiness.ps1` ejecutado en 478 ms con 10/10 pilares en PASS (Runtimes, ensamblados Release, bundles, costo BCrypt 12, CV inmutable, RowVersion, adjuntos privados HTTP 206 y diapositivas).
  * Suite opt-in de concurrencia SQL (`GOB12SqlConcurrency`) ejecutada con **10/10 PASS** sobre SQL Server 2022 ([`sql-concurrency-results.log`](./sql-concurrency-results.log)).
  * Calibración BCrypt (`GOB15BcryptBenchmark`) con dictamen `PASS_SCREENING` ([`bcrypt-report.json`](./bcrypt-report.json)).

### CF-04: Recorrido Guiado por Roles (Seis Roles Institucionales)
- **Estado:** **SATISFECHO / COMPLETO**.
- **Evidencias:**
  * Backend: `RoleAuthorizationMatrixTests.cs` (111/111 PASS) validando operaciones a través de `Estudiante`, `Profesor`, `Egresado`, `Empleador`, `Moderador`, `Administrador` y anónimo.
  * Frontend: `roleRoutingMatrix.test.jsx` (83/83 PASS) evaluando rutas protegidas (`/admin`, `/moderacion`, etc.) para los 6 roles.
  * Auditoría visual E2E en runtime documentada en `docs/audit/full_audit/VISUAL_AUDIT_REPORT.md` (madurez visual certificada en 98.50% promedio / 98.67% proporción).

### CF-05: Validación Realtime y Aislamiento Multi-Sesión
- **Estado:** **SATISFECHO / COMPLETO**.
- **Evidencias:**
  * Suite `privateChatRecovery.gob12.test.jsx` (6/6 PASS): verificación de reconexión tras desconexión 1006, inversión de tramas replay/http, aislamiento de topic, descarte de echos y purga de caché Apollo en logout/reemplazo de usuario.
  * Servidores daemon locales Kestrel API (`task-5028`) y Vite (`task-5030`) validados y activos.

### CF-06: Manifiesto Consolidado y Congelamiento del Candidato
- **Estado:** **SATISFECHO / CONSOLIDADO**.
- **Dictamen:** Se formaliza este manifiesto vinculando SHA, métricas, suites, salidas y salvedades. El árbol queda congelado bajo la rama `feature/2026-11-01-debugger-cv-builder`.

---

## 5. Delimitación de F05 y Alcance de Demo

- **Hallazgo F05 (Gestión de Comisiones y Notas):**
  * **Backend:** 100% implementado, migrado y probado en xUnit (`SaveSectionGradeAsync`, comisiones, concurrencia optimista `RowVersion` y `ConcurrencyConflict`).
  * **Frontend:** La interfaz actual opera de forma freeze-safe con el alcance de carrera validado institucionalmente (`UserCareer`). La selección granular por comisión permanece clasificada como mejora UI post-congelamiento para demo, sin comprometer la integridad de datos ni los contratos probados.

---

## 6. Brechas Externas Residuales (Sin Alteración de Código)

- `GAP-AUTH-01`, `GAP-AUTH-02`, `GAP-PRIV-01`: Remediadas en Spec 201 y ratificadas en Delta 4.
- `GAP-FILE-01`: Abierta; descarga estática en `/uploads` sin autorización por objeto (aceptación exclusiva para demo académica local).
- `GAP-INFRA-01`: Abierta; provisión de certificados TLS del destino productivo.
- `GAP-OPS-01`: Abierta; integración con plataforma centralizada de observabilidad cloud.
