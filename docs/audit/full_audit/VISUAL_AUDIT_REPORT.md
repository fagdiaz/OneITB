# Informe de Auditoría Visual, Estética y Accesibilidad UI/UX Consolidado (OneITB23)

**Documento:** `docs/audit/full_audit/VISUAL_AUDIT_REPORT.md`<br>
**Rol Auditor:** Diseñador Visual de Sistemas y Especialista en Accesibilidad UI/UX OneITB23<br>
**Fecha de Emisión Inicial:** 2026-10-30T17:25:00-03:00<br>
**Fecha de Consolidación y Certificación:** 2026-11-14T19:05:00-03:00<br>
**Stack Visual Auditado:** React 18, Tailwind CSS v4, FontAwesome 6.7.2, Apollo Client 3.7, Vite 8<br>
**Modo de Inspección:** E2E en Navegador en Vivo (`http://localhost:5173`) + Análisis Estático y Pruebas Automatizadas (Vitest 374/374, xUnit 389/389, Total 763)<br>
**Alcance:** Consolidación exhaustiva de los 5 Sub-Slices funcionales y de gobernanza con remediación verificada.

---

## 1. Resumen Ejecutivo y Matriz de Madurez Visual Consolidada

Se ha completado la auditoría visual y de interacción en vivo a lo largo de los 5 sub-slices de la plataforma, cubriendo la totalidad de roles (`Estudiante`, `Profesor`, `Egresado`, `Empleador`, `Moderador`, `Administrador`) y contrastando ambos temas (*Clean Tech* y *Tech Noir*).

Todos los hallazgos críticos de omisión de clases `dark:` y contraste invisible previamente detectados han sido **remediados y verificados en runtime**.

| Vector de Análisis Visual | Estado Inicial | Estado Posterior a Remediación | Cumplimiento Actual | Hallazgos 🔴 | Hallazgos 🟡 | Hallazgos 🟢 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Consistencia de Diseño y Tailwind CSS** | ACEPTABLE (86%) | **EXCELENTE** | **98%** | 0 | 1 | 4 |
| **2. Modo Claro vs. Modo Oscuro (Dark Mode)** | CRÍTICO (74%) | **EXCELENTE (Gold Standard)** | **99%** | 0 | 1 | 6 |
| **3. Responsividad y Adaptación Móvil** | EXCELENTE (96%) | **EXCELENTE** | **99%** | 0 | 1 | 3 |
| **4. Micro-Feedback Visual y Estados UI** | BUENO (84%) | **EXCELENTE** | **98%** | 0 | 1 | 4 |
| **TOTALES CONSOLIDADOS** | **CALIFICADO CON RESERVAS (85.0%)** | **EVALUACIÓN POSITIVA** | **98.5% (Promedio) / 98.67% (Ítems)** | **0** | **4** | **17** |

> [!NOTE] Criterio, Metodología y Diferenciación de Métricas:
> Se distinguen formalmente dos agregaciones matemáticas derivadas de las 300 verificaciones observadas en los 5 sub-slices:
> 1. **Promedio simple por categorías (98.50%):** Promedio no ponderado de los 4 vectores visuales: `(98% + 99% + 99% + 98%) / 4 = 394% / 4 = 98.50%`.
> 2. **Proporción de ítems aprobados (98.67%):** Proporción directa sobre el total muestreado: `296 / 300 = 98.666...% (~98.67%)`.
>
> **Detalle de los 4 hallazgos pendientes (bandera amarilla 🟡):**
> * Vector 1 (49/50): Consistencia de tablas densas administrativas en vistas de auditoría.
> * Vector 2 (99/100): Contraste de trazado en gráficos estadísticos complejos bajo modo oscuro.
> * Vector 3 (99/100): Adaptación elástica de grillas de notas en anchos ultrapequeños (<360px).
> * Vector 4 (49/50): Micro-feedback explícito al descartar lotes de subida masiva de adjuntos.
>
> Ambas cifras se consideran una **estimación indicativa de madurez estética y de usabilidad** y no sustituyen el inventario unitario caso por caso ni la ejecución y certificación de los gates formales CF-03 a CF-06 requeridos por la Constitución del proyecto.

---

## 2. Consolidación de Resultados por Sub-Slice (Verificación en Vivo)

### Sub-Slice 1: Muro Social y Chat en Tiempo Real (`/feed`, `/chat`)
* **Compositor de Publicaciones (`Feed.jsx`):**
  * Espaciados, tarjetas e inputs alineados con `dark:bg-slate-900/80` y `dark:border-white/10`.
  * Selector de adjuntos probado: subida de imagen/PDF, previsualización en miniatura y remoción limpia con botón de descarte.
  * Alerta preventiva probada: al ingresar >2 enlaces de YouTube, se despliega advertencia visual limitando el embebido interactivo.
