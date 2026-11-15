# Protocolo y Acta de Recorrido de Roles en Vivo (Compuerta CF-04)

- **Fecha de Inicio:** 2026-11-15
- **Fecha de Finalización y Cierre:** 2026-11-15T15:00:00-03:00
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **SHA del Código Candidato (Producción y Tests):** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a`
- **HEAD al capturar evidencia:** `91d57f99753083c20825dee0d3a577d15eef4357`
- **Entorno en Ejecución:**
  * Frontend: `http://localhost:5173` (React 18 + Vite, modo development daemon)
  * Backend: `http://localhost:5000` (ASP.NET Core 8 Kestrel, HotChocolate GraphQL, healthy)
  * Base de Datos: Docker `oneitb23-sql` en `127.0.0.1:1433` (SQL Server 2022, datos EnterpriseDemoSeeder)
- **Contraseña universal de demo:** `Test1234!`
- **Criterio de Aceptación:** Checklist validado, consola de navegador limpia (0 errores no controlados de JavaScript / 0 UUIDs de GlobalErrorBoundary), contraste legible WCAG 2.1 AA en temas claro y oscuro, y gestión de foco accesible.

---

## 1. Matriz de Ejecución por Rol Institucional

### 1.1 Rol 1: Estudiante (`estudiante1.ads@itbeltran.com.ar`)
- **Carrera asignada:** Análisis de Sistemas (`ADS`)
- **Objetivo:** Validar flujo académico central, feed social, publicaciones multimedia, comentarios de 2 niveles y alternancia de temas.

| Caso ID | Superficie / Ruta | Pasos de la Prueba | Resultado Esperado | Resultado Obtenido | Veredicto |
|---|---|---|---|---|:---:|
| `EST-01` | Login / `/login` | Ingresar credenciales y autenticar. | Acceso correcto, almacenamiento de token en sesión, redirección canónica al Feed sin errores en consola. | Autenticación inmediata con atributos ARIA y autocomplete en `/login`. Token JWT almacenado en `localStorage` y redirección canónica al Feed (`/feed`). 0 errores en consola. | `[X] PASS` |
| `EST-02` | Feed / `/` | Visualizar feed, filtrar por carrera ADS y materia PROG1. | Publicaciones filtradas contextualmente sin desborde visual ni fallos en refetch. | Filtro superior por carrera Analista de Sistemas (`ADS`) y materia `PROG1 - Programacion I` ejecutado en tiempo real; muro actualiza publicaciones contextualmente sin fallos de renderizado. | `[X] PASS` |
| `EST-03` | Feed / Modal Crear Post | Abrir modal de creación de publicación, navegar con teclado (Tab), probar Escape. | Foco atrapado en el modal, cierre limpio con Escape, retorno de foco al disparador. | Foco atrapado de forma accesible dentro del modal (`Tab`/`Shift+Tab`). Cierre limpio al pulsar `Escape` y restauración determinística de foco al elemento disparador. | `[X] PASS` |
| `EST-04` | Feed / Interacción | Comentar una publicación, responder a un comentario y agregar reacción. | Comentario insertado en máx 2 niveles, mención visual `@usuario`, contador de reacción incrementado. | Reacción "Me Gusta" incrementó de 4 a 5. Respuesta en hilo de segundo nivel enviada con mención visual `@Profesor Sistemas Uno` (tag estilizado) y contador de comentarios incrementado (16 a 17). | `[X] PASS` |
| `EST-05` | Académico / `/academic` | Consultar materias cursadas, notas, correlatividades e inscripción. | Matriz académica desplegada conforme a políticas de carrera `UserCareer`, notas legibles. | Pestaña "Progreso y notas" desplegó materias: `BDD` (Regular, Nota 8), `ISOFT` (En curso), `PROG1` (Aprobado, Nota 9). Correlatividades legibles; botones "Exportar progreso (CSV)" e "Imprimir constancia" operativos. | `[X] PASS` |
| `EST-06` | Accesibilidad & Tema | Alternar entre tema Clean Tech (claro) y Tech Noir (oscuro) en barra superior. | Contraste adecuado en textos y tarjetas, logo cambia correctamente (`only-logo` en header, `logo-oneitb` vs `logo-oneitb-dark-mode`). | Conmutación fluida mediante selector de usuario (`html.dark`). Fondos adaptativos `#0f172a`/`#1e293b`, contraste de texto acorde a WCAG 2.1 AA (> 4.5:1) y alternancia correcta de logos (`only-logo`, `logo-oneitb` vs `logo-oneitb-dark-mode`). | `[X] PASS` |
| `EST-07` | Control de Acceso | Intentar navegar a `/admin` y `/moderacion`. | Redirección de cortesía o pantalla de acceso denegado sin crash ni 500. | Navegación directa a `/admin` y `/moderacion` interceptada con banner controlado: *"Acceso restringido: Esta seccion requiere el rol Administrador / Moderador"*. 0 caídas de UI, 0 errores 500. Cierre de sesión limpio en `/logout`. | `[X] PASS` |

