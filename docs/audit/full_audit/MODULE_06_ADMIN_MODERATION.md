# Reporte de Auditoría: Módulo MOD-06 - Administración, Moderación, Reportes y Auditoría

**Fecha y Hora:** 2026-10-29T23:00:00-03:00  
**Estado del Módulo:** AUDITED (Auditado al 100%)  
**Archivos Inspeccionados:** 15 archivos (Frontend: 9, Backend: 6)

---

## 1. Resumen Ejecutivo del Módulo

| Métrica | Cantidad |
| :--- | :---: |
| Vistas / Pantallas Analizadas | 7 |
| Botones y Acciones Interactivas | 19 |
| 🔴 Hallazgos Críticos (Bloqueantes / Rotos) | 0 |
| 🟡 Advertencias (Gaps / UX / Incompletos) | 2 |
| 🟢 Oportunidades de Reducción de Código | 2 |

---

## 2. Matriz Detallada de Componentes y Botones

### Vista: `AdminDashboard` (`FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`)
* **Ruta de Acceso:** `/admin` (con redirección de `/admin/users`)
* **Roles Autorizados:** Exclusivo `Administrador` (Bloqueo en UI y en resolvers backend)

#### Botones de Navegación por Pestañas
* **Ubicación:** Líneas 45-59 en `AdminDashboard.jsx`
* **Pestañas Operativas:**
  1. `users`: Gestión Integral de Usuarios (`UserManagement.jsx`)
  2. `subjects`: Materias y Correlatividades (`SubjectManagement.jsx`)
  3. `publications`: Moderación de Consultas (`PublicationManagement.jsx`)
  4. `comments`: Moderación de Comentarios (`CommentManagement.jsx`)
  5. `moderation`: Reportes Comunitarios (`ModerationManagement.jsx`)
  6. `audit`: Registro de Auditoría de Moderación (`ModerationAuditManagement.jsx`)
  7. `employer-requests`: Adhesión de Empresas (`EmployerRequestManagement.jsx`)
* **Diagnóstico y Estado:** 🟢 OK

---

### Componente: `UserManagement` & `EditUserModal` (`FrontEnd/OneItb-FE/src/Components/admin/`)

#### Botón / Acción: `Guardar Nuevo Rol de Usuario`
* **Ubicación:** Línea 115 en `EditUserModal.jsx`
* **Comportamiento en UI:**
  * Solicita contraseña de administrador si el cambio involucra los roles `Administrador` o `Moderador`
  * Deshabilita botón durante guardado (`savingRole`)
* **Contrato GraphQL:**
  * Operación: `UPDATE_USER_ROLE` (`mutation UpdateUserRole($userId: UUID!, $newRole: String!, $adminPassword: String)`)
  * Hook: `useMutation(UPDATE_USER_ROLE)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `UpdateUserRole` (`[Authorize(Roles = new[] { "Administrador" })]`)
  * Servicio: `UsersService.cs` -> `UpdateUserRoleAsync`
  * Verificación de Seguridad: Comprueba la contraseña del operador contra el hash BCrypt de su propia cuenta antes de elevar privilegios
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Activar / Suspender Usuario`
* **Ubicación:** Línea 140 en `EditUserModal.jsx`
* **Contrato GraphQL:** `UPDATE_USER_STATUS` (`Mutation.cs` -> `UpdateUserStatus`)
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Silenciar Usuario Temporalmente`
* **Ubicación:** Línea 165 en `EditUserModal.jsx`
* **Comportamiento en UI:** Selector de ventana temporal (1, 6, 24 o 72 horas) para silenciar interacción social.
* **Contrato GraphQL:** `SILENCE_USER` (`Mutation.cs` -> `SilenceUser`)
* **Diagnóstico y Estado:** 🟢 OK

---

### Componente: `EmployerRequestManagement` (`FrontEnd/OneItb-FE/src/Components/admin/EmployerRequestManagement.jsx`)

#### Botón / Acción: `Aprobar Solicitud de Empresa`
* **Ubicación:** Línea 145 en `EmployerRequestManagement.jsx`
* **Comportamiento en UI:**
  * Estado de carga: Spinner en botón (`approvingId === request.id`)
  * Mueve la solicitud a la pestaña "Aprobadas" y genera credencial
* **Contrato GraphQL:**
  * Operación: `APPROVE_EMPLOYER_REQUEST` (`mutation ApproveEmployerRequest($requestId: UUID!)`)
  * Hook: `useMutation(APPROVE_EMPLOYER_REQUEST)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `ApproveEmployerRequest`
  * Servicio: `EmployerRequestService.cs` -> `ApproveRequestAsync`
  * Transaccionalidad: Crea atómicamente el usuario `User` con rol `Empleador`, cuenta `Account`, genera Magic Link de un solo uso y encola el correo en `EmployerOnboardingOutbox`
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Rechazar Solicitud de Empresa`
* **Ubicación:** Línea 168 en `EmployerRequestManagement.jsx`
* **Comportamiento en UI:** Solicita motivo de rechazo mediante prompt visual y marca estado `Rejected`.
* **Contrato GraphQL:** `REJECT_EMPLOYER_REQUEST` (`Mutation.cs` -> `RejectEmployerRequest`)
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Reenviar Credencial de Acceso`
* **Ubicación:** Línea 192 en `EmployerRequestManagement.jsx`
* **Contrato GraphQL:** `RESEND_EMPLOYER_WELCOME` (`Mutation.cs` -> `ResendEmployerWelcome`)
* **Diagnóstico y Estado:** 🟢 OK

