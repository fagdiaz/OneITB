# Alcance y especificación de requerimientos de OneITB23

| Dato de control | Valor |
|---|---|
| **Última revisión contra código** | 2026-08-03 |
| **Stack de referencia** | .NET 8, EF Core 8, HotChocolate 14, React 18, Apollo Client 3, Tailwind CSS 4 y SQL Server 2022 |
| **Estado del alcance contabilizado** | 117/117 ítems: 109 funcionales/operativos y 8 remediaciones de auditoría |
| **Clasificación** | Release Candidate académico, core Feature Complete y Code Freeze operativo local |
| **Fuente de estados y prioridades** | `docs/project_docs/ROADMAP.md` |
| **Fuente de riesgos y aceptación** | `docs/audit/FINAL_AUDIT_REPORT.md` |

Este documento define **qué debe hacer OneITB23, para qué actores y bajo qué reglas**.
No describe en detalle la implementación interna ni reemplaza al roadmap. Las palabras
“debe”, “solo” y “no debe” expresan requisitos verificables. Cuando el código actual no
cumple completamente una condición, la diferencia se registra en la sección 9 en lugar
de ocultarse o reinterpretarse.

---

## 1. Propósito, problema y objetivos

### 1.1 Problema institucional

La comunidad del Instituto Tecnológico Beltrán necesita concentrar en un único espacio
la identidad académica y profesional, las consultas por materia, los recursos de estudio,
la comunicación entre miembros, la moderación institucional y el acceso a oportunidades
laborales. Sin esa integración, la información queda fragmentada entre canales informales,
archivos aislados y procesos administrativos difíciles de auditar.

### 1.2 Objetivo general

OneITB23 es una red social académica con bolsa de trabajo institucional. Debe permitir
que estudiantes, profesores, egresados, empleadores y autoridades interactúen dentro de
fronteras de autorización explícitas, con persistencia relacional, trazabilidad y una
experiencia web responsive.

### 1.3 Objetivos específicos

1. Proveer identidad, perfil profesional/CV y pertenencia académica.
2. Organizar publicaciones, comentarios, recursos y progreso por carrera/materia.
3. Facilitar comunicación privada y notificaciones en tiempo real.
4. Permitir moderación reversible, reportes y auditoría persistente.
5. Vincular estudiantes/egresados con empleadores mediante ofertas y postulaciones.
6. Disponer de una base demo reproducible y un entorno local contenido para la defensa.
7. Mantener una arquitectura extensible hacia proveedores reales sin afirmar que ya
   fueron aceptados en producción.

### 1.4 Resultado esperado para la entrega académica

El resultado comprometido es una aplicación funcional sobre un entorno controlado,
demostrable con seis roles, datos coherentes y evidencia técnica. No se compromete un
servicio público con SLA, soporte 24x7, SIU real ni cloud institucional aprovisionada.

---

## 2. Frontera del producto

### 2.1 Capacidades incluidas

| Módulo | Capacidad incluida | Nivel de aceptación documentado |
|---|---|---|
| Identidad y cuentas | Registro local, login, lockout, JWT, Magic Link y Microsoft Entra opcional | Local verificado por etapas; Entra real bloqueado por tenant/consentimiento |
| Perfil y CV | Perfil relacional, avatar, contacto, experiencia, educación, proyectos, aptitudes, idiomas, carreras y privacidad | Implementado; recorridos locales y contratos cubiertos por etapas |
| Carreras y materias | Carreras, materias, año, correlatividades y asociaciones de usuario | Contrato/runtime sobre base demo reconstruida |
| Muro social | Feed paginado, búsqueda, comentarios, respuestas, menciones, reacciones, reportes, seguidores, bloqueos y adjuntos | Implementado y aceptado por etapas; regresión manual final pendiente |
| Mensajería | Conversaciones uno a uno, historial, lectura, búsqueda, badges y eventos WebSocket | Persistencia verificada; handshake final con dos navegadores pendiente |
| Académico | Recursos, progreso/notas, constancias, preferencias, SIU mock y notificaciones | Implementado localmente; SIU productivo fuera de alcance |
| Administración y moderación | Usuarios, roles, carreras, materias, reportes, hide/restore, silenciamiento y auditoría | Implementado; recorrido visual Moderador/Admin pendiente antes de la defensa |
| Bolsa de Trabajo | Ofertas, postulaciones, Gestor de Ofertas y Postulaciones y alertas | Implementado; SMTP público y regresión visual B2B pendientes |
| Onboarding empresarial | Solicitud pública, revisión Admin, aprovisionamiento `Empleador`, Outbox y bienvenida | Implementado localmente con anti-enumeración y correo `.eml` |
| Operación | Docker, SQL, Redis/Mailpit locales, storage configurable, scripts de gates y seed demo | Base local aceptada; proveedores públicos no aceptados |

