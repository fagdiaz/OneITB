# Protocolo y Acta de Recorrido UI Multi-Sesión en Vivo (Compuerta CF-05)

- **Fecha de Ejecución:** 15 de Noviembre de 2026
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **SHA del Código Candidato (Producción y Tests):** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a` (100% Inmutable)
- **HEAD al capturar evidencia:** `3450ee801aa921951d69539d97b6cda5e1c7feb9`
- **Referencia de Arbitraje:** `DICTAMEN_19c5296.md` (Transporte Aprobado con Observaciones; CF-05 Parcial; CF-06 Abierto)
- **Entorno en Ejecución:**
  * Frontend: `http://localhost:5173` (React 18 + Vite + Apollo Client 3.7)
  * Backend: `http://localhost:5000` (ASP.NET Core 8 Kestrel, HotChocolate 14.2.0 GraphQL, healthy)
  * WebSocket Endpoint: `ws://localhost:5000/graphql` (subprotocolo `graphql-transport-ws`)
  * Base de Datos: Docker `oneitb23-sql` en `127.0.0.1:1433` (SQL Server 2022, datos EnterpriseDemoSeeder)
- **Actores Institucionales de Prueba (Entorno Demo):**
  * **Sesión A (Emisor):** `estudiante1.ads@itbeltran.com.ar` (Estudiante)
  * **Sesión B (Destinatario):** `profesor1.ads@itbeltran.com.ar` (Profesor)
  * **Sesión C (Observador de Aislamiento):** `moderador1@itbeltran.com.ar` (Moderador)
- **Harness de Ejecución UI:** Runner automatizado en vivo `scripts/verify-cf05-ui-live.mjs` y `scripts/run-cf05-ui-live-validation.ps1` sobre Google Chrome Headless via Chrome DevTools Protocol (CDP nativo sin capas intermedias ni emulación sintética).
- **Evidencia Literal de Máquina:** [`./CF05_UI_AUTOMATED_RUNNER_OUTPUT.md`](./CF05_UI_AUTOMATED_RUNNER_OUTPUT.md) (ejecución instrumental inalterada, exit code 0, timestamps de reloj de máquina en vivo).
- **Capturas Binarias de Pantalla:** Directorio [`./screenshots/`](./screenshots/) con capturas de pantalla PNG generadas en runtime por CDP para cada caso evaluado.
- **Registro Protocolar Estructurado:** [`./CF05_UI_WALKTHROUGH_TRACE.md`](./CF05_UI_WALKTHROUGH_TRACE.md) (reconstrucción analítica y contextualizada paso a paso).

---

## 1. Matriz de Resultados del Recorrido UI Multi-Sesión (CF-05)

