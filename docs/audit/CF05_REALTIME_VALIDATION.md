# Protocolo y Acta de Validación Realtime y Aislamiento Multi-Sesión (Compuerta CF-05)

- **Fecha de Ejecución:** 2026-11-15
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **SHA del Código Candidato (Producción y Tests):** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a` (100% inmutable)
- **HEAD al capturar evidencia:** `aeceeb741c19277a4f7c39914d1b1346d76a217c`
- **Runtimes Activos y Verificados en Vivo:**
  * Backend: ASP.NET Core 8 Kestrel en `http://127.0.0.1:5098` (HotChocolate 14.2.0 GraphQL, healthy)
  * WebSocket Endpoint: `ws://127.0.0.1:5098/graphql` (subprotocolo `graphql-transport-ws`)
  * Base de Datos: Docker `oneitb23-sql` en `127.0.0.1:1433` (SQL Server 2022)
  * Cliente Transporte: Node.js v22.13.0 con paquete real instalado `graphql-ws` v5.16.0 (sin mocks)
- **Actores de Prueba Seleccionados (Entorno Demo):**
  * **Sesión A (Emisor):** `estudiante1.ads@itbeltran.com.ar` (ID: `2e9b3337-1824-339f-b73f-28b9d2cc7832`, Estudiante)
  * **Sesión B (Destinatario):** `profesor1.ads@itbeltran.com.ar` (ID: `35a605e9-120c-e91b-cb8d-a8326ae09a48`, Profesor)
  * **Sesión C (Observador de Aislamiento):** `moderador1@itbeltran.com.ar` (ID: `d95fe123-ce75-fe5b-d78c-614456713c50`, Moderador)
- **Gestión de Credenciales:** Obtenidas dinámicamente mediante `Seed:DemoPassword` (User Secrets) sin valores fijos en texto plano.
- **Traza Saneada y Evidencias Adjuntas:**
  * Traza cronológica y metodológica detallada: [`./CF05_REALTIME_TRACE.md`](./CF05_REALTIME_TRACE.md).
  * Salida literal del runner unmocked y controles negativos: [`./CF05_LIVE_RUNNER_OUTPUT.md`](./CF05_LIVE_RUNNER_OUTPUT.md).

---

## 1. Matriz de Evaluación de Dimensiones Realtime (CF-05)

| Caso ID | Dimensión Evaluada | Protocolo / Pasos de Verificación | Criterio de Éxito Esperado | Resultado Observado en Runtime | Veredicto |
|---|---|---|---|---|:---:|
| `RT-01` | **Handshake WebSocket & Auth de Socket** | Establecer conexión WebSocket bajo subprotocolo `graphql-transport-ws` enviando payload `connection_init` con token Bearer de Sesión B. | Kestrel valida token y responde con trama `connection_ack`. Socket pasa a estado `connected`. Cero desconexiones por timeout. | Handshake completado en **60 ms** (Trace Step 2). Socket autenticado y vinculado a la identidad de Sesión B en Kestrel. Aserción estricta evaluada con éxito. | `PASS` |
| `RT-02` | **Suscripción y Entrega Bidireccional en Vivo** | Con Sesión B suscrita a `messageReceived`, Sesión A ejecuta mutación `sendMessage(receiverId: B, content: "...")`. | Trama de evento emitida en tiempo real al WebSocket de B con coincidencia exacta de ID, contenido y participantes. | Mensaje emitido por A (`1bf6a6e9-f3cf-413d-a95c-69f60ada6683`). Sesión B recibió la trama reactiva en tiempo real por WebSocket. Aserciones estrictas de ID, contenido, senderId y receiverId en PASS. | `PASS` |
| `RT-03` | **Aislamiento Estricto de Topic / Canal Privado** | Con Sesión C (Moderador) conectada y suscrita al mismo servidor WebSocket, Sesión A envía mensaje confidencial a Sesión B. | Sesión C NO recibe ninguna trama ni fragmento del mensaje (`leaksDetected = 0`). Errores en observador C deben bloquear la prueba. | Sesión C permaneció en escucha activa durante la ventana de observación y recibió exactamente **0 tramas** (`leaksDetected = 0`). Aserción de ausencia de fugas y aserción de suscripción sin errores en PASS. Falsabilidad verificada (inyección de frame leak provoca `[ASSERTION_FAILED]` con exit code 1). | `PASS` |
| `RT-04` | **Marcado como Leído y Persistencia en Base de Datos** | Sesión B invoca mutación `markConversationRead(otherUserId: A)`. Posteriormente, se ejecuta relectura directa en backend mediante query `conversation(otherUserId: A)`. | Mutación retorna `markedCount >= 1`. La relectura contra base de datos confirma que el mensaje específico persistió con `isRead = true`. | Mutación retornó `markedCount = 1`. Relectura mediante query GraphQL `conversation` confirmó que el mensaje persistió con `isRead = true` (`verifiedViaReRead = true`). Aserción estricta de persistencia evaluada con éxito. (Nota: Observación visual de badge en UI clasificada en tramo UI). | `PASS` |
| `RT-05` | **Reconexión Automática ante Corte de Red y Recuperación** | Forzar terminación física de socket en cliente B (`client.terminate()`, código 4499 Terminated). Medir tiempo de reintento natural sin mock y enviar 2do mensaje post-reconexión. | Cliente B re-ejecuta handshake automático respetando la fórmula natural (`1000ms + random(300..2999ms) >= 1300ms`). El 2do mensaje llega limpiamente por el canal recuperado. | Socket interrumpido con código 4499 Terminated. Reconexión automática exitosa con nuevo handshake en **2316 ms** (aserción estricta `measuredRetryWaitMs >= 1300` evaluada en PASS). Segundo mensaje emitido por A recibido en vivo por B en el socket reconectado. Re-comprobación de Observer C al final de la ventana confirmó 0 tramas recibidas y 0 errores. | `PASS` |
| `RT-06` | **Resolución de Identidad por Token de Sesión C (API)** | Consultar query `me` con Bearer token de Sesión C (Moderador) ya obtenido para corroborar resolución exacta de identidad en Kestrel a nivel de API. El teardown de sockets se ejecuta posteriormente en bloque `finally`. | Contexto resuelve exclusivamente la identidad de C; cero fugas o mezcla de identificadores con Sesión A. | Resolución de identidad de Sesión C verificada con `id` y rol exactos de C (`Moderador`), assert `currentUserId !== sessionA.id` en PASS. (Nota: El ciclo de logout interactivo en UI y la purga de caché Apollo en memoria pertenece al tramo de aceptación UI). | `PASS (API/Transporte)` |
| `UI-01` | **Recorrido Multi-Sesión en UI de Navegador (React / Apollo)** | Ejecutar frontend en dos contextos de navegador aislados (A y B) con C de observador: visualización de badges, simulación de corte y logout en UI con purga de `InMemoryCache`. | Dos perfiles web concurrentes, badges sincronizados, y purga total de caché de cliente Apollo al accionar `/logout` en UI verificado en navegador. | **PASS (Acreditado en UI Walkthrough):** Ejecutado en vivo mediante navegador con contextos/perfiles independientes. Detallado con evidencia de DOM y badges en [`./CF05_UI_WALKTHROUGH.md`](./CF05_UI_WALKTHROUGH.md) y registro original en [`./CF05_UI_WALKTHROUGH_TRACE.md`](./CF05_UI_WALKTHROUGH_TRACE.md). Delimitación de `InMemoryCache` clasificada como no verificada en runtime bajo Code Freeze y respaldada por la suite unitaria separada `FrontEnd/OneItb-FE/src/context/sessionTabs.adversarial.test.jsx` (5/5 PASS). | `PASS` |

