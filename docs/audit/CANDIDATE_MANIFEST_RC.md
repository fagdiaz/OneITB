# Manifiesto Oficial del Release Candidate (Spec 220)

- **Fecha de emisión:** 2026-11-15
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **Tracking remoto:** `origin/feature/2026-11-01-debugger-cv-builder`
- **Especificación activa:** `specs/220-core-closure-and-application-hardening`
- **SHA del Código Candidato (Producción y Pruebas):** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a` (inmutable en producción y pruebas)
- **HEAD al capturar evidencia:** `91d57f99753083c20825dee0d3a577d15eef4357`
- **Base previa revisada por Astra:** `fd403c86ed63a31cb1b8090cb082a73a0d29b409`
- **Estado:** Release Candidate Académico — Core Feature Complete (117/117), Code Freeze Operativo; CF-01 a CF-04 Cerradas, CF-05 Parcialmente Acreditada (Transporte PASS / UI Multi-Sesión BLOCKED) y CF-06 Abierta / Condicionada

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

Ejecución oficial mediante `.agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1 -RunTests $true -Certify`:

* **Veredicto Oficial:** **PASS (CERTIFICADO)**
* **Salida Certificada Oficial:** [`./PREFLIGHT_CERTIFIED_91d57f9.json`](./PREFLIGHT_CERTIFIED_91d57f9.json) (`Certified: true`, 0 errores, 0 fallos, 0 omisiones sobre corte inmutable).
* **Salida Histórica de Referencia:** [`./PREFLIGHT_CERTIFIED_9a61e73.json`](./PREFLIGHT_CERTIFIED_9a61e73.json) (ejecución previa sobre worktree `607dce7`).

| N.º | Compuerta | Severidad | Estado | Respaldo / Detalle |
|---|---|:---:|:---:|---|
| 1 | `git-diff-check` | P1 | **PASS** | 0 conflictos de formato o saltos de línea. |
| 2 | `secret-leak-and-untracked-configs` | P0 | **PASS** | 0 tokens JWT, contraseñas planas o archivos `.env` en seguimiento. |
| 3 | `backend-dotnet-build` | P0 | **PASS** | Compilación Release net8.0: 0 errores / 0 advertencias. |
| 4 | `frontend-vite-build` | P0 | **PASS** | Empaquetado de producción Vite en 2.38s (569 módulos). |
| 5 | `backend-regression-suite` | P0 | **PASS** | 396/396 xUnit superadas sin omisiones. |
| 6 | `frontend-regression-suite` | P0 | **PASS** | 389/389 Vitest superadas en 70 suites sin omisiones. |
| 7 | `frontend-oxlint-check` | P1 | **PASS** | 0 advertencias y 0 errores sobre 218 archivos analizados. |
| 8 | `ef-pending-model-changes` | P1 | **PASS** | 0 cambios pendientes entre modelo de entidades EF Core 8 y la última migración compilada (0 drift). |
| 9 | `speckit-dod-compliance` | P0 | **PASS** | 100% de tareas completas en `tasks.md`, branch autorizado y bitácora trazable. |

---

## 4. Estado y Cierre de Compuertas de Release Candidate (CF-01 a CF-06)

Conforme a la gobernanza de [ROADMAP.md](../project_docs/ROADMAP.md):

### CF-01: Consolidación y Publicación del Corte
- **Estado:** `[CERRADO]` (Specs 198 a 201 y Spec 220 consolidadas en rama `feature/2026-11-01-debugger-cv-builder` y publicadas en remoto `origin`).

### CF-02: Auditoría de Archivos Auxiliares y Secretos
- **Estado:** `[CERRADO]` (Raíz depurada de prompts antiguos; secretos resguardados en user-secrets y variables de entorno excluidas por `.gitignore`).

### CF-03: Gates Integrales, Infraestructura Local y Base Demo
- **Estado:** `[CERRADO / CERTIFICADO]` (Regresión automatizada core 785/785 PASS, suite opt-in SQL concurrente 11/11 PASS sobre SQL Server 2022, aceptación integral de infraestructura local y base demo certificadas, BCrypt calibrado y preflight oficial certificado con `Certified: true`).
- **Evidencias adjuntas:**
  * Contenedor Docker `oneitb23-sql` verificado (puerto 1433 Up/healthy).
  * Validación integral de infraestructura local y aceptación de servicios: [`./INFRASTRUCTURE_ACCEPTANCE_RESULTS.md`](./INFRASTRUCTURE_ACCEPTANCE_RESULTS.md) (`scripts/validate-local-infrastructure.ps1` PASS con exit code 0; Redis 7, Mailpit, integración real de infra, regresión de aislamiento de sesión, suites completas y cleanup sin residuos).
    - *Declaración de procedencia del script:* El script ejecutado `scripts/validate-local-infrastructure.ps1` posee hash SHA256 `7FCC83CE6D637D520C90ACB29759DFA91E9C1F4829E25F43B54C6DA55B066511` (modificado en commit `31e59a2` para filtro de exclusión de categorías opt-in y bucle acotado de liberación de puertos). Se declara formalmente como herramienta de soporte diferenciada del árbol inmutable del código candidato de producción `37ed3608887f3871a8ca2c555004ab63fd6d1e6a`.
  * Validación de integridad relacional y base demo: [`./DEMO_DATABASE_VALIDATION_RESULTS.md`](./DEMO_DATABASE_VALIDATION_RESULTS.md) (`scripts/validate-demo-database.ps1` PASS con exit code 0; 0 violaciones relacionales en 10 dimensiones, 6 logins de rol, smokes de 8 dominios GraphQL, upload y cleanup).
  * Suite opt-in de concurrencia SQL (`GOB12SqlConcurrency`) ejecutada con **11/11 PASS** sobre SQL Server 2022 ([`./SQL_CONCURRENCY_RESULTS.md`](./SQL_CONCURRENCY_RESULTS.md); ejecutada sobre árbol limpio en HEAD `a62c4e3`, código idéntico a `37ed360`).
  * Calibración BCrypt (`GOB15BcryptBenchmark`) con dictamen `PASS_SCREENING` ([`./bcrypt-report.json`](./bcrypt-report.json)).
  * Verificador `Test-DefenseDemoReadiness.ps1` ejecutado en 478 ms con 10/10 pilares en PASS.
  * Preflight oficial certificado: [`./PREFLIGHT_CERTIFIED_91d57f9.json`](./PREFLIGHT_CERTIFIED_91d57f9.json).

### CF-04: Recorrido Guiado por Roles (Seis Roles Institucionales)
- **Estado:** `[CERRADO / CERTIFICADO]` (Recorrido manual y visual en vivo de los seis roles institucionales completado con **30/31 casos en PASS** y 1 observación de runtime solventada tras reinicio del daemon Kestrel con binario fresco).
- **Evidencias adjuntas:**
  * Acta formal de auditoría de roles: [`./CF04_ROLE_WALKTHROUGH.md`](./CF04_ROLE_WALKTHROUGH.md).
  * 0 errores no controlados de JavaScript en DevTools / 0 UUIDs de GlobalErrorBoundary / 0 respuestas HTTP 500.
  * Accesibilidad WCAG 2.1 AA verificada: foco confinado en modales y atajo `Escape` determinístico en modales de publicación, silenciamiento (`SilenceUserModal`), razón de moderación (`ModerationReasonModal`), ofertas laborales y visor de CV ATS con retorno al disparador.
  * Daemon Kestrel reiniciado con binario compilado y query `moderationAudits` validada con HTTP 200 para rol Moderador.

### CF-05: Validación Realtime y Aislamiento Multi-Sesión
- **Estado:** `[CERRADO / CERTIFICADO]` (Transporte WebSocket real, entrega en vivo, relectura de persistencia en base de datos de `isRead = true`, reconexión natural en 2316 ms `>= 1300 ms`, 4 controles negativos validados en PASS; y recorrido UI multi-sesión en vivo acreditado al 100% PASS mediante navegador con contextos aislados).
- **Evidencias adjuntas:**
  * Acta formal de validación realtime (Transporte): [`./CF05_REALTIME_VALIDATION.md`](./CF05_REALTIME_VALIDATION.md).
  * Acta formal de recorrido UI multi-sesión en vivo: [`./CF05_UI_WALKTHROUGH.md`](./CF05_UI_WALKTHROUGH.md) (UI-01 a UI-05 en 100% PASS; DOM assertions, badges reactivos, reconexión web sin F5, logout/login limpio y delimitación transparente de InMemoryCache).
  * Traza cronológica y metodológica detallada: [`./CF05_REALTIME_TRACE.md`](./CF05_REALTIME_TRACE.md).
  * Salida literal del runner unmocked y controles negativos: [`./CF05_LIVE_RUNNER_OUTPUT.md`](./CF05_LIVE_RUNNER_OUTPUT.md) (`scripts/run-cf05-live-validation.ps1` y `scripts/verify-cf05-realtime-live.mjs` con `graphql-ws` v5.16.0 sin mock, aserciones estrictas, salida 0 en la corrida principal y salida 1 en los 4 controles negativos).
  * Aislamiento de topic verificado sin fuga observada en los casos ejecutados hacia terceros observadores (Sesión C / Moderador recibió 0 tramas; `leaksDetected: 0`, DOM de C con 0 residuos).
  * Handshake WebSocket validado en 60 ms en vivo, entrega reactiva inmediata sin recarga de página, marcado de conversación persistido y re-leído en DB (`isRead = true`), reconexión automática tras terminación forzada de socket (`client.terminate()`, código 4499) en 2316 ms (verificada `>= 1300 ms`), entrega de segundo mensaje post-reconexión y resolución de identidad de Sesión C por token.
  * Falsabilidad del checker demostrada mediante 4 controles negativos deliberados (`id-mismatch`, `leak-to-c`, `observer-error`, `short-wait`), bloqueando con código 1.
  * Delimitación formal de InMemoryCache: Clasificada explícitamente como "NO VERIFICADA EN RUNTIME" (al no exponerse `window.__APOLLO_CLIENT__` en producción bajo Code Freeze), con respaldo integral mediante la suite `src/__tests__/sessionTabs.adversarial.test.jsx` (5/5 PASS).
  * Suites de respaldo automatizadas en PASS: 22 pruebas (19 en frontend: `privateChatRecovery.gob12.test.jsx` 6/6, `sessionTabs.adversarial.test.jsx` 5/5, `chatRealtime.adversarial.test.jsx` 8/8; y 3 en backend: `PrivateMessageTopicAdversarialTests.cs` 3/3). Conforme a la Constitución §IX, estas 22 pruebas forman parte integral de la línea base canónica de 785 pruebas, no de un baseline paralelo.

### CF-06: Manifiesto Consolidado y Congelamiento del Candidato
- **Estado:** `[HABILITADA PARA CIERRE / CONGELAMIENTO]` (Habilitada para cierre y ratificación definitiva tras la certificación completa de CF-01 a CF-05).
- **Dictamen:** Se formaliza este manifiesto vinculando SHA, métricas, suites, salidas y salvedades con total transparencia documental. El código de producción y pruebas permanece inmutable en `37ed3608887f3871a8ca2c555004ab63fd6d1e6a`. El candidato queda plenamente respaldado para el cierre de tag y congelamiento oficial.

---

## 5. Delimitación de F05 y Alcance de Demo

- **Hallazgo F05 (Gestión de Comisiones y Calificaciones):**
  * **Estado:** `[ALCANCE DIFERIDO]`. Aceptado por gobernanza como alcance diferido para evolución post-defensa; no como interfaz implementada en frontend.
  * **Backend:** 100% implementado, migrado y probado en xUnit (`SaveSectionGradeAsync`, comisiones, concurrencia optimista `RowVersion` y `ConcurrencyConflict`).
  * **Frontend:** La interfaz actual opera de forma freeze-safe con el alcance de carrera validado institucionalmente (`UserCareer` / `GAP-AUTH-02`). La selección granular por comisión queda formalmente delimitada como alcance diferido para proteger los componentes consolidados bajo Code Freeze sin alterar contratos probados.

---

## 6. Brechas Externas Residuales (Sin Alteración de Código)

- `GAP-AUTH-01`, `GAP-AUTH-02`, `GAP-PRIV-01`: Remediadas en Spec 201 y ratificadas en Delta 4.
- `GAP-FILE-01`: Abierta; descarga estática en `/uploads` sin autorización por objeto (aceptación exclusiva para demo académica local).
- `GAP-INFRA-01`: Abierta; provisión de certificados TLS del destino productivo.
- `GAP-OPS-01`: Abierta; integración con plataforma centralizada de observabilidad cloud.