### 2.2 Entornos contemplados

- **Development local**: SQL Server Docker, almacenamiento local, Redis/Mailpit de
  aceptación cuando corresponda y secretos mediante `dotnet user-secrets`/`.env`.
- **Defensa académica**: entorno local preconfigurado, base demo canónica y contingencia
  offline; no depende de proveedores externos para los flujos principales.
- **Producción objetivo**: topología preparada, pero su aceptación requiere completar
  los gates `PR-01` a `PR-07` del roadmap.

### 2.3 Supuestos

1. Las personas operan bajo una identidad individual; no se comparten cuentas.
2. Las carreras y materias son administradas institucionalmente.
3. La pertenencia a una carrera determina visibilidad social y académica.
4. El correo y el tenant Microsoft institucional son fuentes externas que requieren
   configuración y consentimiento fuera del repositorio.
5. El adaptador SIU vigente es un mock de integración, no una conexión al SIU real.
6. La moderación preserva evidencia mediante ocultamiento/soft delete, no borrado físico.

---

## 3. Actores y matriz de permisos

### 3.1 Actores

| Actor | Objetivo principal |
|---|---|
| Visitante | Conocer la plataforma, iniciar sesión, registrarse como rol público permitido o solicitar alta empresarial |
| Estudiante | Participar por carrera/materia, acceder a recursos/progreso, comunicarse y postularse |
| Profesor | Acompañar la actividad académica, publicar recursos y gestionar progreso autorizado |
| Egresado | Mantener un CV, aportar a la comunidad y acceder a oportunidades laborales |
| Empleador | Publicar ofertas y gestionar postulaciones de ofertas propias |
| Moderador | Revisar reportes, aplicar silenciamientos y ocultar/restaurar contenido con auditoría |
| Administrador | Gobernar identidades, estructura académica, solicitudes empresariales, moderación, auditoría y operaciones restringidas |
| Sistema | Ejecutar seeds, cleanup, Outbox, notificaciones, auditoría y adaptadores externos |

### 3.2 Matriz resumida

| Acción | Visitante | Estudiante | Profesor | Egresado | Empleador | Moderador | Administrador |
|---|---:|---:|---:|---:|---:|---:|---:|
| Registro local público | Sí | N/A | N/A | N/A | No | No | No |
| Solicitud empresarial | Sí | Sí | Sí | Sí | N/A | Sí | Sí |
| Editar perfil propio | No | Sí | Sí | Sí | Sí | Sí | Sí |
| Ver perfil privado sensible | No | Solo propio | Solo propio | Solo propio | Solo propio | Sí | Sí |
| Publicar/comentar en muro | No | Sí | Sí | Sí | Según carrera | Sí | Sí |
| Ver recursos de una materia | No | Por carrera | Por carrera/Admin académico | Por carrera | No por defecto | Según carrera | Sí |
| Crear recursos académicos | No | No | Sí | No | No | No | Sí |
| Cargar progreso/notas | No | No | Sí | No | No | No | Sí |
| Consultar progreso propio | No | Sí | Si corresponde | Si corresponde | No | No por defecto | Sí |
| Publicar ofertas | No | No | No | No | Sí | No | Sí |
| Postularse | No | Sí | No | Sí | No | No | No |
| Gestionar postulaciones | No | No | No | No | Solo propias | No | Sí |
| Ocultar/restaurar contenido ajeno | No | No | No | No | No | Sí | Sí |
| Aprobar solicitudes empresariales | No | No | No | No | No | No | Sí |

La tabla expresa el contrato vigente tras la Spec 201. El alta pública asigna únicamente
`Estudiante`; Profesor y los demás roles se aprovisionan mediante flujos confiables. Las
operaciones académicas del Profesor quedan acotadas a materias de carreras vinculadas
mediante `UserCareer`, como política equivalente de mínimo privilegio durante Code Freeze.

---

