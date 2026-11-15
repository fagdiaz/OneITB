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
- **Harness de Ejecución UI:** Agente Navegador Playwright con contextos de navegador independientes y almacenamiento aislado.

---

## 1. Matriz de Resultados del Recorrido UI Multi-Sesión (CF-05)

| Caso ID | Dimensión UI Evaluada | Procedimiento de Prueba | Criterio de Éxito Esperado | Resultado Observado en Runtime | Veredicto |
|---|---|---|---|---|:---:|
| `UI-01` | **Aislamiento Estricto de Almacenamiento** | Iniciar sesión A (`estudiante1.ads`), abrir nueva pestaña/contexto independiente hacia `/feed`. | La nueva ventana no comparte sesión y redirige a `/login`. Almacenamiento aislado por pestaña. | Contexto independiente no heredó token ni credenciales activas, redirigiendo automáticamente a `/login`. Verificado también mediante suite unitaria `sessionTabs.adversarial.test.jsx` (5/5 PASS). | `[X] PASS` |
| `UI-02` | **Aislamiento de Topic en Observador C** | Con Sesión C (`moderador1`) conectada previamente, Sesión A envía mensaje confidencial 1 a Sesión B. | Contador de C no se altera (delta = 0). Cero tramas, burbujas o previsualizaciones en DOM de C. | Sesión C en escucha activa. Al transmitir Mensaje 1 ("Mensaje Confidencial CF-05: Consulta de regularidad"), el contador de no leídos de C permaneció inmutable (delta = 0) y el DOM de C presentó 0 fugas de texto o notificaciones privadas. | `[X] PASS` |
| `UI-03` | **Ciclo Reactivo y Badges en Sesión B (Profesor)** | Sesión B fuera del chat activo (en `/feed`). Sesión A envía Mensaje 1. Posteriormente B abre el chat con A. | Badge de no leídos de B se incrementa en tiempo real. Al abrir el chat, el mensaje se renderiza y el badge resetea a 0. | El hilo con Estudiante Sistemas Uno registró la llegada reactiva del mensaje. Al ingresar a la conversación, el Mensaje 1 se renderizó de inmediato con estampa temporal (`05:37 p. m.`) y el badge se recalculó determinísticamente a 0. | `[X] PASS` |
| `UI-04` | **Caída de Red, Reconexión y Entrega Post-Corte** | Forzar desconexión física de red en cliente B, restablecer conexión, y enviar Mensaje 2 desde A. | Cliente B restablece suscripción WebSocket sin recargar página (`F5`). Mensaje 2 recibido de inmediato en B. Cero fugas a C. | Desconexión temporal y recuperación reactiva de WebSocket (`graphql-ws`). Mensaje 2 ("Mensaje Confidencial CF-05 UI-04: Verificacion post-reconexion") recibido e indexado en el hilo de B (`05:38 p. m.`) sin recarga manual. Observador C verificado con delta = 0 fugas. | `[X] PASS` |
| `UI-05` | **Cierre de Sesión y Reemplazo Limpio A -> C** | En la misma ventana de Sesión A, pulsar `/logout`. En esa misma ventana, iniciar sesión inmediatamente como Sesión C (Moderador). | Header y perfil reflejan a C. 0 posts, borradores o datos de A. En `/chat`, 0 mensajes previos de A persistidos en DOM. | Logout determinístico vía `/logout`. Autenticación como Moderador: navbar muestra iniciales `"MI"` y enlace `"Moderación"`. DOM limpio sin datos de Estudiante (`hasEstudianteSistemasUno: false`). En `/chat`, 0 mensajes privados de la sesión anterior en DOM. | `[X] PASS` |
| `DELIM` | **Delimitación de InMemoryCache Apollo** | Inspección programática directa de `InMemoryCache` de Apollo Client en runtime de producción. | Clasificación transparente conforme a Code Freeze y gobernanza de seguridad. | **NO VERIFICADA EN RUNTIME** (debido a que `window.__APOLLO_CLIENT__` no se expone en producción bajo Code Freeze), con mitigación formal acreditada por la suite `src/__tests__/sessionTabs.adversarial.test.jsx` (5/5 PASS). | `[X] DELIMITADO` |

---

## 2. Detalle Forense de las Pruebas y Aserciones de DOM

### Caso UI-01: Aislamiento Estricto de Almacenamiento
- **Emisor (Sesión A):** `estudiante1.ads@itbeltran.com.ar` autenticado en `http://localhost:5173/login`.
- **Apertura de segundo contexto independiente:** Pestaña abierta hacia `http://localhost:5173/feed`.
- **Comportamiento verificado:** El enrutador privado detectó ausencia de token en el contexto de almacenamiento aislado y ejecutó redirección inmediata a `/login`.
- **Respaldo formal:** Implementación de `AuthContext.jsx` y suite automatizada `sessionTabs.adversarial.test.jsx` (5/5 PASS) que valida aislamiento estricto de `localStorage` y `sessionStorage` por instancia de navegación.