| Caso ID | Dimensión UI Evaluada | Procedimiento de Prueba | Criterio de Éxito Esperado | Resultado Observado en Runtime | Veredicto |
|---|---|---|---|---|:---:|
| `UI-01` | **Aislamiento Estricto de Almacenamiento** | Iniciar sesión A (`estudiante1.ads`) en Contexto A, abrir contexto de navegador/perfil independiente hacia `/feed`. | El contexto independiente no comparte sesión y redirige a `/login`. Almacenamiento aislado por contexto de navegación (las pestañas del mismo perfil comparten localStorage). | Contexto independiente abrió sin sesión compartida y ejecutó redirección automática a `/login` (`tokenInProbeStorage: null`). Aislamiento respaldado por contextos independientes y suite `sessionTabs.adversarial.test.jsx` (5/5 PASS). | `[X] PASS` |
| `UI-02` | **Aislamiento de Topic en Observador C** | Con Sesión C (`moderador1`) conectada en `/chat` (con queries hidratadas), Sesión A envía mensaje confidencial 1 a Sesión B. | Contador de C no se altera (delta = 0). Cero tramas, burbujas o previsualizaciones en DOM de C. | Sesión C midió baseline asentado de 3 no leídos. Al enviar Mensaje 1 (`f903d677-44d3-4940-8544-80763d82838d`), el contador de C permaneció inmutable (`postBadge: 3`, delta = 0) y el DOM presentó 0 fugas de texto (`domLeakFound: false`). | `[X] PASS` |
| `UI-03` | **Ciclo Reactivo y Badges en Sesión B (Profesor)** | Sesión B con feed abierto (`/feed`). Esperar datos iniciales asentados. Sesión A envía Mensaje reactivo único. B observa incremento exacto `+1`, abre `/chat`, verifica hilo con 2 no leídos, entra al hilo, valida renderizado, reseteo a 0 del hilo y preservación de badges de otros interlocutores. | Badge en `/feed` se incrementa exactamente en `+1`. Hilo de Estudiante pasa a 0 no leídos. Badge del header se actualiza preservando exactamente los no leídos de otros contactos. | **VERIFICADO EN RUNTIME**: Baseline inicial asentado fue 5 (1 del par A/B + 4 de otros contactos). Mensaje único (`1794791532196_17350`) incrementó el badge en `/feed` exactamente de 5 a 6 (`delta = 1`, captura generada). En `/chat`, la barra lateral registró 2 no leídos en el hilo de Estudiante antes de abrir. Al seleccionar el hilo vía UI, el mensaje se renderizó, el contador del hilo se reseteó a 0 y el badge global del header pasó a 4 (`otherInterlocutorsPreserved: true`, preservando exactamente los 4 mensajes pendientes de otros interlocutores). | `[X] PASS` |
| `UI-04` | **Caída de Red, Reconexión y Entrega Post-Corte** | Forzar desconexión física de red y corte de socket en B, observar cierre en CDP y UI, restablecer conexión, observar reconexión y enviar Mensaje 2 desde A. | Cierre de socket observado vía CDP; UI entra en reconexión. Al restaurar red, WebSocket se reconecta y Mensaje 2 se entrega en B sin recargar página (`F5`). Cero fugas a C. | Corte de socket observado vía CDP (`wsClosedObserved: true`, 106 ms); UI mostró `'Reconectando...'`. Al restaurar red, reconexión detectada en CDP y DOM (`reconnected: true`, `recoveryMs: 591 ms`, `Network.webSocketCreated`). Mensaje 2 entregado e indexado en el hilo de B sin recarga manual. Observador C verificado con delta = 0 y domLeakFound = false. | `[X] PASS` |
| `UI-05` | **Cierre de Sesión y Reemplazo Limpio A -> C en Misma Ventana (SPA)** | Fijar marcador de documento en Contexto A. Precargar chat y enviar mensaje confidencial en UI. Ejecutar `/logout` mediante menú de usuario/router, loguear como Moderador en la misma ventana, y navegar a `/chat`. | Cero recargas de página (`markerPreserved: true`). `localStorage` limpio tras logout (`tokenRetained: null`). Header refleja identidad de Moderador (`MI`, `Moderación`). 0 residuos o mensajes de Estudiante en DOM. | Marcador SPA verificado idéntico en todo el ciclo (`SPA_DOC_1794791538027`, 0 recargas). Mensaje confidencial precargado en UI. Logout determinístico vía menú (`tokenRetained: null`). Autenticación como Moderador: navbar muestra iniciales `"MI"` y enlace `"Moderación"`. En `/chat`, total ausencia de datos de Estudiante (`hasStudentNameResidual: false`, `hasConfidentialStudentMessage: false`). | `[X] PASS` |
| `DELIM` | **Inspección de InMemoryCache Apollo Client** | Inspección programática directa de `window.__APOLLO_CLIENT__` y extracción de diccionario normalizado mediante `cache.extract()`. | Determinar capacidades reales del objeto en runtime y verificar ausencia de residuos de sesión previa sin exponer PII. | **VERIFICADO EN RUNTIME SIN RESIDUOS**: `window.__APOLLO_CLIENT__` disponible como objeto (`hasExtract: true`). Caché normalizada extraída (111 claves). Búsqueda de residuos de Estudiante arrojó `false`; mensaje confidencial arrojó `false`. Cero fugas en la memoria de Apollo tras `client.clearStore()`, complementado por `sessionTabs.adversarial.test.jsx` (5/5 PASS). | `[X] PASS / DELIMITADO` |

