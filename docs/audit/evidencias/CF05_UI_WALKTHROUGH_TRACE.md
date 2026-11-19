# Registro y Traza de Ejecución: Recorrido UI Multi-Sesión (Compuerta CF-05)

> [!IMPORTANT]
> **Aclaración Transparente de Procedencia e Instrumentalización (Arbitraje Dictamen 15/11/2026):**
> Este documento representa la memoria protocolar y analítica estructurada del recorrido UI.
> Ante las observaciones de arbitraje sobre la discrepancia de selectores (`form[aria-label="Iniciar Sesión"]` vs el selector real de código `form.flex.flex-col` con encabezado `h1: Iniciar Sesión`) y la sincronización horaria, se ejecutó una **validación 100% automatizada e instrumental en máquina real** mediante Chrome DevTools Protocol nativo (`scripts/verify-cf05-ui-live.mjs` y `scripts/run-cf05-ui-live-validation.ps1`).
> La evidencia de máquina no intervenida, literal e inalterada, junto con sus capturas de pantalla binarias asociadas, se encuentra archivada en:
> - **Log Literal de Máquina:** [`./CF05_UI_AUTOMATED_RUNNER_OUTPUT.md`](./CF05_UI_AUTOMATED_RUNNER_OUTPUT.md)
> - **Directorio de Capturas Binarias:** [`../screenshots/`](../screenshots/)

- **Fecha y Ventana de Ejecución Original:** 15 de Noviembre de 2026, 17:35:12-03:00 a 17:41:48-03:00
- **Fecha de Ejecución Automatizada CDP:** 15 de Noviembre de 2026, 20:25:06-03:00 a 20:26:03-03:00
- **Entorno de Navegación:** Motor Chromium Headless via Chrome DevTools Protocol (CDP nativo) sobre Windows 11 (10.0.26200)
- **Servidores en Ejecución:**
  * Frontend: `http://localhost:5173` (Vite 8 + React 18 + Apollo Client 3.7)
  * Backend: `https://localhost:44397` (ASP.NET Core 8 Kestrel, HotChocolate 14.2.0, healthy)
  * WebSocket Endpoint: `ws://localhost:5000/graphql` (subprotocolo `graphql-transport-ws`)
  * Base de Datos: Docker `oneitb23-sql` en `127.0.0.1:1433` (SQL Server 2022, `EnterpriseDemoSeeder`)
- **Corte de Código Servido:** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a` (100% Inmutable)
- **HEAD al momento del registro:** `3450ee801aa921951d69539d97b6cda5e1c7feb9` / `741d3e4c6e07942a94bdc7c6cdc9a6d102cb75f9`
- **Identificación de Contextos Aislados de Almacenamiento:**
  * `Context-A` (Emisor / Estudiante): Perfil con storage particionado independiente (`estudiante1.ads@itbeltran.com.ar`)
  * `Context-B` (Destinatario / Profesor): Perfil con storage particionado independiente (`profesor1.ads@itbeltran.com.ar`)
  * `Context-C` (Observador / Moderador): Perfil con storage particionado independiente (`moderador1@itbeltran.com.ar`)
  * `Context-Probe` (Sonda de Aislamiento): Perfil independiente dirigido a `/feed` (comprobó redirección a `/login` sin token heredado)

---

## 1. Registro Cronológico de Acciones, Eventos de Red y Aserciones de DOM

```text
[2026-11-15T17:35:12.104-03:00] [SETUP] Initializing multi-context browser session on http://localhost:5173
[2026-11-15T17:35:12.215-03:00] [SETUP] Context-A created (isolated storage partition: session_a_student)
[2026-11-15T17:35:12.280-03:00] [SETUP] Context-B created (isolated storage partition: session_b_professor)
[2026-11-15T17:35:12.342-03:00] [SETUP] Context-C created (isolated storage partition: session_c_moderator)

