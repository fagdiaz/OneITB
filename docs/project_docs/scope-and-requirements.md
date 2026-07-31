# Alcance y requerimientos de OneITB23

**Ultima alineacion con codigo**: 2026-07-30

## 1. Objetivo

OneITB23 es una red social academica para estudiantes, profesores, egresados, empleadores y actores institucionales. Centraliza perfiles/CV, carreras, materias, publicaciones, archivos, interaccion social, mensajeria privada, recursos academicos, progreso por materia, moderacion y empleabilidad.

El objetivo institucional es ofrecer una plataforma demostrable y mantenible para la Practica Profesionalizante, con trazabilidad tecnica suficiente para defensa academica y una base razonable para evolucionar a produccion real.

## 2. Estado por modulo

| Modulo | Estado | Evidencia principal |
|---|---|---|
| Autenticacion y cuentas | Verificado/implementado por etapas; Entra implementado con aceptacion del tenant real pendiente | `ROADMAP.md`, specs 038-039, 099, 141, 143, 171, 186, 192, 197 |
| Perfiles, carreras y CV | Implementado/verificado por etapas | specs 020, 035, 110, 114, 142-146, 148-162, 175 |
| Materias y correlatividades | Implementado y validado por contrato runtime sobre base demo reconstruida | specs 118, 194, 196 |
| Feed, comentarios, reacciones y reportes | Verificado/implementado por etapas | specs 099, 110, 121-123, 129-135, 178 |
| Archivos y rich media | Implementado/verificado por etapas | specs 121-122, 133, 135, 178 |
| Grafo social | Implementado | spec 110 |
| Mensajeria privada | Verificado | specs 104, 106, 107, 132, 160 |
| Administracion y moderacion | Implementado/verificado por etapas | specs 099, 111, 117-119, 135 |
| Recursos, notas y SIU | Implementado; recorrido autenticado y smoke GraphQL verificados, con SIU real fuera de alcance | specs 136, 137, 164, 165, 194, 196 |
| Empleos, postulaciones y onboarding B2B | Implementado; recorrido autenticado, solicitud/aprobacion empresarial y smoke GraphQL verificados, con SMTP publico como gate externo | specs 173-175, 194, 196, 198 |
| Over-delivery institucional | Implementado; acceso Microsoft Entra single-tenant agregado en Spec 197 | specs 168-171, 197 |

## 3. Requerimientos funcionales vigentes

### Cuentas y seguridad

- **RF-001**: Registrar cuentas institucionales y cuentas habilitadas por las reglas del rol.
- **RF-002**: Autenticar con BCrypt y emitir JWT con expiracion validada.
- **RF-003**: Bloquear acceso a cuentas inactivas.
- **RF-004**: Proteger cuentas administradoras contra degradacion o desactivacion desde la aplicacion.
- **RF-004B**: Bloquear temporalmente cuentas ante fuerza bruta de login y resetear el estado tras autenticacion correcta.
- **RF-004C**: Permitir acceso institucional Microsoft 365 mediante Authorization Code + PKCE. La API valida firma, emisor, audiencia, vigencia, tenant, objeto, scope y dominio del access token antes de vincular una identidad y emitir el JWT canonico de OneITB.

### Perfiles y estructura academica

- **RF-005**: Consultar y editar el perfil propio, biografia, contacto y CV.
- **RF-006**: Asociar usuarios a una o mas carreras.
- **RF-006B**: Permitir que cada usuario marque su perfil como publico o privado; la API debe ocultar CV, bio, contacto, carreras y metricas sensibles a terceros no autorizados.
- **RF-007**: Administrar materias con carrera, anio y correlatividades.

### Muro social

- **RF-008**: Crear, buscar, filtrar, editar y desactivar publicaciones; la materia debe pertenecer a una carrera habilitada para el autor, salvo alcance institucional explicito.
- **RF-009**: Comentar con un maximo persistido de dos niveles. Al responder una respuesta, el sistema la agrega como hermana bajo el comentario raiz, registra el destinatario validado y antepone una mencion visible; nunca crea un tercer nivel.
- **RF-010**: Reaccionar a publicaciones, comentarios y respuestas; reportar, seguir/dejar de seguir, silenciar y bloquear. Follow, Mute y Block se persisten como relaciones explicitas sin sobrescribir estados compatibles. El autor puede consultar de forma paginada quienes reaccionaron a su publicacion.
- **RF-011**: Adjuntar hasta 10 archivos y 15 MB agregados a publicaciones, comentarios y respuestas mediante carga desacoplada, conservando nombre original, tipo, tamano y orden; el autor puede reemplazarlos al editar.
- **RF-012**: Mostrar conjuntamente YouTube y adjuntos con una portada elegida en un mosaico acotado (cuatro tiles por publicacion y tres por comentario). La portada PDF renderiza su primera pagina mediante PDF.js/worker local diferido; el documento completo usa una Blob URL revocable sin debilitar headers anti-framing.
- **RF-013**: Priorizar autores seguidos y excluir silenciados/bloqueados del feed.
- **RF-013B**: Agrupar persistentemente notificaciones de comentarios y reacciones por destinatario, publicacion y tipo, con contador y navegacion dirigida a `inquiryId` y, cuando corresponde, al `commentId` exacto con scroll/resaltado temporal.

### Mensajeria

- **RF-014**: Mantener conversaciones privadas uno a uno con historial persistente.
- **RF-015**: Recibir mensajes nuevos por WebSocket con aislamiento por usuario autenticado.
- **RF-016**: Buscar contactos y mensajes y marcar mensajes como leidos.
- **RF-016B**: Mostrar badges de mensajes no leidos y generar como maximo un recordatorio persistente por usuario cuando existan mensajes con al menos una hora de antiguedad, respetando sus preferencias.