## 4. Requerimientos funcionales

### 4.1 Identidad, cuentas y seguridad

| ID | Requerimiento verificable | Criterio de aceptación |
|---|---|---|
| `RF-001` | Permitir registro local estudiantil con nombre, apellido, correo institucional, contraseña y al menos una carrera activa. | Backend y frontend exigen `@itbeltran.com.ar`; email normalizado; nombres en Title Case; contraseña de 8-64 caracteres; carrera existente/activa; respuesta de duplicado no enumerable; limitador por origen/identidad; el flujo asigna exclusivamente `Estudiante`. |
| `RF-002` | Autenticar cuentas locales y emitir JWT OneITB. | Password BCrypt válido, cuenta/usuario activos, issuer/audience/lifetime correctos y claims canónicos `sub`, `name`, `role`, `email`. |
| `RF-003` | Rechazar cuentas inactivas sin revelar información sensible. | Login y operaciones protegidas fallan con error controlado; no se emite token. |
| `RF-004` | Proteger cuentas Administrador contra degradación, desactivación o silenciamiento desde la aplicación. | UI deshabilitada y backend fail-closed; promoción a Administrador exige contraseña del operador Admin. |
| `RF-004B` | Bloquear fuerza bruta por cuenta. | Cinco fallos generan lockout de 15 minutos; éxito reinicia el contador; respuesta no facilita enumeración. |
| `RF-004C` | Permitir acceso Microsoft 365 mediante Authorization Code + PKCE. | API valida RS256, issuer, audience, vigencia, tenant concreto, object ID, scope y dominio antes de vincular identidad y emitir JWT local. |
| `RF-004D` | Exigir configuración académica al Estudiante sin carreras. | Layout privado permanece bloqueado; debe seleccionar al menos una carrera activa y un refetch de `me` de la misma identidad confirma persistencia. |
| `RF-004E` | Ejecutar Microsoft 365 mediante redirect idempotente. | Callback no interactivo, sin popup, destino interno sanitizado, adquisición silenciosa del access token y un solo canje GraphQL frente a rerenders/Strict Mode. |
| `RF-004F` | Cerrar completamente la sesión. | Elimina storage local, limpia Apollo, termina WebSocket, incrementa epoch y evita que respuestas de A hidraten la sesión B. |

### 4.2 Perfil, CV y estructura académica

| ID | Requerimiento verificable | Criterio de aceptación |
|---|---|---|
| `RF-005` | Consultar y editar el perfil propio/CV; Administrador puede editar perfiles según el contrato protegido. | Persistencia única para bio, contacto, avatar, redes, experiencia, educación, proyectos, aptitudes, idiomas y carreras; un usuario común no modifica otro perfil. |
| `RF-006` | Asociar un usuario a una o más carreras activas. | FKs explícitas, sin duplicados; las selecciones se reflejan en `me`, feed, materias, recursos y perfil. |
| `RF-006B` | Permitir perfil público o privado con masking server-side. | En privado solo propietario, Administrador, Moderador o seguidor persistido acceden a bio, contacto, CV, carreras y métricas; terceros reciben identidad básica y colecciones vacías. |
| `RF-007` | Administrar carreras y materias con código, año, estado y correlatividades. | Solo Administrador; carrera obligatoria; correlatividades autorreferenciales sin ciclos de cascade delete; selector y listados reflejan estado activo. |
| `RF-007B` | Imprimir/exportar una representación formal del CV. | La plantilla de impresión es reutilizable, consistente entre perfil/edición y fuerza paleta clara independientemente del tema. |

### 4.3 Muro social, medios e interacciones

