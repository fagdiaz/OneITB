# 3. Casos de uso

| Dato de control | Valor |
|---|---|
| **Sistema** | OneITB23 |
| **Versión documental** | 2.0 |
| **Fecha de revisión** | 3 de agosto de 2026 |
| **Clasificación** | Catálogo académico derivado |
| **Actores** | Visitante, Estudiante, Profesor, Egresado, Empleador, Moderador y Administrador |
| **Cobertura** | 26 casos de uso; 48 requerimientos funcionales trazados |

Este catálogo describe los principales objetivos que los actores alcanzan mediante
OneITB. La autorización se decide en backend a partir del JWT y las relaciones
persistidas; ocultar una acción en React no constituye un control de seguridad. Los
contratos normativos permanecen en
[`scope-and-requirements.md`](../project_docs/scope-and-requirements.md) y el estado de
cada capacidad se consulta en el [`ROADMAP.md`](../project_docs/ROADMAP.md).

---

## 3.1 Convenciones y condiciones transversales

### Convenciones

- **Actor principal**: inicia el caso para alcanzar un objetivo.
- **Actores secundarios**: servicios o roles que colaboran con el resultado.
- **Precondición**: condición que debe cumplirse antes del flujo.
- **Postcondición**: estado observable que debe quedar al finalizar con éxito.
- **Alternativa**: salida controlada que no debe producir escrituras parciales.

### Condiciones comunes

1. Las operaciones protegidas requieren un JWT OneITB vigente y usuario/cuenta activos.
2. Los IDs enviados por el cliente no reemplazan al actor derivado de claims.
3. Los errores de autorización, validación o conflicto no exponen stack traces, secretos
   ni existencia de identidades cuando corresponda anti-enumeración.
4. Las escrituras críticas son transaccionales o idempotentes según su dominio.
5. Las relaciones usan claves foráneas explícitas y `DeleteBehavior.Restrict`.
6. Las fechas se almacenan en UTC y se localizan al presentarse.
7. Los archivos binarios se cargan por REST; el negocio se confirma mediante GraphQL.

## 3.2 Identidad y ciclo de sesión

### CU-01 Registrar una cuenta local

| Campo | Definición |
|---|---|
| **Actor principal** | Visitante |
| **Objetivo** | Crear una identidad permitida para ingresar posteriormente |
| **Precondiciones** | No existe una cuenta con el email; hay carreras activas disponibles |
| **Postcondiciones** | `Account`, `User` y asociaciones académicas quedan persistidos; no se inicia sesión automáticamente |
| **Requisitos** | `RF-001`, `BR-001` a `BR-003` |

**Flujo principal**

1. El visitante completa nombre, apellido, email institucional, contraseña y confirmación.
2. Selecciona al menos una carrera activa; el rol público se asigna como Estudiante.
3. React valida formato y coincidencia de contraseña y normaliza el email a minúsculas.
4. GraphQL vuelve a validar campos, duplicados, rol y carrera.
5. El backend normaliza identidad, genera el hash BCrypt y guarda la cuenta y el usuario.
6. La interfaz informa el alta y redirige a `/login`.

**Alternativas y errores**

- Email duplicado, carrera inexistente, dominio externo o contraseña inválida: se rechaza
  sin revelar si ya existe una cuenta.
- Cualquier rol distinto de Estudiante se rechaza en el alta pública; Profesor,
  Egresado, Moderador, Administrador y Empleador requieren aprovisionamiento confiable.
- El limiter específico acota intentos por IP y por identidad normalizada.

### CU-02 Iniciar sesión con credenciales locales

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario registrado |
| **Objetivo** | Obtener una sesión OneITB válida |
| **Precondiciones** | Cuenta y usuario activos; cuenta fuera de lockout |
| **Postcondiciones** | JWT local almacenado, Apollo/WebSocket asociados a la identidad y navegación privada habilitada |
| **Requisitos** | `RF-002`, `RF-003`, `RF-004B` |

**Flujo principal**

1. El usuario ingresa email y contraseña.
2. El backend busca el email normalizado y comprueba estado y lockout.
3. BCrypt verifica la contraseña.
4. El contador de fallos se reinicia y se emite JWT con claims canónicos.
5. `AuthContext` limpia cualquier sesión previa e hidrata la identidad nueva.