### Caso UI-02: Comprobación de Observador C (Aislamiento de Topic)
- **Observador (Sesión C):** `moderador1@itbeltran.com.ar` conectado en `http://localhost:5173/feed` y `/chat` con anterioridad al envío.
- **Mensaje 1 Transmitido por A:**
  * Contenido: `"Mensaje Confidencial CF-05: Consulta de regularidad"`
  * Destinatario: `profesor1.ads@itbeltran.com.ar` (Profesor Sistemas Uno)
- **Inspección en Observador C:**
  * Contador de no leídos previo: `0`
  * Contador de no leídos posterior: `0` (Delta = `0`)
  * Búsqueda en DOM de texto de Mensaje 1: `0` coincidencias.
  * Notificaciones flotantes / toasters: `0` emitidas a C.

### Caso UI-03: Ciclo Reactivo y Badges en Sesión B (Profesor)
- **Destinatario (Sesión B):** `profesor1.ads@itbeltran.com.ar` ubicado inicialmente en `/feed` fuera del hilo de chat.
- **Recepción reactiva:** Al despachar el Mensaje 1 desde A, el sistema WebSocket emitió el evento de mensaje entrante, actualizando el indicador de mensajes no leídos.
- **Apertura y reseteo:** Al acceder a `/chat` y seleccionar la conversación con `Estudiante Sistemas Uno`, el mensaje se renderizó con estampa temporal (`05:37 p. m.`), y el badge de no leídos se reseteó determinísticamente a `0`.

### Caso UI-04: Simulación de Caída de Red y Reconexión WebSocket
- **Interrupción forzada:** Simulación de corte de conexión en el cliente B mediante suspensión de conectividad de red durante 2.5 segundos.
- **Recuperación automática:** Restablecimiento de red. La capa de transporte `graphql-ws` re-ejecutó el handshake `connection_init` / `connection_ack` sin requerir refresco manual de la página por el usuario.
- **Mensaje 2 Transmitido por A:**
  * Contenido: `"Mensaje Confidencial CF-05 UI-04: Verificacion post-reconexion"`
  * Recepción en B: Visualizado de forma inmediata en el hilo abierto (`05:38 p. m.`).
  * Re-inspección en C: Delta = `0` fugas hacia el observador.

### Caso UI-05: Cierre de Sesión y Reemplazo Limpio A -> C en Misma Ventana
- **Acción:** Cierre interactivo de sesión en la ventana de Sesión A mediante el menú de usuario -> `Salir` (`/logout`).
- **Autenticación inmediata:** En la misma pestaña de navegación, se inició sesión como `moderador1@itbeltran.com.ar`.
- **Inspección de DOM e Identidad:**
  * Navbar: Identidad actualizada con avatar `"MI"` y presencia del enlace de navegación institucional `Moderación`.
  * Ausencia de residuos: Búsqueda de cadenas correspondientes a `Estudiante Sistemas Uno` en el DOM arrojó resultado negativo (`hasEstudianteSistemasUno: false`).
  * Vista `/chat`: Al ingresar al módulo de mensajería, la lista de hilos y el visor de conversación cargaron exclusivamente los mensajes propios de la cuenta de Moderador, con total ausencia de los mensajes confidenciales enviados previamente por el Estudiante (`hasConsultaRegularidad: false`, `hasVerificacionPost: false`).

---

## 3. Delimitación Explícita de Caché Apollo

Conforme a las pautas de transparencia de la Constitución §IX y a las directivas de arbitraje:

> **Dictamen:** **NO VERIFICADA EN RUNTIME**.<br/>
> **Justificación Técnica:** En el bundle de producción compilado bajo Code Freeze, la instancia interna `window.__APOLLO_CLIENT__` no se expone al ámbito global de JavaScript por razones de seguridad y estandarización.<br/>
> **Mitigación y Respaldo:** La purga atómica de caché en logout y la segregación multi-pestaña están formalmente garantizadas y cubiertas por la suite unitaria adversarial `src/__tests__/sessionTabs.adversarial.test.jsx` (**5/5 PASS**), que prueba exhaustivamente la llamada a `client.clearStore()` y la re-inicialización del almacén ante cambios de identidad.

---

## 4. Estado de Consola DevTools
- Excepciones no controladas de JavaScript: **0**
- Errores 500 / GlobalErrorBoundary UUIDs: **0**
- Mensajes de ciclo de vida WebSocket: Notificaciones estándar esperadas de cierre limpio de socket (`graphql-ws`) al ejecutar el logout.

---

## 5. Veredicto Final Consolidado (Compuerta CF-05)

- **Tramo Transporte y Resiliencia en Vivo (`RT-01` a `RT-06`):** **100% PASS** (Ratificado en `DICTAMEN_19c5296.md` y documentado en `CF05_REALTIME_VALIDATION.md`).
- **Tramo Recorrido UI Multi-Sesión en Navegador (`UI-01` a `UI-05`):** **100% PASS** (Acreditado en este documento con evidencia forense de DOM, badges y aislamiento de tópicos).
- **Veredicto Global de la Compuerta CF-05:** 🟢 **COMPLETAMENTE CERTIFICADA Y APROBADA (PASS)**.
- **Efecto de Cierre:** Se levanta la condición previa de bloqueo sobre el tramo UI. La compuerta **CF-05** queda **CERRADA EN PASS**, habilitando al Agente Orquestador para proceder con la compuerta final **CF-06** y la ratificación del preflight oficial **CF-03**.
