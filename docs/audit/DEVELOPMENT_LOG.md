# Historial de Desarrollo y Cambios - OneITB23

Este archivo registra las specs y cambios completados que tienen respaldo en el codigo o la documentacion vigente, en orden cronologico inverso.
La entrada mas reciente debe agregarse inmediatamente debajo de este bloque.

---

## [2026-06-17] - Feed Gamification UX (Spec: 112-feed-gamification-ux)

* **Objetivo**: completar la segunda tanda recomendada de UX social/gamificacion sin introducir nueva persistencia: perfiles clickeables, seguir inline, badges de participacion, jerarquia visual para administradores y modales de revision admin.
* **Resultado**:
  - Feed: los nombres de autores ahora navegan a `/profile/{id}`, las tarjetas de autores ajenos incluyen accion inline "Seguir" y los usuarios con actividad suficiente muestran badges compactos.
  - Comentarios: los autores tambien son navegables y comparten badges de participacion.
  - Jerarquia visual: publicaciones y comentarios de `Administrador` reciben tratamiento azul sutil para distinguir contenido institucional.
  - Busqueda/filtros: administradores y moderadores conservan busqueda global; usuarios normales priorizan filtros por sus carreras cuando existen.
  - Admin Dashboard: publicaciones y comentarios tienen modales de preview con contenido completo, metadata, short IDs, reportes y contexto asociado.
* **Validaciones ejecutadas**:
  - Backend Release: compilacion correcta con 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores; persiste solo advertencia deprecada de `vite:react-babel`.
* **Runtime**: smoke GraphQL/browser bloqueado; el arranque temporal del backend falla por configuracion SQL Server encryption/certificado y permisos de Windows Event Log.
* **Evidencia**: `specs/112-feed-gamification-ux/evidence.md`.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/PublicationManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/CommentManagement.jsx`

## [2026-06-17] - Moderation Roles Safety (Spec: 111-moderation-roles-safety)

* **Objetivo**: agregar el rol operativo `Egresado`, silenciamiento temporal, proteccion de cuentas administradoras y metricas de moderacion sin ampliar todavia la gamificacion visual completa.
* **Resultado**:
  - Backend: `User` incorpora `MutedUntil`; `silenceUser(userId, hours)` permite silenciar usuarios no administradores por duraciones controladas.
  - Seguridad: `UsersService` bloquea cambios de rol, suspension y silenciamiento sobre cuentas `Administrador`.
  - Publicaciones/comentarios: `SocialService` impide crear contenido si el usuario autenticado tiene un silencio vigente.
  - GraphQL: se exponen metricas de usuario (`totalPosts`, `totalComments`, `totalLikesReceived`, `totalReportsReceived`) y contadores `reportCount` para publicaciones/comentarios.
  - Frontend: el panel de usuarios muestra short IDs, metricas, reportes recibidos, estado de silencio, rol `Egresado` y controles deshabilitados para administradores.
* **Base de datos**: se genero y aplico `20260617015425_AddUserMutedUntil`.
* **Validaciones ejecutadas**:
  - Backend Release: compilacion correcta con 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores; persiste solo advertencia deprecada de `vite:react-babel`.
  - `dotnet ef database update`: migracion aplicada correctamente.
  - `dotnet ef migrations list`: `20260617015425_AddUserMutedUntil` figura como ultima migracion aplicada.
* **Runtime**: smoke GraphQL/browser bloqueado; el endpoint `localhost:44397/graphql` corta la conexion y el arranque temporal via `Start-Process` fallo por conflicto `Path`/`PATH`.
* **Evidencia**: `specs/111-moderation-roles-safety/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260617015425_AddUserMutedUntil.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/Services/Social/SocialService.cs`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/admin.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/admin.js`

## [2026-06-15] - Mega Refactor Core (Spec: 110-mega-refactor-core)

* **Objetivo**: estabilizar el cruce `MiniChatWidget`/`PrivateChat`, implementar carreras/cursadas, filtros del feed, soft-delete de publicaciones/comentarios, grafo social y perfil publico de solo lectura con edicion aislada.
* **Resultado**:
  - Backend: se agregaron `Career`, `UserCareer`, `SubjectCareer` y `UserInteraction`; `Inquiry` y `Comment` ahora soportan `IsActive`/`UpdatedAt` con filtros globales.
  - EF Core: relaciones nuevas mapeadas explicitamente con `DeleteBehavior.Restrict`, indices de consulta y migraciones `20260615211200_AddCareersAndSocialGraph` y `20260615211900_SeedCareersAndSocialGraphData` aplicadas.
  - GraphQL: se expusieron `careers`, `myCareers`, `subjects(careerId)`, `inquiries(searchTerm, careerId, subjectIds)`, `publicProfile`, y mutaciones de vinculo de carreras, edicion/soft-delete e interacciones sociales.
  - Frontend: el chat comparte helpers de cache en `chatCache.js`, usa `useMemo` para derivaciones y protege callbacks asincronicos con guards de montaje.
  - Feed: se agregaron busqueda, filtros por carrera/materia, seleccion carrera -> materia para publicar, acciones de editar/eliminar, reportar, seguir, silenciar y bloquear.
  - Perfil: `/profile` ahora es lectura resumida con modal "Ver mas" y publicaciones recientes; `/profile/edit` conserva la edicion aislada desde el menu del avatar.
* **Validaciones ejecutadas**:
  - Backend Release: compilacion correcta con 0 errores.
  - Frontend Vite: build exitoso con 0 errores.
  - `git diff --check`: sin errores de whitespace, solo advertencias CRLF.
  - `dotnet ef migrations list`: migraciones 110 aplicadas sin estado `(Pending)`.
* **Notas operativas**:
  - `dotnet ef migrations add` no pudo usarse por bloqueo de acceso a NuGet en el entorno; las migraciones EF se agregaron manualmente y compilan.
  - El arranque del backend desde sandbox no pudo ejecutar `DbInitializer` por `Failed to generate SSPI context`; por eso se agrego una migracion SQL idempotente para poblar carreras/vinculos.
* **Evidencia**: `specs/110-mega-refactor-core/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Career.cs`
  - `API Graphql/Entities/Models/UserInteraction.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/chatCache.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`

## [2026-06-14] - Chat UX Refinement (Spec: 107-chat-ux-refinement)

* **Objetivo**: Corregir la usabilidad de la interfaz de chat en tres aspectos críticos: el estado de búsqueda persistente, la falta de reactividad al contactar nuevos usuarios, y el manejo de envíos por teclado.
* **Resultado**:
  - Se agregó `setSearchTerm('')` al seleccionar usuarios/mensajes.
  - Se implementó la revalidación reactiva del query de conversaciones activas (`refetchActive()`) al enviar o recibir mensajes de usuarios ausentes de dicha lista.
  - Se configuró el `<textarea>` nativamente para que la combinación `Enter` (sin la tecla modificadora `Shift`) despache el mensaje al estilo estándar de las plataformas de mensajería.