**Alternativas y errores**

- Credencial inválida: incrementa el contador y devuelve mensaje genérico.
- Quinto fallo: establece lockout de 15 minutos.
- Cuenta inactiva/bloqueada: no emite token ni revela detalles sensibles.

### CU-03 Iniciar sesión con Microsoft 365

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario de un directorio organizacional admitido |
| **Actor secundario** | Microsoft Entra ID |
| **Objetivo** | Canjear una identidad Microsoft validada por una sesión OneITB |
| **Precondiciones** | App Registrations, redirect URI, scope y consentimiento configurados |
| **Postcondiciones** | Identidad externa vinculada/provisionada sin privilegios y JWT OneITB emitido |
| **Requisitos** | `RF-004C`, `RF-004E` |

**Flujo principal**

1. El usuario selecciona el acceso Microsoft.
2. MSAL inicia `loginRedirect` con Authorization Code + PKCE.
3. Microsoft retorna a `/auth/microsoft/callback`.
4. El callback bloquea nuevas interacciones, selecciona la cuenta inequívoca y adquiere
   silenciosamente el access token del scope API.
5. GraphQL valida firma RS256, issuer, audience, vigencia, tenant, object ID, scope y
   dominio.
6. El backend vincula o aprovisiona la identidad con rol sin privilegios y emite JWT local.

**Alternativas y errores**

- Configuración faltante, token inválido o cuenta ambigua: flujo fail-closed.
- Rerender/Strict Mode: una barrera idempotente impide múltiples canjes.
- El access token Microsoft no autoriza directamente otros resolvers OneITB.
- La aceptación con tenant institucional real permanece como gate externo.

### CU-04 Solicitar y consumir un Magic Link

| Campo | Definición |
|---|---|
| **Actor principal** | Empleador aprobado o usuario habilitado por el flujo |
| **Actor secundario** | Servicio de correo/pickup local |
| **Objetivo** | Acceder mediante una credencial efímera de un solo uso |
| **Precondiciones** | Identidad activa y canal de entrega configurado |
| **Postcondiciones** | Token consumido, sesión local emitida y digest inutilizable para replay |
| **Requisitos** | `RF-032`, `BR-011` |

**Flujo principal**

1. El actor solicita el enlace con su email.
2. La API responde de manera uniforme, exista o no una identidad elegible.
3. Si corresponde, genera un token aleatorio, persiste solo su digest y entrega el enlace
   fuera de GraphQL.
4. El navegador retira el secreto del fragmento antes del canje.
5. El backend valida digest, expiración y no consumo, marca el token usado y emite JWT.

**Alternativas y errores**

- Solicitudes excesivas: rate limit sin revelar existencia de la cuenta.
- Token vencido, usado o alterado: rechazo controlado sin sesión.

### CU-05 Completar configuración académica inicial

| Campo | Definición |
|---|---|
| **Actor principal** | Estudiante autenticado sin carreras |
| **Objetivo** | Asociar al menos una carrera antes de usar el área privada |
| **Precondiciones** | Sesión válida, rol Estudiante y catálogo activo |
| **Postcondiciones** | `UserCareer` persistido y layout desbloqueado después de refetch de la misma identidad |
| **Requisitos** | `RF-004D`, `RF-006` |

**Flujo principal**

1. El guard detecta que `me.careers` está vacío.
2. Redirige a una vista obligatoria que no se cierra con Escape ni click-outside.
3. El estudiante selecciona una o más carreras y guarda.
4. La mutación reemplaza las asociaciones válidas.
5. Un refetch de `me` confirma persistencia y habilita la navegación.

### CU-06 Cerrar sesión o sustituir una identidad

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario autenticado |
| **Objetivo** | Terminar la sesión sin filtrar datos al siguiente usuario |
| **Postcondiciones** | Storage, Apollo y WebSocket limpios; rutas privadas inaccesibles |
| **Requisitos** | `RF-004F`, `RNF-010` |

**Flujo principal**

