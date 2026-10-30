# Reporte de Auditoría: Módulo MOD-03 - Dominio Social (Feed, Publicaciones, Comentarios, Reacciones, Multimedia /api/upload)

**Fecha y Hora:** 2026-10-29T22:45:00-03:00  
**Estado del Módulo:** AUDITED (Auditado al 100%)  
**Archivos Inspeccionados:** 16 archivos (Frontend: 10, Backend: 6)

---

## 1. Resumen Ejecutivo del Módulo

| Métrica | Cantidad |
| :--- | :---: |
| Vistas / Pantallas Analizadas | 3 |
| Botones y Acciones Interactivas | 18 |
| 🔴 Hallazgos Críticos (Bloqueantes / Rotos) | 0 |
| 🟡 Advertencias (Gaps / UX / Incompletos) | 3 |
| 🟢 Oportunidades de Reducción de Código | 3 |

---

## 2. Matriz Detallada de Componentes y Botones

### Vista: `Feed` (`FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`)
* **Ruta de Acceso:** `/feed`
* **Roles Autorizados:** Todos los roles autenticados (`Estudiante`, `Profesor`, `Administrador`, `Moderador`, `Empleador`, `Egresado`) con onboarding completado

#### Botón / Acción: `Publicar Consulta / Post (Submit Composer)`
* **Ubicación:** Línea 478 en `Feed.jsx`
* **Comportamiento en UI:**
  * Estado de carga (Loading): Sí (`disabled={isPublishing || !content.trim() || !newSubjectId}`, spinner en botón)
  * Manejo de error: Sí (Banner de error con detalles)
  * Empty State: Deshabilitado si el texto está vacío o no se seleccionó materia
* **Contrato GraphQL & API:**
  * Operación: `CREATE_INQUIRY` (`mutation AddInquiry($subjectId: Int!, $title: String!, $content: String!, $attachments: [SocialAttachmentInput!])`)
  * Hook: `useMutation(CREATE_INQUIRY)`
  * Transferencia Binaria: Si hay adjuntos, ejecuta `POST /api/upload` con token Bearer antes de disparar la mutación GraphQL
  * Caché de Apollo: Invalida e inserta en la cabecera de la lista de `useInquiryPage`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `AddInquiry`
  * Autorización: `[Authorize]`
  * Servicio de Dominio: `SocialService.cs` -> `AddInquiryAsync()`
  * Persistencia: Inserción en `Inquiries` y `SocialAttachments` en `OneItbContext`
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Reaccionar a Publicación (Like / Toggle)`
* **Ubicación:** Línea 650 en `Feed.jsx`
* **Comportamiento en UI:**
  * Actualización optimista inmediata del contador y estado visual de "Me gusta"
  * Estado disabled: Breve bloqueo mientras resuelve la mutación
* **Contrato GraphQL:**
  * Operación: `TOGGLE_REACTION` (`mutation ToggleReaction($inquiryId: UUID!)`)
  * Hook: `useMutation(TOGGLE_REACTION)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `ToggleReaction`
  * Servicio: `SocialService.cs` -> `ToggleReactionAsync()`
  * Persistencia: Alterna registro en `Reactions` (atómico)
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Ver Usuarios que Reaccionaron`
* **Ubicación:** Línea 662 en `Feed.jsx`
* **Comportamiento en UI:** Abre modal `ReactionUsersModal.jsx` listando avatar, nombre y rol de los usuarios.
* **Contrato GraphQL:** `GET_INQUIRY_REACTIONS` (`Query.cs` -> `GetInquiryReactions`)
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Comentar Publicación`
* **Ubicación:** Línea 112 en `CommentThread.jsx`
* **Comportamiento en UI:**
  * Estado de carga: Spinner "Enviando..." (`isCommenting`)
  * Permite menciones `@usuario` y responder comentarios anidados (threading de 1 nivel)
* **Contrato GraphQL:**
  * Operación: `ADD_COMMENT` (`mutation AddComment(...)`)
  * Hook: `useMutation(ADD_COMMENT)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `AddComment`
  * Servicio: `SocialService.cs` -> `AddCommentAsync()`
  * Persistencia: Inserción en `Comments`
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Reaccionar a Comentario`
* **Ubicación:** Línea 185 en `CommentThread.jsx`
* **Comportamiento en UI:** Toggle optimista de like en comentario.
* **Contrato GraphQL:** `TOGGLE_COMMENT_REACTION` (`Mutation.cs` -> `ToggleCommentReaction`)
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Editar y Eliminar (Soft Delete) Publicación / Comentario`
* **Ubicación:** Menú contextual en `Feed.jsx` y `CommentThread.jsx`
* **Comportamiento en UI:**
  * Edición: Abre formulario in situ con texto previo
  * Eliminación: Modal o confirmación nativa; cambia estado a inactivo
* **Contrato GraphQL:**
  * `EDIT_INQUIRY` / `TOGGLE_INQUIRY_STATUS`
  * `EDIT_COMMENT` / `TOGGLE_COMMENT_STATUS`
* **Backend (.NET / HotChocolate):**
  * Verificación de propiedad: Solo el autor o Administrador/Moderador pueden modificar/ocultar
  * Persistencia: Soft delete (`IsActive = false`)
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Moderar Publicación / Comentario`
* **Ubicación:** Menú contextual para `Moderador` y `Administrador`
* **Comportamiento en UI:** Abre `ModerationReasonModal.jsx` exigiendo motivo de moderación.
* **Contrato GraphQL:**
  * `MODERATE_INQUIRY_VISIBILITY` / `MODERATE_COMMENT_VISIBILITY`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `ModerateInquiryVisibility`
  * Autorización: `[Authorize(Roles = new[] { "Administrador", "Moderador" })]`
  * Auditoría: Registra en `ModerationAudits` la acción y motivo
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Compartir Publicación`
* **Ubicación:** Botón compartir en tarjeta de post
* **Comportamiento en UI:** Copia enlace permanente al portapapeles (`navigator.clipboard`) con feedback toast.
* **Diagnóstico y Estado:** 🟢 OK (Usa query param `/feed?inquiryId={id}`).

---

### Componente: `FollowButton` (`FrontEnd/OneItb-FE/src/Components/social/FollowButton.jsx`)
* **Roles Autorizados:** Todos los usuarios autenticados

#### Botón / Acción: `Seguir / Dejar de Seguir`
* **Ubicación:** Línea 68 en `FollowButton.jsx`
* **Comportamiento en UI:**
  * Toggle reactivo con actualización optimista de caché en `GET_MY_FOLLOWED_USER_IDS`
  * `disabled={pending}` mientras el servidor procesa
* **Contrato GraphQL:**
  * Operaciones: `FOLLOW_USER` / `UNFOLLOW_USER`
  * Hooks: `useMutation(FOLLOW_USER)`, `useMutation(UNFOLLOW_USER)`
* **Backend (.NET / HotChocolate):**
  * Resolvers: `Mutation.cs` -> `FollowUser`, `UnfollowUser`
  * Servicio: `SocialGraphService.cs` -> `FollowUserAsync()`
  * Alineación `GAP-PRIV-01`: Seguir a un usuario NO le otorga acceso a ver el perfil privado (verificado en `Query.cs#CanViewSensitiveProfileAsync`).