| ID | Requerimiento verificable | Criterio de aceptación |
|---|---|---|
| `RF-008` | Crear, buscar, filtrar, editar y desactivar publicaciones. | Autor autenticado; materia dentro de una carrera habilitada salvo rol global; contenido máximo 10.000 caracteres; soft delete; feed paginado máximo 25. |
| `RF-009` | Comentar y responder con máximo dos niveles persistidos. | Comentario máximo 1.000 caracteres; una respuesta a nivel 2 se guarda como hermana bajo la raíz con destinatario/mención, nunca como nivel 3. |
| `RF-010` | Reaccionar, reportar, seguir, dejar de seguir, silenciar y bloquear. | Relaciones explícitas e idempotentes; un usuario sancionado no reacciona; autor puede consultar reacciones paginadas; no se generan auto-notificaciones. |
| `RF-011` | Adjuntar archivos a publicaciones, comentarios y respuestas mediante carga REST desacoplada. | Máximo 10 adjuntos y 15 MB agregados por contenido; JWT, nombre original, tipo, tamaño, orden, magic bytes/estructura y reemplazo al editar. |
| `RF-012` | Renderizar YouTube, imágenes y documentos en un mosaico acotado. | Hasta dos enlaces YouTube; portada elegida; cuatro tiles por publicación/tres por comentario; PDF muestra primera página con worker local y abre Blob URL revocable. |
| `RF-013` | Aplicar relevancia y alcance académico al feed. | Prioriza seguidos, conserva orden cronológico secundario, excluye mute/block y limita contenido a la intersección de carreras salvo Admin/Moderador. |
| `RF-013B` | Agrupar notificaciones sociales y navegar al contenido exacto. | Agrupación por destinatario/publicación/tipo, contador no leído idempotente, deep-link a `inquiryId`/`commentId`, scroll y resaltado temporal. |
| `RF-013C` | Moderar sin alterar la autoría. | Solo autor edita/desactiva; Moderador/Admin oculta/restaura con motivo y auditoría; no edita texto ajeno ni borra físicamente contenido social. |

### 4.4 Mensajería y notificaciones

| ID | Requerimiento verificable | Criterio de aceptación |
|---|---|---|
| `RF-014` | Mantener conversaciones privadas uno a uno. | Solo emisor/receptor acceden; historial persistente, ordenado y paginado; FKs restrictivas. |
| `RF-015` | Entregar mensajes/notificaciones por WebSocket. | Topic derivado de identidad autenticada, JWT en conexión, aislamiento entre usuarios y fallback local/distribuido configurado. |
| `RF-016` | Buscar contactos/mensajes y marcar conversaciones leídas. | Consultas paginadas, badges calculados por registros no leídos y avatar del emisor disponible. |
| `RF-016B` | Recordar mensajes antiguos sin saturar. | Máximo un recordatorio persistente por usuario para mensajes con al menos una hora, respetando preferencias y evitando duplicados concurrentes. |
| `RF-016C` | Configurar preferencias por tipo/materia. | Toggles persistentes; afectan creación/entrega futura sin borrar el historial existente. |

### 4.5 Administración y moderación

| ID | Requerimiento verificable | Criterio de aceptación |
|---|---|---|
| `RF-017` | Gestionar usuarios, roles, carreras y materias desde un panel protegido. | Solo roles autorizados; operaciones sensibles auditadas; Administradores protegidos; tablas con carga/error/vacío. |
| `RF-018` | Gestionar reportes, publicaciones y comentarios. | Moderador/Admin consulta reportes y aplica acciones permitidas; estado y motivo quedan persistidos. |
| `RF-019` | Silenciar usuarios temporalmente y moderar de forma reversible. | Duración 1-168 horas, acumulable desde el vencimiento vigente; Administrador inmune; guards sociales previos a toda escritura. |
| `RF-019B` | Registrar auditoría transversal. | Actor, acción, entidad, timestamp, correlation ID y cambios sanitizados; no duplicar contraseñas, tokens, CUIT ni motivos sensibles innecesarios. |

### 4.6 Recursos, progreso e integración académica

| ID | Requerimiento verificable | Criterio de aceptación |
|---|---|---|
| `RF-020` | Mantener un repositorio académico independiente del feed. | Recursos activos por materia/categoría/búsqueda; archivo o enlace obligatorio; versión y uploader persistidos. |
| `RF-021` | Consultar progreso/notas por materia. | Estudiante ve su progreso; Administrador puede consultar terceros; datos ordenados y acceso protegido. |
| `RF-022` | Sincronizar calificaciones mediante `ISiuIntegrationService`. | Solo Administrador; adaptador mock desacoplado; upsert por estudiante/materia; nota 0-10; ítems inválidos se registran sin abortar el lote. |
| `RF-023` | Notificar nuevos recursos y cambios de progreso. | Audiencia calculada por carrera, exclusión del actor cuando corresponde y deep-link académico. |
| `RF-024` | Registrar Audit Trail mediante interceptor EF Core. | Entidades críticas, valores sanitizados, actor/correlación y persistencia separada de logs de aplicación. |
| `RF-025` | Exportar progreso como CSV e imprimir constancias. | Datos del usuario autenticado, formato descargable/print y ausencia de HTML no confiable. |
| `RF-026` | Publicar credenciales digitales limitadas. | Ruta pública por identificador no adivinable/validado, datos mínimos y opción de compartir; no expone expediente completo. |
| `RF-027` | Mostrar toasts globales desde subscriptions. | Provider único, limpieza de suscripción y visualización accesible sin bloquear navegación. |