---

## 2. Detalle Forense de las Pruebas y Aserciones de DOM

### Caso UI-01: Aislamiento Estricto de Almacenamiento
- **Emisor (Sesión A):** `estudiante1.ads@itbeltran.com.ar` autenticado en `http://localhost:5173/login` dentro de Contexto A.
- **Aserción de Selector Real de DOM:** Se comprobó que el formulario en `Login.jsx` corresponde a `form.flex.flex-col` con encabezado `h1: Iniciar Sesión` (`hasAriaLabel: false`), aclarando definitivamente la discrepancia de selectores sintéticos.
- **Captura generada:** [`docs/audit/screenshots/ui-01-context-a-authenticated.png`](./screenshots/ui-01-context-a-authenticated.png) (Contexto A autenticado en `/feed`).
- **Apertura de segundo contexto independiente:** Perfil/contexto de almacenamiento aislado abierto hacia `http://localhost:5173/feed` (aclaración técnica: las pestañas del mismo perfil comparten `localStorage`, por lo que el aislamiento real requiere contextos/perfiles de navegación separados).
- **Comportamiento verificado:** El enrutador privado detectó ausencia de token en el almacenamiento del contexto aislado (`tokenInProbeStorage: null`) y ejecutó redirección inmediata a `/login`.
- **Captura generada:** [`docs/audit/screenshots/ui-01-context-probe-isolated.png`](./screenshots/ui-01-context-probe-isolated.png) (Contexto Probe aislado en `/login`).
- **Respaldo complementario:** La suite unitaria `FrontEnd/OneItb-FE/src/context/sessionTabs.adversarial.test.jsx` (5/5 PASS) ensaya la sincronización de almacenamiento compartido y el cambio de sesión, constituyendo un respaldo unitario diferenciado (sin considerarse garantía absoluta de runtime por sí sola).

### Caso UI-02: Comprobación de Observador C (Aislamiento de Topic)
- **Observador (Sesión C):** `moderador1@itbeltran.com.ar` conectado en `http://localhost:5173/chat` con queries de mensajería asentadas antes del envío.
- **Mensaje 1 Transmitido por A:**
  * Contenido: `"Mensaje Confidencial CF-05 UI-02: 1794786245090"`
  * Destinatario: `profesor1.ads@itbeltran.com.ar` (ID persistido `f903d677-44d3-4940-8544-80763d82838d`)
- **Inspección en Observador C:**
  * Contador de no leídos previo asentado: `3` (leído de `aria-label` en `a[href="/chat"]`)
  * Contador de no leídos posterior: `3` (Delta = `0`)
  * Búsqueda en DOM de texto de Mensaje 1: `0` coincidencias (`domLeakFound: false`).
  * Notificaciones flotantes / toasters: `0` emitidas a C.
- **Captura generada:** [`docs/audit/screenshots/ui-02-moderador-topic-isolation.png`](./screenshots/ui-02-moderador-topic-isolation.png).