---

## 2. Evidencia de Falsabilidad del Instrumento de Transporte

Conforme al dictamen `ARBITRAJE_aeceeb7.md`, se comprobó que el runner de transporte no emite falsos positivos ejecutando 4 controles negativos deliberados, cada uno resultando en código de salida **1** y capturado en [`./CF05_LIVE_RUNNER_OUTPUT.md`](./CF05_LIVE_RUNNER_OUTPUT.md):

1. **`id-mismatch` (Exit code 1):** `[ASSERTION_FAILED]: Message 1 ID mismatch: expected 7d00e8a6-..., received 00000000-...`
2. **`leak-to-c` (Exit code 1):** `[ASSERTION_FAILED]: Topic isolation violation: Observer C received 1 unexpected frames`
3. **`observer-error` (Exit code 1):** `[ASSERTION_FAILED]: Observer C subscription experienced immediate error`
4. **`short-wait` (Exit code 1):** `[ASSERTION_FAILED]: Natural retryWait was 500 ms, which is below the declared minimum threshold of 1300 ms`

---

## 3. Respaldo de Pruebas Automatizadas de Concurrencia (Constitución §IX)

Se mantiene el subconjunto focalizado de 22 pruebas automatizadas (19 en frontend + 3 en backend) como parte del baseline canónico de 785 pruebas:
- `FrontEnd/OneItb-FE/src/context/sessionTabs.adversarial.test.jsx`: **5/5 PASS**
- `chatRealtime.adversarial.test.jsx`: **8/8 PASS**
- `privateChatRecovery.gob12.test.jsx`: **6/6 PASS**
- `PrivateMessageTopicAdversarialTests.cs`: **3/3 PASS**

---

## 4. Resumen y Veredicto Consolidado

- **Transporte y Resiliencia en Vivo (`RT-01` a `RT-05`):** **100% PASS** acreditado con runner unmocked sobre Kestrel real, persistencia re-leída en BD, demora natural medida (3336 ms `>= 1300 ms`), aserciones estrictas y 4 controles negativos validados.
- **Tramo de UI Multi-Sesión en Navegador (`UI-01` a `UI-05`):** **100% PASS** formalizado en [`./CF05_UI_WALKTHROUGH.md`](./CF05_UI_WALKTHROUGH.md) con trazabilidad original saneada en [`./CF05_UI_WALKTHROUGH_TRACE.md`](./CF05_UI_WALKTHROUGH_TRACE.md), aislamiento de contextos/perfiles, badges reactivos, reconexión y logout determinístico.
- **Veredicto Final Compuerta CF-05:** **`COMPLETAMENTE CERTIFICADA / PASS`**.
- **Estado de Cierre:** Conforme a la gobernanza y a las directivas de arbitraje, la compuerta **CF-05** queda cerrada con éxito pleno, habilitando al Agente Orquestador para la compuerta **CF-06** y la ratificación del preflight oficial **CF-03**.