1. El usuario selecciona “Salir” o el sistema detecta expiración/autorización inválida.
2. Se incrementa la época de sesión y se invalidan respuestas en vuelo.
3. Apollo limpia su store y se termina el transporte WebSocket.
4. Se eliminan JWT e identidad local y se redirige a `/login`.
5. Si expiró la sesión, se muestra un mensaje institucional claro.

## 3.3 Perfil y estructura académica

### CU-07 Consultar y editar el perfil/CV propio

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario autenticado |
| **Objetivo** | Mantener una identidad académica/profesional persistente |
| **Precondiciones** | Perfil propio o alcance Admin permitido |
| **Postcondiciones** | Datos básicos y secciones relacionales del CV guardados en una única mutación |
| **Requisitos** | `RF-005`, `RF-006`, `RF-007B` |

**Flujo principal**

1. La query `me` carga avatar, bio, contacto, redes, carreras y secciones del CV.
2. El usuario edita los campos y, si corresponde, procesa el avatar en Canvas.
3. El binario final se carga por `/api/upload`; la URL resultante integra el formulario.
4. Una mutación centralizada persiste perfil, carreras y colecciones CV.
5. La vista pública se actualiza y el usuario puede abrir la plantilla formal de impresión.

**Alternativas y errores**

- Cancelar vuelve a `/profile` sin mutación.
- No seleccionar un avatar nuevo conserva la URL existente.
- Una falla de upload no borra la imagen previa ni guarda un perfil parcial.

### CU-08 Consultar un perfil público o privado

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario autenticado o visitante según la ruta |
| **Objetivo** | Consultar la identidad visible de otra persona respetando privacidad |
| **Postcondiciones** | Se presenta información completa o enmascarada según autorización backend |
| **Requisitos** | `RF-006B`, `RF-010`, `BR-005` |

**Flujo principal**

1. El actor abre `/profile/{id}` o selecciona un autor desde el feed/buscador.
2. La API identifica propietario y rol autorizado; la relación Follow no amplía permisos.
3. Para perfil público, entrega los campos permitidos.
4. Para perfil privado, conserva identidad básica y enmascara CV, contacto, carreras y
   métricas ante terceros no autorizados.
5. El actor puede seguir/dejar de seguir cuando corresponda.

**Control de privacidad vigente**

- El propietario, Administrador y Moderador pueden consultar el detalle privado. Un
  seguidor común recibe la misma vista enmascarada que cualquier tercero.

### CU-09 Administrar carreras, materias y correlatividades

| Campo | Definición |
|---|---|
| **Actor principal** | Administrador |
| **Objetivo** | Mantener el catálogo académico consistente |
| **Postcondiciones** | Carrera/materia activa y relaciones válidas disponibles en selectores |
| **Requisitos** | `RF-007`, `BR-008` |

**Flujo principal**

1. Admin ingresa al panel de materias.
2. Crea o edita carrera, código, nombre, año y estado.
3. Selecciona correlatividades pertenecientes a la carrera.
4. Backend valida existencia, duplicados y relación autorreferencial.
5. EF Core persiste sin cascadas cíclicas y refresca el catálogo.

## 3.4 Comunidad social y multimedia

### CU-10 Crear o editar una publicación multimedia

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario autenticado no silenciado |
| **Objetivo** | Compartir contenido contextualizado por carrera y materia |
| **Precondiciones** | Materia dentro del alcance del actor; archivos válidos |
| **Postcondiciones** | Inquiry activa con adjuntos ordenados y feed actualizado |
| **Requisitos** | `RF-008`, `RF-011`, `RF-012`, `RF-013` |

**Flujo principal**

1. La UI presenta solo materias de las carreras habilitadas, agrupadas por carrera/año.
2. El actor ingresa título/contenido y puede añadir hasta dos enlaces YouTube.
3. Selecciona hasta diez archivos, con máximo agregado de 15 MB, quita elementos y
   elige portada.
4. React muestra previews y carga cada binario con JWT a `/api/upload`.
5. El backend valida extensión, MIME, magic bytes/estructura, tamaño y metadatos.
6. GraphQL revalida materia y persiste Inquiry + `SocialAttachment` de forma consistente.
7. El feed muestra portada, mosaico acotado, overflow y visores correspondientes.

**Alternativas y errores**