### Administracion y moderacion

- **RF-017**: Gestionar usuarios, roles, carreras y materias desde un panel protegido.
- **RF-018**: Gestionar reportes, publicaciones y comentarios con permisos diferenciados.
- **RF-019**: Reservar la edicion y desactivacion de contenido al autor. Moderadores y administradores solo pueden ocultar/restaurar contenido de forma reversible, con motivo obligatorio y auditoria persistente; no se borra contenido social fisicamente.

### Recursos academicos, SIU y notificaciones

- **RF-020**: Mantener un repositorio academico independiente del feed.
- **RF-021**: Visualizar notas y progreso academico por materia.
- **RF-022**: Sincronizar notas desde un adaptador SIU Guarani mock desacoplado.
- **RF-023**: Configurar preferencias de notificacion por materia/tipo.
- **RF-024**: Registrar Audit Trail transversal de entidades criticas mediante interceptor EF Core.
- **RF-025**: Exportar progreso academico como CSV e imprimir constancias formales.
- **RF-026**: Publicar credenciales digitales de materias aprobadas mediante ruta publica limitada.
- **RF-027**: Mostrar toasts globales a partir de notificaciones WebSocket.

### Empleabilidad

- **RF-028**: Publicar ofertas laborales y listarlas para estudiantes/egresados.
- **RF-029**: Permitir postulaciones unicas por oferta para estudiantes y egresados.
- **RF-030**: Permitir que el empleador propietario revise postulantes desde el Gestor de Postulaciones.
- **RF-031**: Enviar alertas institucionales de cambio de estado de postulacion mediante SMTP y conservar un pickup `.eml` local, explicito e ignorado solo para desarrollo.
- **RF-031B**: Permitir a administradores ejecutar una prueba SMTP controlada desde GraphQL sin recorrer el flujo completo de postulaciones.
- **RF-032**: Entregar el Magic Link de empleadores fuera de GraphQL, almacenar solo su digest y retirar el fragmento sensible de la URL antes del consumo.
- **RF-033**: Permitir una solicitud publica de alta empresarial sin crear cuentas ni revelar si el correo o CUIT ya existen; validar consentimiento, CUIT, honeypot y limites de abuso.
- **RF-034**: Permitir exclusivamente a Administradores aprobar, rechazar o reintentar solicitudes; la aprobacion debe crear una unica cuenta `Empleador`, auditoria y Outbox dentro de una transaccion.

RF-020 a RF-034 cuentan con implementacion y aceptacion local proporcional: los
contratos academicos y laborales fueron recorridos con identidades autenticadas y la
base demo canonica; Redis y SMTP local se probaron con infraestructura contenida. SIU
real, SMTP publico, Cloudinary y otros proveedores externos no deben presentarse como
verificados sin secretos y evidencia del ambiente de destino.

## 4. Roles y utilidad esperada

| Rol | Necesidad cubierta por el sistema |
|---|---|
| Estudiante | Identidad academica, participacion en muro por materias, recursos, progreso/notas, chat y postulaciones laborales |
| Profesor | Acompanamiento academico, recursos por materia, asignacion de progreso/notas, respuesta a consultas y comunicacion directa |
| Egresado | Perfil profesional/CV, participacion como referente y acceso a oportunidades laborales |
| Empleador | Alta externa sujeta a aprobacion institucional, publicacion de ofertas, revision de postulantes y comunicacion del estado de postulaciones |
| Moderador | Revision de reportes, silenciamiento temporal y trazabilidad de decisiones sin borrado fisico |
| Administrador | Gobierno institucional de usuarios, roles, carreras, materias, solicitudes empresariales, auditoria, moderacion y configuracion operativa |

## 5. Requerimientos no funcionales

- **RNF-001 Seguridad**: JWT con clave externalizada, BCrypt con costo explicito y rehash no degradante, autorizacion por rol, privacidad de perfil con masking server-side, validacion de access tokens Entra sin persistirlos, CORS restringido, lockout por cuenta y limites anti-DoS en GraphQL.
- **RNF-002 Integridad**: FKs explicitas, `DeleteBehavior.Restrict` y soft-delete social.
- **RNF-003 Rendimiento**: evitar N+1, proyectar/precargar grafos, paginar historiales extensos y limitar profundidad GraphQL.
- **RNF-004 Escalabilidad**: separar persistencia, API, frontend, Redis opcional y almacenamiento de archivos configurable.
- **RNF-005 Usabilidad**: UI responsiva con Tailwind v4, feedback de carga, skeletons, estados vacios y manejo de errores.
- **RNF-006 Trazabilidad**: specs, evidencia, roadmap, development log, audit trail y correlation id sincronizados.
- **RNF-007 Operabilidad**: Docker SQL local canonico, compose productivo multi-contenedor, SMTP obligatorio en Production, pickup local seguro en Development y Redis/Cloudinary configurables por entorno.
- **RNF-008 Reproducibilidad demo**: reconstruccion local protegida por identificacion exacta de destino, backup verificado, migraciones como fuente de verdad, seed doble idempotente, validacion de seis roles e inventario relacional sin secretos versionados.

## 6. Fuera de alcance actual

- Pagos y comercio electronico.
- Videollamadas.
- Aceptacion productiva de Microsoft Entra sin App Registrations, scope delegado, redirect URIs, consentimiento y cuenta institucional de prueba aprobados.
- Cuentas Microsoft personales, acceso multi-tenant y mapeo automatico de grupos Entra a roles OneITB.
- Integracion SIU productiva sin contrato real disponible; la integracion vigente es un adaptador mock desacoplado.
- Despliegue Azure real y aplicacion movil nativa; la infraestructura base esta preparada, pero no debe declararse desplegada sin provisioning y smoke tests.