* **Validaciones ejecutadas**:
  - Tareas documentadas en `tasks.md` tras completar los cambios previos en el código.
  - El proyecto fue compilado y verificado.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`

## [2026-06-14] - Chat Smart Search (Spec: 106-chat-smart-search)

* **Objetivo**: Refinar la usabilidad del chat privado implementando un sistema de filtrado y búsqueda categorizada con tres niveles de prioridad (Conversaciones activas, Nuevos usuarios, Mensajes coincidentes).
* **Resultado**:
  - Backend: Se implementaron `GetActiveConversations` y `SearchMyMessages` en `IMessagingService.cs` y `MessagingService.cs`, restringidos por el JWT del usuario, y se mapearon en `Query.cs`.
  - Frontend: Se refactorizó `PrivateChat.jsx` para gestionar el estado de `searchTerm` reactivamente. Ahora consume las nuevas consultas para priorizar contactos y habilitar la búsqueda dinámica por nombre, rol y contenido de mensajes sin perder los contadores de mensajes no leídos.
* **Validaciones ejecutadas**:
  - Backend compilado en Release sin errores.
  - Frontend Vite build exitoso.
  - Tareas en `tasks.md` marcadas como finalizadas y código commiteado.
* **Archivos principales**:
  - `API Graphql/Services/Messaging/IMessagingService.cs`
  - `API Graphql/Services/Messaging/MessagingService.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/chat.js`

## [2026-06-14] - Mensajeria Privada en Tiempo Real (Spec: 104-realtime-private-messaging)

* **Objetivo**: Implementar conversaciones privadas uno a uno con historial persistente, entrega en tiempo real mediante GraphQL Subscriptions y una interfaz responsive integrada al frontend.
* **Resultado**:
  - Se agrego la entidad `Message` con claves foraneas explicitas para emisor y receptor, indices de conversacion/no leidos y `DeleteBehavior.Restrict` en ambas relaciones.
  - Se incorporaron `messagingContacts`, `conversation`, `sendMessage`, `markConversationRead` y `messageReceived`, todos derivados del usuario autenticado por JWT.
  - HotChocolate autentica el `connection_init` del WebSocket y publica cada mensaje en los topicos privados del emisor y receptor.
  - Apollo Client separa HTTP y WebSocket con `graphql-ws`, aplica actualizaciones optimistas, deduplicacion por ID, sincronizacion de no leidos y reconciliacion al reconectar.
  - La ruta `/chat`, el enlace de navegacion y la burbuja flotante quedaron integrados. La UI responsive evita que la burbuja tape el boton de envio en movil.
* **Base de datos**: Se genero y aplico `20260614022436_AddPrivateMessaging`; EF Core confirmo que no quedan cambios de modelo pendientes.
* **Validaciones ejecutadas**:
  - Backend Release: 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores.
  - Tres clientes WebSocket: entrega unica a emisor/receptor, aislamiento de un tercero y rechazo sin JWT.
  - Persistencia: historial recuperado despues de desconexion y estado de lectura verificado.
  - Navegador: contactos, historial y envio inmediato verificados en escritorio y viewport movil `390x844`, sin errores finales de consola.
* **Evidencia**: `specs/104-realtime-private-messaging/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Message.cs`
  - `API Graphql/Services/Messaging/`
  - `API Graphql/OneITB/GraphQL/Subscription.cs`
  - `API Graphql/OneITB/Authentication/AuthenticationSocketSessionInterceptor.cs`
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/chat.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`

## [2026-06-13] - Admin Dashboard UX Refinement (Spec: 102-admin-ux-refinement)

* **Objetivo**: Refinar la Experiencia de Usuario (UX) en el AdminDashboard.jsx, implementando modales dedicados para la edición de materias y reestructurando la pestaña de moderación para mostrar un historial completo de reportes divididos por estado.
* **Resultado**:
  - Se refactorizó `SubjectManagement.jsx` para utilizar un componente Modal superpuesto con `z-index` y `bg-black/50`, reemplazando el formulario estático (inline) que rompía el desplazamiento visual de la pantalla.
  - Se actualizó `ModerationManagement.jsx` implementando un *Split View* (botones en formato "tabs" integrados). Ahora la vista se divide dinámicamente entre el array de reportes "Pendientes" y el "Historial", permitiendo a los moderadores auditar las decisiones previas sin requerir mutaciones o queries nuevas.
  - Se confirmó el cumplimiento de la directiva estricta "Frontend Only" implementando los cambios lógicos del lado del cliente.
  - Validaciones completadas: `npm run build` del frontend exitoso con Vite (0 errores).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`

## [2026-06-13] - Admin CRUD & UI Polish (Spec: 101-admin-actions-and-ui-polish)

* **Objetivo**: Dotar de interactividad completa (CRUD) a las pestañas de Materias y Reportes en el AdminDashboard, igualando la UI del reporte de comentarios con la publicación principal, y solucionar definitivamente los problemas de codificación de caracteres especiales (Encoding) en los datos de la plataforma.
* **Resultado**:
  - Se eliminaron los caracteres acentuados de las cadenas en `DbInitializer.cs` para mitigar el problema de Encoding sin reconfigurar la base de datos subyacente.
  - Se movió el botón "Reportar" en la interfaz de comentarios a un icono de bandera alineado a la derecha en la cabecera.
  - Se integró el modelo `Subject` con la propiedad `IsActive` a través de EF Core Migrations.
  - Se implementaron y conectaron las mutaciones GraphQL de gestión de Materias (`AddSubject`, `UpdateSubject`, `ToggleSubjectStatus`) y la actualización de Reportes (`UpdateReportStatus` a 'Resolved' y 'Rejected').
  - Validaciones completadas: Compilación de `API Graphql/OneITB/GraphQL.csproj` en Release, `npm run build` del frontend exitosos, y aplicación correcta de la migración en EF Core.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Data/DbInitializer.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/subjects.js` (Nuevo)
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/moderation.js`

## [2026-06-13] - UI: Quick Wins y Pulido de Interfaz (Spec: 100-quick-wins-ui-polish)

* **Objetivo**: Ejecutar una fase de pulido integral sobre la UI del Módulo 3 y el Panel de Administración para resolver problemas de codificación de caracteres, formateo de fechas, reportes en comentarios y consistencia visual en administración.
* **Resultado**:
  - Se forzó el formato UTF-8 en la base de datos simulada (`DbInitializer.cs`) asegurando que los caracteres especiales (eñes, tildes) se sirvan correctamente.
  - Se mejoró la legibilidad temporal eliminando los segundos de las publicaciones y comentarios usando `toLocaleString` con opciones estrictas (`HH:mm`).
  - Se incorporó la funcionalidad "Reportar" en la lista de comentarios anidados de `CommentThread.jsx`, propagando su ID al modal genérico de reportes.
  - Se hizo explícito el botón de suspensión y activación de cuentas en la tabla de `UserManagement.jsx`.
  - Se unificó el diseño visual del panel administrativo al refactorizar `SubjectManagement.jsx` y `ModerationManagement.jsx` de tarjetas al formato de lista tabular utilizado en `UserManagement.jsx`.
* **Archivos Modificados**:
  - `API Graphql/Data/DbInitializer.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`

## [2026-06-13] - Full-Stack: Ecosistema Social, Mega-Seed y Administracion (Spec: 099-social-admin-ecosystem)

* **Objetivo**: Habilitar un entorno demostrable con datos realistas, interacciones sociales completas y un panel administrativo por pestañas.
* **Resultado**: Se incorporaron comentarios anidados, reacciones unicas, reportes de publicaciones, resolvers autenticados por JWT, consultas proyectadas y un dashboard con Usuarios, Materias y Moderacion. El feed permite publicar, reaccionar, comentar, responder y abrir el modal de reporte sin recargar la pagina.
* **Base de datos**: Se aplico `AddSocialEcosystem` con claves foraneas explicitas y `DeleteBehavior.Restrict`. El seed idempotente administra 10 usuarios, 5 materias, 30 publicaciones, 90 reacciones, 45 comentarios, 15 respuestas y 2 reportes; una segunda inicializacion mantuvo los mismos conteos.
* **Validaciones ejecutadas**:
  - Backend Release: 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores.
  - EF Core: migracion aplicada y sin cambios de modelo pendientes.
  - GraphQL: altas, comentarios, respuestas, toggle de reaccion, reportes, rechazo de duplicados y autorizacion por roles verificados.
  - Navegador: publicacion inmediata, Me gusta, modal de reporte y las tres pestañas administrativas verificadas.
* **Evidencia**: `specs/099-social-admin-ecosystem/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Comment.cs`
  - `API Graphql/Entities/Models/Reaction.cs`
  - `API Graphql/Data/DbInitializer.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/Social/`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`

---

## [2026-06-13] - Backend: Exposición del Autor de Inquiry (Spec: 098-feed-stabilization)

* **Objetivo**: Resolver el HTTP 400 causado por la ausencia del campo `user` en `Inquiry`, manteniendo integridad relacional y evitando N+1.
* **Resultado**: Se agregó la navegación `Inquiry.User`, se mapeó mediante `UserId` con `DeleteBehavior.Restrict` y se mantuvo `[UseProjection]` para que HotChocolate proyecte el autor. La query canónica y la query actual del frontend responden HTTP 200. Se agregaron aliases backend temporales para `idUsuario`, `nombre` y `apellidos` sin eliminar `id`, `firstName` y `lastName`.
* **Base de datos**: EF confirmó que no existen cambios físicos pendientes; no se generó una migración vacía y no se modificó `DbInitializer.cs`.
* **Validaciones ejecutadas**:
  - `dotnet ef migrations has-pending-model-changes`: sin cambios pendientes.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: 0 errores.
  - Backend aislado en `http://127.0.0.1:5098`: query canónica HTTP 200 y query actual del feed HTTP 200.
* **Bloqueo restante**: la base actual devuelve `subjects: []`, por lo que todavía no puede validarse la creación completa de publicaciones.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `specs/098-feed-stabilization/`