### 4.7 Bolsa de Trabajo y onboarding empresarial

| ID | Requerimiento verificable | Criterio de aceptación |
|---|---|---|
| `RF-028` | Publicar/listar ofertas laborales. | Solo Empleador/Admin crea; ofertas activas paginadas; evento `jobOfferCreated`; datos de empresa, ubicación y fecha. |
| `RF-029` | Permitir postulación única de Estudiante/Egresado. | Índice oferta/postulante, oferta activa, estado inicial Pendiente y operación idempotente/controlada. |
| `RF-030` | Gestionar postulaciones desde el Gestor de Ofertas y Postulaciones. | Empleador solo modifica postulaciones de ofertas propias; Admin posee alcance global; estados Pendiente/Revisado/Rechazado. |
| `RF-031` | Comunicar cambios de estado por correo. | `IEmailSender` configurable; SMTP obligatorio en Production; pickup `.eml` ignorado solo en Development; error sanitizado. |
| `RF-031B` | Probar SMTP desde una operación exclusiva de Administrador. | Destino validado, autorización declarativa, resultado controlado y sin exponer configuración. |
| `RF-032` | Entregar Magic Link fuera de GraphQL. | Respuesta genérica, token aleatorio, digest persistido, expiración/consumo único, rate limit y fragmento retirado antes del canje. |
| `RF-033` | Recibir solicitudes públicas de empresas sin aprovisionamiento automático. | Consentimiento, CUIT normalizado/válido, honeypot anterior a validación, rate limit HMAC y respuesta uniforme ante duplicados/conflictos. |
| `RF-034` | Procesar solicitudes exclusivamente por Administrador. | Listado paginado/filtrado; aprobación serializable e idempotente crea una cuenta `Empleador`, auditoría y Outbox; rechazo exige motivo sin copiarlo al audit transversal. |
| `RF-034B` | Reintentar entrega de bienvenida sin duplicar cuentas. | Solo Admin, solicitud aprobada, Outbox con lease/reintentos acotados y estado observable. |

---

## 5. Reglas de negocio transversales

| ID | Regla |
|---|---|
| `BR-001` | Los roles canónicos son `Estudiante`, `Profesor`, `Egresado`, `Empleador`, `Moderador` y `Administrador`; `User` es legacy y no debe asignarse públicamente. |
| `BR-002` | Ningún flujo público puede crear Administrador, Moderador o Empleador. Empleador nace únicamente de aprobación Admin o seed controlado. |
| `BR-003` | El correo local se normaliza a minúsculas y nombres/apellidos a Title Case en backend. |
| `BR-004` | La visibilidad social/académica se determina por intersección de carreras; Admin/Moderador poseen alcance global donde el contrato lo permite. |
| `BR-005` | El perfil privado conserva identidad básica visible y enmascara datos sensibles server-side. Follow no concede acceso: solo propietario, Administrador o Moderador pueden consultar el detalle privado. |
| `BR-006` | Publicaciones/comentarios no se borran físicamente. Autor desactiva; Moderador/Admin oculta/restaura con trazabilidad. |
| `BR-007` | `SocialAttachment` pertenece a una Inquiry XOR a un Comment, jamás a ambos ni a ninguno. |
| `BR-008` | Las relaciones EF Core usan FK explícita y `DeleteBehavior.Restrict`, salvo una excepción documentada y probada. |
| `BR-009` | Notificaciones propias se omiten; agrupaciones y contadores consideran estrictamente registros no leídos. |
| `BR-010` | Toda operación protegida obtiene actor/rol desde claims; IDs enviados por cliente no sustituyen la identidad autenticada. |
| `BR-011` | Secretos, tokens externos, passwords y credenciales de un uso no se registran ni se versionan. |
| `BR-012` | Las fechas operativas se almacenan en UTC y se presentan localizadas en UI cuando corresponde. |

---