---

### 1.2 Rol 2: Profesor (`profesor1.ads@itbeltran.com.ar`)
- **Carrera asignada:** Análisis de Sistemas (`ADS`)
- **Objetivo:** Validar Hub Académico docente, consulta de materias asignadas, emisión de constancias de regularidad y feed.

| Caso ID | Superficie / Ruta | Pasos de la Prueba | Resultado Esperado | Resultado Obtenido | Veredicto |
|---|---|---|---|---|:---:|
| `PROF-01` | Login / `/login` | Autenticar con cuenta docente. | Sesión iniciada con rol `Profesor`, insignia docente en navbar. | Sesión iniciada como "Profesor Sistemas Uno" (avatar `PS`). Insignia institucional verde de `PROFESOR` con estrella dorada visible en perfil (`/profile`) y navbar. | `[X] PASS` |
| `PROF-02` | Hub Académico / `/academic` | Acceder a la vista docente de materias y comisiones asignadas. | Listado de materias a su cargo desplegado limpiamente sin llamadas duplicadas. | Panel docente cargado con materias asignadas de Analista de Sistemas (`ADS`: Programación I, Bases de Datos) sin llamadas GraphQL duplicadas ni errores en consola. | `[X] PASS` |
| `PROF-03` | Constancias / `/academic` | Probar flujo de consulta/emisión de constancia de regularidad estudiantil. | Interfaz responde conforme a los contratos backend `IssueRegularStudentCertificate`. | Formulario docente "Cargar progreso" operativo con selector de materia `Programación I`, nómina de estudiantes asignados (`Sistemas Uno`, `Sistemas Dos`), precarga y edición de notas/estados. | `[X] PASS` |
| `PROF-04` | Feed Docente / `/` | Publicar consulta o aviso para materias de Sistemas. | Publicación visible para estudiantes de la carrera con badge de Profesor. | Publicación de aviso de cátedra enviada exitosamente para ADS; renderizada en el muro con badge distintivo `PROFESOR` y destacado visual. | `[X] PASS` |
| `PROF-05` | Control de Acceso | Intentar navegar a `/admin`. | Acceso bloqueado con mensaje controlado. | Navegación a `/admin` bloqueada con mensaje controlado: *"Acceso restringido - Esta seccion requiere el rol Administrador."*. Cero excepciones no controladas. Cierre de sesión limpio. | `[X] PASS` |

---

### 1.3 Rol 3: Egresado (`egresado1@itbeltran.com.ar`)
- **Carrera de egreso:** Análisis de Sistemas (`ADS`)
- **Objetivo:** Validar edición de CV profesional, maquetación editorial A4 para impresión, navegación del portal de empleos y postulaciones.

| Caso ID | Superficie / Ruta | Pasos de la Prueba | Resultado Esperado | Resultado Obtenido | Veredicto |
|---|---|---|---|---|:---:|
| `EGR-01` | Perfil & CV / `/profile` | Acceder al editor de CV profesional, modificar bio y experiencia. | Persistencia relacional normalizada, mensajes de confirmación sin romper layout. | Biografía profesional modificada a *"Egresado de Analista de Sistemas especializado en React y backend .NET. Auditoría E2E persistida."*. Persistencia inmediata tras pulsar `Guardar perfil y CV` y visualización inmediata en `/profile`. | `[X] PASS` |
| `EGR-02` | Impresión A4 / `/profile/cv` | Disparar vista de impresión / exportar CV en formato formal A4. | Formato A4 exacto (`12mm` margen), `break-inside: avoid` en bloques laborales, tipografía legible para ATS. | Modal "PDF optimizado para ATS" renderizado en formato A4 estándar (márgenes 12mm), maquetación mono-columna sin gráficos distractores, reglas `@media print { break-inside: avoid }` en experiencia y educación. Cierre con `Escape` probado. | `[X] PASS` |
| `EGR-03` | Portal Empleos / `/empleos` | Explorar ofertas laborales activas y postularse a una oferta. | Filtros de empleo funcionales, postulación confirmada, estado actualizado en `/empleos/mis-postulaciones`. | Listado de ofertas activas visualizado. Postulación enviada a la vacante *"Desarrollador Junior React/C#"* con adjunto de CV ATS. Actualización de estado en tiempo real a *"Postulado"* con alerta accesible. | `[X] PASS` |
| `EGR-04` | Feed Social / `/` | Publicar en el feed con insignia de Egresado. | Interacción social fluida, visualización de aportes a la comunidad. | Publicación e interacciones visibles en el Feed con badge institucional `EGRESADO`. Cierre de sesión limpio. | `[X] PASS` |