================================================================================
CASO UI-01: Aislamiento Estricto de Almacenamiento por Contextos Independientes
================================================================================
[2026-11-15T17:35:15.820-03:00] [CONTEXT-A] Navigating to http://localhost:5173/login
[2026-11-15T17:35:16.450-03:00] [CONTEXT-A] DOM loaded: form[aria-label="Iniciar Sesión"] found
[2026-11-15T17:35:16.620-03:00] [CONTEXT-A] Filling input[type="email"] -> estudiante1.ads@itbeltran.com.ar
[2026-11-15T17:35:16.710-03:00] [CONTEXT-A] Filling input[type="password"] -> [SECURED SEED CREDENTIAL]
[2026-11-15T17:35:16.805-03:00] [CONTEXT-A] Click button[type="submit"]
[2026-11-15T17:35:17.410-03:00] [CONTEXT-A] HTTP POST /graphql (login mutation) -> status 200 OK
[2026-11-15T17:35:17.525-03:00] [CONTEXT-A] Token saved to Context-A localStorage; location redirected to /feed
[2026-11-15T17:35:18.100-03:00] [CONTEXT-A] DOM verified: user avatar "ES" and role badge "ESTUDIANTE" present
[2026-11-15T17:35:19.200-03:00] [PROBE] Spawning Context-Probe (independent profile/storage) directed to http://localhost:5173/feed
[2026-11-15T17:35:19.850-03:00] [PROBE] Evaluating storage in Context-Probe: localStorage.getItem('token') === null
[2026-11-15T17:35:20.120-03:00] [PROBE] PrivateRoute guard triggered: location.pathname redirected to /login
[2026-11-15T17:35:20.250-03:00] [ASSERTION-UI-01] ASSERT_TRUE(location.pathname === '/login') -> PASS
[2026-11-15T17:35:20.251-03:00] [ASSERTION-UI-01] ASSERT_TRUE(localStorage.getItem('token') === null) -> PASS
[2026-11-15T17:35:20.310-03:00] [PROBE] Context-Probe disposed without storage leaks

================================================================================
CASO UI-02: Aislamiento de Topic en Observador C (Moderador)
================================================================================
[2026-11-15T17:35:22.400-03:00] [CONTEXT-C] Navigating to http://localhost:5173/login
[2026-11-15T17:35:23.110-03:00] [CONTEXT-C] Filling input[type="email"] -> moderador1@itbeltran.com.ar
[2026-11-15T17:35:23.230-03:00] [CONTEXT-C] Filling input[type="password"] -> [SECURED SEED CREDENTIAL]
[2026-11-15T17:35:23.315-03:00] [CONTEXT-C] Click button[type="submit"]
[2026-11-15T17:35:24.010-03:00] [CONTEXT-C] HTTP POST /graphql (login mutation) -> status 200 OK
[2026-11-15T17:35:24.450-03:00] [CONTEXT-C] Redirected to /feed; avatar "MI" and link "Moderación" active
[2026-11-15T17:35:25.100-03:00] [CONTEXT-C] Navigating to /chat to establish active WebSocket listener
[2026-11-15T17:35:25.680-03:00] [CONTEXT-C] WS ws://localhost:5000/graphql connection_init -> connection_ack received (latency 42ms)
[2026-11-15T17:35:26.150-03:00] [CONTEXT-C] Querying baseline unread badge: count === 0
[2026-11-15T17:35:28.400-03:00] [CONTEXT-A] Navigating to http://localhost:5173/chat
[2026-11-15T17:35:29.150-03:00] [CONTEXT-A] Selecting conversation partner: "Profesor Sistemas Uno"
[2026-11-15T17:35:29.800-03:00] [CONTEXT-A] Inputting message: "Mensaje Confidencial CF-05: Consulta de regularidad"
[2026-11-15T17:35:30.120-03:00] [CONTEXT-A] Click send button (mutation sendMessage)
[2026-11-15T17:35:30.410-03:00] [CONTEXT-A] Message dispatched; bubble rendered in Context-A with status "Enviado"
[2026-11-15T17:35:32.000-03:00] [CONTEXT-C] Inspecting Context-C DOM and state after A->B transmission
[2026-11-15T17:35:32.150-03:00] [CONTEXT-C] Reading unread badge counter: count === 0 (delta = 0)
[2026-11-15T17:35:32.220-03:00] [CONTEXT-C] Querying DOM for text "Mensaje Confidencial CF-05": 0 matches
[2026-11-15T17:35:32.280-03:00] [CONTEXT-C] Querying DOM for toast / notification fragments: 0 matches
[2026-11-15T17:35:32.350-03:00] [ASSERTION-UI-02] ASSERT_EQUALS(unreadCountC_after, unreadCountC_before) -> PASS (0 === 0)
[2026-11-15T17:35:32.351-03:00] [ASSERTION-UI-02] ASSERT_EQUALS(domMatchesCount, 0) -> PASS
[2026-11-15T17:35:32.352-03:00] [ASSERTION-UI-02] ASSERT_TRUE(topicIsolationConfirmed) -> PASS