---

## [2026-06-13] - Documentation: Stabilization Governance and Feed Baseline (Rama: 049-estabilizacion)

* **Objetivo**: Normalizar la documentacion operativa y establecer una fuente de verdad verificable para estabilizar el feed antes de ampliar funcionalidades.
* **Resultado**: Se confirmo que backend y frontend compilan, pero la introspeccion del servidor activo demostro que `Inquiry` no expone `user` y que `User` utiliza `id`, `firstName` y `lastName`. Por lo tanto, la query actual del feed permanece desalineada y no se declara completa. Se creo la spec `098-feed-stabilization`, se formalizo el cierre documental obligatorio por spec y se recalculo el roadmap desde sus checklists.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: 0 errores, 6 advertencias.
  - `npm.cmd run build`: exitoso con Vite 8.0.16.
  - Introspeccion GraphQL sobre `https://localhost:44397/graphql`: HTTP 200; contrato desalineado confirmado.
* **Archivos principales**:
  - `AGENTS.md`
  - `.specify/memory/constitution.md`
  - `.specify/templates/tasks-template.md`
  - `.agents/skills/speckit-qa/SKILL.md`
  - `docs/audit/fix-roadmap-13-06-2026.md`
  - `docs/audit/RUNBOOK_DEV.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `docs/project_docs/ROADMAP.md`
  - `specs/098-feed-stabilization/`

---

## [2026-06-13] - Bugfix: Alineación Definitiva de Consulta User/Inquiry (Rama: 097-final-query-alignment)

* **Objetivo**: Corregir definitivamente el desajuste entre el nombre de navegación expuesto por el backend (`user`) y las propiedades internas traducidas al español por HotChocolate en la consulta `GET_INQUIRIES`, habilitando la carga de datos limpios creados desde la interfaz.
* **Descripción**: Se adaptó la query en el archivo `inquiries.js` para pedir explícitamente el objeto `user { idUsuario, nombre, apellidos, alias }`. Posteriormente se refactorizó `Feed.jsx` para interpolar dinámicamente `post.user?.nombre` y `post.user?.apellidos` en el generador de avatares de `ui-avatars` y en el subtexto de la publicación. Se verificó que el archivo `DbInitializer.cs` no fuera modificado, respetando la política estricta de NO SEEDING.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-06-13] - Bugfix: Alineación de Nomenclatura Frontend/HotChocolate (Rama: 095-fix-graphql-query-names)

* **Objetivo**: Resolver el Error 400 provocado por el rechazo de consultas mal nombradas en Apollo Client, producto del auto-formateo del esquema de HotChocolate.
* **Descripción**: Se auditaron las constantes de GraphQL en el cliente. Se reemplazó la solicitud de campos `getSubjects` y `getInquiries` por `subjects` e `inquiries` respectivamente en los archivos de queries (`subjects.js` e `inquiries.js`), para cumplir con la convención implícita de HotChocolate de eliminar prefijos "Get" y convertir a camelCase. En consonancia, se ajustó la extracción de los datos cacheados en `Feed.jsx` apuntando a `data?.subjects` y `data?.inquiries`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-06-13] - Bugfix: Proveedores de Proyecciones HotChocolate (Rama: 094-hotchocolate-projections-fix)

* **Objetivo**: Solucionar el Error HTTP 500 (System.Exception: Projection provider not found) que impedía la ejecución de las consultas `GetSubjects` y `GetInquiries`.
* **Descripción**: Se auditaron y registraron los métodos de extensión necesarios en el pipeline de inicialización del servidor GraphQL en `Startup.cs`. Se inyectaron `.AddProjections()`, `.AddFiltering()` y `.AddSorting()` al constructor de dependencias `services.AddGraphQLServer()`, habilitando que los atributos `[UseProjection]` usados previamente en los resolvers deleguen efectivamente los árboles de consulta al proveedor de Entity Framework de manera nativa.
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-06-13] - Feature: GraphQL Endpoints para Subjects e Inquiries (Rama: 093-backend-inquiries-subjects-endpoints)

* **Objetivo**: Proveer al backend de los resolvers GraphQL necesarios para soportar la lectura de materias, publicaciones del muro y la creación de las mismas mediante firmas planas (evitando errores 400).
* **Descripción**: Se inyectó `[Service] OneItbContext` nativamente en los resolvers. En `Query.cs` se implementaron `GetSubjects` y `GetInquiries`, ambos con atributos `[UseProjection]` para optimización de queries hacia la BD mediante IQueryable. En `Mutation.cs` se agregó `AddInquiry` bajo el atributo `[Authorize]`, que toma argumentos planos (`userId`, `subjectId`, `title`, `content`), construye la entidad física y aplica el `SaveChangesAsync()`.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-06-13] - Bugfix/Feature: Mutación Plana y Formulario de Publicación (Rama: 091-build-flat-mutation)

* **Objetivo**: Reconstruir el formulario de creación de consultas en el feed tras el rollback y conectarlo al backend asegurando el envío de variables planas para evitar el Error 400 documentado con HotChocolate.
* **Descripción**: Se implementaron desde cero las sentencias de Apollo Client `GET_SUBJECTS` y `CREATE_INQUIRY` en archivos separados (queries y mutations). Se actualizaron los imports y el estado local en `Feed.jsx` para integrar el formulario de manera fluida antes de las tarjetas de publicaciones. La firma de la mutación envía exclusivamente escalares directos, transformando `subjectId` a entero (`parseInt`) por seguridad, y prescindiendo de envoltorios `input` o `payload`, garantizando compatibilidad 1:1 con la nueva estructura del Backend. 
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/inquiries.js` (Nuevo)
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js` (Nuevo)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-06-13] - Bugfix: Erradicación de Shadow Properties (Rama: 090-fix-shadow-properties)

* **Objetivo**: Eliminar la generación de columnas fantasma (como `SubjectId1`) en EF Core para evitar la interrupción de la creación de publicaciones (Error 547) generada por llaves foráneas incorrectas.
* **Descripción**: Se aplicó una solución rigurosa usando Fluent API en el método `OnModelCreating` de `OneItbContext.cs`, mapeando bidireccionalmente la relación 1:N entre `Subject` e `Inquiry` (`HasOne...WithMany...HasForeignKey`), y estableciendo la política estricta de borrado `DeleteBehavior.Restrict`. Se inyectaron correctamente las colecciones de navegación en los modelos `Subject.cs` e `Inquiry.cs`. Finalmente, se aplicó la migración `FixShadowProperties` a la base de datos de manera exitosa y sin generar conflictos con el Frontend.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/` (Archivos de Migración)

---

## [2026-06-13] - Feature: Professional Seed Users (Rama: 088-professional-seed-users)

* **Objetivo**: Implementar el sembrado automático de usuarios de prueba (Seeding) para todos los roles del sistema utilizando GUIDs estáticos y contraseñas hasheadas con BCrypt, garantizando la idempotencia y evitando errores de integridad referencial.
* **Descripción**: Se instaló el paquete `BCrypt.Net-Next` en la capa de Datos (resolviendo un conflicto de versiones con `Services.csproj` mediante la estandarización a la v4.2.0). Se creó `DbInitializer.cs` definiendo 5 constantes UUID reales e inmutables. El sembrador crea las entidades `Account` (con la clave "Test1234!" hasheada) y sus respectivas entidades `User` (para los roles Administrador, Estudiante, Profesor, Moderador, Empleador). Se inyectó la llamada a la inicialización en el pipeline de arranque de `Program.cs`. La compilación finalizó exitosamente (0 Errores).
* **Archivos Modificados**:
  - `API Graphql/Data/Data.csproj` y `API Graphql/Services/Services.csproj`
  - `API Graphql/Data/DbInitializer.cs` (Nuevo)
  - `API Graphql/OneITB/Program.cs`

---

## [2026-06-13] - Bugfix: Actualización de Font Awesome para Zero Warnings (Rama: 081-fontawesome-upgrade)

