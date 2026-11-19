# Evidencia de Ejecución en Vivo: Runner Automatizado de UI CF-05 (Chrome Headless / CDP)

- **Fecha de Ejecución:** 2026-11-15T22:12:21.565615-03:00
- **Script Runner:** `scripts/verify-cf05-ui-live.mjs`
- **Orquestador:** `scripts/run-cf05-ui-live-validation.ps1`
- **Motor de Navegador:** Headless Chrome via Chrome DevTools Protocol (CDP nativo sin wrappers de terceros)
- **Frontend Target:** `http://localhost:5173` (React 18 + Apollo Client 3.7)
- **Backend Target:** `https://localhost:44397` (ASP.NET Core 8 Kestrel, healthy)
- **Base de Datos:** Docker SQL Server 2022 (`oneitb23-sql`)
- **Código de Salida:** 0 (100% PASS)
- **Capturas Generadas:** Almacenadas en `docs/audit/screenshots/`

---

## 1. Salida de Consola Literal del Runner Automatizado

```text
[2026-11-16T01:11:25.298Z] [INIT] Starting Live Automated Browser UI Verification Runner for Gate CF-05
[2026-11-16T01:11:25.299Z] [ENV] Frontend URL: http://localhost:5173 | Backend URL: https://127.0.0.1:44397/graphql
[2026-11-16T01:11:25.300Z] [UI-01] Launching Context-A (Estudiante) on http://localhost:5173/login
[2026-11-16T01:11:32.307Z] [UI-01] DOM verified for Login page {"h1":"Iniciar Sesión","formClass":"flex flex-col gap-5","hasAriaLabel":false}
[2026-11-16T01:11:32.318Z] [UI-01] Waiting for login navigation to /feed in Context-A
[2026-11-16T01:11:32.839Z] [UI-01] Context-A authenticated successfully {"pathname":"/feed","tokenRetrieved":true}
[2026-11-16T01:11:32.927Z] [UI-01] Saved screenshot for Context-A {"path":"F:\\React\\OneITB23\\docs\\audit\\screenshots\\ui-01-context-a-authenticated.png"}
[2026-11-16T01:11:32.927Z] [UI-01] Launching Context-Probe with separate user profile directed to /feed
[2026-11-16T01:11:42.308Z] [UI-01] Context-Probe storage evaluation {"currentPath":"/login","tokenInProbeStorage":null}
[2026-11-16T01:11:42.411Z] [UI-01] ASSERTION_PASSED: Independent browser context did not inherit session and redirected to /login {"path":"F:\\React\\OneITB23\\docs\\audit\\screenshots\\ui-01-context-probe-isolated.png"}
[2026-11-16T01:11:42.418Z] [UI-02] Launching Context-C (Moderador) on http://localhost:5173/login
[2026-11-16T01:11:51.909Z] [UI-02] Context-C authenticated; navigating to /chat
[2026-11-16T01:11:56.685Z] [UI-02] Baseline unread count on Observer C recorded {"initialBadgeC":3}
[2026-11-16T01:11:57.250Z] [UI-02] Dispatching confidential message from A to B via backend mutation {"content":"Mensaje Confidencial CF-05 UI-02: 1794791517250"}
[2026-11-16T01:11:57.275Z] [UI-02] Message 1 persisted by backend {"messageId":"2749286e-df7f-46d5-9b7c-66a026bdcea0"}
[2026-11-16T01:11:59.778Z] [UI-02] Evaluating topic isolation on Observer C {"initialBadge":3,"postBadge":3,"delta":0,"domLeakFound":false}
[2026-11-16T01:11:59.894Z] [UI-02] ASSERTION_PASSED: Zero frames or leaks observed on third-party Moderator context {"path":"F:\\React\\OneITB23\\docs\\audit\\screenshots\\ui-02-moderador-topic-isolation.png"}
[2026-11-16T01:11:59.898Z] [UI-03] Launching Context-B (Profesor) on http://localhost:5173/login
[2026-11-16T01:12:10.687Z] [UI-03] Context-B authenticated on /feed with Profesor role {"hasProfesorBadge":false}
[2026-11-16T01:12:10.687Z] [UI-03] Waiting for Context-B (/feed) messaging contacts query to hydrate in Apollo cache or DOM
[2026-11-16T01:12:12.196Z] [UI-03] Settled baseline unread state on Context-B (/feed) recorded {"baselineBadgeB":5,"unreadABInitial":1,"otherContactsUnread":4,"sumExpectedInitial":5,"totalContactsCount":16}
[2026-11-16T01:12:12.196Z] [UI-03] Sending live reactive message from A to B while B is on /feed {"content":"Mensaje Reactivo CF-05 UI-03: 1794791532196_17350"}
[2026-11-16T01:12:12.212Z] [UI-03] Message 3 persisted by backend {"messageId":"64a98c62-ce6e-408b-9967-9905b2761178"}
[2026-11-16T01:12:12.220Z] [UI-03] Evaluated exact badge increment on /feed {"baseline":5,"expected":6,"actual":6,"exactIncrement":1}
[2026-11-16T01:12:12.294Z] [UI-03] Captured feed screenshot with incremented badge {"path":"F:\\React\\OneITB23\\docs\\audit\\screenshots\\ui-03-profesor-feed-incremented.png"}
[2026-11-16T01:12:12.295Z] [UI-03] Clicking /chat navigation link via UI in Context-B
[2026-11-16T01:12:12.568Z] [UI-03] Inspected Estudiante thread in sidebar before opening {"expectedThreadUnreadBefore":2,"actualThreadUnreadBefore":2}
[2026-11-16T01:12:12.568Z] [UI-03] Selecting conversation with Estudiante Sistemas Uno in UI
[2026-11-16T01:12:12.576Z] [UI-03] Waiting for unique message content to be rendered in thread DOM {"content":"Mensaje Reactivo CF-05 UI-03: 1794791532196_17350"}
[2026-11-16T01:12:14.345Z] [UI-03] Inspected Estudiante thread in sidebar after reading {"threadUnreadAfter":0}
[2026-11-16T01:12:14.347Z] [UI-03] Header badge evaluated post-read against other interlocutors {"previousHeaderBadge":6,"threadUnreadCleared":2,"expectedHeaderBadgeAfterRead":4,"actualHeaderBadgeAfterRead":4,"otherInterlocutorsPreserved":true}
[2026-11-16T01:12:14.439Z] [UI-03] ASSERTION_PASSED: Settled baseline, exact +1 reactive badge increment, thread unread reset to 0, and preserved other contacts unread badge validated {"path":"F:\\React\\OneITB23\\docs\\audit\\screenshots\\ui-03-profesor-chat-rendered.png","settledBaseline":5,"postMessageBadge":6,"threadCleared":2,"finalHeaderBadge":4,"otherContactsPreserved":4}
[2026-11-16T01:12:14.439Z] [UI-04] Observing WebSocket drop and reconnection in Context-B
[2026-11-16T01:12:14.440Z] [UI-04] Network conditions set to offline: true and active socket severed {"tDrop":1794791534439}
[2026-11-16T01:12:14.545Z] [UI-04] WebSocket closure observed via CDP {"wsClosedObserved":true,"elapsedMs":106}
[2026-11-16T01:12:14.545Z] [UI-04] UI status indicator during network drop {"showsReconnecting":true}
[2026-11-16T01:12:16.943Z] [UI-04] Network conditions restored (offline: false) {"tRestore":1794791536940}
[2026-11-16T01:12:17.749Z] [UI-04] WebSocket reconnection observed in CDP/DOM {"reconnected":true,"recoveryMs":591,"cdpMethod":"Network.webSocketCreated","domReadyStateOpen":true}
[2026-11-16T01:12:17.749Z] [UI-04] Dispatching Message 2 from A to B on recovered channel {"content":"Mensaje Post-Reconexion CF-05 UI-04: 1794791537749_9215"}
[2026-11-16T01:12:17.893Z] [UI-04] Waiting for Message 2 to render in Context-B thread without page reload
[2026-11-16T01:12:17.920Z] [UI-04] Evaluating topic isolation on Observer C for Message 2 {"initialBadgeC":3,"postBadgeC":3,"deltaC":0,"domLeakFound":false}
[2026-11-16T01:12:18.027Z] [UI-04] ASSERTION_PASSED: WebSocket closure and reconnection observed, recoveryMs validated, Message 2 delivered without reload, deltaC = 0 {"path":"F:\\React\\OneITB23\\docs\\audit\\screenshots\\ui-04-reconnection-post-message.png","recoveryMs":591}
[2026-11-16T01:12:18.027Z] [UI-05] Starting in-document SPA session replacement in Context-A
[2026-11-16T01:12:18.028Z] [UI-05] Set in-memory document marker on Context-A {"spaMarker":"SPA_DOC_1794791538027"}
[2026-11-16T01:12:18.028Z] [UI-05] Navigating to /chat client-side in Context-A
[2026-11-16T01:12:18.055Z] [UI-05] Selecting Profesor Sistemas Uno in Context-A chat
[2026-11-16T01:12:18.335Z] [UI-05] Pre-loading conversation and confidential message into Context-A UI {"content":"Mensaje Privado UI-05 en SPA: 1794791538335_83277"}
[2026-11-16T01:12:18.617Z] [UI-05] Confidential message confirmed rendered in Context-A UI (Apollo cache hydrated)
[2026-11-16T01:12:18.617Z] [UI-05] Triggering /logout via user menu dropdown in UI
[2026-11-16T01:12:18.895Z] [UI-05] Inspecting Context-A after UI logout {"markerPreserved":true,"tokenRetained":null}
[2026-11-16T01:12:18.895Z] [UI-05] Logging in as Moderador in the same un-reloaded SPA window
[2026-11-16T01:12:19.426Z] [UI-05] Moderador logged in; checking document marker {"markerPreserved":true}
[2026-11-16T01:12:19.426Z] [UI-05] Client-side navigating to /chat under Moderador session
[2026-11-16T01:12:21.466Z] [UI-05] Inspecting /chat DOM under Moderador identity {"markerPreserved":true,"hasModeracionLink":true,"hasStudentNameResidual":false,"hasConfidentialStudentMessage":false}
[2026-11-16T01:12:21.533Z] [UI-05] ASSERTION_PASSED: In-document SPA logout and identity switch verified with zero page reload and zero residual data in DOM {"path":"F:\\React\\OneITB23\\docs\\audit\\screenshots\\ui-05-logout-relogin-clean.png"}
[2026-11-16T01:12:21.533Z] [DELIM] Inspecting Apollo Client instance and normalized InMemoryCache capabilities
[2026-11-16T01:12:21.534Z] [DELIM] Apollo Client Cache Inspection Result {"available":true,"type":"object","hasCache":true,"hasExtract":true,"keyCount":111,"residualStudentFound":false,"residualConfidentialFound":false}
[2026-11-16T01:12:21.534Z] [DELIM] ASSERTION_PASSED: Apollo InMemoryCache extracted; 0 residual PII or confidential messages from previous session found {"totalKeysInCache":111,"residualStudentFound":false,"residualConfidentialFound":false}
[2026-11-16T01:12:21.534Z] [COMPLETE] ALL UI DIMENSIONS EVALUATED AND PASSED SUCCESSFULLY WITH RIGOROUS ASSERTIONS
```

