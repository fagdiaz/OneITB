# Reporte de Auditoría: Módulo MOD-02 - Dominio Académico (Materias, Correlatividades, Syllabus, Mock SIU)

**Fecha y Hora:** 2026-10-29T22:40:00-03:00  
**Estado del Módulo:** AUDITED (Auditado al 100%)  
**Archivos Inspeccionados:** 12 archivos (Frontend: 5, Backend: 7)

---

## 1. Resumen Ejecutivo del Módulo

| Métrica | Cantidad |
| :--- | :---: |
| Vistas / Pantallas Analizadas | 4 |
| Botones y Acciones Interactivas | 12 |
| 🔴 Hallazgos Críticos (Bloqueantes / Rotos) | 0 |
| 🟡 Advertencias (Gaps / UX / Incompletos) | 3 |
| 🟢 Oportunidades de Reducción de Código | 2 |

---

## 2. Matriz Detallada de Componentes y Botones

### Vista: `AcademicDashboard` (`FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`)
* **Ruta de Acceso:** `/academic`
* **Roles Autorizados:** `Estudiante`, `Profesor`, `Administrador`

#### Botón / Acción: `Selector de Pestaña Recursos vs Progreso`
* **Ubicación:** Líneas 466 y 475 en `AcademicDashboard.jsx`
* **Comportamiento en UI:** Alterna vista entre "Recursos y Syllabus" y "Progreso Académico / Calificaciones".
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Selección de Materia`
* **Ubicación:** Línea 536 en `AcademicDashboard.jsx`
* **Comportamiento en UI:**
  * Estado de carga: Indicador "Cargando..." (`subjectsLoading`)
  * Empty State: Mensaje amigable "Selecciona una carrera" si no hay materias cargadas.
* **Contrato GraphQL:**
  * Operación: `GET_SUBJECTS` (`query Subjects($careerId: Int)`)
  * Hook: `useQuery(GET_SUBJECTS)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Query.cs` -> `GetSubjects`
  * Autorización: `[AllowAnonymous]` (Público autenticado/no autenticado para consulta de planes)
  * Persistencia: `context.Subjects.AsNoTracking().Include(s => s.Career).Include(s => s.Prerequisites)`
* **Diagnóstico y Estado:** 🟢 OK (Usa `.AsNoTracking()` e incluye correlatividades).

#### Botón / Acción: `Nuevo Recurso (Abre Modal)`
* **Ubicación:** Línea 569 en `AcademicDashboard.jsx`
* **Comportamiento en UI:**
  * Estado disabled: Deshabilitado si no hay materia seleccionada (`disabled={!selectedSubjectId}`)
  * Modal: Formulario completo con título, descripción, categoría (APUNTE, SYLLABUS, EXAMEN, OTRO), versión y subida de archivo / link externo.
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Subir y Crear Recurso (Submit Modal)`
* **Ubicación:** Línea 895 en `AcademicDashboard.jsx`
* **Comportamiento en UI:**
  * Estado de carga: Spinner con texto "Subiendo archivo..." o "Guardando recurso..."
  * Manejo de error: Captura de excepciones con mensaje explicativo en banner
* **Contrato GraphQL:**
  * Operación: `UPLOAD_ACADEMIC_RESOURCE` (`mutation UploadAcademicResource(...)`)
  * Hook: `useMutation(UPLOAD_ACADEMIC_RESOURCE)`
  * Transferencia binaria: Previa llamada a `POST /api/upload` con token JWT multipart
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `UploadAcademicResource`
  * Autorización: `[Authorize]`
  * Servicio: `AcademicService.cs` -> `AddAcademicResourceAsync`
  * Persistencia: Creación en `AcademicResource` y emisión de notificaciones automáticas (`INotificationService`) a estudiantes matriculados en la carrera
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Eliminar Recurso`
* **Ubicación:** Línea 615 en `AcademicDashboard.jsx`
* **Comportamiento en UI:** Condicionado a permisos (`isManager || resource.uploader.id === auth.id`), confirmación nativa `window.confirm`.
* **Contrato GraphQL:**
  * Operación: `DELETE_RESOURCE`
  * Hook: `useMutation(DELETE_RESOURCE)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `DeleteResource`
  * Servicio: `AcademicService.cs` -> `DeleteResourceAsync` (Soft delete: `resource.IsActive = false`)
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Sincronizar SIU Guaraní (Mock)`
* **Ubicación:** Línea 723 en `AcademicDashboard.jsx`
* **Comportamiento en UI:**
  * Visibilidad: Solo visible para Administradores (`{isAdmin && ...}`)
  * Estado de carga: `disabled={!selectedSubjectId || syncingSiu}`, texto "Sincronizando..."
  * Feedback: Muestra tarjeta resumen con registros procesados, creados, actualizados y omitidos
* **Contrato GraphQL:**
  * Operación: `SYNC_SIU_GRADES` (`mutation SyncSiuGrades($subjectId: Int!)`)
  * Hook: `useMutation(SYNC_SIU_GRADES)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `SyncSiuGrades` (`[Authorize(Roles = new[] { "Administrador", "Profesor" })]`)
  * Servicio: `AcademicService.cs` -> `SyncSiuGradesAsync` (Exige `EnsureAdmin(actorRole);`)
* **Diagnóstico y Estado:**
  * **Categoría:** 🟡 WARNING
  * **Detalle:** Existe un desacople entre el atributo HotChocolate en `Mutation.cs` (que incluye `"Profesor"`) y la regla en `AcademicService.cs#L333` (que requiere estrictamente `"Administrador"`). Si bien la UI lo oculta a profesores, el resolver permite el paso y luego lanza un error 500 no mapeado si un profesor invoca la mutación directamente.
  * **Propuesta de Cierre:** Restringir el atributo en `Mutation.cs` a `[Authorize(Roles = new[] { "Administrador" })]` para alinear la capa GraphQL con el servicio de dominio.