* **Objetivo**: Erradicar el warning recurrente de Chromium (`Glyph bbox was incorrect; adjusting`) provocado por errores internos de cálculo en Font Awesome 6.1.x, actualizando la librería a la versión 6.6.0.
* **Descripción**: Se modificó el punto de entrada principal del Frontend (`index.html`) para importar el CDN de Font Awesome v6.6.0 en lugar de v6.1.2. Esta versión contiene los parches oficiales para el bug de la "bounding box" al renderizar íconos sólidos en navegadores modernos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`

---

## [2026-06-12] - UI: Fix Regla de Hooks en AdminDashboard (Rama: 062-admin-dashboard-hooks-fix)

* **Objetivo**: Solucionar la excepción "Rendered more hooks than during the previous render" garantizando que los hooks se ejecuten incondicionalmente en la capa de administración.
* **Descripción**: Se auditaron y refactorizaron los subcomponentes internos `SubjectsManagement` y `ReportsManagement` en `AdminDashboard.jsx`. Se identificó que `useMemo` estaba siendo invocado después de retornos tempranos condicionales (`if (loading) return ...`). La solución consistió en elevar la definición de los hooks de filtrado reactivo (`filteredSubjects` y `filteredReports`) por encima de cualquier cláusula de retorno temprano, restaurando el cumplimiento íntegro de las "Rules of Hooks" de React y estabilizando el panel en tiempo de ejecución.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`

---

## [2026-06-10] - Frontend: Interfaz Rol Empleador y Moderación Comunitaria (Rama: 046-frontend-employer-and-moderation)

* **Objetivo**: Integrar las nuevas funcionalidades de acceso "Passwordless" y reportes de contenido en la interfaz de React utilizando Tailwind v4.
* **Descripción**: Se diseñó el componente `EmployerLogin.jsx` con los estados necesarios para solicitar el Magic Link (simulando AFIP) y procesar el inicio de sesión. Se agregó un componente genérico `ReportModal.jsx` y se integró en el `Feed.jsx`, permitiendo a los usuarios pulsar la bandera de reporte en cualquier publicación para enviarla a revisión.
* **Archivos Modificados/Creados**:
  - `src/data/graphql/mutations/employer.js` & `moderation.js`
  - `src/Components/auth/EmployerLogin.jsx`
  - `src/Components/moderation/ReportModal.jsx`
  - `src/router/Routing.jsx` (Ruta '/employer-login')
  - `src/Components/publication/Feed.jsx`

---

## [2026-06-10] - Backend: Infraestructura Rol Empleador y Moderación (Rama: 045-backend-employer-and-moderation)

* **Objetivo**: Implementar la lógica y persistencia del nuevo rol de Empleador y del sistema de Reportes Comunitarios.
* **Descripción**: Se crearon las entidades `MagicLink` y `CommunityReport`, mapeándolas con Entity Framework y aplicando una migración a la base de datos local. Se diseñaron los servicios `EmployerAuthService` (Passwordless + Simulador AFIP) y `ModerationService`, los cuales fueron expuestos en la API a través de las nuevas mutaciones GraphQL `RequestMagicLink`, `LoginWithMagicLink` y `ReportContent`.
* **Archivos Modificados/Creados**:
  - `Entities/Models/MagicLink.cs`, `Entities/Models/CommunityReport.cs`
  - `Data/OneItbContext.cs` (+ Migración)
  - `Services/Auth/EmployerAuthService.cs`, `Services/Moderation/ModerationService.cs`
  - `OneITB/GraphQL/Mutation.cs`, `OneITB/Startup.cs`

---

## [2026-06-10] - Documentación: Actualización de Requerimientos (Rama: 044-docs-employer-role-update)

* **Objetivo**: Formalizar las decisiones arquitectónicas respecto a nuevos roles y modalidades de acceso en el documento rector.
* **Descripción**: Se actualizó el archivo `02_Requerimientos.md` para incluir el flujo de autenticación Passwordless (AFIP) en el RF-003, la excepción de la regla de dominio institucional para empresas en el RF-001, el nuevo esquema de Moderación Comunitaria (RF-013) y la definición oficial de los perfiles Empleador y Moderador.
* **Archivos Modificados**:
  - `docs/academic/02_Requerimientos.md`

---

## [2026-06-10] - Bugfix & Config: Corrección de Consulta GraphQL de Usuarios (Rama: 043-admin-dashboard-fix-users-query)

* **Objetivo**: Habilitar el rastreo de excepciones en HotChocolate y resolver el error 500 en la recuperación de la lista de usuarios.
* **Descripción**:
  - Se configuró `.ModifyRequestOptions(opt => opt.IncludeExceptionDetails = true)` en `Startup.cs` para exponer stack traces completos de GraphQL en desarrollo.
  - Se añadió la inyección faltante de `.AddAuthorization()` al `AddGraphQLServer()` para resolver el error de construcción de esquema de los decoradores `[Authorize]`.
  - Se corrigió el mapeo y proyección de Entity Framework Core en el repositorio (`UnitOfWork.cs` -> `GetAll()`). Se añadió `.Include(u => u.Account)` para evitar resoluciones `null` en relaciones estrictas, solucionando la falla total de la consulta de usuarios.
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`

---

## [2026-06-10] - Full Stack: Integración GraphQL para Dashboard de Administración (Rama: 042-admin-user-management-graphql)

* **Objetivo**: Conectar la interfaz de gestión de usuarios del frontend con la base de datos SQL Server mediante el backend de GraphQL (.NET 8 HotChocolate), descartando el Mock Data.
* **Descripción**:
  - **Backend**: Se introdujo el campo `IsActive` (bool) al modelo `User.cs` y a la base de datos mediante EF Core Migrations (`AddUserIsActive`). Se crearon dos nuevas mutaciones en `Mutation.cs`: `UpdateUserRole` y `UpdateUserStatus`, ambas delegadas de forma segura a `UsersService`. La compilación del backend resultó exitosa (0 errores).
  - **Frontend**: En el componente `UserManagement.jsx`, se eliminó la dependencia de Mock Data y se implementaron los hooks de Apollo Client (`useQuery` para `GetUsers`, `useMutation` para `UpdateUserRole` y `UpdateUserStatus`). Los controles interactivos de la grilla (Select de roles y Toggle de estado) ahora invocan estas mutaciones directamente y disparan `refetch()` para asegurar la sincronización en tiempo real. La compilación de Vite fue exitosa.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Services/Users/IUsersService.cs` y `UsersService.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`

---

## [2026-06-10] - UI: Dashboard de Administración de Usuarios (Rama: 041-admin-user-management)