- Tercer enlace YouTube, exceso de archivos/tamaño o archivo inválido: rechazo previo.
- Al editar, el actor puede conservar, quitar o agregar adjuntos.
- `SocialAttachment` debe pertenecer XOR a Inquiry o Comment.
- `GAP-FILE-01`: la entrega estática actual no aplica autorización por recurso.

### CU-11 Comentar, responder y mencionar

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario autenticado no silenciado |
| **Objetivo** | Participar en la conversación de una publicación |
| **Postcondiciones** | Comment activo, notificación agrupada y foco contextual disponible |
| **Requisitos** | `RF-009`, `RF-011`, `RF-013B` |

**Flujo principal**

1. El actor abre comentarios y el input recibe foco.
2. Escribe hasta 1.000 caracteres y puede adjuntar archivos válidos.
3. Para responder a un comentario raíz se guarda `ParentCommentId`.
4. Responder a una respuesta reutiliza la raíz y agrega la mención del destinatario, sin
   crear un tercer nivel.
5. La API persiste comentario y notificación para autor/mencionado, excluyendo al actor.
6. El deep-link permite volver al comentario y resaltarlo temporalmente.

### CU-12 Reaccionar y administrar relaciones sociales

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario autenticado |
| **Objetivo** | Expresar una reacción o ajustar la relación con otra persona |
| **Postcondiciones** | Reacción/interacción idempotente y feed recalculado según alcance |
| **Requisitos** | `RF-010`, `RF-013`, `BR-004`, `BR-009` |

**Flujo principal**

1. El actor reacciona a una publicación/comentario o elige seguir, silenciar o bloquear.
2. Backend valida identidad, sanción y contenido activo.
3. La operación crea/elimina la relación sin duplicados.
4. Si corresponde, genera una notificación agrupable para un tercero.
5. Feed y buscador priorizan seguidos y excluyen mute/block dentro del scoping académico.

**Alternativas y errores**

- Auto-like/auto-comentario: no genera notificación propia.
- Usuario silenciado: no puede reaccionar.
- El autor puede abrir la lista paginada de reacciones de su publicación.

### CU-13 Gestionar notificaciones y preferencias

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario autenticado |
| **Objetivo** | Consultar eventos relevantes y controlar avisos futuros |
| **Postcondiciones** | Estado leído/preferencias persistidos y badge recalculado |
| **Requisitos** | `RF-013B`, `RF-016B`, `RF-016C`, `RF-027` |

**Flujo principal**

1. La campana muestra `Count(n => !n.IsRead)` y recibe eventos realtime.
2. El usuario abre el listado y selecciona una notificación.
3. La API la marca leída y la UI navega a la publicación, comentario, recurso u oferta.
4. En configuración, el usuario activa/desactiva tipos o materias mediante toggles.
5. Las preferencias afectan eventos futuros sin borrar el historial.
6. Mensajes sin leer durante al menos una hora generan como máximo un recordatorio
   persistente por usuario.

### CU-14 Mantener una conversación privada

| Campo | Definición |
|---|---|
| **Actor principal** | Usuario autenticado |
| **Actor secundario** | Otro usuario autenticado |
| **Objetivo** | Intercambiar mensajes privados persistentes y en tiempo real |
| **Postcondiciones** | Mensaje almacenado, evento privado emitido y contador actualizado |
| **Requisitos** | `RF-014`, `RF-015`, `RF-016` |

**Flujo principal**

1. El actor selecciona un contacto y consulta historial paginado.
2. La API verifica que el actor sea emisor o receptor de cada conversación.
3. Envía un mensaje; EF Core lo persiste antes de publicar el evento.
4. El receptor conectado recibe el mensaje por su topic autenticado.
5. Al abrir la conversación se marcan mensajes leídos y se recalculan badges.

**Alternativas y errores**

- JWT WebSocket inválido o topic ajeno: conexión/evento rechazado.
- Sin presencia real, la UI no presenta estados “En línea” inventados.

### CU-15 Moderar contenido y usuarios

| Campo | Definición |
|---|---|
| **Actor principal** | Moderador o Administrador |
| **Objetivo** | Resolver reportes y reducir daño sin alterar autoría |
| **Precondiciones** | Rol vigente y contenido/usuario objetivo permitido |
| **Postcondiciones** | Acción reversible/auditada y contenido oculto o usuario silenciado |
| **Requisitos** | `RF-013C`, `RF-018`, `RF-019`, `RF-019B` |