* **Interacciones Sociales e Hilos de Comentarios:**
  * Reacciones "Me gusta" con animación y recuento instantáneo.
  * Hilos de discusión con indentación adaptativa.
  * Primer comentario cronológico con "Me gusta" del usuario actual destacado dinámicamente como `firstLikedComment` (`Feed.jsx:923–926`) con selector de expansión (`+1 más · Expandir comentarios`).
  * Indicador de usuario activo resaltado en azul institucional.
* **Funciones de Moderación Disciplinaria Inline (`Feed.jsx`):**
  * Moderador (`moderador1@itbeltran.com.ar`) y Administrador cuentan con menú contextual exclusivo sobre publicaciones ajenas:
    * **Ocultar por moderación:** Despliega `ModerationReasonModal`, exige motivo obligatorio (≥5 caracteres) y retira la publicación del feed con auditoría persistida.
    * **Silenciar autor (Moderación):** Abre diálogo modal de sanción disciplinaria implementado mediante `SilenceUserModal.jsx` con contrato completo de teclado y accesibilidad (foco inicial en botón de cierre, trampa de tabulación `Tab`/`Shift+Tab`, tecla `Escape` libre en reposo y bloqueada durante el envío de la mutación, y restauración de foco al disparador al cerrar). Permite seleccionar duración (24 hs, 72 hs, 168 hs), ejecuta la mutación `SILENCE_USER` persistiendo el silenciamiento en backend (`MutedUntil`), y emite toast de confirmación.
* **Chat Institucional (`PrivateChat.jsx`):**
  * Contacto probado con docente (`profesor2.cdia`).
  * Burbujas diferenciadas: azul institucional (`bg-blue-600 text-white`) para mensajes propios y superficie contrastada para mensajes recibidos.
  * Indicador de socket WebSocket activo con pulsación verde en tiempo real. Cero errores en consola DevTools.

### Sub-Slice 2: Perfil de Usuario, Avatar, Privacidad y CV ATS (`/perfil`)
* **Editor Interactivo de Avatar (`AvatarEditorModal.jsx`):**
  * Carga de imagen con controles de zoom (slider), arrastre/desplazamiento en canvas circular y rotación 90°.
  * **Accesibilidad Modal:** Cierre probado y verificado mediante pulsación de tecla `Escape` y clic en el telón de fondo (backdrop) exterior con foco inicial y confinamiento (focus trap).
  * Actualización reactiva instantánea del avatar en el header y en el perfil sin recarga forzada.
* **Privacidad y Escudo Institucional (`CvEditorProfile.tsx`, `UserProfile.tsx`):**
  * Switch de privacidad de perfil público/privado con mutación verificada (`toggleProfilePrivacy`), actualización de caché de Apollo únicamente tras confirmar `success === true`, reversión limpia en fallo, y persistencia ante recarga `F5`.
  * **GAP-PRIV-01 (Escudo de Privacidad Institucional):** Verificado en runtime con cuenta de contraste. Dueño del perfil privado: `egresado1@itbeltran.com.ar`. Seguidor/solicitante: `estudiante1.ads@itbeltran.com.ar`. Se comprobó que el seguimiento unilateral (Follow) no otorga acceso al CV ATS, teléfono, materias cursadas ni datos de contacto sensibles (`Query.cs:1021–1057`).
* **CV ATS de Exportación:**
  * Vista previa monocolumna en formato A4 estándar internacional con diálogo modal accesible (foco inicial, focus trap y cierre por tecla `Escape` o backdrop).
  * Reglas `@media print` depuradas: fondo blanco puro, tipografía negra de alto contraste (`print:text-black`), márgenes exactos de 12mm (`useCvAtsPrint.ts:15`) y ocultamiento estricto de controles de navegación e interactivos.

### Sub-Slice 3: Gestión Académica y Calificaciones (`/academico`)
* **Aislamiento de Carrera (`GAP-AUTH-02`):**
  * Docente de Analista de Sistemas (`profesor1.ads`) restringido estrictamente a comisiones y materias de su carrera asignada, sin visibilidad ni acceso a carreras externas.
* **Grilla de Calificaciones y Validación Numérica:**
  * Tabla de estudiantes con estados de regularidad y notas previas.
  * Validación de notas: restricción estricta de 0 a 10. Carga de nota 9 persistida correctamente en backend.
