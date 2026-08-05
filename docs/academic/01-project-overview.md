# 1. Presentación general del proyecto

| Dato de control | Valor |
|---|---|
| **Proyecto** | OneITB23 |
| **Producto** | OneITB |
| **Institución de referencia** | Instituto Tecnológico Beltrán |
| **Espacio curricular** | Práctica Profesionalizante III |
| **Tipo de solución** | Red social académica y Bolsa de Trabajo institucional |
| **Estado documental** | Resumen académico derivado, revisado el 5 de agosto de 2026 |
| **Estado técnico de referencia** | Release Candidate académico; core Feature Complete y Code Freeze operativo local |

Este documento ofrece una introducción ejecutiva al proyecto. No reemplaza el contrato
de alcance, la arquitectura, el Roadmap ni el informe final de auditoría. Ante cualquier
diferencia prevalecen, en ese orden, el código y la evidencia reproducible, seguidos por
los documentos canónicos enlazados en la [sección 1.10](#110-fuentes-canónicas).

---

## 1.1 Organización y contexto institucional

OneITB23 se desarrolla como proyecto académico para el Instituto Tecnológico Beltrán en
el marco de Práctica Profesionalizante III. La solución toma como referencia una
comunidad formada por estudiantes, profesores, egresados, autoridades académicas y
organizaciones empleadoras vinculadas con carreras técnicas y sus materias.

El proyecto integra análisis de requerimientos, diseño de arquitectura, desarrollo
full-stack, persistencia relacional, seguridad, experiencia de usuario, pruebas,
operación con contenedores y documentación de entrega. Su evolución se organizó mediante
especificaciones Speckit para mantener trazabilidad entre necesidad, diseño, tareas,
implementación y evidencia.

OneITB es una propuesta tecnológica académica. No debe interpretarse como un sistema
institucional oficialmente desplegado ni como sustituto de los sistemas administrativos
vigentes del Instituto hasta completar los procesos de aprobación, integración y
operación correspondientes.

## 1.2 Problema identificado

La información académica y la comunicación de una comunidad educativa pueden quedar
distribuidas entre mensajería, correo, almacenamiento de archivos, redes sociales y
canales informales. Esa fragmentación dificulta:

1. Encontrar consultas y respuestas relacionadas con una materia.
2. Compartir recursos con contexto académico y trazabilidad de autoría.
3. Mantener conversaciones privadas dentro del mismo entorno.
4. Presentar una identidad académica y profesional coherente.
5. Vincular estudiantes y egresados con oportunidades laborales pertinentes.
6. Moderar contenido, atender reportes y auditar decisiones relevantes.
7. Obtener una visión integrada del progreso y de los recursos de cada materia.

El problema no se reduce a crear otra red social. La necesidad es concentrar los flujos
académicos, sociales y de empleabilidad en un dominio institucional con permisos,
relaciones y evidencia explícitos.

## 1.3 Objetivo general

Construir una aplicación web responsive que funcione como red social académica y Bolsa
de Trabajo institucional, organizando la interacción por usuarios, carreras y materias,
con controles de acceso, moderación, comunicación en tiempo real y una base operativa
reproducible.

### Objetivos específicos

- Centralizar publicaciones, comentarios, respuestas, reacciones, menciones y reportes.
- Confirmar una carrera actual para cada Estudiante, conservar asociaciones múltiples
  sólo para roles o importaciones compatibles y contextualizar el contenido por materia.
- Facilitar el intercambio de archivos, enlaces, imágenes, PDF y multimedia educativa.
- Representar la identidad académica y profesional mediante un perfil con formato de CV.
- Proporcionar mensajería privada y notificaciones dentro de la plataforma.
- Gestionar recursos, progreso académico y una integración SIU desacoplada y simulada.
- Vincular estudiantes y egresados con empresas mediante ofertas y postulaciones.
- Proveer herramientas de administración, moderación, auditoría y protección de cuentas.
- Mantener una arquitectura local reproducible y preparada para evolución cloud.

## 1.4 Actores y valor aportado

| Actor | Necesidad principal | Capacidades relevantes |
|---|---|---|
| **Visitante** | Conocer la plataforma y acceder de forma segura | Landing pública, registro permitido, login local/Microsoft y solicitud empresarial |
| **Estudiante** | Participar de la comunidad y consultar su trayectoria | Feed por carreras, recursos, perfil/CV, progreso propio, chat, notificaciones y postulaciones |
| **Profesor** | Acompañar el intercambio académico | Publicaciones, recursos y gestión de progreso conforme a autorización |
| **Egresado** | Mantener vínculo académico y acceder a empleabilidad | Perfil/CV, comunidad, recursos permitidos, chat y postulaciones |
| **Empleador** | Publicar oportunidades y revisar candidatos | Ofertas propias y Gestor de Ofertas y Postulaciones |
| **Moderador** | Mantener convivencia y aplicar medidas acotadas | Reportes, ocultamiento auditado y silenciamiento temporal |
| **Administrador** | Gobernar catálogo, usuarios y operaciones críticas | Carreras, materias, roles permitidos, moderación, SIU mock, solicitudes empresariales y auditoría |

Los roles elevados no se asignan desde el registro público. La cuenta `Empleador` surge
del seed controlado o de la aprobación administrativa de una solicitud empresarial.

## 1.5 Alcance funcional consolidado

### Identidad, perfiles y estructura académica

- Registro local, login, recuperación por Magic Link, lockout y JWT OneITB.
- Integración Microsoft Entra organizacional mediante Authorization Code + PKCE; su
  aceptación con cuentas Microsoft 365 reales permanece como gate externo.
- Perfil público/privado, avatar, contacto, redes y CV relacional imprimible.
- Carreras, materias, años y correlatividades con relaciones explícitas.
- Onboarding obligatorio de carreras para estudiantes sin identidad académica asociada.

### Comunidad social y multimedia

- Feed filtrado por carrera/materia y priorizado por relaciones sociales.
- Publicaciones, comentarios, respuestas de hasta dos niveles, menciones y reacciones.
- Adjuntos múltiples, nombres originales, imágenes, documentos, PDF y enlaces YouTube.
- Media Grid dinámico, vistas previas y visores accesibles.
- Seguimiento, silenciamiento, bloqueo, reportes y soft delete moderado.

### Comunicación y notificaciones

- Conversaciones privadas persistidas en SQL Server.
- Recepción en tiempo real mediante GraphQL Subscriptions por WebSocket.
- Contadores de mensajes no leídos y notificaciones agrupadas con enlaces de contexto.
- Preferencias de notificación y recordatorios de mensajes pendientes.

### Módulo académico

- Recursos académicos clasificados y asociados a materias.
- Seguimiento de progreso y calificaciones con acceso restringido.
- Exportación de constancias/reportes de apoyo, sin firma digital institucional.
- Adaptador `ISiuIntegrationService` con implementación mock para demostrar el patrón de
  integración; no existe conexión productiva con SIU Guaraní.

### Bolsa de Trabajo y vínculo empresarial

- Publicación y consulta de ofertas laborales.
- Postulación única por estudiante o egresado.
- Gestor de Ofertas y Postulaciones para el propietario de cada oferta.
- Solicitud pública de alta empresarial, revisión administrativa, aprovisionamiento
  controlado, Outbox y correo de bienvenida.
- Eventos en tiempo real y avisos por correo cuando la infraestructura está configurada.

### Administración, moderación y auditoría

- Gestión de usuarios, carreras, materias, contenido y solicitudes empresariales.
- Protección de cuentas Administrador y doble verificación para promociones críticas.
- Ocultamiento moderado sin editar el texto de otros autores.
- Auditoría persistente de operaciones sensibles y trazabilidad de moderación.
- Prueba SMTP administrativa y herramientas locales de aceptación.

## 1.6 Arquitectura y tecnologías

| Capa | Tecnología y responsabilidad |
|---|---|
| **Frontend web** | React 18, Apollo Client, Vite 8 y Tailwind CSS 4; SPA responsive con temas Clean Tech y Tech Noir |
| **API de negocio** | ASP.NET Core sobre .NET 8 y HotChocolate GraphQL 14 |
| **Persistencia** | Entity Framework Core 8 y SQL Server 2022; migraciones versionadas y relaciones con `DeleteBehavior.Restrict` |
| **Tiempo real** | GraphQL Subscriptions por WebSocket; memoria en desarrollo y Redis opcional para distribución |
| **Archivos** | `POST /api/upload` desacoplado; provider `Local` explícito en Development y Cloudinary fail-closed en Production |
| **Correo** | Adaptador SMTP; pickup `.eml`/Mailpit para aceptación local sin secretos versionados |
| **Despliegue** | Docker multi-stage, Docker Compose, Nginx y configuración por variables de entorno |
| **Observabilidad** | Logs estructurados y auditoría persistente; centralización productiva aún pendiente |

La aplicación utiliza GraphQL para operaciones de negocio y una excepción REST
autenticada para archivos binarios. Apollo Client administra consultas, caché y
suscripciones. EF Core modela el dominio relacional y aplica claves foráneas explícitas
para evitar propiedades sombra y borrados en cascada no deseados.

## 1.7 Seguridad y calidad transversal

La implementación incorpora, entre otros controles:

- Hash de contraseñas con BCrypt, bloqueo temporal por intentos fallidos y JWT firmado.
- Validación criptográfica de tokens Microsoft Entra antes de emitir una sesión OneITB.
- Autorización declarativa en resolvers y validaciones de ownership en servicios.
- Rate limiting global y específico para superficies públicas sensibles.
- Límites de profundidad, costo, nodos y paginación en GraphQL.
- Validación de extensión, tamaño y magic bytes para archivos.
- Sanitización de datos, anti-enumeración, honeypot y Outbox en onboarding empresarial.
- Limpieza de caché Apollo y transporte WebSocket al cambiar o cerrar sesión.
- Error Boundary global, estados de carga/error y fallbacks visuales defensivos.
- Pruebas backend/frontend, builds Release/Vite, controles EF y scripts de aceptación.

Estos mecanismos reducen el riesgo, pero no reemplazan pentesting, monitoreo, backup,
antivirus/CDR ni aceptación de proveedores en un ambiente productivo real.

## 1.8 Estado verificable y lectura del 100 %

El Roadmap registra **117 de 117 ítems contabilizados**, distribuidos de esta forma:

| Estado | Cantidad | Interpretación |
|---|---:|---|
| Verificado `[V]` | 46 | Cuenta con evidencia runtime, de base o infraestructura proporcional al alcance |
| Implementado `[I]` | 71 | Cuenta con código, tests, builds, migración o prueba aislada; puede requerir aceptación manual o externa |
| **Total** | **117** | **100 % del alcance contabilizado** |

Por lo tanto, “100 %” significa **alcance funcional contabilizado implementado o
verificado**. No significa que la plataforma esté desplegada y aceptada en producción.
La formulación recomendada para la defensa es:

> Release Candidate académico, Feature Complete y con entorno local reproducible. La
> aceptación productiva de proveedores externos, observabilidad y controles operativos
> permanece como evolución posterior.

Los baselines más recientes alcanzaron 234/234 pruebas backend en Spec 216 y 251/251
frontend en Spec 217. El gate conjunto debe repetirse sobre el SHA candidato definitivo
antes de congelarlo para la presentación.

## 1.9 Límites, brechas y evolución

### Pendientes de cierre académico

- Gate integral sobre un único SHA candidato.
- Regresión visual por los seis roles y recorrido específico del Moderador.
- Prueba realtime con dos sesiones aisladas.
- Aceptación visual del onboarding empresarial y preparación de contingencia.
- Maquetación, impresión, presentación y ensayos de la defensa.

### Brechas técnicas que impiden afirmar producción plena

- `GAP-AUTH-01`, `GAP-AUTH-02` y `GAP-PRIV-01` fueron cerrados en Spec 201 mediante
  registro público institucional solo para Estudiante, alcance docente por carrera y
  eliminación de Follow como permiso para revelar perfiles privados.
- Los archivos privados requieren autorización por recurso o URL firmada
  (`GAP-FILE-01`).
- La plantilla productiva exige ahora una cadena SQL externa con certificado verificable;
  falta la aceptación TLS contra el destino real (`GAP-INFRA-01`).
- Falta aceptar observabilidad central, alertas, backup y respuesta operativa
  (`GAP-OPS-01`).

### Dependencias externas pendientes

- Microsoft Entra completó el acceso real hasta onboarding/muro; restan cancelación,
  error, logout y aislamiento con una segunda cuenta institucional.
- SMTP, Redis administrado y Cloudinary en proveedores productivos.
- Antivirus/CDR para adjuntos y benchmark BCrypt en hardware objetivo.

### Fuera del alcance entregado

- Aplicación móvil React Native/Expo: planificada, sin código versionado.
- Despliegue Azure productivo y dominio institucional definitivo.
- Videollamadas nativas, pagos y selección automática de candidatos.
- Integración SIU Guaraní real y emisión de títulos o certificados oficiales firmados.

## 1.10 Fuentes canónicas

- [Alcance y requerimientos](../project_docs/scope-and-requirements.md)
- [Arquitectura y diseño](../project_docs/architecture-and-design.md)
- [Roadmap único](../project_docs/ROADMAP.md)
- [Informe final de auditoría](../audit/FINAL_AUDIT_REPORT.md)
- [Runbook de desarrollo y aceptación](../audit/RUNBOOK_DEV.md)
- [Estado y gobierno documental](../audit/DOCUMENTATION_STATUS.md)
- [Memoria técnica de entrega](../entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md)

Este resumen debe actualizarse únicamente después de modificar sus fuentes canónicas. No
se utiliza para cambiar porcentajes, aceptar riesgos ni declarar una feature verificada.