**Flujo principal**

1. El actor abre reportes y consulta contenido, autor y contexto.
2. Selecciona ocultar/restaurar contenido o silenciar temporalmente según su rol.
3. Informa motivo cuando el contrato lo exige.
4. Backend valida que no edite texto ajeno ni afecte una cuenta Administrador protegida.
5. Persiste estado y `ModerationAudit` con actor, acción, fecha y datos sanitizados.

## 3.5 Recursos y progreso académico

### CU-16 Publicar y consultar recursos académicos

| Campo | Definición |
|---|---|
| **Actor principal** | Profesor o Administrador para crear; usuario autorizado para consultar |
| **Objetivo** | Compartir material independiente del feed por materia |
| **Postcondiciones** | Recurso versionado activo y audiencia notificada |
| **Requisitos** | `RF-020`, `RF-023` |

**Flujo principal**

1. El actor selecciona carrera y materia dentro de su alcance.
2. Informa título, descripción, categoría, versión y archivo o enlace.
3. Si hay binario, lo carga por el endpoint REST autenticado.
4. GraphQL valida permisos, materia y completitud y persiste `AcademicResource`.
5. Se notifican usuarios de la carrera, excluyendo al actor cuando corresponde.
6. Los usuarios autorizados filtran recursos por materia, categoría o texto.

### CU-17 Consultar o registrar progreso académico

| Campo | Definición |
|---|---|
| **Actor principal** | Estudiante para lectura propia; Profesor/Admin para gestión permitida |
| **Objetivo** | Consultar o actualizar estado y nota por materia |
| **Postcondiciones** | Progreso único por usuario/materia y notificación correspondiente |
| **Requisitos** | `RF-021`, `RF-023` |

**Flujo principal**

1. El estudiante consulta su progreso ordenado por carrera/materia.
2. Profesor/Admin selecciona estudiante y materia autorizados.
3. Backend valida rol, rango de nota y pertenencia académica: el Profesor debe estar
   vinculado a la carrera de la materia; el Administrador conserva alcance global.
4. Realiza upsert de `AcademicProgress` y registra la operación.
5. El estudiante recibe notificación del cambio.

**Política de alcance vigente**

- Spec 201 utiliza `UserCareer` como política equivalente y comprobable. Una futura
  relación Profesor-Materia solo sería necesaria para restringir aún más la granularidad.

### CU-18 Sincronizar calificaciones mediante SIU mock

| Campo | Definición |
|---|---|
| **Actor principal** | Administrador |
| **Actor secundario** | `ISiuIntegrationService` mock |
| **Objetivo** | Demostrar una integración desacoplada con upsert masivo de progreso |
| **Postcondiciones** | Registros válidos actualizados y operación auditada |
| **Requisitos** | `RF-022`, `RF-024` |

**Flujo principal**

1. Admin selecciona una materia y solicita sincronización.
2. El adaptador mock devuelve alumnos, notas y estados simulados.
3. El servicio valida rango 0-10, identidad y materia.
4. Realiza upsert por estudiante/materia y registra ítems inválidos sin abortar todo el lote.
5. Guarda Audit Trail y presenta resumen de resultados.

**Límite**: no existe conexión productiva con SIU Guaraní ni se procesan datos reales.

### CU-19 Exportar progreso o compartir una credencial limitada

| Campo | Definición |
|---|---|
| **Actor principal** | Estudiante autenticado |
| **Objetivo** | Descargar su progreso o compartir una acreditación mínima |
| **Postcondiciones** | CSV/impresión generada o ruta pública limitada disponible |
| **Requisitos** | `RF-025`, `RF-026` |

**Flujo principal**

1. El usuario consulta datos propios autorizados.
2. Selecciona exportar CSV o imprimir una constancia de apoyo.
3. El frontend genera salida sin incorporar HTML no confiable.
4. Para credencial pública, la API expone solo datos mínimos mediante identificador
   validado y permite construir un enlace de compartir.

**Límite**: estos artefactos no sustituyen certificados, títulos ni constancias oficiales
firmadas por la institución.