* **Vista del Estudiante:**
  * Comprobación de ausencia de textos técnicos informales (ej. `"anio"`): visualización formal `"1° año"`, `"2° año"`, `"3° año"`.
  * Exportación de analítico y certificados con soporte de impresión y descarga CSV.
* **Alcance de Gestión Académica y Concurrencia (F05 / AC-1 y AC-2 de Spec 220):**
  * **Backend (.NET 8):** Los contratos de `AC-1` y `AC-2` están 100% implementados y verificados con suites xUnit en `Services.Tests`:
    * `SaveSectionGradeAsync`: valida que el docente esté asignado a la comisión, preserva el historial de intentos en recursadas y lanza `ConcurrencyConflict` cuando `ExpectedVersion` no coincide con el `RowVersion` de la entidad en base de datos (`AcademicSectionGradeTests.cs` y `SectionGradeSqlRaceTests.cs`).
    * `GetMyCourseSectionsAsync`: retorna períodos y comisiones asignadas con control de acceso por rol y carrera.
    * `IssueRegularStudentCertificateAsync`: emite certificados institucionales con validación criptográfica de vigencia.
  * **Frontend UI (Aceptación de Demo):** La interfaz actual en `AcademicDashboard.jsx` opera bajo la política freeze-safe de carrera (`UserCareer` / `GAP-AUTH-02`), impidiendo a los docentes calificar o ver alumnos de carreras ajenas (`AcademicService.cs:850–908`). La integración de los selectores visuales de comisión/sección y el diálogo interactivo de conflicto de concurrencia optimista (`ExpectedVersion`) quedan catalogados formalmente como frontera de UI pendiente para demo según los criterios de aceptación AC-1 y AC-2 de la Spec 220, sin inferir ausencia total de deuda o vulnerabilidades fuera de los contratos rigurosamente probados.

### Sub-Slice 4: Ecosistema B2B Laboral y Postulaciones (`/empleos`, `/empleos/solicitud`)
* **Solicitud de Vinculación B2B (`/empleos/solicitud`):**
  * Validación rigurosa de CUIT institucional mediante algoritmo de Módulo 11 de AFIP. CUIT válido de prueba: `30712345671`.
  * Bloqueo preventivo de campos vacíos o con formato inválido. Recepción institucional exitosa con código de seguimiento `#F56C019F3E`.
* **Portal del Empleador (`empleador1@itbeltran.com.ar`):**
  * Publicación exitosa de oferta laboral (*"Desarrollador Junior React/C#"*).
  * Modal ATS de revisión de candidatos con visor de perfil y atajo de cierre `Escape`.
* **Experiencia del Postulante (Estudiante):**
  * Postulación interactiva a vacante con feedback visual inmediato: transformación del botón de acción en badge estático `✓ Postulado` con estilos accesibles.

### Sub-Slice 5: Moderación, Panel Administrador y Gobernanza Institucional
* **Acciones de Moderación (`moderador1@itbeltran.com.ar` en `/feed`):**
  * Menú contextual (`...`) sobre publicación con acción *"Ocultar por moderación"*.
  * Modal `ModerationReasonModal` verificado:
    * Intento de confirmación con campo vacío: bloqueado con mensaje de validación *"Debe ingresar un motivo formal de moderación"*.
    * Descarte accesible mediante tecla `Escape` y clic en backdrop.
    * Ocultamiento exitoso con motivo formal: remoción inmediata del post del feed sin recargar la página.
* **Panel de Gobernanza del Administrador (`admin1@itbeltran.com.ar` en `/admin`):**
  * **Aprobación de Solicitudes B2B:** Revisión de la empresa solicitante y aprobación formal incorporándola al padrón activo.
  * **Trazabilidad Forense (`AuditLog`):** Registro inmediato del evento `HideInquiry` con actor (`Moderador Institucional`), título del post, motivo registrado y estampa temporal.
  * **Protección de Cuentas Administrativas (`Cuenta protegida`):** Intento de edición sobre `admin1` o `admin2` bloqueado por modal inmutable: *"Este usuario es un Administrador protegido. No se puede modificar su rol, estado ni silenciarlo."*
* **Acciones de Moderación Disciplinaria (F04 - Moderador vs. Administrador):**
  * El Moderador cuenta con acceso a su panel institucional en `/moderacion` (`ModerationDashboard.jsx`), con pestañas para Reportes de Comunidad (`ModerationManagement`) y Auditoría Forense de Moderación (`ModerationAuditManagement` respaldado por `GetModerationAudits` en backend autorizado para `Moderador` y `Administrador`), además de sus facultades sancionatorias inline en `/feed` (`ModerationReasonModal` y `SilenceUserModal`).
  * La ruta `/admin` (`AdminDashboard.jsx`) se mantiene estrictamente restringida a `Administrador` por política probada en `roleRoutingMatrix.test.jsx:137`, resguardando la gestión de usuarios, cambio de roles y configuración del sistema bajo el principio de mínimo privilegio.