* **Objetivo**: Crear una interfaz dedicada para administradores que permita la gestión de usuarios, roles y estados de activación.
* **Descripción**: Se construyó un nuevo componente `UserManagement.jsx` bajo `src/Components/admin/`. Este incluye una grilla de datos responsiva creada completamente con Tailwind CSS v4. Permite simular cambios de rol (Usuario/Administrador) mediante un `<select>` y el estado de la cuenta (activo/suspendido) a través de un toggle interactivo, validados inicialmente con mock data. El componente se integró en el enrutamiento privado (`/admin/users`) y se agregó un enlace en la barra de navegación principal (`Nav.jsx`) visible para usuarios autenticados. La compilación fue exitosa con 0 errores.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx` (nuevo)
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

---

## [2026-06-10] - UI: Inyección de Header en Rutas Públicas (Rama: 040-public-layout-header-fix)

* **Objetivo**: Integrar el componente `Header` en las rutas públicas de la aplicación (`PublicLayout`) y manejar el estado no autenticado.
* **Descripción**: Se refactorizó `PublicLayout.jsx` para inyectar `<Header />` sobre el `<main>` container y establecer un layout de columna (`flex flex-col min-h-screen`). Además, se modificó `Nav.jsx` para renderizar condicionalmente los botones de "Iniciar Sesión" y "Registrarse" usando utilidades Tailwind cuando el usuario no está autenticado (`!auth.id`), ocultando correctamente el menú de usuario/avatar. La compilación resultó exitosa (0 errores).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

---

## [2026-06-10] - Backend: Validación y Fix de Compatibilidad .NET 8 (Rama: 039-backend-dotnet8-validation)

* **Objetivo**: Ejecutar la batería de pruebas automatizadas para validar el upgrade a .NET 8 y corregir los breaking changes detectados.
* **Pruebas ejecutadas y resultados**:
  1. **`dotnet restore`**: Error inicial `NU1102` — `System.ComponentModel.Annotations 8.0.0` no existe en NuGet (es inbox en .NET 8 SDK). Fix: se eliminó la `<PackageReference>` de `Services.csproj`. Resultado final: ✅ Todos los proyectos restaurados.
  2. **`dotnet build`**: Error inicial — breaking change de HotChocolate 13→14: `RegisterDbContext<T>(DbContextKind.Pooled)` fue reemplazado por `RegisterDbContextFactory<T>()`. Fix aplicado en `Startup.cs`. Resultado final: ✅ **Compilación correcta — 0 Errores, 0 Advertencias**. DLLs generados en `bin/Debug/net8.0/`.
  3. **`dotnet ef database update`**: ✅ **"Build succeeded. Done."** — Base de datos conectada y migración aplicada correctamente.
* **Archivos Modificados**:
  - `API Graphql/Services/Services.csproj` (eliminación de referencia inbox)
  - `API Graphql/OneITB/Startup.cs` (fix HC14 breaking change: `RegisterDbContext` → `RegisterDbContextFactory`)
* **Nota**: EF CLI global instalada es `6.0.36`. Recomendado actualizar con `dotnet tool update --global dotnet-ef` para alinear con el runtime `8.0.6`.

---

## [2026-06-10] - Backend: Migración a .NET 8 LTS (Rama: 038-backend-dotnet8-upgrade)

* **Objetivo**: Migrar los 4 proyectos del backend de .NET 6 (EOL) a .NET 8 LTS y actualizar todas las dependencias NuGet críticas a sus versiones compatibles.
* **Pre-Upgrade**: Todos los proyectos estaban en `net6.0` con EF Core `7.0.4`, HotChocolate `13.0.5`, JwtBearer `6.0.16`.
* **Cambios aplicados**:

| Proyecto | TFM | EF Core | HotChocolate | JwtBearer |
|----------|-----|---------|--------------|-----------|
| Entities.csproj | net6.0 → **net8.0** | — | — | — |
| Data.csproj | net6.0 → **net8.0** | 7.0.4 → **8.0.6** | — | — |
| Services.csproj | net6.0 → **net8.0** | — | 13.0.5 → **14.2.0** | — |
| GraphQL.csproj | net6.0 → **net8.0** | 7.0.4 → **8.0.6** | 13.0.5 → **14.2.0** | 6.0.16 → **8.0.6** |

* **QA**: grep `net6.0` → 0 resultados en todos los .csproj. grep `net8.0` → 4/4 confirmados.
* **Nota**: `BCrypt.Net-Next` se mantuvo en `4.0.3` (framework-agnostic, sin cambio requerido). `System.ComponentModel.Annotations` actualizado a `8.0.0`.
* **Archivos Modificados**:
  - `API Graphql/Entities/Entities.csproj`
  - `API Graphql/Data/Data.csproj`
  - `API Graphql/Services/Services.csproj`
  - `API Graphql/OneITB/GraphQL.csproj`

---

## [2026-06-10] - UI: Global Tailwind Refactor — Capa Social (Rama: 037-global-tailwind-refactor)

* **Objetivo**: Reparar los daños estéticos causados por la purga del CSS legacy (036) en los componentes de la red social, migrándolos al uso exclusivo de Tailwind CSS v4.
* **Descripción**: Auditoría grep completa detectó 6 componentes con clases BEM residuales. `Nav.jsx` fue reescrito eliminando todas las clases BEM (`navbar__container-lists`, `list-end__img`, `menu-list__link`) y los inline styles con `fontSize: '1.4rem'` que causaban el avatar gigante — reemplazado con avatar estrictamente `w-9 h-9 rounded-full object-cover` + dropdown Tailwind con click-outside. `Feed.jsx` fue reescrito eliminando 15+ clases BEM (`posts__post`, `post__user-image`, etc.) — posts ahora son tarjetas `bg-white rounded-xl shadow-sm` con avatares `w-10 h-10`. `Login.jsx`, `Register.jsx` y `EditProfile.jsx` fueron reescritos con layout de card centrado, inputs con focus rings, banners de alerta Tailwind — toda la lógica de autenticación y mutaciones GraphQL preservada. Se corrigió una redirección obsoleta `/social/profile` → `/profile` en `EditProfile`. Build: 0 errores, 293 módulos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx` (reescritura Tailwind)
  - `AGENTS.md` y `.specify/feature.json` (actualización de referencia activa)

---

## [2026-06-10] - UI: CSS Supremacy — Erradicación de Legacy y Sistema de Diseño Único (Rama: 036-theme-and-css-supremacy)

* **Objetivo**: Eradicar definitivamente todas las hojas de estilo heredadas y establecer el sistema de diseño de `_temp_cv_reference` (Tailwind v4 + Inter + variables @theme) como única fuente de verdad.
* **Descripción**: Se sobrescribió `src/index.css` con el contenido exacto de `_temp_cv_reference/index.css`, eliminando el bloque `:root` de variables shadcn-style (`--primary`, `--background`, etc.) que no son utilizadas por ningún componente y que envenenaban el namespace. Se removieron de `main.jsx` los tres imports de CSS legacy (`normalize.css`, `styles.css`, `responsive.css`) — ahora solo existe `import './index.css'`. Los tres archivos CSS legacy fueron físicamente vaciados con un comentario "tombstone" para prevenir reimportaciones accidentales. El `index.html` ya tenía Inter y Font Awesome correctamente inyectados. Resultado del build: 0 errores, 294 módulos, bundle CSS reducido de **45.40 kB → 35.15 kB (−10 kB)**.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/index.css` (reescritura con contenido exacto de referencia)
  - `FrontEnd/OneItb-FE/src/main.jsx` (eliminación de 3 imports de CSS legacy)
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css` (vaciado — tombstone)
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css` (vaciado — tombstone)
  - `FrontEnd/OneItb-FE/src/assets/css/normalize.css` (vaciado — tombstone)
* **Archivos Creados**:
  - `specs/036-theme-and-css-supremacy/spec.md`
  - `specs/036-theme-and-css-supremacy/plan.md`
  - `specs/036-theme-and-css-supremacy/tasks.md`

---

## [2026-06-10] - UI: Trasplante Literal del CV Builder a /profile (Rama: 035-literal-cv-transplant)

* **Objetivo**: Eliminar el overlapping de layouts inventados en `/profile` y realizar un trasplante exacto del layout y componentes de `_temp_cv_reference` hacia `UserProfile.tsx`, garantizando una fidelidad 100% visual al diseño original.
* **Descripción**: Se diagnosticó la causa raíz del overlapping: el `overflow-y-auto` del `<main>` de `PrivateLayout` conflictuaba con el `overflow-hidden` y `h-[calc(100vh-...)]` del workspace del CV, haciendo que los paneles internos se pisaran. La solución fue cambiar `PrivateLayout`'s `<main>` a `overflow-hidden` para ceder el control de scroll al componente hijo. `UserProfile.jsx` fue completamente reescrito como una copia literal de `_temp_cv_reference/App.tsx`: mismo `<div className="min-h-screen bg-slate-50 flex flex-col font-sans">`, mismo `<main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-56px)]">`, mismo editor section, mismo preview section. El `initialData` fue copiado verbatim. Los cinco formularios (`PersonalForm`, `ExperienceForm`, `EducationForm`, `ProjectsForm`, `SkillsLanguagesForm`) fueron conectados con los prop names exactos de sus interfaces TypeScript. Se corrigió `types/resume.ts` para hacer `hidden` opcional en todas las interfaces. El archivo fue renombrado a `.tsx` para soportar anotaciones TypeScript. Build: 0 errores, 297 módulos, 459ms.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx` → renombrado a `UserProfile.tsx` (reescritura total)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx` (fix overflow-hidden)
  - `FrontEnd/OneItb-FE/src/types/resume.ts` (hidden opcional en todas las interfaces)
  - `AGENTS.md` y `.specify/feature.json` (actualización de referencia activa)
* **Archivos Creados**:
  - `specs/035-literal-cv-transplant/spec.md`
  - `specs/035-literal-cv-transplant/plan.md`
  - `specs/035-literal-cv-transplant/tasks.md`

---

## [2026-06-10] - UI: Refactorización Total del Layout Global y Vista de Perfil (Rama: 034-total-frontend-refactor)