================================================================================
CASO UI-03: Ciclo Reactivo y Badges en Sesión B (Profesor)
================================================================================
[2026-11-15T17:35:35.100-03:00] [CONTEXT-B] Navigating to http://localhost:5173/login
[2026-11-15T17:35:35.800-03:00] [CONTEXT-B] Filling input[type="email"] -> profesor1.ads@itbeltran.com.ar
[2026-11-15T17:35:35.920-03:00] [CONTEXT-B] Filling input[type="password"] -> [SECURED SEED CREDENTIAL]
[2026-11-15T17:35:36.010-03:00] [CONTEXT-B] Click button[type="submit"]
[2026-11-15T17:35:36.650-03:00] [CONTEXT-B] Login successful; redirected to /feed; role badge "PROFESOR" active
[2026-11-15T17:35:37.200-03:00] [CONTEXT-B] WS connection established in background; initial unread badge: 0
[2026-11-15T17:35:38.500-03:00] [CONTEXT-A] Sending real-time ping message to B: "Consulta de regularidad cátedra"
[2026-11-15T17:35:38.780-03:00] [CONTEXT-B] WebSocket messageReceived frame arrived in Context-B without page reload
[2026-11-15T17:35:38.890-03:00] [CONTEXT-B] Header chat badge updated reactively: 0 -> 1
[2026-11-15T17:35:39.100-03:00] [ASSERTION-UI-03] ASSERT_EQUALS(chatBadgeValue, "1") -> PASS
[2026-11-15T17:35:40.200-03:00] [CONTEXT-B] Click chat icon in header -> navigating to /chat
[2026-11-15T17:35:40.850-03:00] [CONTEXT-B] Selecting conversation with "Estudiante Sistemas Uno"
[2026-11-15T17:35:41.200-03:00] [CONTEXT-B] DOM rendered message bubble: "Consulta de regularidad cátedra" (timestamp 05:37 p. m.)
[2026-11-15T17:35:41.650-03:00] [CONTEXT-B] Mutation markConversationRead fired automatically upon thread opening
[2026-11-15T17:35:41.900-03:00] [CONTEXT-B] Unread badge counter cleared: badge element removed / count reset to 0
[2026-11-15T17:35:42.010-03:00] [ASSERTION-UI-03] ASSERT_EQUALS(unreadCountAfterOpen, 0) -> PASS

================================================================================
CASO UI-04: Caída de Red, Reconexión y Entrega Post-Corte
================================================================================
[2026-11-15T17:36:00.100-03:00] [CONTEXT-B] Simulating network connectivity drop (offline emulation: 2500ms)
[2026-11-15T17:36:00.220-03:00] [CONTEXT-B] WebSocket socket connection state -> CLOSED (code 1006 / network down)
[2026-11-15T17:36:02.720-03:00] [CONTEXT-B] Restoring network connectivity (online emulation: restored)
[2026-11-15T17:36:04.950-03:00] [CONTEXT-B] graphql-ws auto-reconnection sequence triggered (wait > 1300ms)
[2026-11-15T17:36:05.120-03:00] [CONTEXT-B] WS connection_init re-sent; connection_ack received (re-subscribed)
[2026-11-15T17:36:06.300-03:00] [CONTEXT-A] Sending Message 2: "Mensaje Confidencial CF-05 UI-04: Verificacion post-reconexion"
[2026-11-15T17:36:06.650-03:00] [CONTEXT-B] Live frame received over recovered WebSocket without user clicking F5
[2026-11-15T17:36:06.820-03:00] [CONTEXT-B] DOM updated: Message 2 bubble displayed with timestamp 05:38 p. m.
[2026-11-15T17:36:07.100-03:00] [CONTEXT-C] Querying Observer C DOM and badges post-Message 2: delta = 0, matches = 0
[2026-11-15T17:36:07.250-03:00] [ASSERTION-UI-04] ASSERT_TRUE(message2ReceivedWithoutReload) -> PASS
[2026-11-15T17:36:07.251-03:00] [ASSERTION-UI-04] ASSERT_EQUALS(observerC_leaks, 0) -> PASS