## 3.6 Bolsa de Trabajo y onboarding empresarial

### CU-20 Publicar una oferta laboral

| Campo | Definición |
|---|---|
| **Actor principal** | Empleador o Administrador |
| **Objetivo** | Incorporar una oportunidad visible para candidatos |
| **Postcondiciones** | `JobOffer` activa, evento realtime emitido y listado actualizado |
| **Requisitos** | `RF-028` |

**Flujo principal**

1. El actor ingresa título, empresa, descripción, ubicación y contacto de postulación.
2. Backend valida rol, contenido y autoría.
3. Persiste la oferta activa.
4. Publica `jobOfferCreated` y los clientes actualizan el badge/listado.

### CU-21 Postularse a una oferta

| Campo | Definición |
|---|---|
| **Actor principal** | Estudiante o Egresado |
| **Objetivo** | Registrar interés en una oferta activa |
| **Postcondiciones** | Una única `JobApplication` Pendiente por oferta/postulante |
| **Requisitos** | `RF-029` |

**Flujo principal**

1. El actor abre una oferta activa y revisa sus datos.
2. Selecciona “Postularse”.
3. Backend valida rol, oferta activa y ausencia de postulación previa.
4. Persiste la aplicación Pendiente y la UI cambia a “Postulado”.

### CU-22 Gestionar postulaciones de ofertas propias

| Campo | Definición |
|---|---|
| **Actor principal** | Empleador propietario; Administrador con alcance global |
| **Objetivo** | Revisar candidatos y actualizar su estado |
| **Postcondiciones** | Estado Revisado/Rechazado persistido y candidato notificado |
| **Requisitos** | `RF-030`, `RF-031` |

**Flujo principal**

1. El empleador abre el Gestor de Ofertas y Postulaciones.
2. Selecciona una oferta propia y filtra candidatos.
3. Consulta el Perfil Académico permitido del postulante.
4. Cambia el estado a Revisado o Rechazado.
5. Backend verifica `EmployerId == currentUserId`, persiste y envía correo/notificación.

**Alternativas y errores**

- Oferta ajena: rechazo sin modificación.
- Falla SMTP: error sanitizado y estado de negocio tratado conforme al adaptador/outbox.

### CU-23 Presentar una solicitud empresarial

| Campo | Definición |
|---|---|
| **Actor principal** | Visitante representante de una organización |
| **Objetivo** | Solicitar revisión para obtener una cuenta Empleador |
| **Postcondiciones** | Solicitud Pendiente o respuesta genérica equivalente |
| **Requisitos** | `RF-033` |

**Flujo principal**

1. El visitante abre `/empleos/solicitud` desde “Soy empresa”.
2. Completa empresa, contacto, email, teléfono, CUIT, comentarios y consentimiento.
3. El backend procesa primero el honeypot y luego valida/normaliza campos.
4. Aplica rate limit mediante fingerprint HMAC.
5. Persiste una solicitud Pendiente si corresponde y siempre devuelve confirmación
   genérica para evitar enumeración.

### CU-24 Procesar una solicitud empresarial

| Campo | Definición |
|---|---|
| **Actor principal** | Administrador |
| **Actor secundario** | Worker de Outbox y servicio de correo |
| **Objetivo** | Aprobar/rechazar una empresa y aprovisionar acceso controlado |
| **Postcondiciones** | Solicitud procesada; aprobación crea una sola cuenta Empleador y mensaje Outbox |
| **Requisitos** | `RF-034`, `RF-034B`, `RF-032` |

**Flujo principal de aprobación**

1. Admin filtra solicitudes y abre una Pendiente.
2. Confirma aprobación.
3. Una transacción serializable cambia estado, crea `Account`/`User` con rol fijo
   Empleador, registra auditoría y crea Outbox.
4. El worker adquiere lease y envía instrucciones/Magic Link.
5. Admin consulta estado de entrega y puede reintentar sin duplicar identidades.

**Flujo alternativo de rechazo**

1. Admin informa un motivo y confirma.
2. La solicitud queda Rechazada con procesador y fecha.
3. El audit transversal registra la acción sin copiar el motivo potencialmente sensible.

## 3.7 Administración e infraestructura controlada

### CU-25 Gestionar usuarios y operaciones críticas