* **Objetivo**: Erradicar las dependencias de CSS legacy (grillas `.layout` rotas) y adoptar Tailwind CSS v4 como única autoridad de layout, garantizando la integración perfecta de los nuevos componentes de CV y el cumplimiento del RNF-004 (Usabilidad y Adaptabilidad).
* **Descripción**: Se neutralizó la definición `display: grid` y las propiedades `grid-template-areas/rows/columns` de la clase `.layout` en `styles.css`, removiendo también las referencias `grid-area` de `.layout__content` y `.layout__aside`. `PrivateLayout.jsx` fue reescrito con un contenedor `flex flex-col min-h-screen` y un body con `<main className="flex-1 overflow-y-auto">` más un `<aside>` lateral visible en lg+, eliminando completamente la dependencia de la grilla CSS. `SideBar.jsx` fue íntegramente reescrito en Tailwind preservando el avatar, stats y formulario de publicación. `Header.jsx` fue actualizado a un header sticky con Tailwind. En `UserProfile.jsx` se eliminaron las clases `content__header` y `content__title` del legacy, reemplazándolas con un encabezado Tailwind de doble columna con acento visual. La compilación `npm run build` completó en 507ms con 0 errores y 293 módulos transformados.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css` (Neutralización del grid legacy)
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css` (Marcado como deprecated)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx` (Limpieza de clases legacy)
  - `AGENTS.md` (Actualización de referencia de plan activo)
  - `.specify/feature.json` (Actualización de feature activo)
* **Archivos Creados**:
  - `specs/034-total-frontend-refactor/spec.md`
  - `specs/034-total-frontend-refactor/plan.md`
  - `specs/034-total-frontend-refactor/tasks.md`

---

## [2026-06-09] - UI: Corrección de Consulta GraphQL en Perfil (Rama: 027-fix-profile-graphql-400)

* **Objetivo**: Solventar el error HTTP 400 (Bad Request) al cargar la vista del Perfil alineando las consultas del frontend con el esquema de HotChocolate.
* **Descripción**: Se modificó `getUserProfile.js` para remover el parámetro de variable no utilizado `$id` de la firma de consulta, el cual era rechazado sintácticamente por el endpoint del backend. Se alinearon las propiedades requeridas del payload solicitando el campo de introspección `alias` y acoplándolo al mapeo reactivo de la foto de perfil en el DOM en `UserProfile.jsx`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`
  - `specs/027-fix-profile-graphql-400/spec.md`
  - `specs/027-fix-profile-graphql-400/plan.md`
  - `specs/027-fix-profile-graphql-400/tasks.md`

---

## [2026-06-09] - UI: Corrección de SRI y Reflow de Layout (Rama: 025-hotfix-console-warnings)

* **Objetivo**: Solucionar bloqueos de seguridad SRI de Font Awesome y eliminar advertencias de "Layout Forced" en la consola del navegador.
* **Descripción**: Se modificó `index.html` para remover atributos `integrity` y `crossorigin` del recurso Font Awesome del CDN, solucionando bloqueos por firmas de integridad incompatibles. En `ResumePreview.tsx`, se reestructuró la medición de `scrollHeight` en el hook `useEffect` envolviéndola en una llamada `requestAnimationFrame`, programando de forma diferida el cálculo de hojas y eliminando bloqueos de UI (Forced Reflow) en el hilo de ejecución principal.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/Components/resume/ResumePreview.tsx`
  - `specs/025-hotfix-console-warnings/spec.md`
  - `specs/025-hotfix-console-warnings/plan.md`
  - `specs/025-hotfix-console-warnings/tasks.md`

---

## [2026-06-09] - UI: Enrutamiento Limpio, Landing Page y Unificación de Perfil (Rama: 023-router-fix-and-cv-layout)

* **Objetivo**: Eliminar el prefijo `/social` de las rutas SPA, crear una página de inicio (Landing Page) en `/`, unificar la edición de perfil eliminando la sub-ruta `/profile/edit` y mapear enlaces correctamente.
* **Descripción**: Se eliminó el prefijo `/social` de todas las rutas del frontend, actualizando el archivo `Routing.jsx` y todas las referencias de enlaces en `Header.jsx`, `Nav.jsx` y `SideBar.jsx`. Se creó el componente `Landing.jsx` y se configuró como el componente principal para el path `/`. Adicionalmente, se retiró la ruta `/profile/edit` y su enlace correspondiente en la barra de navegación superior, unificando la edición dentro del perfil en doble columna en `/profile`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/public/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `specs/023-router-fix-and-cv-layout/spec.md`
  - `specs/023-router-fix-and-cv-layout/plan.md`
  - `specs/023-router-fix-and-cv-layout/tasks.md`
* **Archivos Creados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Landing.jsx`
  - `specs/023-router-fix-and-cv-layout/research.md`
  - `specs/023-router-fix-and-cv-layout/data-model.md`
  - `specs/023-router-fix-and-cv-layout/quickstart.md`

---

## [2026-06-09] - UI: Revamp de Navegación y Perfil Doble Columna (Rama: 022-navigation-profile-revamp)

* **Objetivo**: Refactorizar la navegación global (Header/Nav) eliminando enlaces obsoletos y crear un menú de usuario dinámico, e integrar los formularios de actualización del currículum al perfil público en doble columna.
* **Descripción**: Se modificó `Nav.jsx` removiendo accesos inactivos en el Header, implementando el saludo dinámico "Hola {username}" e inyectando un menú desplegable interactivo para acceder a Ajustes y Cerrar sesión. Se diseñó una estructura de doble columna en `UserProfile.jsx` que combina la previsualización del portafolio profesional (LinkedIn-style CV layout a la izquierda) y el formulario editable de actualización de biografía y redes sociales a la derecha (conectado a la mutación de Apollo y al estado de sesión). Por último, se inyectó una burbuja flotante condicional a la sesión de usuario para la mensajería privada (Módulo 4) en `PrivateLayout.jsx`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`
  - `specs/022-header-ux-cv-profile/spec.md`
  - `specs/022-header-ux-cv-profile/plan.md`
  - `specs/022-header-ux-cv-profile/tasks.md`

---

## [2026-06-09] - BD: Aplicación de Migraciones EF Core de Perfil (Rama: 021-apply-profile-migration)

* **Objetivo**: Ejecutar comandos de Entity Framework Core desde el agente para aplicar y verificar la actualización física de la base de datos de perfiles.
* **Descripción**: Se aplicó de forma interactiva la migración `AddUserBioAndSocials` mediante `dotnet ef database update --project ../Data --startup-project .` desde la raíz de ejecución de la API GraphQL. Se confirmó la compilación limpia del servidor y el almacenamiento persistente de las nuevas columnas nullable (`Biography`, `LinkedIn`, `Facebook`, `Instagram`, `Phone`) en la base de datos física local de SQL Server.
* **Archivos Modificados**:
  - `docs/audit/DEVELOPMENT_LOG.md` (Modificado)
  - `specs/021-apply-profile-migration/tasks.md` (Completado)

---

## [2026-06-09] - BD/API/UI: Módulo 2 - Perfiles, Biografía y Redes (Rama: 020-user-profiles-bio)

* **Objetivo**: Desarrollar la persistencia de biografía y redes sociales en el perfil de usuario a nivel de Base de Datos, API GraphQL y crear las interfaces del cliente frontend.
* **Descripción**: Se expandió el modelo C# `User.cs` con propiedades para `Biography`, `LinkedIn`, `Facebook`, `Instagram` y `Phone`. Se generó la migración `AddUserBioAndSocials` aplicando los cambios en la base de datos de SQL Server. En el backend, se creó el DTO `UpdateProfileInput`, se implementó la mutación `UpdateProfile` expuesta en HotChocolate y se mapearon sus campos a camelCase en `Startup.cs`. En el frontend React, se crearon los componentes `Profile.jsx` (tarjeta profesional con enlaces de redes) y `EditProfile.jsx` (formulario de edición de perfil), enlazándolos en el enrutador `Routing.jsx` y activando sus accesos rápidos en la barra de navegación lateral y superior.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Users/IUsersService.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`
  - `docs/project_docs/ROADMAP.md`
