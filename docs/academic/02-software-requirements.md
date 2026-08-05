# 2. Especificación de requerimientos de software

| Dato de control | Valor |
|---|---|
| **Sistema** | OneITB23 |
| **Versión documental** | 2.0 |
| **Fecha de revisión** | 3 de agosto de 2026 |
| **Clasificación** | Especificación académica derivada |
| **Fuente normativa** | [`scope-and-requirements.md`](../project_docs/scope-and-requirements.md) |
| **Cobertura** | 48 RF, 12 BR y 12 RNF |

Este documento presenta los requerimientos en un formato apropiado para consulta académica
y defensa. Resume el contrato canónico sin reemplazarlo. Los estados de implementación y
verificación se administran exclusivamente en el
[`ROADMAP.md`](../project_docs/ROADMAP.md); una descripción en este archivo no constituye
por sí misma evidencia de funcionamiento.

---

## 2.1 Propósito, alcance y convenciones

OneITB23 debe proporcionar una red social académica y Bolsa de Trabajo institucional para
estudiantes, profesores, egresados, empleadores, moderadores y administradores. La
plataforma integra identidad, carreras, materias, comunidad social, archivos, mensajería,
recursos académicos, progreso, moderación, empleabilidad y auditoría.

### Convenciones

| Prefijo | Significado |
|---|---|
| `RF` | Requerimiento funcional: comportamiento observable del sistema |
| `BR` | Regla de negocio transversal: restricción que debe respetarse en diferentes módulos |
| `RNF` | Requerimiento no funcional: atributo de calidad o restricción técnica |
| `[V]` | Verificado mediante evidencia runtime, de datos o infraestructura |
| `[I]` | Implementado con código, pruebas, build, migración o validación aislada; puede requerir aceptación adicional |
| `[B]` | Bloqueado por una dependencia o ambiente externo identificado |

Los sufijos `B`, `C`, etc. conservan la numeración histórica del requerimiento al que
amplían. No representan subcriterios opcionales.

## 2.2 Actores y responsabilidades

| Actor | Responsabilidades y alcance principal |
|---|---|
| **Visitante** | Consultar la landing, registrarse con un rol público permitido, autenticarse o presentar una solicitud empresarial |
| **Estudiante** | Configurar carreras, participar en el feed, usar chat, consultar recursos/progreso propio y postularse |
| **Profesor** | Participar en la comunidad, publicar recursos y gestionar progreso dentro del alcance autorizado |
| **Egresado** | Mantener perfil/CV, participar de la comunidad y postularse a ofertas |
| **Empleador** | Crear ofertas propias y administrar sus postulaciones, sin permisos académicos elevados |
| **Moderador** | Consultar reportes, ocultar/restaurar contenido y silenciar temporalmente con auditoría |
| **Administrador** | Gestionar catálogo, usuarios, solicitudes empresariales, moderación, auditoría e integraciones controladas |

### Matriz resumida de permisos

| Capacidad | Visitante | Estudiante | Profesor | Egresado | Empleador | Moderador | Administrador |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Registro/login público | Sí | Sí | Sí | Sí | Solicitud | Sí | Sí |
| Feed social | Lectura pública limitada | Sí | Sí | Sí | Limitado | Global | Global |
| Recursos académicos | No | Lectura autorizada | Crear/leer | Lectura autorizada | No | Según carrera | Global |
| Progreso académico | No | Propio | Gestionar autorizado | Propio si aplica | No | No | Global |
| Chat privado | No | Sí | Sí | Sí | Sí | Sí | Sí |
| Postularse | No | Sí | No | Sí | No | No | No |
| Crear ofertas | No | No | No | No | Propias | No | Sí |
| Moderar contenido | No | No | No | No | No | Sí | Sí |
| Administrar sistema | No | No | No | No | No | No | Sí |