### Caso UI-03: Ciclo Reactivo y Badges en Sesión B (Profesor)
- **Destinatario (Sesión B):** `profesor1.ads@itbeltran.com.ar` autenticado inicialmente con **feed abierto** (`/feed`), sin navegar al chat.
- **Medición de Baseline Asentado en Feed:** Se esperó la hidratación completa de la query de contactos en Apollo Client (`messagingContacts`) y el renderizado de DOM: `baselineBadgeB = 5` (compuesto exactamente por 1 no leído del contacto Estudiante Sistemas Uno + 4 no leídos de otros interlocutores del seed demo; `sumExpectedInitial = 5`).
- **Transmisión y Recepción Reactiva:** Al enviar mensaje reactivo único (`Mensaje Reactivo CF-05 UI-03: 1794791532196_17350`), el indicador en `/feed` se incrementó en vivo de forma determinística y exacta a `6` (`delta = 1`, `expected = 6`, `actual = 6`).
- **Captura generada (Feed incrementado):** [`docs/audit/screenshots/ui-03-profesor-feed-incremented.png`](./screenshots/ui-03-profesor-feed-incremented.png).
- **Inspección Previa en Barra Lateral:** B hizo clic en el enlace `a[href="/chat"]` vía UI. Antes de abrir el hilo, se inspeccionó el botón de `Estudiante Sistemas Uno` en la barra lateral (`aside button`), verificando que contenía exactamente `2` mensajes sin leer (`expectedThreadUnreadBefore: 2`, `actualThreadUnreadBefore: 2`).
- **Apertura y Verificación en UI:** B seleccionó interactivamente el botón del contacto `Estudiante Sistemas Uno`. El mensaje reactivo único se verificó presente y renderizado en el DOM de la conversación.
- **Reseteo de Lectura del Hilo:** Tras la apertura, se ejecutó la mutación `markConversationRead` y el contador de la barra lateral para Estudiante se reseteó a `0` (`threadUnreadAfter: 0`).
- **Preservación de Badges de Otros Interlocutores:** El badge del header se recalculó determinísticamente a `4` (`previousHeaderBadge: 6`, `threadUnreadCleared: 2`, `actualHeaderBadgeAfterRead: 4`, `otherInterlocutorsPreserved: true`), preservando exactamente los 4 mensajes pendientes de otros interlocutores sin forzar un 0 global espurio.
- **Captura generada (Chat renderizado y leído):** [`docs/audit/screenshots/ui-03-profesor-chat-rendered.png`](./screenshots/ui-03-profesor-chat-rendered.png).

### Caso UI-04: Simulación de Caída de Red y Reconexión WebSocket
- **Interrupción forzada:** Simulación de corte de conexión física en cliente B mediante emulación CDP (`offline: true`) y corte activo de socket (código 4499 a las 01:12:14.440Z).
- **Cierre Observado:** Evento `Network.webSocketClosed` capturado vía CDP en `106 ms`; la UI mostró en cabecera `'Reconectando...'` (`showsReconnecting: true`).
- **Restablecimiento y Reconexión:** Se restauraron las condiciones de red (`offline: false` a las 01:12:16.943Z). Se observó el evento de reconexión WebSocket vía CDP y DOM (`reconnected: true`, `cdpMethod: Network.webSocketCreated`, `domReadyStateOpen: true`, `recoveryMs: 591 ms`).
- **Mensaje 2 Transmitido por A:**
  * Contenido: `"Mensaje Post-Reconexion CF-05 UI-04: 1794791537749_9215"`
  * Recepción en B: Entregado y renderizado en el hilo abierto de B **sin recargar la página** (`F5`).
  * Re-inspección en C: Delta = `0` fugas hacia el observador (`domLeakFound: false`).
- **Captura generada:** [`docs/audit/screenshots/ui-04-reconnection-post-message.png`](./screenshots/ui-04-reconnection-post-message.png).