#### Botón / Acción: `Guardar Progreso de Estudiante`
* **Ubicación:** Línea 801 en `AcademicDashboard.jsx`
* **Comportamiento en UI:** Visible solo para roles docentes/gestores (`isAcademicManagerRole`). Permite asignar nota (0 a 10) y estado (`IN_PROGRESS`, `REGULAR`, `APPROVED`, `FREE`).
* **Contrato GraphQL:**
  * Operación: `UPSERT_ACADEMIC_PROGRESS`
  * Hook: `useMutation(UPSERT_ACADEMIC_PROGRESS)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `UpsertAcademicProgress` (`[Authorize(Roles = new[] { "Administrador", "Profesor" })]`)
  * Servicio: `AcademicService.cs` -> `UpsertAcademicProgressAsync`
  * Control de Acceso (`GAP-AUTH-02`): Ejecuta `EnsureCanManageSubjectAsync`: verifica que el profesor pertenezca a la misma carrera de la materia (`_context.UserCareers`).
* **Diagnóstico y Estado:** 🟢 OK

---

### Componente: `CertificateExport` (`FrontEnd/OneItb-FE/src/Components/academic/CertificateExport.jsx`)
* **Ubicación:** Integrado en la pestaña de progreso de `AcademicDashboard.jsx`

#### Botón / Acción: `Descargar CSV de Progreso`
* **Ubicación:** Línea 145 en `CertificateExport.jsx`
* **Comportamiento en UI:** Genera un archivo CSV con encoding UTF-8 BOM (`\uFEFF`) y activa la descarga automática sin peticiones de red adicionales.
* **Diagnóstico:** 🟢 OK

#### Botón / Acción: `Imprimir / PDF de Constancia`
* **Ubicación:** Línea 156 en `CertificateExport.jsx`
* **Comportamiento en UI:** Abre ventana emergente (`window.open`) con diseño institucional estilizado para imprimir o guardar como PDF.
* **Diagnóstico:** 🟢 OK

---

### Vista: `PublicCertificate` (`FrontEnd/OneItb-FE/src/Components/certificates/PublicCertificate.jsx`)
* **Ruta de Acceso:** `/certificate/:id`
* **Roles Autorizados:** Público (Anónimo)
* **Comportamiento en UI:**
  * Inyección reactiva de etiquetas OpenGraph en `<head>` para compatibilidad al compartir en LinkedIn.
  * Botón para compartir directamente en LinkedIn vía query intent.
* **Contrato GraphQL:**
  * Operación: `GET_PUBLIC_CERTIFICATE` (`Query.cs` -> `GetPublicCertificate`)
* **Diagnóstico y Estado:** 🟢 OK

---

## 3. Oportunidades de Optimización y Reducción de Líneas

### A. Código Muerto / Huérfano
* `API Graphql/Services/Academic/AcademicService.cs#L499-L520`: El método `GetResourcesBySubject` en `Query.cs` es un alias 100% idéntico a `GetAcademicResources`. Ambos invocan `academicService.GetAcademicResourcesAsync(...)` con la misma firma. Uno de los dos es redundante.

### B. Boilerplate y Simplificación
* `FrontEnd/OneItb-FE/src/Components/academic/CertificateExport.jsx#L79-L135`: La plantilla HTML inyectada por JavaScript con estilos en línea dentro de `window.document.write` abarca ~60 líneas. Podría resolverse con una vista imprimible pura en React y utilidades Tailwind `@media print`, tal como se implementó en `UserProfile.tsx`.
  * *Potencial de reducción:* De ~56 líneas de HTML procedural a un componente declarativo estándar.

---

## 4. Advertencias y Gaps Detectados (Sin romper Code Freeze)

1. 🟡 **Rutas Académicas no Mapeadas en React Router:**  
   `audit_state.json` lista `/materias`, `/carreras`, `/horarios` y `/syllabus`. En la implementación real, todo el catálogo está encapsulado dentro de `/academic` y `/admin`. No existe ningún módulo de horarios en el código fuente (no hay entidades en EF Core ni pantallas en frontend). Las rutas `/materias` y `/horarios` dan `404` si se ingresan manualmente.  
   *Propuesta de Cierre:* Si la institución requiere esas URLs, agregar redirecciones en `Routing.jsx` apuntando a `/academic`.

2. 🟡 **Desalineación RBAC en `SyncSiuGrades` Resolver vs Service:**  
   El resolver HotChocolate en `Mutation.cs` permite rol `"Profesor"`, mientras que `AcademicService.cs` lanza `EnsureAdmin` (solo `"Administrador"`).  
   *Propuesta de Cierre:* Remover `"Profesor"` del atributo `[Authorize]` en `Mutation.cs`.

3. 🟡 **Entrega Estática de Archivos (`GAP-FILE-01`):**  
   Los apuntes subidos a `/uploads/` se descargan directamente vía HTTP estático en Kestrel/ASP.NET sin pasar por validación de carrera/materia del estudiante. Se mantiene clasificado como deuda aceptada para el freeze académico.

---

## 5. Conclusiones y Próximos Pasos para este Módulo
El Módulo 02 (Dominio Académico) posee una **arquitectura sólida y bien desacoplada**. Los contratos de carga de recursos, notas, correlatividades y exportación de constancias funcionan correctamente. La mitigación `GAP-AUTH-02` restringe exitosamente el alcance de los profesores a sus carreras asignadas.

Procede avanzar inmediatamente al **Módulo 03: Dominio Social (Feed, Publicaciones, Comentarios, Reacciones, Multimedia /api/upload)**.