La matriz expresa el contrato esperado. Las brechas de alcance docente y alta pública se
detallan en la [sección 2.9](#29-brechas-y-gates-de-conformidad).

## 2.3 Requerimientos funcionales

### 2.3.1 Identidad, cuentas y seguridad

| ID | Requerimiento | Criterio de aceptación resumido |
|---|---|---|
| `RF-001` | Registrar una identidad local con datos personales, credencial, rol público permitido y carrera. | Email normalizado, nombre en Title Case, contraseña de 8-64 caracteres, carrera activa y duplicados rechazados; nunca asigna Admin, Moderador o Empleador. |
| `RF-002` | Autenticar cuentas locales y emitir un JWT OneITB. | BCrypt válido, cuenta/usuario activos y claims canónicos `sub`, `name`, `role`, `email` con issuer, audience y expiración. |
| `RF-003` | Rechazar cuentas inactivas sin filtrar información sensible. | No se emite JWT y se devuelve un error controlado no enumerable. |
| `RF-004` | Proteger cuentas Administrador. | No pueden degradarse, desactivarse o silenciarse; la promoción exige contraseña del Admin operador. |
| `RF-004B` | Bloquear fuerza bruta por cuenta. | Cinco fallos consecutivos generan un lockout de 15 minutos; un acceso exitoso reinicia el contador. |
| `RF-004C` | Autenticar mediante Microsoft 365. | Authorization Code + PKCE; backend valida firma RS256, issuer, audience, vigencia, tenant, object ID, scope y dominio antes de emitir JWT local. |
| `RF-004D` | Exigir configuración o reconciliación académica al Estudiante que no tenga exactamente una carrera. | El layout permanece bloqueado con cero o varios vínculos hasta seleccionar y confirmar una carrera activa; `me` debe devolver esa única asociación antes de continuar. |
| `RF-004E` | Procesar Microsoft 365 mediante redirect idempotente. | Callback aislado, destino interno sanitizado, adquisición silenciosa y un solo canje GraphQL frente a rerenders. |
| `RF-004F` | Finalizar completamente una sesión. | Limpia storage, Apollo y WebSocket; incrementa la época de sesión e impide que respuestas anteriores hidraten una identidad nueva. |

### 2.3.2 Perfil, CV, carreras y materias

| ID | Requerimiento | Criterio de aceptación resumido |
|---|---|---|
| `RF-005` | Consultar y editar el perfil/CV propio. | Bio, contacto, avatar, redes, experiencia, educación, proyectos, aptitudes, idiomas y carreras se persisten en un único contrato; un usuario común no modifica otro perfil. |
| `RF-006` | Asociar usuarios con carreras activas según su rol. | Estudiante autogestiona exactamente una carrera actual; roles institucionales compatibles conservan N:M; FKs explícitas, sin duplicados y reflejo consistente en identidad, feed, materias, recursos y perfil. |
| `RF-006B` | Alternar privacidad del perfil con masking server-side. | Terceros no autorizados reciben identidad básica y colecciones sensibles vacías; propietario y roles permitidos conservan acceso. |
| `RF-007` | Administrar carreras, materias, año y correlatividades. | Solo Admin; carrera obligatoria, estado activo y relación autorreferencial sin cascadas cíclicas. |
| `RF-007B` | Imprimir una representación formal del CV. | Vista y edición comparten un documento semántico de una columna, con texto seleccionable, enlaces visibles, paginación A4 por contenido y paleta clara. Se comunica como **PDF optimizado para ATS**, sin garantía universal de proveedor. |

### 2.3.3 Muro, archivos e interacciones sociales

| ID | Requerimiento | Criterio de aceptación resumido |
|---|---|---|
| `RF-008` | Crear, buscar, filtrar, editar y desactivar publicaciones. | Autor autenticado, materia autorizada, hasta 10.000 caracteres, soft delete y feed paginado máximo 25. |
| `RF-009` | Comentar y responder con un máximo de dos niveles. | Hasta 1.000 caracteres; una respuesta al nivel 2 se persiste bajo la raíz con destinatario/mención, nunca como tercer nivel. |
| `RF-010` | Reaccionar, reportar, seguir, dejar de seguir, silenciar y bloquear. | Operaciones idempotentes, relaciones explícitas, sanciones respetadas y ausencia de auto-notificaciones. |
| `RF-011` | Adjuntar archivos mediante carga REST desacoplada. | JWT, máximo 10 adjuntos y 15 MB agregados por contenido; conserva nombre, tipo, tamaño, orden y permite reemplazo al editar. |
| `RF-012` | Renderizar YouTube, imágenes y documentos en un mosaico acotado. | Hasta dos videos YouTube, portada elegida, tiles limitados y PDF con primera página/Blob URL revocable. |
| `RF-013` | Aplicar relevancia y alcance académico al feed. | Prioriza seguidos, mantiene orden cronológico, excluye mute/block y limita por intersección de carreras salvo roles globales. |
| `RF-013B` | Agrupar notificaciones sociales y navegar al contenido exacto. | Agrupación por destinatario/contenido/tipo, contador estrictamente no leído y deep-link con scroll/resaltado. |
| `RF-013C` | Moderar contenido sin alterar su autoría. | Solo el autor edita/desactiva; Moderador/Admin oculta o restaura con motivo y auditoría, sin editar texto ajeno. |

### 2.3.4 Mensajería y notificaciones

| ID | Requerimiento | Criterio de aceptación resumido |
|---|---|---|
| `RF-014` | Mantener conversaciones privadas uno a uno. | Solo emisor/receptor acceden; historial persistente, paginado, ordenado y con FKs restrictivas. |
| `RF-015` | Entregar mensajes y notificaciones por WebSocket. | Topic derivado de identidad, JWT en conexión, aislamiento entre usuarios y transporte local/distribuido configurable. |
| `RF-016` | Buscar contactos/mensajes y marcar conversaciones leídas. | Consultas paginadas, avatar disponible y badges derivados únicamente de registros no leídos. |
| `RF-016B` | Recordar mensajes antiguos sin saturar al destinatario. | Como máximo un recordatorio persistente por usuario para mensajes con una hora, respetando preferencias y concurrencia. |
| `RF-016C` | Configurar preferencias de notificación. | Toggles persistentes afectan eventos futuros sin borrar el historial existente. |

### 2.3.5 Administración y moderación

| ID | Requerimiento | Criterio de aceptación resumido |
|---|---|---|
| `RF-017` | Gestionar usuarios, roles, carreras y materias. | Solo roles autorizados, cuentas Admin protegidas, operaciones auditadas y estados loading/error/empty en UI. |
| `RF-018` | Gestionar reportes y contenido social. | Moderador/Admin consulta reportes y aplica únicamente acciones autorizadas con estado y motivo persistidos. |
| `RF-019` | Silenciar usuarios temporalmente. | Duración de 1 a 168 horas, acumulable desde vencimiento vigente; Admin inmune y guard anterior a escrituras sociales. |
| `RF-019B` | Registrar auditoría transversal. | Actor, acción, entidad, timestamp, correlation ID y cambios sanitizados; sin contraseñas, tokens, CUIT o motivos sensibles innecesarios. |

### 2.3.6 Recursos, progreso e integración académica

| ID | Requerimiento | Criterio de aceptación resumido |
|---|---|---|
| `RF-020` | Mantener un repositorio académico independiente del feed. | Recursos activos por materia/categoría/búsqueda; archivo o enlace obligatorio, versión y uploader persistidos. |
| `RF-021` | Consultar progreso y notas por materia. | Estudiante consulta datos propios; Admin consulta terceros; datos ordenados y acceso protegido. |
| `RF-022` | Sincronizar calificaciones mediante un adaptador SIU. | Solo Admin; implementación mock desacoplada, upsert estudiante/materia, nota 0-10 y tolerancia de ítems inválidos. |
| `RF-023` | Notificar recursos y cambios de progreso. | Audiencia calculada por carrera, actor excluido cuando corresponde y deep-link académico. |
| `RF-024` | Registrar Audit Trail mediante interceptor EF Core. | Entidades críticas, cambios sanitizados, actor/correlación y separación respecto de logs técnicos. |
| `RF-025` | Exportar progreso y constancias de apoyo. | Datos del usuario autenticado en CSV/impresión, sin HTML no confiable ni pretensión de certificación oficial. |
| `RF-026` | Publicar credenciales digitales limitadas. | Identificador no adivinable/validado, datos mínimos y opción de compartir sin exponer el expediente completo. |
| `RF-027` | Mostrar toasts globales desde subscriptions. | Provider único, cleanup correcto y notificaciones accesibles que no bloquean navegación. |

### 2.3.7 Bolsa de Trabajo y onboarding empresarial

| ID | Requerimiento | Criterio de aceptación resumido |
|---|---|---|
| `RF-028` | Publicar y listar ofertas laborales. | Solo Empleador/Admin crea; ofertas activas paginadas y evento realtime `jobOfferCreated`. |
| `RF-029` | Permitir una postulación por Estudiante/Egresado y oferta. | Oferta activa, índice único, estado inicial Pendiente y operación idempotente/controlada. |
| `RF-030` | Gestionar postulaciones. | Empleador modifica únicamente postulaciones de ofertas propias; Admin tiene alcance global; estados Pendiente/Revisado/Rechazado. |
| `RF-031` | Comunicar cambios de estado por correo. | `IEmailSender` configurable; SMTP obligatorio en Production, pickup ignorado en Development y errores sanitizados. |
| `RF-031B` | Probar SMTP desde una operación exclusiva de Admin. | Destino validado, autorización declarativa y respuesta controlada sin revelar configuración. |
| `RF-032` | Entregar Magic Link fuera de la respuesta GraphQL. | Respuesta uniforme, token aleatorio, digest persistido, expiración, consumo único y rate limit. |
| `RF-033` | Recibir solicitudes empresariales sin aprovisionamiento automático. | Consentimiento, CUIT válido, honeypot temprano, rate limit HMAC y respuesta uniforme ante duplicados. |
| `RF-034` | Aprobar o rechazar solicitudes exclusivamente por Admin. | Aprobación serializable/idempotente crea Empleador, auditoría y Outbox; rechazo exige motivo sin copiarlo al audit transversal. |
| `RF-034B` | Reintentar la bienvenida sin duplicar cuentas. | Solicitud aprobada, operación Admin-only y Outbox con lease, reintentos acotados y estado observable. |

## 2.4 Reglas de negocio transversales

| ID | Regla |
|---|---|
| `BR-001` | Los roles canónicos son Estudiante, Profesor, Egresado, Empleador, Moderador y Administrador; `User` es legacy. |
| `BR-002` | Ningún flujo público crea Administrador, Moderador o Empleador; Empleador requiere aprobación Admin o seed controlado. |
| `BR-003` | El backend normaliza email a minúsculas y nombres/apellidos a Title Case. |
| `BR-004` | La visibilidad social/académica se determina por intersección de carreras, salvo alcance global explícito. |
| `BR-005` | Un perfil privado conserva identidad básica visible y enmascara información sensible server-side; el Follow unilateral actual constituye una brecha pendiente. |
| `BR-006` | Publicaciones y comentarios no se borran físicamente; autor desactiva y Moderador/Admin oculta/restaura. |
| `BR-007` | Un `SocialAttachment` pertenece a una Inquiry XOR a un Comment, jamás a ambos ni a ninguno. |
| `BR-008` | Las relaciones EF Core usan FK explícita y `DeleteBehavior.Restrict`, salvo excepción documentada y probada. |
| `BR-009` | Se omiten auto-notificaciones; agrupaciones y badges cuentan estrictamente registros no leídos. |
| `BR-010` | Claims determinan actor y rol; un ID enviado por el cliente nunca sustituye la identidad autenticada. |
| `BR-011` | Secretos, tokens externos, contraseñas y credenciales de un uso no se registran ni versionan. |
| `BR-012` | Las fechas operativas se almacenan en UTC y se localizan únicamente al presentarlas. |

## 2.5 Requerimientos no funcionales

| ID | Atributo | Criterio verificable |
|---|---|---|
| `RNF-001` | Seguridad | JWT externalizado de al menos 32 bytes, BCrypt configurable 10-14, lockout 5/15, autorización declarativa, CORS explícito, uploads autenticados y rate limiting. |
| `RNF-002` | Integridad | FKs explícitas, `Restrict`, índices únicos, constraints XOR/completitud, transacciones y soft delete social. |
| `RNF-003` | Rendimiento | Sin I/O síncrono en rutas async; `AsNoTracking`, proyecciones/DataLoaders, `AsSplitQuery`, paginación y límites GraphQL. |
| `RNF-004` | Escalabilidad | API stateless respecto de JWT, Redis condicional, storage intercambiable y servicios separables por contenedor. |
| `RNF-005` | Usabilidad | UI responsive Clean Tech/Tech Noir con loading, error, empty, skeletons, feedback inmediato, foco y teclado. |
| `RNF-006` | Accesibilidad | Contraste, labels, foco visible, reduced-motion, alternativas textuales e impresión independiente del tema; auditoría WCAG formal pendiente. |
| `RNF-007` | Trazabilidad | Correlation ID, logs estructurados, Audit Trail, ModerationAudit, specs y evidencia sin PII innecesaria. |
| `RNF-008` | Operabilidad | Healthcheck, rate limiting, security headers, Docker, configuración por entorno, scripts finitos, fail-closed y backup/restore. |
| `RNF-009` | Reproducibilidad | Base demo identificada, backup verificado, migraciones canónicas, doble seed idempotente, seis roles e integridad relacional. |
| `RNF-010` | Resiliencia frontend | Error Boundary sobre providers, fallback pre-mount, logout idempotente y descarte de respuestas por época de sesión. |
| `RNF-011` | Calidad | Builds sin errores, tests según riesgo, control de drift EF, schema ejecutado y regresión manual para flujos visuales/realtime. |
| `RNF-012` | Privacidad | Minimización, masking server-side, anti-enumeración, auditoría sanitizada y secretos fuera de Git; cumplimiento legal integral no declarado. |

Estos RNF representan un baseline técnico. No equivalen a certificación WCAG, pentest
externo, SLA productivo ni prueba formal de carga.

## 2.6 Integraciones y dependencias

| Integración | Contrato | Situación actual |
|---|---|---|
| SQL Server | EF Core 8, migraciones, SQL Auth y Docker | Verificado localmente |
| Redis | Pub/Sub HotChocolate y limiters distribuidos | Verificado local; proveedor administrado pendiente |
| SMTP | `IEmailSender`, SMTP Production y pickup Development | Mailpit/pickup verificado; proveedor público pendiente |
| Cloudinary | `IFileStorageService` con fallback local | Adaptador implementado; cuenta real pendiente |
| Microsoft Entra | Dos App Registrations, scope API y PKCE | Código implementado; consentimiento/cuenta real pendientes |
| SIU Guaraní | `ISiuIntegrationService` | Solo implementación mock; integración real fuera de alcance |
| YouTube/PDF.js | Embeds acotados y worker PDF local | Implementado; condicionado por navegador y tercero |

## 2.7 Supuestos y restricciones

1. El usuario posee una identidad válida y, para funciones académicas, carreras activas.
2. Los identificadores de cliente no se consideran una fuente de autorización.
3. La demostración se ejecuta con base demo y cuentas controladas.
4. Las credenciales externas se suministran mediante secretos o variables de entorno.
5. El contenido cargado debe respetar políticas institucionales aún por formalizar.
6. La integración SIU mock demuestra arquitectura, no interoperabilidad productiva.
7. Las constancias y credenciales públicas no reemplazan documentación académica oficial.

## 2.8 Exclusiones del alcance

- Pagos, suscripciones o comercio electrónico.
- Videollamadas o streaming nativo.
- Integración SIU productiva sin contrato/API institucional.
- Cuentas Microsoft personales y asignación automática de roles desde grupos Entra.
- Despliegue Azure productivo ya aceptado.
- Aplicación móvil nativa React Native/Expo.
- SLA 24x7, alta disponibilidad multi-región y disaster recovery productivo.
- Antivirus/CDR externo para adjuntos.
- SSR completo para Open Graph ante todos los crawlers.
- Certificación WCAG, pentest externo y prueba de carga corporativa.
- Selección automática de candidatos o evaluación algorítmica de postulantes.

## 2.9 Brechas y gates de conformidad

| ID | Severidad | Brecha | Criterio de cierre |
|---|---|---|---|
| `GAP-AUTH-01` | Cerrada en Spec 201 | Registro público limitado a Estudiante institucional, con respuesta anti-enumeración y rate limiting específico. | Mantener pruebas negativas para roles elevados, dominio externo y duplicados. |
| `GAP-AUTH-02` | Cerrada en Spec 201 | La vinculación `UserCareer` funciona como política equivalente: Profesor solo gestiona materias de sus carreras; Admin conserva alcance global. | Mantener pruebas de Profesor vinculado/no vinculado y evaluar una relación Profesor-Materia solo si se requiere mayor granularidad. |
| `GAP-PRIV-01` | Cerrada en Spec 201 | Follow dejó de otorgar acceso a CV, contacto, carreras o métricas de un perfil privado. | Mantener pruebas de propietario, Admin/Moderador y seguidor no aprobado. |
| `GAP-FILE-01` | Alta | `/uploads` entrega archivos estáticos sin autorización por recurso. | Utilizar endpoint autorizado, storage privado o URL firmada según ownership/scoping. |
| `GAP-INFRA-01` | Aceptación externa | Compose exige una cadena externa segura; falta verificar certificado y `TrustServerCertificate=False` contra el destino productivo real. | Ejecutar smoke TLS con secretos del entorno y conservar evidencia sanitizada. |
| `GAP-OPS-01` | Media | No existe observabilidad central aceptada. | Definir logs, métricas, trazas, alertas, retención y respuesta a incidentes. |
| `GAP-EXT-01` | Externo | Microsoft Entra requiere registros, scope, consentimiento y cuenta organizacional. | Ejecutar aceptación real con configuración institucional. |
| `GAP-EXT-02` | Externo | SMTP, Redis administrado y Cloudinary requieren proveedor y secretos. | Configurar y ejecutar smoke en ambiente destino. |
| `GAP-QA-01` | Cierre | Falta regresión final de seis roles, realtime y B2B sobre un único SHA. | Ejecutar checklist, registrar evidencia y congelar el candidato. |

Las brechas residuales no impiden una defensa local controlada si se declaran con
transparencia. `GAP-FILE-01`, la aceptación externa de infraestructura y `GAP-OPS-01`
impiden afirmar aptitud productiva integral.

## 2.10 Trazabilidad y aceptación

| Artefacto | Responsabilidad |
|---|---|
| `scope-and-requirements.md` | Contrato canónico detallado |
| `architecture-and-design.md` | Diseño y decisiones que satisfacen el contrato |
| `ROADMAP.md` | Estado `[V]`, `[I]`, `[P]` o `[B]` y planificación |
| `specs/<id>/` | Especificación, plan, tareas, contratos y evidencia granular |
| Tests/build/schema/migraciones | Evidencia técnica reproducible |
| `FINAL_AUDIT_REPORT.md` | Riesgos, controles y recomendación de liberación |
| `DEVELOPMENT_LOG.md` | Historia del cambio; no prueba el estado vigente |

### Definition of Done de un requerimiento

Un requerimiento solo puede declararse cerrado cuando:

1. Su comportamiento y actores están definidos sin ambigüedad.
2. La autorización se valida en backend, no solo en React.
3. Los cambios de datos cuentan con modelo, migración y constraints coherentes.
4. GraphQL y Apollo utilizan el mismo contrato real.
5. Existen pruebas proporcionales al riesgo y builds limpios.
6. Los flujos GraphQL o visuales críticos poseen evidencia runtime/manual cuando aplica.
7. Los límites conocidos se documentan sin convertirlos en éxitos.
8. Roadmap, auditoría, log y entregables académicos permanecen sincronizados.

Esta especificación se actualiza después del contrato canónico, nunca antes. Cualquier
nuevo requisito debe ingresar mediante una Spec y control de alcance explícito.