## 6. Requerimientos no funcionales

| ID | Atributo | Requisito y criterio medible |
|---|---|---|
| `RNF-001` | Seguridad | JWT con secreto externalizado >=32 bytes; BCrypt configurable 10-14 (12 por defecto); lockout 5/15; autorización declarativa; CORS explícito; uploads autenticados; rate limits HTTP/Magic Link/Entra/B2B. |
| `RNF-002` | Integridad | FKs explícitas, `Restrict`, índices únicos, constraints de completitud/XOR, transacciones para aprovisionamiento y soft delete social. |
| `RNF-003` | Rendimiento | Sin I/O síncrono en rutas async; `AsNoTracking`, proyecciones/DataLoaders, `AsSplitQuery`, paginación y límites. GraphQL: profundidad 15, page default 20/máxima 50 y límites de costo/parser configurables. |
| `RNF-004` | Escalabilidad | API stateless respecto de sesión JWT; Pub/Sub Redis condicional; storage local/Cloudinary; SQL, API y frontend separables por contenedor. |
| `RNF-005` | Usabilidad | UI responsive Clean Tech/Tech Noir, estados loading/error/empty, skeletons, feedback inmediato, click-outside, foco y navegación por teclado en controles críticos. |
| `RNF-006` | Accesibilidad | Contraste legible, labels, foco visible, reduced-motion, alternativas textuales y plantillas de impresión independientes del tema. Auditoría WCAG formal queda pendiente. |
| `RNF-007` | Trazabilidad | Correlation ID, logs estructurados, Audit Trail, ModerationAudit, specs/evidence y documentos sincronizados sin PII innecesaria. |
| `RNF-008` | Operabilidad | Healthcheck, rate limiting, security headers, Docker, configuración por ambiente, scripts finitos, fallos Production fail-closed y procedimiento backup/restore. |
| `RNF-009` | Reproducibilidad | Base demo identificada, backup `COPY_ONLY` verificado, migraciones como fuente, doble seed idempotente, seis roles e integridad relacional. |
| `RNF-010` | Resiliencia frontend | Error boundary sobre providers, fallback pre-mount, terminación idempotente de sesión y descarte por epoch. |
| `RNF-011` | Calidad | Builds sin errores, tests automatizados proporcionales al riesgo, drift EF controlado, schema ejecutado y regresión manual para flujos visuales/realtime. |
| `RNF-012` | Privacidad | Minimización, masking server-side, anti-enumeración, auditoría sanitizada y secretos fuera de repositorio. No se declara cumplimiento legal integral sin revisión institucional. |

No existe todavía una prueba formal de carga, SLA productivo, pentest externo ni
certificación WCAG. Por ello estos RNF están implementados como baseline técnico, no como
certificaciones independientes.

---

## 7. Integraciones y dependencias externas

| Integración | Contrato vigente | Estado |
|---|---|---|
| SQL Server | EF Core 8, migraciones, SQL Auth, Docker local | Verificado localmente |
| Redis | Pub/Sub HotChocolate y limiters distribuidos cuando se configura | Verificado con Redis local; proveedor administrado pendiente |
| SMTP | `IEmailSender`, SMTP Production y pickup Development | Mailpit/pickup verificados; SMTP público pendiente |
| Cloudinary | `IFileStorageService` condicional con fallback local | Implementado; proveedor real pendiente |
| Microsoft Entra | Dos App Registrations, scope API y Authorization Code + PKCE | Implementado; consentimiento/cuenta real pendientes |
| SIU Guaraní | `ISiuIntegrationService` con implementación mock | Mock verificado; contrato/productivo fuera de alcance |
| YouTube/PDF.js | Embeds controlados y worker PDF local | Implementado en frontend; sujeto a políticas del navegador/tercero |

---

## 8. Fuera de alcance actual

1. Pagos, suscripciones o comercio electrónico.
2. Videollamadas o streaming nativo.
3. Integración SIU productiva sin contrato/API institucional disponible.
4. Cuentas Microsoft personales y mapeo automático de grupos Entra a roles OneITB.
5. Provisionamiento Azure/App Service/SQL realmente desplegado y aceptado.
6. Aplicación móvil nativa; el frontend responsive no equivale a una app móvil.
7. SLA, soporte 24x7, alta disponibilidad multi-región y disaster recovery productivo.
8. Antivirus/CDR externo para uploads; se recomienda antes de exposición pública amplia.
9. SSR para Open Graph dinámico perfecto ante crawlers.
10. Certificación formal de accesibilidad, pentest externo o prueba de carga corporativa.
11. Aprobación automática de Profesor/Egresado desde directorios o padrones externos.