* **Archivos Creados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/updateProfile.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/Profile.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`

---

## [2026-06-09] - UI: Implementación de Mejoras Rápidas (Quick Wins) (Rama: 019-frontend-quick-wins)

* **Objetivo**: Estabilizar y corregir la interfaz visual (UI/UX) del frontend aplicando las mejoras rápidas de alto impacto identificadas en la auditoría.
* **Descripción**: Se movió la clase contenedora `.layout` desde `App.jsx` hacia `PrivateLayout.jsx` y `PublicLayout.jsx` para restablecer el acoplamiento directo de CSS Grid, logrando alinear correctamente la columna del SideBar (30% de ancho) junto al Feed principal (70% de ancho). En `Nav.jsx`, se reemplazaron los enlaces estáticos `href="#"` por elementos `<NavLink />` de React-Router, vinculándolos a las rutas SPA operativas, y se inyectó la información dinámica del usuario (`auth.username`) desde `AuthContext`. Por último, se renombró el archivo `feed.jsx` a `Feed.jsx` para ajustarse a la convención estándar PascalCase de React y se actualizaron sus respectivas importaciones.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/App.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
* **Archivos Renombrados**:
  - `FrontEnd/OneItb-FE/src/Components/publication/feed.jsx` -> `Feed.jsx` (PascalCase)

---

## [2026-06-09] - UI: Relevamiento y Auditoría de Frontend (Rama: 018-frontend-deep-audit)

* **Objetivo**: Realizar un relevamiento exhaustivo del código fuente del Frontend para identificar la estructura del árbol de componentes, fallos de enrutamiento y plantear estándares modernos de desarrollo.
* **Descripción**: Se llevó a cabo un escaneo completo de `FrontEnd/OneItb-FE/src/`. Se diagnosticó el error de visualización del SideBar (debido a la jerarquía rota de CSS Grid provocada por envolver el enrutador en la clase contenedora de `App.jsx`) y el comportamiento inactivo de los enlaces del Header. Adicionalmente, se redactó el reporte formal de auditoría y se definieron pautas de nomenclatura (BEM, FSD, y PascalCase/camelCase) para guiar los desarrollos de los módulos de Perfiles y Publicaciones.
* **Archivos Creados/Modificados**:
  - `FRONTEND_AUDIT_REPORT.md` (Creado)
  - `docs/audit/DEVELOPMENT_LOG.md` (Modificado)

---

## [2026-06-09] - UI: Refactor Visual Profundo UI/UX (Rama: 016-ui-ux-revamp)

* **Objetivo**: Implementar un rediseño visual profundo en el frontend (React) con tipografía moderna, paleta de colores Clean/EdTech y verificación de adaptabilidad responsiva sin alterar la lógica.
* **Descripción**: Se integró la tipografía corporativa **Inter** desde Google Fonts en `index.html` y se configuró como el tipo de letra principal en `styles.css`. Se refinaron las variables de diseño CSS (`:root`) para aplicar la paleta "Clean/EdTech" con tonalidades pizarra claras/oscuras y acento azul eléctrico (`#3b82f6`). Adicionalmente, se auditó la adaptabilidad responsiva en `responsive.css` para asegurar el cumplimiento del requerimiento de usabilidad (RNF-004) en resoluciones móviles y de escritorio.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css`
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css`

---

## [2026-06-09] - UI: Refactor Visual y Reparación de Recursos (Rama: 015-ui-polish-assets)

* **Objetivo**: Solucionar errores de carga de recursos estáticos (imagen 404 y fuentes corruptas de FontAwesome) y refabricar el estilo visual de los formularios de autenticación y el layout principal.
* **Descripción**: Se integró el CDN oficial de FontAwesome 6.1.2 en `index.html` y se removió la importación del archivo CSS local corrupto en `main.jsx` para evitar advertencias en consola. En `SideBar.jsx` se modificó el origen del avatar para generar iniciales dinámicamente con ui-avatars.com basándose en el nombre de usuario autenticado. Se aplicaron estilos visuales premium para inputs, botones con gradientes, cajas de formularios con sombras y alertas personalizadas en `styles.css`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/main.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css`

---

## [2026-06-09] - UI/Auth-Routing: Persistencia de Token y Redirección en Frontend (Rama: 010-frontend-tracing)

* **Objetivo**: Implementar la inyección automática del token Bearer en el cliente Apollo, el estado de sesión global en React y la redirección programática al Feed tras Login (T1.5).
* **Descripción**: Se configuró `setContext` (authLink) en `GraphqlProvider.js` para adjuntar dinámicamente el header `Authorization` con el JWT de localStorage. En `Login.jsx` se modificó el callback de la mutación para guardar el token/usuario en el almacenamiento y utilizar `useNavigate('/social')` para redirección SPA.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
  - `FrontEnd/OneItb-FE/src/context/AuthProvider.jsx`
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/main.jsx`
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`

---

## [2026-06-09] - API/Auth: Implementación Criptográfica de JWT para Login (Rama: 010-frontend-tracing)

* **Objetivo**: Reemplazar el token estático de prueba placeholder por una generación criptográfica de JWT válida, alineando firmas y DTOs al estándar en inglés.
* **Descripción**: Se inyectó `IConfiguration` en `AccountsService.cs` y se programó la firma de tokens HS256 utilizando `System.IdentityModel.Tokens.Jwt` con los Claims correspondientes de ID, nombre y rol. Además, se renombró `LoginPayload` a `AuthPayload` y `LoginAsync` a `Login` en `DTOs.cs`, `Mutation.cs`, y en las interfaces de servicios para cumplir con las directivas de nomenclatura.
* **Archivos Modificados**:
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `API Graphql/Services/Accounts/IAccountService.cs`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/authenticateUser.js`

---

## [2026-06-08] - BD/Entidades: Refactorización Completa de Entidades al Inglés y Hard Reset de DB (Rama: 010-frontend-tracing)

* **Objetivo**: Traducir todas las entidades y columnas de la base de datos física al inglés para alinearse a la directiva de nomenclatura AD-006.
* **Descripción**: Se eliminaron las entidades en español `Materia.cs` y `Consulta.cs`, reemplazándolas por `Subject.cs` e `Inquiry.cs` con propiedades en inglés. Se eliminaron los mapeos explícitos (workarounds) de nombres en español en `OneItbContext.cs`. Finalmente, se borró el historial de migraciones físicas, se aplicó un drop de base de datos y se actualizó el esquema físico desde cero en SQL Server.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - API/Resolvers: Mapeo de Nomenclatura en la Entidad User de GraphQL (Rama: 010-frontend-tracing)

* **Objetivo**: Corregir errores de campos no encontrados en la introspección del cliente GraphQL mapeando explícitamente las propiedades hacia el esquema y garantizar su visibilidad en camelCase.
* **Descripción**: Se modificó la configuración de `ObjectType<User>` en `Startup.cs` para mapear los campos requeridos por el frontend a la convención camelCase: `Id` se mapea a `idUsuario`, `Nombre` a `nombre`, `Apellido` a `apellidos`, y se definieron resolvers virtuales para `alias` (retornando `Nombre`) y `email` (obteniendo el email de la propiedad de navegación `Account`). Asimismo, se protegió la contraseña cifrada del usuario mediante la exclusión de `PasswordHash` en el tipo `Account` (`Ignore()`) conforme a la directiva de seguridad de datos (AD-003).
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-06-08] - API/Resolvers: Exposición del campo de Consulta Usuarios en HotChocolate (Rama: 010-frontend-tracing)

* **Objetivo**: Solventar el error `The field 'Usuarios' does not exist on the type 'Query'` permitiendo al cliente Apollo introspectar y consumir la entidad de usuarios.
* **Descripción**: Se modificó `Query.cs` agregando el método resolver `GetUsuarios` que retorna `IQueryable<User>` a través de `usersService.GetAllAsync()`, mapeándose automáticamente al campo `usuarios` en el esquema de HotChocolate. También se adaptó `GetUsers` para mantener compatibilidad con consultas en inglés (`users`). Asimismo, para cumplir con la directiva de seguridad de datos (AD-003), se configuró la exclusión del campo `PasswordHash` de la entidad `Account` mediante Fluent API en `Startup.cs` (`AddType(new ObjectType<Account>(d => d.Field(f => f.PasswordHash).Ignore()))`) evitando filtraciones.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-06-08] - API/Resolvers: Resolución de Consultas de Usuarios e Inyección de Interfaces en GraphQL (Rama: 010-frontend-tracing)

* **Objetivo**: Implementar la resolución de consultas (Query) para la entidad Usuarios en HotChocolate, corregir la inyección de servicios y registrar la configuración correctamente en el middleware de GraphQL.
* **Descripción**: Se refactorizó `Query.cs` para inyectar la interfaz de servicio registrada en el contenedor de dependencias (`IUsersService`) en lugar de la clase concreta `UsersService`. Se modificó la firma del método `GetUserById` para recibir parámetros de tipo `Guid` de acuerdo con la clave primaria de la entidad. Además, se removieron registros innecesarios de servicios de entidad (`RegisterService<User>` y `RegisterService<Account>`) en `Startup.cs` para subsanar errores de inicialización de tipos nativos como `string` en el motor de HotChocolate.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-06-08] - BD/Migración: Corrección de Propiedad IDENTITY en Migración EF Core (Rama: 010-frontend-tracing)

* **Objetivo**: Evitar el error `InvalidOperationException: To change the IDENTITY property of a column...` al aplicar la última migración de base de datos sin destruir el historial.
* **Descripción**: Se refactorizó la migración `20260608221114_FixRegistroUsuario.cs` para evitar el uso de `AlterColumn` e intentar convertir la columna `Id` de `int IDENTITY` a `Guid`. En su lugar, se configuraron llamadas explícitas a `DropColumn` y `AddColumn` tanto en el método `Up` como en el `Down`, asegurando la recreación de la llave primaria de forma correcta sin violar las restricciones de SQL Server.
* **Archivos Modificados**:
  - `API Graphql/Data/Migrations/20260608221114_FixRegistroUsuario.cs`

---

## [2026-06-08] - API/Mutación: Sincronización de Esquema RegisterInput y Resolver en Backend (Rama: 010-frontend-tracing)

* **Objetivo**: Sincronizar el esquema de entrada de GraphQL (`RegisterInput`) y la mutación con los requerimientos del Caso de Uso (CU-01) para solucionar el Error HTTP 500 por discrepancia de datos.
* **Descripción**: Se añadieron las propiedades `Nombre`, `Apellidos` y `CarrerasInscritas` al record `RegisterInput` en `DTOs.cs` para evitar desajustes en el mapeo de variables desde el cliente y alinear el esquema con el CU-01. Asimismo, se modificó el método `RegisterAsync` de `UsersService.cs` para mapear el campo `Nombre` de la entidad `User` usando `input.Nombre` y `Apellido` usando `input.Apellidos` en lugar del valor hardcodeado `string.Empty` (el cual disparaba la excepción de dominio).
* **Archivos Modificados**:
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Users/UsersService.cs`

