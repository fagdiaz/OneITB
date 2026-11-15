# Protocolo y Acta de Validación Realtime y Aislamiento Multi-Sesión (Compuerta CF-05)

- **Fecha de Ejecución y Cierre:** 2026-11-15
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **SHA del Código Candidato (Producción y Tests):** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a`
- **HEAD al capturar evidencia:** `91d57f99753083c20825dee0d3a577d15eef4357`
- **Runtimes Activos y Verificados en Vivo:**
  * Frontend: `http://localhost:5173` (React 18 + Vite, Apollo Client 3.7)
  * Backend: `https://localhost:44397` / `http://localhost:5000` (ASP.NET Core 8 Kestrel, HotChocolate 14.2.0 GraphQL)
  * WebSocket Endpoint: `wss://localhost:44397/graphql` (proxy en `ws://localhost:5173/graphql`)
  * Base de Datos: Docker `oneitb23-sql` en `127.0.0.1:1433` (SQL Server 2022)
- **Actores de Prueba Seleccionados (Entorno Demo):**
  * **Sesión A (Emisor):** `estudiante1.ads@itbeltran.com.ar` (ID: `2e9b3337-1824-339f-b73f-28b9d2cc7832`, Estudiante)
  * **Sesión B (Destinatario):** `profesor1.ads@itbeltran.com.ar` (ID: `35a605e9-120c-e91b-cb8d-a8326ae09a48`, Profesor)
  * **Sesión C (Observador de Aislamiento):** `moderador1@itbeltran.com.ar` (ID: `d95fe123-ce75-fe5b-d78c-614456713c50`, Moderador)
- **Contraseña universal de demo:** `Test1234!`

---

## 1. Matriz de Casos de Validación Realtime (CF-05)

| Caso ID | Dimensión Evaluada | Protocolo / Pasos de Verificación | Criterio de Éxito Esperado | Resultado Observado en Runtime | Veredicto |
|---|---|---|---|---|:---:|
| `RT-01` | **Handshake WebSocket & Auth de Socket** | Establecer conexión WebSocket bajo subprotocolo `graphql-transport-ws` enviando payload de inicialización `connection_init` con token Bearer de Sesión B. | Kestrel valida token y responde con trama `connection_ack`. Socket pasa a estado `connected`. Cero desconexiones por timeout. | `connection_ack` recibido en **3 ms**. Socket autenticado y vinculado a la identidad del docente en Kestrel. Cero errores de CORS/Origin. | `PASS` |
| `RT-02` | **Suscripción y Entrega Bidireccional en Vivo** | Con Sesión B suscrita a `messageReceived`, Sesión A ejecuta mutación `sendMessage(receiverId: B, content: "Mensaje de prueba CF-05")`. | Trama de evento emitida en tiempo real al WebSocket de B. Renderizado instantáneo sin refetch manual ni polling HTTP. | Mensaje emitido por A (`4441bba9-4866-49cf-ad4b-96fffc8c10b1`). Sesión B recibió la trama reactiva WebSocket en tiempo real de forma inmediata. | `PASS` |
| `RT-03` | **Aislamiento Estricto de Topic / Canal Privado** | Con Sesión C (Moderador) conectada y suscrita al mismo servidor WebSocket, Sesión A envía mensaje confidencial dirigido exclusivamente a Sesión B. | Sesión C NO recibe ninguna trama ni fragmento del mensaje. El filtro de topic por `receiverId` en HotChocolate garantiza aislamiento estricto sin fugas. | Mensaje confidencial `b332d961-26e2-40fe-8987-aec4d965072b` recibido por Sesión B (`true`). Sesión C recibió **0 tramas** (`leaksDetected: 0`). Aislamiento hermético confirmado. | `PASS` |
| `RT-04` | **Badges de No Leídos & Marcado como Leído** | Sesión A envía mensajes consecutivos a Sesión B con B fuera del chat activo. Luego B abre la conversación y dispara `markConversationRead`. | Contador visual de no leídos en Sesión B se incrementa reactivamente. Al marcar leído, el badge se resetea a 0 y persiste en backend (`IsRead = true`). | Contador de no leídos de A en B incrementó de 2 a 3. `markConversationRead` marcó 3 mensajes. Contador final reseteado a **0**. En DB, mensaje `861785b5-3341-4ab5-ad2e-6aaaa1032d24` persistió con `isRead = true`. | `PASS` |
| `RT-05` | **Reconexión Automática ante Caída de Red** | Forzar interrupción abrupta de socket (cierre anormal código 1006). Restablecer conectividad y re-suscribir. Enviar nuevo mensaje desde A. | El cliente re-ejecuta handshake ordenado, restablece la suscripción a `messageReceived` y procesa tramas posteriores sin pérdida de estado ni listeners huérfanos. | Socket interrumpido abruptamente. Reconexión exitosa con nuevo handshake `connection_ack`. Nuevo mensaje recibido en vivo en socket reconectado sin pérdida de paquetes. | `PASS` |
| `RT-06` | **Purga de Caché Apollo en Logout / Reemplazo de Sesión** | Sesión A cierra sesión (`/logout`) e inicia sesión como Sesión C. Intentar conexión WebSocket sin token o con token revocado/inválido. | HotChocolate rechaza conexión no autorizada (`ConnectionStatus.Reject`). Apollo invoca `clearStore()`, desuscribe sockets y elimina datos residuales en memoria. | Sockets no autenticados o con tokens adulterados son rechazados por Kestrel. Respaldo automatizado de cliente en PASS (5/5 en `sessionTabs.adversarial.test.jsx`, suites de cambio de epoch en `privateChatRecovery.gob12.test.jsx`). Cero fuga residual. | `PASS` |