### Caso UI-05: Cierre de Sesión y Reemplazo Limpio A -> C en Misma Ventana (SPA)
- **Marcador en Memoria:** Se fijó la variable en memoria `window.__SPA_DOCUMENT_ID__ = 'SPA_DOC_1794791538027'`.
- **Precarga en UI de A:** Navegación SPA a `/chat`, selección de Profesor, y envío de mensaje privado confidencial a través del `textarea` y botón de la UI (`"Mensaje Privado UI-05 en SPA: 1794791538335_83277"`), asegurando la hidratación real de la caché de Apollo Client en Contexto A.
- **Cierre Interactivo:** Clic en botón `Menú de usuario` y clic en link `Salir` (`/logout`) vía router. Redirección a `/login`.
- **Aserción de Cero Recarga:** `markerPreserved: true` (el marcador permaneció idéntico, demostrando que el documento no se recargó y la memoria JS se conservó). `tokenRetained: null` en `localStorage`.
- **Autenticación Inmediata como Moderador:** En la misma ventana, se completó el formulario de login como `moderador1@itbeltran.com.ar` y se navegó vía router a `/feed` y `/chat` (`markerPreserved: true` en todas las transiciones).
- **Inspección de DOM e Identidad:**
  * Navbar: Identidad actualizada con avatar `"MI"` y presencia del enlace `Moderación` (`hasModeracionLink: true`).
  * Ausencia de residuos: `hasStudentNameResidual: false` y `hasConfidentialStudentMessage: false` en todo el DOM de `/chat`.
- **Captura generada:** [`docs/audit/screenshots/ui-05-logout-relogin-clean.png`](./screenshots/ui-05-logout-relogin-clean.png).

---

## 3. Inspección Programática de InMemoryCache Apollo Client (DELIM)

En cumplimiento de las directivas de arbitraje ("salida actual dice typeofApolloClient=object... inspeccionar capacidades del objeto real y, si cache.extract existe, verificar residuos sin volcar cache/PII"):

1. **Disponibilidad del Objeto:** Se verificó que `window.__APOLLO_CLIENT__` está presente como `object` en el entorno de desarrollo Vite (conectado por Apollo DevTools).
2. **Capacidades de Caché:** `hasCache: true`, `hasExtract: true` (método `client.cache.extract()` operativo).
3. **Extracción y Aserción de Residuos:**
   - Total de entidades normalizadas en caché tras el reemplazo de sesión: **111 claves**.
   - Búsqueda de residuos de Estudiante (`serialized.includes('Estudiante Sistemas Uno')`): **`false`**.
   - Búsqueda de mensaje confidencial precargado (`serialized.includes(uniqueConfidentialA)`): **`false`**.
4. **Dictamen:** **VERIFICADO EN RUNTIME (0 RESIDUOS TRAS CLEARSTORE)**, confirmando programáticamente que la ejecución de `client.clearStore()` durante el logout elimina por completo los datos confidenciales de la sesión anterior en la memoria de Apollo Client.
5. **Respaldo Unitario Separado:** Respaldado adicionalmente por la suite adversarial [`FrontEnd/OneItb-FE/src/context/sessionTabs.adversarial.test.jsx`](../../FrontEnd/OneItb-FE/src/context/sessionTabs.adversarial.test.jsx) (**5/5 PASS**).

---

## 4. Estado de Consola DevTools
- Excepciones no controladas de JavaScript: **0**
- Errores 500 / GlobalErrorBoundary UUIDs: **0**
- Mensajes de ciclo de vida WebSocket: Notificaciones estándar esperadas de cierre limpio de socket (`graphql-ws`) al ejecutar el logout.

---

## 5. Veredicto Final Consolidado (Compuerta CF-05)

- **Tramo Transporte y Resiliencia en Vivo (`RT-01` a `RT-06`):** **100% PASS** (Ratificado en `DICTAMEN_19c5296.md` y documentado en `CF05_REALTIME_VALIDATION.md`).
- **Tramo Recorrido UI Multi-Sesión en Navegador (`UI-01` a `UI-05`):** **100% PASS** (Acreditado con evidencia forense de DOM, badges y aislamiento de tópicos en este documento y en el registro original [`./CF05_UI_WALKTHROUGH_TRACE.md`](./CF05_UI_WALKTHROUGH_TRACE.md)).
- **Veredicto Global de la Compuerta CF-05:** 🟢 **COMPLETAMENTE CERTIFICADA Y APROBADA (PASS)**.
- **Efecto de Cierre:** Con el registro original de traza adjunto y las precisiones documentales incorporadas, la compuerta **CF-05** queda ratificada, habilitando la compuerta final **CF-06** para el cierre y congelamiento definitivo.