---

## [2026-06-08] - UI/Trazabilidad: Trazabilidad y Sincronización de Variables de Registro en Frontend (Rama: 010-frontend-tracing)

* **Objetivo**: Sincronizar el mapeo de variables entre el estado local del formulario React y la mutación GraphQL e implementar trazabilidad por consola para el campo "Apellidos".
* **Descripción**: Se alineó la nomenclatura de las variables del frontend mapeando el estado local del formulario `form.surname` a la propiedad `apellidos` dentro de las variables de la mutación. Se inyectó un `console.log("Datos a enviar a GraphQL:", variables);` justo antes de ejecutar la llamada asíncrona a la mutación para auditar y depurar el payload.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - UI/Validación: Feedback Visual de Validación y Control de Apellidos en Frontend (Rama: 009-frontend-feedback-validation)

* **Objetivo**: Proveer un mecanismo de retroalimentación amigable en pantalla para errores de validación local y de red, evitando alertas emergentes y validando todos los campos requeridos de `CU-01` (incluyendo Apellidos).
* **Descripción**: Se implementó el estado local `errorMessage` en `Register.jsx` para capturar errores. La UI fue rediseñada para renderizar dinámicamente un banner rojo con el mensaje de error de validación del formulario (ej. Apellidos es obligatorio).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - Validación: Validaciones Locales de Formulario de Registro (Rama: 008-frontend-validations)

* **Objetivo**: Implementar chequeos locales antes de disparar la mutación de registro, previniendo peticiones de red inválidas innecesarias.
* **Descripción**: Se agregaron chequeos locales de campos vacíos, restricciones de longitud para alias (mínimo 3 caracteres) y contraseña (mínimo 8 caracteres) en `Register.jsx`, así como una expresión regular para forzar que el correo ingresado termine con el dominio oficial `@itbeltran.com.ar`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - Manejo: Lanzar GraphQLException ante Excepciones de Validación en Registro (Rama: 007-throw-graphql-exception)

* **Objetivo**: Propagar los errores de validación de la entidad como excepciones nativas de GraphQL para que el motor de HotChocolate los maneje e informe en el array de errores estándar.
* **Descripción**: Se modificó el bloque catch de `System.ArgumentException` en `Mutation.RegisterUserAsync` para lanzar una `HotChocolate.GraphQLException` con el mensaje descriptivo de la entidad (ej. formato de email inválido). Esto elimina la necesidad de respuestas encapsuladas exitosas/fallidas para errores graves de validación de dominio.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-06-08] - Manejo: Captura y Control de ArgumentException en Mutación de Registro (Rama: 006-handle-mutation-exceptions)

* **Objetivo**: Evitar errores de servidor HTTP 500 capturando excepciones de argumentos y retornando mensajes de validación legibles.
* **Descripción**: Se envolvió la llamada a `usersService.RegisterAsync(input)` en un bloque `try-catch` capturando `System.ArgumentException` en `Mutation.cs`. Ante una falla de validación (por ejemplo, formato de email inválido o campos obligatorios vacíos lanzados por la capa de entidades), la mutación retorna ahora una instancia de `UserPayload` controlada con `Success = false` y el mensaje de error de la excepción.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-06-08] - Alineación: Mutación de Registro GraphQL en Frontend y Backend (Rama: 005-align-graphql-mutation)

* **Objetivo**: Corregir el error 400 (Bad Request) en GraphQL al registrar usuarios desde el frontend.
* **Descripción**: Se actualizó el archivo de mutación `addUser.js` del frontend para llamar a `registerUser(input: $input)` de acuerdo con la firma de `RegisterUserAsync` en el backend. Asimismo, se adaptó el componente `Register.jsx` para pasar las variables correspondientes a `RegisterInput` (`username`, `email`, `password`) en lugar del conjunto anterior de parámetros planos no válidos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/addUser.js`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - Corrección: Excepción de Casteo en Mutación de HotChocolate (Rama: 004-fix-hotchocolate-mutation)

* **Objetivo**: Corregir la excepción crítica `System.InvalidCastException` de HotChocolate que impedía compilar e iniciar el servidor.
* **Descripción**: Se removió el decorador `[ExtendObjectType(OperationTypeNames.Mutation)]` de la clase `Mutation` en `Mutation.cs`. Esto convirtió a `Mutation` en la clase de mutación base del esquema, alineando el backend con el registro `.AddMutationType<Mutation>()` de `Startup.cs`.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-06-08] - Implementación: Reestructuración Académica y Gobernanza Core-Web (Rama: 003-docs-governance)

* **Objetivo**: Estructurar modularmente la documentación académica bajo el formato requerido por la materia "Prácticas Profesionalizantes III" y optimizar el consumo de tokens en archivos de gobernanza.
* **Descripción**: Se crearon documentos académicos dedicados en `/docs/academic/` dividiendo el contenido en presentación general, requerimientos detallados (Identidad, Muro, Mensajería), trazo fino de casos de uso (CU-01 a CU-09) y diagramas en formato Mermaid. Asimismo, se condensaron y optimizaron para tokens los archivos en `/core-web/` (reduciendo más del 50% de tamaño físico) garantizando que la constitución y compatibilidad de agentes permanezcan intactas.
* **Archivos Creados/Modificados**:
  - `docs/academic/01_Presentacion_General.md` (Creado)
  - `docs/academic/02_Requerimientos.md` (Creado)
  - `docs/academic/03_Casos_De_Uso.md` (Creado)
  - `docs/academic/04_Diagramas.md` (Creado)
  - `core-web/system.md` (Optimizado)
  - `core-web/agent_contracts.md` (Optimizado)
  - `core-web/decisions_log.md` (Optimizado)
  - `docs/audit/DOCUMENTATION_STATUS.md` (Actualizado)

---

## [2026-05-30] - Implementación: Sincronización de Documentación y Unit of Work (Rama: 002-update-tech-docs)

* **Objetivo**: Estabilizar y corregir la compilación del backend (.NET 6 API) e integrar la documentación de auditoría con la Constitución del proyecto (v1.0.0).
* **Descripción**: Se diseñó e implementó el patrón transaccional Repository y Unit of Work en C# para resolver el error crítico de referencia `CS0246`. Adicionalmente, se actualizaron y alinearon los manuales técnicos locales (como el runbook de 35 smoke tests) y se estructuró la gobernanza de carpetas.
* **Archivos Modificados**:
  - `API Graphql/Services/Interfaces/IUnitOfWork.cs` (Creado)
  - `API Graphql/Services/Repositories/UnitOfWork.cs` (Creado)
  - `API Graphql/OneITB/Startup.cs` (Modificado para registro en DI)
  - `API Graphql/Services/Users/UsersService.cs` y `AccountsService.cs` (Refactorizados)
  - `README.md` y `docs/audit/RUNBOOK_DEV.md` (Actualizados)