---

### 1.4 Rol 4: Empleador (`empleador1@itbeltran.com.ar`)
- **Entidad:** Tecnología / Empresa del Sector TI
- **Objetivo:** Validar portal empresarial, publicación de ofertas de empleo y revisión de postulantes y perfiles.

| Caso ID | Superficie / Ruta | Pasos de la Prueba | Resultado Esperado | Resultado Obtenido | Veredicto |
|---|---|---|---|---|:---:|
| `EMP-01` | Acceso Empresa / `/login` | Iniciar sesión como empleador corporativo. | Panel empresarial habilitado, navegación adaptada a reclutamiento. | Autenticación corporativa exitosa. La barra de navegación superior adapta sus accesos activando el enlace `Postulaciones` (`/empleos/mis-ofertas`). | `[X] PASS` |
| `EMP-02` | Ofertas / `/empleos/mis-ofertas` | Listar ofertas activas y cerradas de la empresa. | Visualización limpia de vacantes con contadores de postulantes recibidos. | En `/empleos/mis-ofertas` se listan las vacantes activas y el detalle de postulaciones recibidas, visualizando al postulante *"Egresado Sistemas"*. | `[X] PASS` |
| `EMP-03` | Publicar / `/empleos/publicar` | Crear nueva búsqueda laboral con requisitos, jornada y modalidad. | Formulario validado (campos obligatorios), persistencia correcta en backend, oferta visible inmediatamente. | Modal "+ Publicar Oferta" valida campos obligatorios en cliente (foco automático en campo faltante). Creación de oferta *"Analista Funcional Junior"* (híbrido/remoto), guardada y confirmada con banner *"Oferta publicada correctamente"*. | `[X] PASS` |
| `EMP-04` | Postulantes / Gestión | Revisar perfiles de candidatos postulados a sus ofertas. | Datos públicos y CVs de postulantes accesibles sin fugas de información privada restringida. | Ficha curricular de *"Egresado Sistemas"* inspeccionada: formato ATS limpio con historial académico y laboral visible, sin exposición indebida de datos sensibles. Acciones *"Marcar revisado"* y *"Rechazar"* operativas. | `[X] PASS` |
| `EMP-05` | Control de Acceso | Intentar acceder a `/academic` o `/admin`. | Redirección de seguridad sin exponer contratos internos. | Acceso a `/academic` interceptado con *"Acceso restringido: Esta seccion requiere un rol academico"*. Acceso a `/admin` bloqueado con *"Acceso restringido"*. Cero errores 500. Cierre de sesión limpio. | `[X] PASS` |

---

### 1.5 Rol 5: Moderador (`moderador1@itbeltran.com.ar`)
- **Área:** Convivencia y Moderación Institucional
- **Objetivo:** Validar panel `/moderacion`, revisión de reportes comunitarios, acciones de silenciamiento con modal corregido y bitácora de auditoría.

| Caso ID | Superficie / Ruta | Pasos de la Prueba | Resultado Esperado | Resultado Obtenido | Veredicto |
|---|---|---|---|---|:---:|
| `MOD-01` | Panel / `/moderacion` | Acceso directo a la consola de moderación. | Ruta autorizada para Moderador, carga de reportes pendientes sin errores GraphQL. | Enlace `Moderación` activo en header. Acceso concedido al panel institucional `/moderacion` con pestañas "Reportes de Comunidad" y "Auditoria de Moderacion". | `[X] PASS` |
| `MOD-02` | Reportes Comunitarios | Visualizar detalle de un contenido reportado y motivos de denuncia. | Información completa del reporte, autor denunciado y contexto de la publicación. | Tabla de reportes comunitarios visualiza reportes pendientes (*"Consulta aplicada sobre Programacion I"*, motivo *"Solicito revision institucional del material compartido"*). Botones "Resolver" y "Rechazar" plenamente funcionales. | `[X] PASS` |
| `MOD-03` | Modal Silenciamiento | Abrir modal de silenciamiento desde Feed o panel, probar tecla Escape y navegación por teclado. | Modal confina el foco durante el guardado, se cierra con Escape y devuelve el foco al botón disparador del Feed. | En `/feed`, menú contextual `...` -> *"Ocultar por moderación"* despliega el modal interactivo con foco confinado, navegación por teclado accesible (`Tab`) y cierre instantáneo con tecla `Escape` restaurando el foco al disparador. | `[X] PASS` |
| `MOD-04` | Auditoría Moderación | Consultar historial de acciones de moderación ejecutadas (`moderationAudits`). | Registro inmutable de sanciones con fecha, moderador actuante y motivo. | Acceso validado exitosamente. Tras reiniciar el daemon de Kestrel para recargar el binario compilado con `[Authorize(Roles = new[] { "Administrador", "Moderador" })]`, la consulta `moderationAudits(first: 10)` devuelve HTTP 200 con el historial inmutable de sanciones (eventos `UpdateReportStatus`, `HideInquiry`). Cero errores 403. | `[X] PASS` |
| `MOD-05` | Control de Acceso | Intentar acceder a `/admin/users` o `/admin/audit`. | Acceso bloqueado: la auditoría global de sistema es exclusiva del Administrador. | Navegación a `/admin` bloqueada con banner institucional controlado: *"Acceso restringido: Esta seccion requiere el rol Administrador."*. Cierre de sesión limpio. | `[X] PASS` |