---

### Componente: `ModerationManagement` (`FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`)

#### Botón / Acción: `Desestimar / Resolver Reporte Comunitario`
* **Ubicación:** Líneas 85 y 95 en `ModerationManagement.jsx`
* **Comportamiento en UI:**
  * Desestimar: Marca el reporte como "Dismissed", conservando el contenido visible.
  * Resolver: Marca el reporte como "Resolved" y oculta la publicación/comentario infractor.
* **Contrato GraphQL:**
  * Operación: `UPDATE_REPORT_STATUS` (`mutation UpdateReportStatus($reportId: UUID!, $status: String!)`)
  * Hook: `useMutation(UPDATE_REPORT_STATUS)`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `UpdateReportStatus` (`[Authorize(Roles = new[] { "Administrador", "Moderador" })]`)
  * Servicio: `ModerationService.cs` -> `UpdateReportStatusAsync`
* **Diagnóstico y Estado:** 🟢 OK

---

### Componente: `ModerationAuditManagement` (`FrontEnd/OneItb-FE/src/Components/admin/ModerationAuditManagement.jsx`)

#### Visualización de Auditoría Inmutable
* **Ubicación:** Tabla de logs de moderación
* **Contrato GraphQL:** `GET_MODERATION_AUDIT_LOGS` (`Query.cs` -> `GetModerationAudits`)
* **Backend e Infraestructura:**
  * Los eventos de moderación se registran en `ModerationAudits`.
  * Además, `AuditSaveChangesInterceptor.cs` intercepta a nivel EF Core todos los cambios en entidades críticas (`Account`, `User`, `AcademicProgress`, `Inquiry`, etc.) con redacción de datos sensibles (`PasswordHash`, `ExternalTenantId`), guardando el diff en la tabla `AuditLogs`.
* **Diagnóstico y Estado:** 🟢 OK

---

## 3. Oportunidades de Optimización y Reducción de Líneas

### A. Código Muerto / Huérfano
* `FrontEnd/OneItb-FE/src/Components/admin/PublicationManagement.test.jsx`: Test que solo comprueba mock de montaje básico sin aserciones de mutación; puede integrarse en la suite central.

### B. Boilerplate y Simplificación
* `FrontEnd/OneItb-FE/src/Components/admin/PublicationManagement.jsx` y `CommentManagement.jsx`:
  Ambos archivos contienen ~220 líneas con una estructura casi calcada (tabla de items, badge de visibilidad y botón `ToggleStatus`).
  * *Potencial de reducción:* Unificar en un componente `AdminContentTable` parametrizado por tipo de contenido, reduciendo ~120 líneas de código duplicado.

---

## 4. Advertencias y Gaps Detectados (Sin romper Code Freeze)

1. 🟡 **Sub-Rutas Administrativas no Declaradas en React Router:**  
   `audit_state.json` contemplaba `/admin/usuarios`, `/admin/carreras`, `/moderacion` y `/moderacion/reportes`.
   En `Routing.jsx`, `/admin/users` redirige a `/admin`, pero `/admin/carreras`, `/moderacion` o `/moderacion/reportes` arrojan `404` al no estar registradas en el enrutador. Todas las funciones se encuentran consolidadas en `/admin`.  
   *Propuesta de Cierre:* Mapear redirecciones hacia `/admin` en `Routing.jsx` para evitar errores 404 ante ingresos por URL manual.

2. 🟡 **Reautenticación Asimétrica en Modificación de Roles:**  
   La contraseña de administrador se exige únicamente al promover o degradar los roles `Administrador` o `Moderador`. Asignar roles como `Profesor`, `Estudiante` o `Empleador` se realiza sin confirmar clave. Cumple con la especificación pero debe documentarse en las políticas de seguridad.

---

## 5. Conclusiones y Próximos Pasos para este Módulo
El Módulo 06 (Administración y Moderación) cuenta con un **panel administrativo integral, protegido y completamente auditado**: gestión de usuarios con confirmación de clave, aprobación de empresas con generación de magic links, resolución de reportes comunitarios e interceptores de auditoría a nivel persistencia (`AuditSaveChangesInterceptor`).

Procede avanzar inmediatamente al **Módulo 07: Consolidación Final, Matriz de Riesgo y Plan Maestro de Reducción de Código (`MASTER_AUDIT_REPORT.md`)**.