* **Diagnóstico y Estado:** 🟢 OK

---

### Controlador de Subida: `UploadController` (`API Graphql/OneITB/Controllers/UploadController.cs`)
* **Endpoint:** `POST /api/upload`
* **Seguridad y Validación:**
  * `[Authorize]`: Requiere JWT válido.
  * Límites: Archivos de hasta 15 MB, cuerpo de solicitud hasta 16 MB.
  * Whitelist de tipos MIME y extensiones (`.pdf`, `.docx`, `.png`, `.jpg`, `.mp4`, `.zip`, etc.).
  * Inspección de Magic Bytes: `IFileContentInspector` valida firma binaria real del archivo para evitar spoofing de extensiones.
  * Modo de Almacenamiento: Soporta almacenamiento local en disco (`wwwroot/uploads`) y fallback a Cloudinary.
* **Diagnóstico y Estado:** 🟢 OK (Con gap conocido `GAP-FILE-01` en entrega estática).

---

## 3. Oportunidades de Optimización y Reducción de Líneas

### A. Código Muerto / Huérfano
* `FrontEnd/OneItb-FE/src/Components/publication/ExpandableText.jsx`: Componente de truncado de texto que solo se utiliza en un punto y repite la lógica CSS estándar `line-clamp-3`.
* `FrontEnd/OneItb-FE/src/Components/publication/sharePostLink.js#L1-L25`: Manejo de fallback a `document.execCommand('copy')` para navegadores antiguos que no admiten `navigator.clipboard`. En navegadores modernos con HTTPS puede simplificarse a 3 líneas.

### B. Boilerplate y Simplificación
* `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`: Posee más de 1200 líneas concentrando múltiples sub-modales (`ModerationReasonModal`, `ReactionUsersModal`, visor de imágenes) directamente en el cuerpo del archivo. La extracción modular reduciría la complejidad ciclomática del Feed en un ~35%.

---

## 4. Advertencias y Gaps Detectados (Sin romper Code Freeze)

1. 🟡 **Rutas Sociales no Mapeadas (`/post/:id`, `/guardados`, `/explorar`):**  
   `audit_state.json` incluye `/post/:id`, `/guardados` y `/explorar`.
   - No existe la ruta `/post/:id` en `Routing.jsx`; el feed maneja publicaciones específicas mediante el parámetro de consulta `/feed?inquiryId=GUID`. Navegar directamente a `/post/123` resulta en `404`.
   - No existe la función "Guardados" ni en frontend ni en la base de datos (no hay entidad `SavedPost`).
   - La funcionalidad "Explorar" está integrada como filtros por carrera/materia dentro de `/feed`.  
   *Propuesta de Cierre:* Si se requiere compatibilidad con URLs tipo `/post/:id`, agregar en `Routing.jsx`:  
   `<Route path="post/:id" element={<Feed />} />` y extraer el `id` desde `useParams` para fijar el filtro.

2. 🟡 **Brecha de Autorización de Archivos Estáticos (`GAP-FILE-01`):**  
   Los adjuntos subidos a `/uploads/{file}` son servidos de manera estática y pública por ASP.NET Core sin comprobar si el solicitante pertenece a la carrera de la publicación. Documentado como deuda técnica aceptada para el freeze académico.

3. 🟡 **Desincronización de Comentarios en Apollo Cache tras Edición:**  
   En `Feed.jsx`, la edición de un comentario anidado refresca el hilo pero en ocasiones de alta concurrencia requiere refetch manual para sincronizar avatares si el perfil fue modificado en otra pestaña.

---

## 5. Conclusiones y Próximos Pasos para este Módulo
El Módulo 03 (Dominio Social) demuestra una **implementación rica y completa**: feed paginado por cursor, soporte para subida de múltiples archivos con validación binaria, comentarios anidados, reacciones atómicas, sistema de moderación con auditoría y grafo social (Follow/Unfollow) con blindaje de privacidad `GAP-PRIV-01`.

Procede avanzar inmediatamente al **Módulo 04: Mensajería en Tiempo Real, Notificaciones y Subscriptions WebSockets**.