El acceso Microsoft organizacional multi-tenant mediante `common` sí pertenece al alcance
implementado; lo que permanece fuera del cierre local es su aceptación con credenciales y
consentimiento reales.

---

## 9. Cierre de brechas de conformidad

### 9.1 `GAP-AUTH-01` - Autoasignación pública del rol Profesor: resuelta

**Estado al 2026-08-03: resuelta por Spec 201.**

`UsersService.RegisterAsync` valida el dominio institucional configurado, asigna solo
`Estudiante`, normaliza la identidad y devuelve un contrato genérico ante duplicados. La
mutación aplica un limitador específico por IP e identidad con fallback acotado en memoria
y soporte Redis. Las pruebas negativas cubren rol Profesor/Admin, dominio externo,
duplicado no enumerable y cancelación. No fue necesaria una migración.

### 9.2 `GAP-AUTH-02` - Alcance académico de Profesor: resuelta con política equivalente

**Estado al 2026-08-03: resuelta por Spec 201 para el alcance actual.**

Durante Code Freeze se adoptó `UserCareer` como política equivalente verificable: un
Profesor solo administra recursos, listados de estudiantes y progreso de materias cuya
carrera está vinculada a su usuario. El Administrador conserva alcance global; Estudiante
y Egresado permanecen en solo lectura dentro de sus carreras. Las pruebas cubren Profesor
vinculado, Profesor fuera de carrera, rol incorrecto y ausencia de escritura.

Una futura asignación Profesor-Materia/Cursada permitiría mayor granularidad, pero es
evolución posterior y no una brecha de privilegios cross-career del corte presentado.

### 9.3 Gates conocidos que no son defectos de código local

- `GAP-EXT-01`: Microsoft Entra real requiere App Registrations y consentimiento.
- `GAP-EXT-02`: SMTP, Redis administrado y Cloudinary requieren secretos/ambiente.
- `GAP-QA-01`: seis roles, realtime y B2B necesitan regresión manual sobre el SHA final.
- `GAP-EXT-03`: BCrypt debe medirse en hardware productivo.
- `GAP-SEC-01`: antivirus/CDR permanece fuera del MVP.

Los hallazgos `GAP-AUTH-01` y `GAP-AUTH-02` están cerrados con pruebas automatizadas. Los
gates externos no invalidan una defensa local controlada, pero impiden afirmar aceptación
productiva sin la infraestructura y la evidencia de destino correspondientes.

---

## 10. Trazabilidad y Definition of Done del alcance

### 10.1 Trazabilidad

- El roadmap contiene el inventario y estado de 117 ítems.
- El informe final conserva remediaciones, evidencia y riesgos residuales.
- La arquitectura debe mapear estos RF/BR/RNF a componentes, entidades y flujos.
- El runbook debe permitir reproducir los criterios locales sin secretos versionados.
- La memoria académica es derivada y no puede ampliar el alcance sin actualizar primero
  este contrato.

### 10.2 Definition of Done de un requerimiento

Un RF/RNF solo puede declararse verificado cuando:

1. El contrato y sus actores están definidos sin ambigüedad.
2. Backend aplica autenticación, autorización y reglas de negocio; el cliente no es la
   única barrera de seguridad.
3. Persistencia/migración e integridad fueron revisadas cuando corresponda.
4. Schema GraphQL o endpoint REST real fue ejecutado.
5. Tests cubren éxito, error, rol incorrecto, ownership, cancelación y no-escritura según
   el riesgo.
6. El flujo visual fue recorrido cuando la UX forma parte del criterio.
7. Evidencia registra comando, entorno, fecha y resultado real.
8. Roadmap, auditoría, estado documental y memoria quedan sincronizados.

### 10.3 Regla de control de cambios

Durante Code Freeze no se incorporan nuevas features. Solo pueden modificarse requisitos
para corregir una contradicción con el código, cerrar una brecha de seguridad/aceptación
o documentar una decisión institucional. Toda ampliación funcional posterior a la defensa
debe crear una spec, evaluar migraciones/seguridad y recalcular alcance de forma explícita.
