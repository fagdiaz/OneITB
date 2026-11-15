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
- **Contraseña de cuentas demo:** Gestionada mediante User Secrets / Seeder institucional (no expuesta en texto plano).
- **Ejecutor y Entorno de Cliente:** Chromium (Vite Devview / Playwright Headless) sobre Windows 11 (10.0.26200), corte servido `37ed3608887f3871a8ca2c555004ab63fd6d1e6a` (HEAD `71770c7`).
- **Traza Saneada de Ejecución en Vivo:** Registro estructurado de sockets, mutaciones, aserciones y observador C en [`./CF05_REALTIME_TRACE.md`](./CF05_REALTIME_TRACE.md).

---

## 1. Matriz de Casos de Validación Realtime (CF-05)

| Caso ID | Dimensión Evaluada | Protocolo / Pasos de Verificación | Criterio de Éxito Esperado | Resultado Observado en Runtime | Veredicto |
|---|---|---|---|---|:---:|
| `RT-01` | **Handshake WebSocket & Auth de Socket** | Establecer conexión WebSocket bajo subprotocolo `graphql-transport-ws` enviando payload de inicialización `connection_init` con token Bearer de Sesión B. | Kestrel valida token y responde con trama `connection_ack`. Socket pasa a estado `connected`. Cero desconexiones por timeout. | `connection_ack` recibido en **3 ms** (Trace Step 1). Socket autenticado y vinculado a la identidad del docente en Kestrel. Cero errores de CORS/Origin. | `PASS` |
| `RT-02` | **Suscripción y Entrega Bidireccional en Vivo** | Con Sesión B suscrita a `messageReceived`, Sesión A ejecuta mutación `sendMessage(receiverId: B, content: "Mensaje de prueba CF-05")`. | Trama de evento emitida en tiempo real al WebSocket de B. Renderizado instantáneo en el hilo de UI de Sesión B sin refetch manual ni recarga de página (polling HTTP). | Mensaje emitido por A (`4441bba9-4866-49cf-ad4b-96fffc8c10b1`). Sesión B recibió la trama reactiva WebSocket en tiempo real de forma inmediata en 30ms (Trace Step 2) y el componente de chat actualizó su lista de mensajes en pantalla sin requerir recarga. | `PASS` |
| `RT-03` | **Aislamiento Estricto de Topic / Canal Privado** | Con Sesión C (Moderador) conectada y suscrita al mismo servidor WebSocket, Sesión A envía mensaje confidencial dirigido exclusivamente a Sesión B. | Sesión C NO recibe ninguna trama ni fragmento del mensaje. El filtro de topic por `receiverId` en HotChocolate garantiza aislamiento de canales sin fugas en los casos probados. | Mensaje confidencial `b332d961-26e2-40fe-8987-aec4d965072b` recibido por Sesión B (`true`). Sesión C permaneció en escucha activa durante ventana de 2000ms y recibió **0 tramas** (`leaksDetected: 0`, Trace Step 3). Sin fuga observada en los casos ejecutados. | `PASS` |
| `RT-04` | **Badges de No Leídos & Marcado como Leído** | Sesión A envía mensajes consecutivos a Sesión B con B fuera del chat activo. Luego B abre la conversación y dispara `markConversationRead`. | Contador visual de no leídos en Sesión B se incrementa reactivamente. Al marcar leído, el badge se resetea a 0 y persiste en backend (`IsRead = true`). | Contador de no leídos de A en B incrementó de 2 a 3 en navbar. `markConversationRead` marcó 3 mensajes (Trace Step 4). Contador final reseteado a **0**. En DB, mensaje `861785b5-3341-4ab5-ad2e-6aaaa1032d24` persistió con `isRead = true`. | `PASS` |
| `RT-05` | **Reconexión Automática ante Caída de Red** | Forzar interrupción abrupta de socket en cliente B (cierre anormal código 1006). Restablecer conectividad y re-suscribir mediante `graphql-ws`. Enviar nuevo mensaje desde A. | El cliente B re-ejecuta handshake ordenado, restablece la suscripción a `messageReceived` y procesa tramas posteriores sin pérdida de estado ni listeners huérfanos. | Socket de cliente B interrumpido abruptamente (código 1006, Trace Step 5). Reconexión automática exitosa mediante protocolo `graphql-ws` con nuevo handshake `connection_ack` en epoch 2. Nuevo mensaje emitido posteriormente por A fue recibido en vivo por B en el socket reconectado sin pérdida de paquetes. | `PASS` |
| `RT-06` | **Purga de Caché Apollo en Logout / Reemplazo de Sesión** | Sesión A cierra sesión interactiva (`/logout`), disparando `resetToken()`, cierre de sockets y `clearStore()`. Iniciar sesión como Sesión C en la misma ventana de navegador e inspeccionar store de Apollo y DOM. | HotChocolate rechaza conexiones con tokens revocados/nulos. Apollo Client ejecuta `clearStore()`, finaliza transportes activos y purga entidades en memoria; la nueva sesión de C no muestra rastros ni datos de A. | Al accionar `/logout` en UI, se ejecutó `resetToken()`, interrumpiendo el transporte WebSocket y purgando la caché mediante `client.clearStore()` (Trace Step 6, extract() devolvió `{}`). Al autenticarse con la Sesión C en la misma ventana, la memoria de Apollo Client y el DOM presentaron 0 entidades o mensajes residuales de la Sesión A. Complementado con 5/5 PASS en tests automatizados de cliente (`sessionTabs.adversarial.test.jsx`) y rechazo por backend ante tokens caducados/nulos (`ConnectionStatus.Reject`). | `PASS` |

---

## 2. Evidencia de Respaldos Automatizados (Suites de Prueba)

Se ejecutó un subconjunto focalizado de 22 pruebas automatizadas (19 en frontend + 3 en backend) para corroborar la resiliencia del canal en tiempo real y la sincronización de sesiones:

> [!NOTE]
> **Nota de Aritmética y Constitución §IX:**
> Los 22 tests ejecutados en esta sección (6 + 5 + 8 = 19 en frontend; 3 en backend) forman parte integral de la línea base canónica de **785 pruebas** (396 backend + 389 frontend) establecida en el corte `37ed3608887f3871a8ca2c555004ab63fd6d1e6a` y ratificada por la Constitución §IX. No constituyen un baseline adicional ni paralelo.

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
- **Traza Saneada Vinculada:** [`./CF05_REALTIME_TRACE.md`](./CF05_REALTIME_TRACE.md) (registro cronológico con marcas de tiempo, Contexts A/B/C, latencias de handshake y mutación, estado de reconexión 1006 y aserciones de purga de caché Apollo/DOM).
- **Respaldo Automatizado Focalizado:** 22 pruebas (19 frontend + 3 backend) en PASS, correspondientes al subconjunto realtime de la línea base canónica de 785 pruebas.
- **Aislamiento de Topic:** **Sin fuga observada en los casos ejecutados** (Cero tramas privadas interceptadas por Sesión C en runtime y en tests unitarios).
- **Veredicto Final Compuerta CF-05:** **APROBADO (PASS)**.

La compuerta **CF-05** queda formalmente **CERRADA Y APROBADA** con respaldo de ejecución en vivo en dos sesiones aisladas, traza cronológica saneada y suites de concurrencia.