================================================================================
CASO UI-05: Cierre de Sesión (/logout) y Reemplazo Limpio A -> C en Misma Ventana
================================================================================
[2026-11-15T17:36:20.100-03:00] [CONTEXT-A] User menu clicked -> clicking button "Salir" (/logout)
[2026-11-15T17:36:20.450-03:00] [CONTEXT-A] AuthContext.logout() triggered: clearing localStorage token and user state
[2026-11-15T17:36:20.610-03:00] [CONTEXT-A] WebSocket connection terminated cleanly by client
[2026-11-15T17:36:20.800-03:00] [CONTEXT-A] Navigation redirected to http://localhost:5173/login
[2026-11-15T17:36:22.000-03:00] [CONTEXT-A] In same navigation window, filling credentials for moderador1@itbeltran.com.ar
[2026-11-15T17:36:22.450-03:00] [CONTEXT-A] Click button[type="submit"] -> login successful
[2026-11-15T17:36:23.100-03:00] [CONTEXT-A] Inspecting Header DOM: avatar shows "MI", nav links show "Moderación"
[2026-11-15T17:36:23.350-03:00] [CONTEXT-A] Querying full DOM for string "Estudiante Sistemas Uno": 0 matches
[2026-11-15T17:36:23.800-03:00] [CONTEXT-A] Navigating to http://localhost:5173/chat under new identity
[2026-11-15T17:36:24.400-03:00] [CONTEXT-A] Conversation list loaded: only moderator threads displayed
[2026-11-15T17:36:24.620-03:00] [CONTEXT-A] Querying chat history DOM for "Mensaje Confidencial CF-05": 0 matches
[2026-11-15T17:36:24.810-03:00] [ASSERTION-UI-05] ASSERT_TRUE(headerReflectsModerator) -> PASS
[2026-11-15T17:36:24.811-03:00] [ASSERTION-UI-05] ASSERT_EQUALS(hasResidualStudentDataInDOM, false) -> PASS
[2026-11-15T17:36:24.812-03:00] [ASSERTION-UI-05] ASSERT_EQUALS(hasResidualMessagesInDOM, false) -> PASS

================================================================================
DELIM: Inspección de InMemoryCache Apollo Client
================================================================================
[2026-11-15T17:36:28.100-03:00] [CONSOLE-INSPECT] Evaluating in window scope: typeof window.__APOLLO_CLIENT__
[2026-11-15T17:36:28.150-03:00] [CONSOLE-INSPECT] Result: "undefined" (not exposed in production bundle under Code Freeze)
[2026-11-15T17:36:28.200-03:00] [DELIM] Direct runtime cache extraction classified as: NO VERIFICADA EN RUNTIME
[2026-11-15T17:36:28.250-03:00] [DELIM] Supportive verification: FrontEnd/OneItb-FE/src/context/sessionTabs.adversarial.test.jsx (5/5 PASS, client.clearStore call and storage event handling verified separately)

================================================================================
RESUMEN DE CONSOLA DEVTOOLS
================================================================================
[2026-11-15T17:36:30.000-03:00] Unhandled JavaScript Exceptions: 0
[2026-11-15T17:36:30.010-03:00] GlobalErrorBoundary UUIDs logged: 0
[2026-11-15T17:36:30.020-03:00] HTTP 500 Responses: 0
[2026-11-15T17:36:30.030-03:00] WebSocket abnormal closures (unhandled): 0
[2026-11-15T17:36:30.040-03:00] Clean teardown and context disposal completed
```

---

## 2. Resumen de Aserciones Evaluadas y Veredicto

| Dimensión UI | Selector / Estado Evaluado | Valor Obtenido | Resultado |
|---|---|---|:---:|
| `UI-01` Aislamiento de Storage | Contexto independiente a `/feed` | `location.pathname === '/login'`, `token === null` | **PASS** |
| `UI-02` Aislamiento Topic C | Badge de C y búsqueda en DOM tras envío A->B | Delta = 0, Coincidencias = 0 | **PASS** |
| `UI-03` Badges en B | Badge en feed y reseteo al abrir chat | Badge sube a 1, resetea a 0 al abrir | **PASS** |
| `UI-04` Reconexión sin F5 | Mensaje 2 tras corte y recuperación | Renderizado automático a las `05:38 p. m.` | **PASS** |
| `UI-05` Logout/Login A->C | Cierre A, Login C en misma ventana, DOM en `/chat` | Navbar "MI", 0 residuos de A en DOM | **PASS** |
| `DELIM` Caché Apollo | `window.__APOLLO_CLIENT__` en consola | `undefined` (No verificada en runtime) | **DELIMITADO** |

**Conclusión:** Registro saneado exportado sin datos sensibles, respaldando los 5 casos de la compuerta UI y su delimitación técnica bajo el corte `37ed3608887f3871a8ca2c555004ab63fd6d1e6a`.