| Campo | Definición |
|---|---|
| **Actor principal** | Administrador |
| **Objetivo** | Administrar identidades sin comprometer cuentas privilegiadas |
| **Postcondiciones** | Cambio autorizado persistido y auditado |
| **Requisitos** | `RF-004`, `RF-017`, `RF-019B`, `RF-024` |

**Flujo principal**

1. Admin consulta usuarios paginados y métricas necesarias.
2. Modifica estado o rol de una cuenta no administrativa.
3. Para promover a Administrador, confirma intención e ingresa su propia contraseña.
4. Backend verifica actor, contraseña y protección del objetivo.
5. Persiste el cambio y Audit Trail sanitizado.

**Alternativas y errores**

- Objetivo ya Administrador: no permite cambiar rol ni desactivar.
- Rol no permitido o contraseña incorrecta: rechazo sin escritura.

### CU-26 Probar correo e inspeccionar salud operativa

| Campo | Definición |
|---|---|
| **Actor principal** | Administrador |
| **Objetivo** | Comprobar SMTP y señales operativas sin ejecutar un flujo laboral completo |
| **Postcondiciones** | Correo de prueba enviado/capturado o error controlado registrado |
| **Requisitos** | `RF-031B`, `RNF-007`, `RNF-008` |

**Flujo principal**

1. Admin invoca la operación de prueba con un destinatario válido.
2. La API verifica autorización declarativa y configuración del adaptador.
3. Envía un mensaje básico sin exponer host, usuario o contraseña.
4. Devuelve éxito o error sanitizado y conserva trazabilidad técnica.

## 3.8 Trazabilidad RF-CU

| Requerimientos | Casos de uso |
|---|---|
| `RF-001` | `CU-01` |
| `RF-002`, `RF-003`, `RF-004B` | `CU-02` |
| `RF-004C`, `RF-004E` | `CU-03` |
| `RF-032` | `CU-04`, `CU-24` |
| `RF-004D`, `RF-006` | `CU-05`, `CU-07` |
| `RF-004F` | `CU-06` |
| `RF-005`, `RF-007B` | `CU-07` |
| `RF-006B` | `CU-08` |
| `RF-007` | `CU-09` |
| `RF-008`, `RF-011`, `RF-012` | `CU-10`, `CU-11` |
| `RF-009` | `CU-11` |
| `RF-010`, `RF-013` | `CU-08`, `CU-12` |
| `RF-013B` | `CU-11`, `CU-13` |
| `RF-013C`, `RF-018`, `RF-019` | `CU-15` |
| `RF-014`, `RF-015`, `RF-016` | `CU-14` |
| `RF-016B`, `RF-016C`, `RF-027` | `CU-13` |
| `RF-017` | `CU-09`, `CU-25` |
| `RF-019B`, `RF-024` | `CU-15`, `CU-18`, `CU-25` |
| `RF-020` | `CU-16` |
| `RF-021` | `CU-17` |
| `RF-022` | `CU-18` |
| `RF-023` | `CU-16`, `CU-17` |
| `RF-025`, `RF-026` | `CU-19` |
| `RF-028` | `CU-20` |
| `RF-029` | `CU-21` |
| `RF-030`, `RF-031` | `CU-22` |
| `RF-031B` | `CU-26` |
| `RF-033` | `CU-23` |
| `RF-034`, `RF-034B` | `CU-24` |

## 3.9 Criterio de aceptación de los casos

Un caso de uso se considera aceptado únicamente cuando:

1. El flujo principal y sus salidas alternativas están implementados.
2. Backend valida rol, ownership, estado y relaciones aplicables.
3. Un error no deja escrituras parciales ni expone información sensible.
4. GraphQL y frontend comparten el mismo contrato ejecutado.
5. Las mutaciones tienen pruebas positivas, negativas y de no-escritura según riesgo.
6. Los flujos visuales críticos se recorren con el rol correspondiente.
7. Las operaciones realtime se validan con identidades aisladas.
8. La evidencia se registra sobre el SHA candidato y actualiza el Roadmap.

Las brechas identificadas dentro de un caso deben resolverse o aceptarse formalmente; no
se eliminan de la documentación para presentar un resultado más favorable.