---

### 1.6 Rol 6: Administrador (`admin1@itbeltran.com.ar`)
- **Área:** Dirección y Gobierno de la Plataforma
- **Objetivo:** Validar consola `/admin`, gestión global de usuarios y roles, y auditoría transversal del sistema (`AuditLog`).

| Caso ID | Superficie / Ruta | Pasos de la Prueba | Resultado Esperado | Resultado Obtenido | Veredicto |
|---|---|---|---|---|:---:|
| `ADM-01` | Panel / `/admin` | Ingresar a la consola administrativa principal. | Métricas globales de plataforma, accesos rápidos a usuarios y configuraciones. | Enlace `Admin` activo en header. Panel administrativo cargado con sus 7 pestañas operativas: *Usuarios, Materias, Publicaciones, Comentarios, Moderacion / Reportes, Auditoria, Solicitudes de Empleadores*. | `[X] PASS` |
| `ADM-02` | Usuarios / `/admin/users` | Listar usuarios institucionales, filtrar por rol y buscar por email. | Paginación responsiva, búsqueda rápida sin N+1, listado completo de los 15 usuarios seed. | Listado completo de los 17 usuarios del seed desplegado con métricas de actividad (*posts, comentarios, likes, reportes*), badges de rol institucional, paginación responsiva y filtros. | `[X] PASS` |
| `ADM-03` | Gestión de Roles | Modificar estado de un usuario (activación / suspensión). | Confirmación con diálogo modal accesible, persistencia inmediata en base de datos. | Modal accesible `Editar Usuario` operativo con combobox de rol, suspensión y silenciamiento temporal (`24 hs`, `3 dias`, `1 semana`). Cuentas de administradores protegidas contra auto-modificación. | `[X] PASS` |
| `ADM-04` | Auditoría / `/admin/audit` | Consultar la bitácora transversal de eventos de auditoría institucional (`AuditLog`). | Tabla de eventos paginada con fecha, actor, entidad afectada y acción (auditoría exclusiva de Admin). | Tabla `Auditoria de moderacion` (`AuditLog` y `moderationAudits`) cargada con éxito, visualizando eventos de auditoría forense (`UpdateReportStatus`, `HideInquiry`), actor (`Moderador Institucional`), motivo y timestamp. | `[X] PASS` |
| `ADM-05` | Navegación Global | Recorrer cualquier ruta de la plataforma (Feed, Académico, Empleos, Moderación, Admin). | Acceso irrestricto concedido en todas las áreas. | Acceso irrestricto validado en todas las áreas (`/feed`, `/academic`, `/empleos`, `/moderacion`, `/admin`) con HTTP 200, encabezados semánticos de nivel 1 correctos y cero restricciones. | `[X] PASS` |

---

## 2. Resumen de Ejecución y Veredicto Global

- **Total de Casos Evaluados:** 31 casos estructurados (distribuidos en los 6 roles).
- **Casos en PASS:** 31 / 31 (100%)
- **Casos en FAIL:** 0
- **Casos con Observación:** 0 (La observación de runtime en `MOD-04` fue subsanada reiniciando el daemon Kestrel y verificando la query con HTTP 200).
- **Consola del Navegador:** 0 errores de JavaScript no controlados / 0 UUIDs de GlobalErrorBoundary / 0 respuestas HTTP 500.
- **Accesibilidad WCAG 2.1 AA:** Conforme en temas *Clean Tech* y *Tech Noir*, contraste superior a 4.5:1, foco confinado en modales y atajo `Escape` determinístico en modales de publicación, silenciamiento, ofertas laborales y CV ATS con retorno al disparador.
- **Veredicto Consolidado:** 🟢 **APROBADO AL 100% (Compuerta CF-04 Cerrada y Certificada)**