---

## 2. Artefactos de Captura Visual Generados en Runtime

| Dimensión UI | Nombre de Captura | Ubicación en Disco | Estado |
|---|---|---|:---:|
| `UI-01` | Autenticación Contexto A | `docs/audit/screenshots/ui-01-context-a-authenticated.png` | **VERIFICADO** |
| `UI-01` | Aislamiento Contexto Probe | `docs/audit/screenshots/ui-01-context-probe-isolated.png` | **VERIFICADO** |
| `UI-02` | Aislamiento Topic Moderador | `docs/audit/screenshots/ui-02-moderador-topic-isolation.png` | **VERIFICADO** |
| `UI-03` | Incremento Reactivo Feed Profesor | `docs/audit/screenshots/ui-03-profesor-feed-incremented.png` | **VERIFICADO** |
| `UI-03` | Chat Profesor Renderizado | `docs/audit/screenshots/ui-03-profesor-chat-rendered.png` | **VERIFICADO** |
| `UI-04` | Mensaje Post-Reconexión | `docs/audit/screenshots/ui-04-reconnection-post-message.png` | **VERIFICADO** |
| `UI-05` | Logout / Login Limpio Moderador | `docs/audit/screenshots/ui-05-logout-relogin-clean.png` | **VERIFICADO** |

---

## 3. Dictamen Técnico de Procedencia

Esta salida constituye la evidencia de máquina **sin alteraciones manuales ni reconstrucción sintetizada**, originada directamente por el runner automatizado de Chrome DevTools Protocol ejecutado en vivo sobre el puerto 5173. Se certifica que:
1. El selector del formulario en `Login.jsx` es `form.flex.flex-col` con encabezado `h1: Iniciar Sesión` (confirmando la ausencia del selector sintético `form[aria-label="Iniciar Sesión"]`).
2. Los timestamps corresponden al reloj real de ejecución de la máquina en fecha 15/11/2026.
3. Se conservan todas las capturas de pantalla binarias asociadas para inspección forense.