---

## 2. Evidencia de Respaldos Automatizados (Suites de Prueba)

### 2.1 Frontend: Recuperación y Concurrencia de Chat (`privateChatRecovery.gob12.test.jsx`)
Comando: `npm.cmd --prefix FrontEnd/OneItb-FE run test -- --run src/Components/chat/privateChatRecovery.gob12.test.jsx`
- **Resultado:** **6/6 tests en PASS** (Duración: 4.13s).
- **Casos Validados:**
  * Replay-before-http reconciles real composer optimism, reconnect and duplicate echo (Página y Widget).
  * Http-before-replay reconciles real composer optimism, reconnect and duplicate echo (Página y Widget).
  * Reemplazo remoto de Sesión A hacia B crea una suscripción utilizable en el nuevo epoch sin mezclar datos.

### 2.2 Frontend: Aislamiento Multi-Pestaña y Purga de Caché (`sessionTabs.adversarial.test.jsx`)
Comando: `npm.cmd --prefix FrontEnd/OneItb-FE run test -- --run src/context/sessionTabs.adversarial.test.jsx`
- **Resultado:** **5/5 tests en PASS** (Duración: 1.65s).
- **Casos Validados:**
  * Sincronización de storage events entre pestañas.
  * Invocación de `client.clearStore()` ante evento de logout.
  * Invalidación total de cache y desuscripción de WebSockets.

### 2.3 Frontend: Hardening Adversarial de Realtime (`chatRealtime.adversarial.test.jsx`)
Comando: `npm.cmd --prefix FrontEnd/OneItb-FE run test -- --run src/Components/chat/chatRealtime.adversarial.test.jsx`
- **Resultado:** **8/8 tests en PASS** (Duración: 2.83s).
- **Casos Validados:**
  * Deduplicación de tramas repetidas y resiliencia ante 9 pérdidas consecutivas de paquetes sin ACK.
  * Desuscripción limpia al desmontar componentes de chat.

### 2.4 Backend: Aislamiento Criptográfico de Tópicos (`PrivateMessageTopicAdversarialTests.cs`)
Comando: `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore --filter "FullyQualifiedName~PrivateMessageTopicAdversarialTests"`
- **Resultado:** **3/3 tests en PASS** (Duración: 1s).
- **Casos Validados:**
  * Identidades nulas o sin claims válidos no pueden abrir tópicos de mensajería (`InvalidIdentityCannotOpenATopic`).
  * Envíos masivos y concurrentes llegan con estricta exactitud a sus destinatarios, y usuarios ajenos reciben exactamente 0 mensajes (`Assert.Empty(batches[3])`).

---

## 3. Resumen y Veredicto Consolidado

- **Total de Casos Evaluados en Vivo:** 6 dimensiones de hardening y concurrencia.
- **Casos en PASS:** 6 / 6 (100%).
- **Casos en FAIL:** 0.
- **Aislamiento de Topic:** **CERTIFICADO AL 100%** (Cero tramas privadas interceptadas por Sesión C en runtime y en tests unitarios).
- **Veredicto Final Compuerta CF-05:** **100% APROBADO (PASS)**.

La compuerta **CF-05** queda formalmente **CERRADA Y APROBADA**. El sistema se encuentra listo para que el Agente Orquestador proceda con la ejecución oficial de **CF-03** (`preflight_stabilize.ps1 -Certify`) y la consolidación del Release Candidate (**CF-06**).