---

## 3. Matriz de Remediación de Hallazgos Previos

| ID | Componente | Descripción Original | Estado Actual | Evidencia de Resolución |
| :--- | :--- | :--- | :---: | :--- |
| **VIS-HIGH-01** | `Login.jsx` | Tarjeta blanca fija en Dark Mode | 🟢 **RESUELTO** | Implementadas clases `dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-100`. |
| **VIS-HIGH-02** | `Register.jsx` | Selector de carrera y tarjeta sin `dark:` | 🟢 **RESUELTO** | Tarjetas, inputs y selector con paleta adaptativa `dark:bg-slate-950/70`. |
| **VIS-HIGH-03** | `UserProfile.tsx` | Texto `slate-950` sobre fondo oscuro (<1.3:1) | 🟢 **RESUELTO** | Agregadas clases `dark:text-white` y `dark:text-slate-200` en todas las métricas. |
| **VIS-HIGH-04** | `NotFound.jsx` | Pantalla 404 sin soporte Dark Mode | 🟢 **RESUELTO** | Rediseño completo con `dark:bg-slate-950 dark:text-slate-100` y acento Cyan. |
| **VIS-HIGH-05** | `MultiSelectDropdown.jsx` | Menú desplegable blanco fijo | 🟢 **RESUELTO** | Contenedor con `dark:bg-slate-900 dark:border-white/10 dark:text-slate-200`. |
| **VIS-MED-01** | `AvatarEditorModal.jsx` | Modal no respondía a Escape ni backdrop | 🟢 **RESUELTO** | Agregado `useEffect` con listener para tecla `Escape` y `onMouseDown` en backdrop. |
| **VIS-MED-02** | `CvEditorProfile.tsx` | Switch de privacidad no persistía en F5 | 🟢 **RESUELTO** | Vinculada mutación `toggleProfilePrivacy` con actualización reactiva en Apollo Cache. |
| **VIS-MED-03** | `Feed.jsx` | Badges de roles con ratio WCAG < 4.5:1 | 🟢 **RESUELTO** | Paleta ajustada: `indigo-700` (5.8:1), `amber-800` (5.1:1), `cyan-800` (5.5:1). |
| **VIS-MED-05** | `AdminDashboard.jsx` | Pestaña activa mimetizada en Dark Mode | 🟢 **RESUELTO** | Botón activo con `dark:bg-blue-600 dark:text-white dark:shadow-blue-600/30`. |

---

## 4. Auditoría de Temas Globales y Accesibilidad WCAG 2.1 AA

* **Transición de Temas (*Clean Tech* vs. *Tech Noir*):**
  * Botón selector en el encabezado ejecuta una transición suave mediante `html.theme-transitioning` sin parpadeos (*FOUC*).
  * Todos los contrastes de texto normal cumplen o superan el umbral mínimo de **4.5:1**, y los textos grandes (>18pt) superan **3.0:1**.
* **Navegación por Teclado y Foco Visible (WCAG 2.4.7):**
  * Se verificó el foco visible en enlaces, campos de texto y botones con anillos contrastados (`focus-visible:ring-2 focus-visible:ring-cyan-400`).
* **Higiene de Consola en Tiempo Real:**
  * Consola DevTools (F12) completamente limpia durante los recorridos de los 5 sub-slices: **0 errores rojos (400, 500, GraphQL mismatch)**.

---

## 5. Veredicto Final y Estado del Release Candidate

El frontend de **OneITB23** ha alcanzado un índice de cumplimiento visual y de accesibilidad del **98.5%** sobre los componentes inspeccionados:
1. **Coherencia Estética Integral:** Lenguaje visual unificado en los 6 roles de usuario.
2. **Robustez en Modo Oscuro:** Cero texto invisible y cero destellos no controlados.
3. **Accesibilidad y Gobernanza:** Manejo de modales con foco inicial, confinamiento (focus trap) y Escape, trazabilidad de auditoría en backend y aislamiento de privilegios.

**Estado de Certificación:** 🟡 **RELEASE CANDIDATE CONDICIONADO A CIERRE DE GATES (CF-03 A CF-06 PENDIENTES)**
La certificación oficial final de Release Candidate permanece formalmente pendiente de la ejecución y verificación de los gates CF-03 a CF-06 en `ROADMAP.md` conforme a Constitución §VII y §IX.
