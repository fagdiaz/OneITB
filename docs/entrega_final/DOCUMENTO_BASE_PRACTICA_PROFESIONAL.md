# DOCUMENTO BASE DE PRÁCTICA PROFESIONALIZANTE III

**Proyecto:** OneITB23 - Red Social Académica y Bolsa de Trabajo Institucional<br>
**Institución:** Instituto Tecnológico Beltrán<br>
**Carrera:** Tecnicatura Superior en Análisis de Sistemas<br>
**Espacio curricular:** Práctica Profesionalizante III<br>
**Alumno:** Francisco Díaz<br>
**Mesa evaluadora:** Saldivar Sebastian Alfredo (presidente) y Benitez Silvio Daniel (vocal)<br>
**Ciclo lectivo:** 2026<br>
**Versión del documento:** 2.1 - normalización final previa a maquetación<br>
**Fecha de corte técnico-documental:** 5 de agosto de 2026<br>
**Fecha prevista de defensa:** 7 de agosto de 2026, 09:00<br>

> **Alcance de esta memoria.** Este documento describe el estado comprobable del repositorio OneITB23 al momento de su redacción. Distingue entre funcionalidades implementadas, validaciones automatizadas y verificaciones externas todavía pendientes. Los nombres y versiones se corresponden con el código fuente: .NET 8 (Microsoft, 2023a), Entity Framework Core 8.0.6 (Microsoft, 2023b), Hot Chocolate 14.2.0 (ChilliCream, s. f.), GraphQL (GraphQL Foundation, 2021), React 18 (React Team, 2022), Apollo Client 3.7 (Apollo GraphQL, s. f.), Vite 8 (Vite Team, 2026), Tailwind CSS 4 (Wathan, 2025) y SQL Server 2022 (Microsoft, 2025).

**Resumen ejecutivo**

OneITB23 es una plataforma web institucional que integra comunicación académica, identidad profesional, recursos por materia, mensajería privada, seguimiento del progreso, moderación y empleabilidad. El sistema centraliza actividades que, de otro modo, quedarían fragmentadas entre redes sociales generalistas, correo, mensajería informal y repositorios de archivos sin contexto académico.

La solución adopta una arquitectura desacoplada: una aplicación de página única o SPA (Mozilla, 2025) consume una API GraphQL desarrollada en .NET 8; Entity Framework Core administra la persistencia en SQL Server; las operaciones en tiempo real utilizan el protocolo WebSocket (Fette & Melnikov, 2011); y la carga binaria se resuelve mediante un endpoint basado en el estilo arquitectónico REST (Fielding, 2000). El despliegue productivo se modela con contenedores Docker (Docker, Inc., s. f.) para NGINX (NGINX, Inc., s. f.), la API, SQL Server y Redis (Redis Ltd., s. f.), con adaptadores por ambiente para SMTP (Klensin, 2008) y almacenamiento Cloudinary (Cloudinary, 2026). Development mantiene pickup de correo y storage local explícitos; Production exige las configuraciones externas y falla cerrado si están incompletas.

El núcleo funcional se encuentra implementado y el roadmap registra un 100 % global
(117 de 117 ítems): 46 se encuentran verificados `[V]` y 71 implementados `[I]`. Esta
medición expresa cobertura del alcance contabilizado, no aceptación productiva total.
Los últimos baselines por capa alcanzaron 234 pruebas backend en la Spec 216 y 251
pruebas frontend en la Spec 217; todavía no constituyen una ejecución conjunta sobre un
SHA candidato congelado. El candidato definitivo requiere repetir ambas suites y builds
sobre el mismo SHA antes de congelarse. La base de demostración fue
respaldada y reconstruida
desde las migraciones canónicas; las migraciones posteriores incorporaron identidad
Microsoft Entra y onboarding B2B sin alterar el grafo demo. Dos ejecuciones del seeder
produjeron un inventario idéntico, la auditoría relacional obtuvo cero violaciones y seis
identidades canónicas autenticaron con el rol esperado. La aceptación local también
verificó aislamiento de sesión, Redis entre proveedores Hot Chocolate independientes y
entrega SMTP capturada mediante Mailpit/pickup local. El acceso institucional Microsoft
365 se implementó con MSAL Authorization Code + PKCE, redirección completa, callback
aislado y validación backend del access token (Microsoft, s. f.). Una cuenta institucional
real completó login, callback, onboarding y acceso al muro; restan cancelación/error,
logout y aislamiento con una segunda cuenta. El alta empresarial se verificó
desde la solicitud GraphQL hasta aprobación, Outbox y correo `.eml`; su recorrido visual
público/Admin queda pendiente. También restan la regresión manual del rol Moderador, la
prueba WebSocket con dos sesiones aisladas y la producción material de la entrega.

**Índice**

1. Presentación general del proyecto
2. Especificación de requerimientos de software
3. Diseño del sistema
4. Arquitectura
5. Gestión y pruebas
6. Manual de usuario
7. Anexos
8. Referencias bibliográficas

---

## 1. PRESENTACIÓN GENERAL DEL PROYECTO

### Presentación de la Organización

El Instituto Tecnológico Beltrán constituye el contexto académico y organizacional para el cual se diseñó OneITB23. La institución articula estudiantes, egresados, docentes, autoridades y organizaciones empleadoras alrededor de carreras técnicas, materias, actividades académicas y oportunidades de inserción laboral.

El problema abordado no es la ausencia absoluta de medios digitales, sino su fragmentación. Las consultas pueden circular por mensajería informal; los materiales se distribuyen por canales aislados; los perfiles académicos no siempre están vinculados con la trayectoria del estudiante; y las ofertas laborales suelen quedar fuera del entorno institucional. Esta dispersión reduce la trazabilidad, dificulta la moderación y obliga a repetir información en herramientas que no comparten identidad ni reglas de acceso.

OneITB23 propone un punto de encuentro institucional con dominio funcional propio. Cada usuario dispone de una identidad académica, se vincula con carreras y materias, participa en un muro contextual, accede a recursos, consulta su progreso, conversa de forma privada y, según su rol, publica o gestiona oportunidades laborales. Los administradores y moderadores cuentan con controles diferenciados y auditoría persistente.

### Objetivo Global del Proyecto

El objetivo global es construir una red social académica y una Bolsa de Trabajo institucional que permita:

- centralizar perfiles académicos y currículums en una estructura persistente;
- organizar publicaciones, comentarios y recursos según carreras y materias;
- facilitar la interacción entre estudiantes, docentes, egresados y empleadores;
- mantener mensajería privada y notificaciones en tiempo real;
- registrar progreso académico y ofrecer una integración desacoplada con SIU Guaraní (Sistema de Información Universitaria, s. f.);
- brindar moderación, privacidad, auditoría y administración con permisos explícitos;
- publicar ofertas y administrar postulaciones mediante un Gestor de Ofertas y Postulaciones;
- ofrecer una base reproducible para demostración, evolución y despliegue en contenedores.

**Beneficios principales**

- Identidad única para actividad social, académica y profesional.
- Menor dispersión de consultas, materiales y oportunidades.
- Segmentación por carrera y materia para reducir contenido irrelevante.
- Trazabilidad de operaciones críticas y acciones de moderación.
- Experiencia consistente en temas Clean Tech y Tech Noir.
- Arquitectura preparada para crecimiento horizontal mediante Redis y almacenamiento externo opcional.

**Límites deliberados del alcance**

- No incluye pasarelas de pago, comercio electrónico ni gestión contable.
- No incluye videollamadas nativas ni reemplaza plataformas de aula virtual sincrónica.
- La integración SIU Guaraní se implementa mediante un adaptador mock; la conexión con una API institucional real requiere convenio, credenciales y contrato de datos.
- Microsoft Entra completó con una cuenta institucional real el login, callback,
  onboarding y acceso al muro. La aceptación integral conserva casos de cancelación,
  error, logout y aislamiento con una segunda cuenta; no equivale a certificación del
  ambiente productivo institucional.
- SMTP, Cloudinary y Redis distribuido poseen implementación condicional, pero requieren secretos y pruebas en el entorno de destino.
- La ruta pública de credenciales digitales no sustituye certificados oficiales firmados por la institución.
- La plataforma no realiza selección automática de candidatos: ofrece una Bolsa de Trabajo y un Gestor de Ofertas y Postulaciones.

### Infografía: interacción del alumno con la comunidad OneITB

Los diagramas de esta memoria utilizan Mermaid, una herramienta de definición textual de visualizaciones compatible con Markdown (Mermaid, s. f.).

**A) Código Mermaid renderizable**

```mermaid
%%{init: {"flowchart": {"curve": "step"}}}%%
flowchart LR
    A["Estudiante"] -->|"crea su perfil y elige carreras"| P["OneITB23"]
    P --> M["Muro por materias"]
    P --> R["Recursos académicos"]
    P --> C["Mensajería privada"]
    P --> N["Notas y progreso"]
    P --> E["Bolsa de Trabajo"]

    D["Profesor"] -->|"publica recursos y asigna progreso"| R
    D -->|"responde y orienta"| M
    B["Empleador"] -->|"publica ofertas"| E
    E -->|"postulación y cambio de estado"| A
    C <-->|"conversación uno a uno"| D
    M -->|"comentarios, reacciones y menciones"| A
    R -->|"descarga o consulta"| A
    N -->|"consulta privada"| A
    X["Administración y Moderación"] -->|"protege, audita y organiza"| P

    classDef person fill:#dbeafe,stroke:#2563eb,color:#0f172a,stroke-width:2px;
    classDef platform fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:3px;
    classDef module fill:#f1f5f9,stroke:#64748b,color:#0f172a;
    class A,D,B,X person;
    class P platform;
    class M,R,C,N,E module;
```

**B) Descripción descriptiva exhaustiva**

La composición debe ser horizontal. En el centro se ubica un rectángulo principal de color azul pizarra oscuro con el texto “OneITB23”; su borde debe ser celeste y más grueso que el resto para indicar que representa la plataforma. A la izquierda se colocan cuatro actores en tarjetas celestes: Estudiante, Profesor, Empleador y Administración/Moderación. A la derecha se distribuyen cinco módulos en tarjetas gris claro: Muro por materias, Recursos académicos, Mensajería privada, Notas y progreso, y Bolsa de Trabajo.

Una flecha parte del Estudiante hacia OneITB23 con la leyenda “crea su perfil y elige carreras”. Desde la plataforma salen flechas hacia todos los módulos. El Profesor se conecta con Recursos académicos y Muro; el Empleador se conecta con Bolsa de Trabajo; Administración/Moderación se conecta con el núcleo de la plataforma. La Bolsa de Trabajo devuelve una flecha al Estudiante para representar la postulación y sus cambios de estado. La Mensajería privada se une de forma bidireccional entre Estudiante y Profesor. El Muro, los Recursos y las Notas retornan información al Estudiante. Se recomienda utilizar íconos institucionales discretos, evitar ilustraciones informales y mantener alto contraste para impresión.

---

## 2. ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE

### Descripción General

El sistema se presenta como una aplicación web responsive. El registro público crea únicamente identidades `Estudiante`, exige correo `@itbeltran.com.ar` y exactamente una carrera activa; Profesor y los demás roles se aprovisionan mediante flujos confiables. La API aplica esta política, evita enumerar duplicados y limita solicitudes por origen e identidad. Las contraseñas se verifican mediante BCrypt (Provos & Mazières, 1999). Como alternativa institucional, MSAL ejecuta Authorization Code + PKCE mediante una autoridad Microsoft Entra para directorios organizacionales: inicia una redirección de página completa, procesa la respuesta en un callback no interactivo y obtiene el access token delegado del scope OneITB. La API vuelve a validar el tenant concreto y canjea ese token por la misma sesión local. Una autenticación válida emite un JSON Web Token o JWT (Jones et al., 2015), que el cliente Apollo adjunta a las operaciones GraphQL y a las cargas de archivos autorizadas. Si el Estudiante llega desde Microsoft con cero vínculos académicos, o conserva varios vínculos heredados, el área privada permanece bloqueada hasta que elija una sola carrera y confirme expresamente que es la que cursa. El sistema sólo continúa cuando una nueva consulta del perfil devuelve esa asociación exacta.

Una vez autenticado, el usuario accede a un muro cuyo contenido se limita por la intersección de carreras y materias. Puede crear publicaciones con texto, enlaces de YouTube y varios adjuntos; elegir una portada; comentar hasta dos niveles; mencionar usuarios; reaccionar; seguir, silenciar o bloquear; y reportar contenido. Los archivos se cargan primero al endpoint REST y luego se asocian a la operación de negocio mediante GraphQL, evitando transportar binarios por el esquema.

El perfil funciona como identidad académica y currículum. Su propietario administra biografía, contacto, avatar, carreras, experiencia, educación, proyectos, habilidades e idiomas. También puede definir el perfil como público o privado. El backend aplica el enmascaramiento de datos sensibles, por lo que la privacidad no depende únicamente de ocultar componentes en React.

El módulo académico organiza materias, correlatividades, recursos, calificaciones y progreso. Profesores y administradores realizan operaciones autorizadas; estudiantes consultan información dentro de su alcance académico. La selección autodeclarada de carrera exige una única opción, confirmación explícita y reemplazo transaccional; una capa compartida valida el catálogo activo para onboarding y perfil, mientras la relación N:M permanece disponible para otros roles e importaciones históricas. Después del cambio, el cliente invalida feed, materias, recursos y progreso dependientes, y conserva el perfil confirmado por el servidor. El adaptador SIU simulado de calificaciones demuestra una capa anticorrupción, patrón orientado a proteger el dominio interno frente al contrato de un sistema externo (Evans, 2003). En paralelo, un puerto independiente de matrícula (`IInstitutionalEnrollmentProvider`) define cómo una futura API autorizada del ITB o SIU podría devolver una carrera, materias, fuente y timestamp normalizados. El proveedor activo `SelfDeclared` no ejecuta una integración externa, no fabrica datos académicos y no se presenta como verificación institucional.

La mensajería privada conserva historial en SQL Server y utiliza suscripciones GraphQL por WebSocket para entregar nuevos mensajes. Las notificaciones persistentes, sus preferencias y los recordatorios de mensajes no leídos complementan la comunicación en tiempo real.

La Bolsa de Trabajo permite que empleadores y administradores publiquen ofertas. Estudiantes y egresados pueden postularse una sola vez por oferta. El propietario de la oferta consulta candidatos y actualiza el estado a pendiente, revisado o rechazado desde el Gestor de Ofertas y Postulaciones. Los cambios relevantes pueden generar correo mediante SMTP; en desarrollo se utiliza un buzón local `.eml` ignorado por el repositorio, sin registrar cuerpos sensibles en consola.

Una empresa externa que todavía no posee cuenta utiliza un formulario público de solicitud. La plataforma no concede el rol `Empleador` de forma automática: un Administrador revisa los datos, aprueba o rechaza la solicitud y, al aprobarla, el sistema crea la identidad con privilegios mínimos y encola el correo de bienvenida dentro de una transacción. Un procesador Outbox reintentable entrega el Magic Link sin comprometer la consistencia de la cuenta si SMTP se encuentra temporalmente indisponible.

Administradores y moderadores disponen de herramientas diferentes. El autor conserva la edición de su texto; la moderación puede ocultar o restaurar contenido con motivo y registro auditable, pero no reescribir contenido ajeno. Las cuentas administrativas están protegidas frente a degradación o desactivación desde la interfaz habitual.

### Requerimientos Funcionales

La presentación siguiente agrupa capacidades para facilitar su lectura. Los identificadores
canónicos se conservan en la matriz de cobertura al final de la sección y corresponden
exactamente a los 48 requerimientos de
[`02-software-requirements.md`](../academic/02-software-requirements.md). Los rótulos de
las viñetas son descriptivos y no crean una numeración alternativa.

#### Autenticación, cuentas e identidad

- **Registro:** permitir el alta con datos normalizados, contraseña confirmada, rol público permitido y carreras seleccionadas.
- **Inicio de sesión:** validar credenciales con BCrypt, emitir JWT y redirigir al área privada.
- **Bloqueo de cuenta:** rechazar cuentas inactivas y aplicar lockout temporal luego de cinco intentos fallidos durante quince minutos.
- **Protección administrativa:** impedir modificar o desactivar una cuenta administradora desde los flujos ordinarios; exigir contraseña del administrador actual para promover otra cuenta.
- **Sesión segura:** limpiar token, estado de autenticación, caché Apollo, chat y notificaciones al cerrar sesión o expirar el JWT.
- **Identidad institucional:** iniciar sesión con una cuenta Microsoft 365 organizacional, validar firma, emisor, audiencia, vigencia, tenant, objeto, scope y dominio antes de vincular la identidad y emitir el JWT OneITB.
- **Perfil y CV:** consultar y editar avatar, biografía, contacto, redes, educación, experiencia, proyectos, habilidades e idiomas.
- **Carreras:** exigir al Estudiante una única carrera actual confirmada y conservar una relación explícita N:M para roles institucionales e importaciones compatibles.
- **Privacidad:** permitir perfil público o privado y enmascarar información sensible ante terceros no autorizados.

#### Muro social y medios

- **Publicaciones:** crear, buscar, filtrar, editar y desactivar publicaciones vinculadas con materias autorizadas.
- **Feed contextual:** mostrar contenido dentro del alcance de carreras del usuario, priorizar autores seguidos y excluir cuentas silenciadas o bloqueadas.
- **Comentarios:** admitir comentarios principales y respuestas con un máximo persistido de dos niveles.
- **Menciones:** convertir menciones válidas en enlaces de perfil y notificar al destinatario, excepto en auto-menciones.
- **Reacciones:** alternar reacciones sobre publicaciones, comentarios y respuestas; permitir al autor consultar quién reaccionó.
- **Adjuntos:** aceptar hasta diez archivos y 15 MB agregados por contenido, conservar nombre original, MIME, tamaño y orden.
- **Multimedia:** combinar imágenes, PDF, documentos y hasta dos enlaces de YouTube en un mosaico acotado, con portada, galería y vista previa.
- **Edición de medios:** permitir al autor reemplazar adjuntos al editar publicaciones o comentarios.
- **Notificaciones sociales:** agrupar reacciones y comentarios por publicación, contabilizar solo elementos no leídos y navegar al contenido exacto.
- **Reportes:** permitir reportar publicaciones y someterlas al circuito de moderación.

#### Carreras, materias y actividad académica

- **Materias:** administrar nombre, código, carrera, año y correlatividades sin borrados en cascada.
- **Recursos académicos:** publicar y consultar archivos o enlaces por materia, categoría y versión.
- **Progreso:** registrar y consultar nota, estado y observaciones por estudiante y materia.
- **Autorización académica:** limitar la lectura y escritura según rol, propiedad y pertenencia a la carrera.
- **Adaptador SIU:** sincronizar datos simulados mediante una interfaz desacoplada y realizar upsert de progreso.
- **Constancias:** exportar progreso como CSV e imprimir una constancia académica de apoyo.
- **Credencial pública:** consultar una credencial limitada de materia aprobada mediante una ruta pública.

#### Mensajería y notificaciones

- **Chat privado:** mantener conversaciones uno a uno con historial persistente.
- **Tiempo real:** recibir mensajes y notificaciones mediante suscripciones GraphQL autenticadas.
- **Lectura:** marcar mensajes y notificaciones como leídos y mostrar badges calculados sobre pendientes reales. Los contadores evitan la acumulación incremental ciega mediante el recálculo estricto de entidades no leídas (`Count(n => !n.IsRead)`), garantizando un resultado idempotente en la interfaz aunque existan lecturas previas o nuevas notificaciones.
- **Recordatorios:** generar un recordatorio idempotente cuando existan mensajes con una antigüedad mínima configurada.
- **Preferencias:** habilitar o deshabilitar categorías de notificación desde un panel compacto.

#### Bolsa de Trabajo y Gestor de Ofertas y Postulaciones

- **Ofertas:** permitir a empleadores y administradores crear y listar ofertas laborales activas.
- **Postulación:** permitir una única postulación por estudiante o egresado y oferta.
- **Gestión:** permitir solo al propietario de la oferta consultar postulantes y cambiar su estado.
- **Perfil académico del candidato:** mostrar al empleador la información permitida para evaluar una postulación.
- **Aviso por correo:** enviar una notificación institucional al pasar una postulación a revisada o rechazada.
- **Prueba SMTP:** permitir a un administrador ejecutar un smoke test de correo sin recorrer el flujo laboral completo.
- **Solicitud empresarial:** permitir que una empresa sin cuenta presente una solicitud pública con consentimiento, datos normalizados, CUIT válido, protección anti-bot y respuesta resistente a enumeración.
- **Aprobación empresarial:** permitir exclusivamente a Administradores revisar solicitudes y aprobarlas o rechazarlas; una aprobación debe aprovisionar exactamente una identidad `Empleador`, registrar auditoría y encolar el acceso por Magic Link de manera atómica.

#### Administración, moderación y auditoría

- **Panel administrativo:** gestionar usuarios, carreras, materias, publicaciones, comentarios y reportes según permisos.
- **Moderación reversible:** ocultar o restaurar contenido con motivo obligatorio, sin editar texto ajeno ni borrar físicamente el contenido social.
- **Silenciamiento temporal:** permitir a moderadores o administradores silenciar usuarios durante un período.
- **Auditoría:** registrar actor, fecha, entidad, identificador, acción y valores relevantes en operaciones críticas.
- **Seeder empresarial:** inicializar, cuando está habilitado, un grafo demo coherente e idempotente para la defensa académica.

#### Matriz canónica de cobertura funcional

| Módulo | Identificadores vigentes |
|---|---|
| Identidad y sesión | `RF-001`, `RF-002`, `RF-003`, `RF-004`, `RF-004B`, `RF-004C`, `RF-004D`, `RF-004E`, `RF-004F` |
| Perfil, CV y catálogo | `RF-005`, `RF-006`, `RF-006B`, `RF-007`, `RF-007B` |
| Muro y multimedia | `RF-008`, `RF-009`, `RF-010`, `RF-011`, `RF-012`, `RF-013`, `RF-013B`, `RF-013C` |
| Mensajería y notificaciones | `RF-014`, `RF-015`, `RF-016`, `RF-016B`, `RF-016C` |
| Administración y moderación | `RF-017`, `RF-018`, `RF-019`, `RF-019B` |
| Académico | `RF-020`, `RF-021`, `RF-022`, `RF-023`, `RF-024`, `RF-025`, `RF-026`, `RF-027` |
| Bolsa de Trabajo y B2B | `RF-028`, `RF-029`, `RF-030`, `RF-031`, `RF-031B`, `RF-032`, `RF-033`, `RF-034`, `RF-034B` |

#### Reglas de negocio transversales

| ID | Regla resumida |
|---|---|
| `BR-001` | Seis roles canónicos; `User` permanece solo como valor legacy. |
| `BR-002` | Ningún flujo público crea Administrador, Moderador o Empleador. |
| `BR-003` | Backend normaliza email y nombres antes de persistir. |
| `BR-004` | Visibilidad social/académica por intersección de carreras, salvo alcance global explícito. |
| `BR-005` | Perfil privado conserva identidad básica y enmascara datos sensibles server-side. |
| `BR-006` | Publicaciones/comentarios usan baja lógica y moderación reversible. |
| `BR-007` | `SocialAttachment` pertenece a Inquiry XOR Comment. |
| `BR-008` | FKs explícitas y `DeleteBehavior.Restrict`, salvo excepción documentada. |
| `BR-009` | Sin auto-notificaciones; badges cuentan estrictamente no leídos. |
| `BR-010` | Claims, no IDs del cliente, determinan actor y rol. |
| `BR-011` | Secretos y credenciales de un uso no se registran ni versionan. |
| `BR-012` | Fechas operativas en UTC y localización exclusiva de presentación. |

### Requerimientos No Funcionales

| Código | Categoría | Requerimiento y criterio aplicado |
|---|---|---|
| RNF-001 | Seguridad | JWT externalizado de al menos 32 bytes, BCrypt configurable entre 10 y 14, bloqueo de cuenta tras 5 intentos durante 15 minutos, autorización declarativa, CORS explícito, uploads autenticados y rate limiting. |
| RNF-002 | Integridad | Claves foráneas explícitas, `DeleteBehavior.Restrict`, índices únicos, constraints XOR/completitud, transacciones y soft delete social. |
| RNF-003 | Rendimiento | Ausencia de I/O síncrono en rutas asíncronas; `AsNoTracking`, proyecciones o DataLoaders para agrupación y caché por solicitud (GraphQL Foundation, s. f.), `AsSplitQuery`, paginación y límites GraphQL. |
| RNF-004 | Escalabilidad | API stateless respecto de JWT, Redis condicional, almacenamiento intercambiable y servicios separables por contenedor. |
| RNF-005 | Usabilidad | Interfaz responsive Clean Tech/Tech Noir con estados de carga, error y vacío, skeletons, feedback inmediato, foco y teclado. |
| RNF-006 | Accesibilidad | Contraste, etiquetas, foco visible, transición temática de 1300 ms anulada por reducción de movimiento e impresión, alternativas textuales e impresión independiente del tema; la auditoría WCAG formal permanece pendiente. |
| RNF-007 | Trazabilidad | Correlation ID, logs estructurados, Audit Trail, `ModerationAudit`, specs y evidencia sin datos personales innecesarios. |
| RNF-008 | Operabilidad | Health checks, rate limiting, security headers, Docker, configuración por entorno, scripts finitos, comportamiento fail-closed y backup/restore. |
| RNF-009 | Reproducibilidad | Base demo identificada, backup verificado, migraciones canónicas, doble seed idempotente, seis roles e integridad relacional. |
| RNF-010 | Resiliencia frontend | Error Boundary sobre los providers, fallback previo al montaje, logout idempotente y descarte de respuestas según la época de sesión. |
| RNF-011 | Calidad | Builds sin errores, pruebas proporcionales al riesgo, control de drift EF, schema ejecutado y regresión manual para flujos visuales y realtime. |
| RNF-012 | Privacidad | Minimización, masking server-side, prevención de enumeración, auditoría sanitizada y secretos fuera de Git; no se declara cumplimiento legal integral. |

Estos requerimientos no funcionales constituyen un baseline técnico verificable. No
equivalen a una certificación WCAG, un pentest externo, un SLA productivo ni una
prueba formal de carga.

**Restricciones técnicas relevantes**

- Las operaciones de negocio se realizan por `/graphql`; la excepción para binarios es `POST /api/upload` autenticado.
- La configuración productiva no contiene contraseñas; utiliza variables de entorno y secretos.
- El tamaño agregado de adjuntos sociales se limita a 15 MB y a diez archivos.
- La paginación global usa un tamaño predeterminado de 20 y un máximo de 50 cuando corresponde.
- La profundidad máxima GraphQL se mantiene en un valor prudente configurable, con base actual de 15.
- La API no debe exponer stack traces ni errores internos al cliente final.

---

## 3. DISEÑO DEL SISTEMA

### Casos de Uso Principales

Los actores principales son Estudiante, Egresado, Profesor, Empleador, Moderador y Administrador. Todos derivan de una cuenta autenticada, pero sus permisos se resuelven en backend; la ocultación visual de un botón no constituye autorización.

**A) Códigos Mermaid renderizables**

> Mermaid no incluye una primitiva UML nativa para casos de uso. Los tres `flowchart` siguientes representan actores, límites del sistema y casos de uso con nodos ovalados compatibles con los renderizadores Mermaid actuales.

```mermaid
%%{init: {"flowchart": {"curve": "step"}}}%%
flowchart LR
    EST["Estudiante"]:::actor
    EGR["Egresado"]:::actor
    PRO["Profesor"]:::actor

    subgraph SYS["A) Módulo Social y Académico"]
        UC1(["Autenticarse y administrar perfil"])
        UC2(["Participar en el muro"])
        UC3(["Consultar materias y recursos"])
        UC4(["Consultar progreso académico"])
        UC5(["Enviar mensajes privados"])
        UC7(["Publicar recursos y asignar progreso"])
    end

    EST --> UC1
    EST --> UC2
    EST --> UC3
    EST --> UC4
    EST --> UC5
    EGR --> UC1
    EGR --> UC2
    EGR --> UC5
    PRO --> UC1
    PRO --> UC2
    PRO --> UC3
    PRO --> UC5
    PRO --> UC7

    classDef actor fill:#dbeafe,stroke:#1d4ed8,color:#0f172a,stroke-width:2px;
    classDef usecase fill:#f8fafc,stroke:#64748b,color:#0f172a;
    class EST,EGR,PRO actor;
    class UC1,UC2,UC3,UC4,UC5,UC7 usecase;
    style SYS fill:#f1f5f9,stroke:#0f172a,stroke-width:2px
```

```mermaid
%%{init: {"flowchart": {"curve": "step"}}}%%
flowchart LR
    EMP["Empleador"]:::actor
    EST["Estudiante"]:::actor
    EGR["Egresado"]:::actor

    subgraph SYS["B) Módulo de Bolsa de Trabajo"]
        UC6(["Postularse a una oferta"])
        UC8(["Publicar ofertas"])
        UC9(["Gestionar postulaciones"])
    end

    EMP --> UC8
    EMP --> UC9
    EST --> UC6
    EGR --> UC6

    classDef actor fill:#dbeafe,stroke:#1d4ed8,color:#0f172a,stroke-width:2px;
    classDef usecase fill:#f8fafc,stroke:#64748b,color:#0f172a;
    class EMP,EST,EGR actor;
    class UC6,UC8,UC9 usecase;
    style SYS fill:#f1f5f9,stroke:#0f172a,stroke-width:2px
```

```mermaid
%%{init: {"flowchart": {"curve": "step"}}}%%
flowchart LR
    MOD["Moderador"]:::actor
    ADM["Administrador"]:::actor

    subgraph SYS["C) Módulo de Administración"]
        UC7(["Publicar recursos y asignar progreso"])
        UC8(["Publicar ofertas"])
        UC10(["Moderar contenido reportado"])
        UC11(["Administrar usuarios y catálogo"])
        UC12(["Auditar y probar infraestructura"])
    end

    MOD --> UC10
    ADM --> UC7
    ADM --> UC8
    ADM --> UC10
    ADM --> UC11
    ADM --> UC12

    classDef actor fill:#dbeafe,stroke:#1d4ed8,color:#0f172a,stroke-width:2px;
    classDef usecase fill:#f8fafc,stroke:#64748b,color:#0f172a;
    class MOD,ADM actor;
    class UC7,UC8,UC10,UC11,UC12 usecase;
    style SYS fill:#f1f5f9,stroke:#0f172a,stroke-width:2px
```

**B) Descripción descriptiva exhaustiva**

El modelo se divide en tres vistas UML complementarias para reducir cruces y conservar legibilidad. En cada vista, los actores se ubican a la izquierda con fondo celeste y borde azul; a la derecha se traza un límite de sistema gris claro que contiene casos de uso ovalados. La vista A reúne el Módulo Social y Académico para Estudiante, Profesor y Egresado; la vista B representa el Módulo de Bolsa de Trabajo para Empleador, Estudiante y Egresado; y la vista C concentra el Módulo de Administración para Administrador y Moderador.

Las líneas representan asociaciones de participación, no una secuencia temporal. La división conserva todas las responsabilidades del modelo original: interacción social y académica, publicación y postulación laboral, moderación, administración de catálogo y auditoría. En una recreación UML manual deben utilizarse asociaciones rectas u ortogonales sin punta de flecha.

### Diagramas de Secuencia (Interacción de Usuario)

Los diagramas siguientes describen el orden temporal de las interacciones de autenticación entre el usuario, el cliente web, la API y la persistencia. Las activaciones indican el período durante el cual cada participante procesa una operación.

**A) Registro de usuario**

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant F as Frontend (React)
    participant C as API GraphQL OneITB
    participant DB as SQL Server

    rect rgb(15, 23, 42)
    note right of U: Flujo de Registro de Usuario
    end

    U->>F: registrarUsuario(datos)
    activate F
    F->>C: POST /graphql (register mutation)
    activate C
    C->>C: hashear password (BCrypt)
    C->>DB: guardarUsuario(datos, hash)
    activate DB
    DB-->>C: confirmación de creación
    deactivate DB
    C-->>F: retorna usuario creado (sin JWT)
    deactivate C
    F->>U: redirigir a /login con mensaje de éxito
    deactivate F
```

**Nota descriptiva.** La secuencia representa un registro estudiantil sin inicio de sesión implícito. Antes de persistir, el backend valida dominio, carrera y rol; el limitador protege origen e identidad. La contraseña se transforma mediante BCrypt y la respuesta excluye el token de sesión; por ello, el cliente redirige a la pantalla de acceso con una confirmación de alta exitosa.

**B) Inicio de sesión**

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant F as Frontend (React)
    participant E as Microsoft Entra ID
    participant C as API (Controlador Auth)
    participant DB as SQL Server

    rect rgb(15, 23, 42)
    note right of U: Flujo de Inicio de Sesión (Login)
    end

    U->>F: seleccionar método de acceso
    activate F
    alt Password local
        F->>C: login(email, password)
        activate C
        C->>DB: buscar cuenta y estado de lockout
        DB-->>C: cuenta y hash BCrypt
        C->>C: verificar password y emitir JWT local
        C-->>F: AuthPayload o error genérico
        deactivate C
    else Microsoft 365 institucional
        F->>E: loginRedirect con Authorization Code + PKCE
        E-->>F: retorno a /auth/microsoft/callback
        F->>F: bloquear interacción y deduplicar flow ID
        F->>E: acquireTokenSilent(scope API OneITB)
        E-->>F: access token delegado
        F->>C: microsoftLogin(accessToken)
        activate C
        C->>E: obtener metadata/keys OpenID cacheadas
        E-->>C: issuer y claves RS256
        C->>C: validar firma, audience, lifetime, tid, oid y scp
        C->>DB: vincular/aprovisionar identidad y auditar
        DB-->>C: usuario local autorizado
        C-->>F: AuthPayload con JWT local
        deactivate C
    end
    F->>U: redirigir a /feed o mostrar error controlado
    deactivate F
```

**Nota descriptiva.** Ambos métodos terminan en el mismo JWT local. El callback de Entra
no contiene botones de acceso y una barrera idempotente evita repetir el canje ante
rerenders. El token Entra solo
se utiliza para validar y vincular la identidad institucional; no se persiste ni
autoriza otras operaciones GraphQL. La autoridad `common` admite cuentas de
directorios organizacionales, mientras la API vuelve a validar el tenant concreto,
emisor, audiencia, scope y dominio institucional de cada token. Una cuenta nueva se
aprovisiona sin privilegios y, si corresponde al rol Estudiante, debe completar su
identidad academica antes de acceder al Feed. Password local y Magic Link de
empleadores permanecen como flujos independientes.

### Modelo de Dominio (DER)

El modelo utiliza claves explícitas y relaciones configuradas mediante Fluent API. Las asociaciones sensibles aplican `DeleteBehavior.Restrict`. Publicaciones y comentarios incorporan baja lógica y ocultamiento moderado; los adjuntos se normalizan en una entidad independiente; el CV se persiste en tablas relacionales; y las operaciones críticas generan auditoría.

**A) Código Mermaid renderizable**

```mermaid
erDiagram
    USER {
        uuid Id PK
        string FirstName
        string LastName
        string Role
        string Biography
        string Phone
        string AvatarUrl
        bool IsActive
        bool IsPublicProfile
        datetime MutedUntil
    }
    ACCOUNT {
        uuid Id PK
        string Email UK
        string PasswordHash "nullable for external-only"
        string ExternalProvider
        string ExternalTenantId
        string ExternalSubjectId
        datetime LastExternalLoginAt
        int FailedLoginAttempts
        datetime LockoutEnd
        datetime CreatedAt
    }
    MAGIC_LINK {
        uuid Id PK
        uuid AccountId FK
        string Token
        datetime ExpiresAt
        bool IsUsed
    }
    EMPLOYER_REQUEST {
        uuid Id PK
        string CompanyName
        string ContactName
        string Email
        string Phone
        string TaxId
        string Status
        datetime CreatedAt
        datetime ProcessedAt
        uuid ProcessedByAdminId FK
        uuid ProvisionedUserId FK
        string EmailDeliveryStatus
    }
    EMPLOYER_ONBOARDING_OUTBOX {
        uuid Id PK
        uuid EmployerRequestId FK,UK
        string Status
        datetime NextAttemptAt
        datetime LeaseExpiresAt
        datetime ProcessedAt
        int Attempts
        string LastErrorCode
    }
    CAREER {
        int Id PK
        string Name
        string Code
        bool IsActive
    }
    USER_CAREER {
        uuid UserId PK,FK
        int CareerId PK,FK
    }
    SUBJECT {
        int Id PK
        int CareerId FK
        string Name
        string Code
        int Year
        bool IsActive
    }
    SUBJECT_PREREQUISITE {
        int SubjectId PK,FK
        int PrerequisiteId PK,FK
    }
    INQUIRY {
        uuid Id PK
        uuid UserId FK
        int SubjectId FK
        string Title
        string Content
        bool IsActive
        bool IsHiddenByModerator
        bool PreferAttachmentCover
        datetime CreatedAt
    }
    COMMENT {
        uuid Id PK
        uuid InquiryId FK
        uuid UserId FK
        uuid ParentCommentId FK
        uuid ReplyToUserId FK
        string Content
        bool IsActive
        bool IsHiddenByModerator
        datetime CreatedAt
    }
    SOCIAL_ATTACHMENT {
        uuid Id PK
        uuid InquiryId FK
        uuid CommentId FK
        string FileUrl
        string OriginalFileName
        string ContentType
        long Size
        int SortOrder
    }
    REACTION {
        uuid Id PK
        uuid InquiryId FK
        uuid UserId FK
    }
    COMMENT_REACTION {
        uuid Id PK
        uuid CommentId FK
        uuid UserId FK
    }
    COMMUNITY_REPORT {
        uuid Id PK
        uuid InquiryId FK
        uuid ReporterId FK
        string Reason
        string Status
        datetime CreatedAt
    }
    USER_INTERACTION {
        uuid Id PK
        uuid ObserverId FK
        uuid TargetId FK
        string Type
        datetime CreatedAt
    }
    MESSAGE {
        uuid Id PK
        uuid SenderId FK
        uuid ReceiverId FK
        string Content
        datetime SentAt
        bool IsRead
    }
    NOTIFICATION {
        uuid Id PK
        uuid UserId FK
        uuid RelatedInquiryId FK
        string Type
        string Message
        string ActionUrl
        bool IsRead
        string GroupKey
        int AggregateCount
        datetime CreatedAt
        datetime UpdatedAt
    }
    NOTIFICATION_PREFERENCE {
        uuid Id PK
        uuid UserId FK
        string Type
        bool IsEnabled
        datetime UpdatedAt
    }
    ACADEMIC_RESOURCE {
        uuid Id PK
        int SubjectId FK
        uuid UploaderId FK
        string Title
        string FileUrl
        string ExternalUrl
        string Category
        int Version
        bool IsActive
    }
    ACADEMIC_PROGRESS {
        uuid Id PK
        uuid UserId FK
        int SubjectId FK
        uuid AssignedById FK
        decimal Score
        string Status
        string Notes
        datetime UpdatedAt
    }
    JOB_OFFER {
        uuid Id PK
        uuid EmployerId FK
        string Title
        string Company
        string Location
        bool IsActive
        datetime CreatedAt
    }
    JOB_APPLICATION {
        uuid Id PK
        uuid JobOfferId FK
        uuid ApplicantId FK
        string Status
        datetime AppliedAt
    }
    USER_CV_EXPERIENCE {
        uuid Id PK
        uuid UserId FK
        string Company
        string Role
        bool IsHidden
        int SortOrder
    }
    USER_CV_EDUCATION {
        uuid Id PK
        uuid UserId FK
        string Institution
        string Degree
        bool IsHidden
        int SortOrder
    }
    USER_CV_PROJECT {
        uuid Id PK
        uuid UserId FK
        string Name
        string Role
        string Url
        bool IsHidden
    }
    USER_CV_SKILL {
        uuid Id PK
        uuid UserId FK
        string Name
        string Level
        bool IsHidden
    }
    USER_CV_LANGUAGE {
        uuid Id PK
        uuid UserId FK
        string Name
        string Level
        bool IsHidden
    }
    AUDIT_LOG {
        uuid Id PK
        uuid ActorUserId FK
        string CorrelationId
        string Action
        string EntityName
        string EntityId
        string OldValuesJson
        string NewValuesJson
        datetime CreatedAt
    }
    MODERATION_AUDIT {
        uuid Id PK
        uuid ActorUserId FK
        uuid TargetUserId FK
        uuid TargetInquiryId FK
        uuid TargetCommentId FK
        uuid TargetReportId FK
        string Action
        string Summary
        datetime CreatedAt
    }

    USER ||--|| ACCOUNT : owns
    ACCOUNT ||--o{ MAGIC_LINK : issues
    USER o|--o{ EMPLOYER_REQUEST : processes
    USER o|--o| EMPLOYER_REQUEST : provisioned_as
    EMPLOYER_REQUEST ||--o| EMPLOYER_ONBOARDING_OUTBOX : enqueues
    USER ||--o{ USER_CAREER : enrolls
    CAREER ||--o{ USER_CAREER : includes
    CAREER ||--o{ SUBJECT : contains
    SUBJECT ||--o{ SUBJECT_PREREQUISITE : requires
    SUBJECT ||--o{ SUBJECT_PREREQUISITE : prerequisite_for
    USER ||--o{ INQUIRY : authors
    SUBJECT ||--o{ INQUIRY : classifies
    INQUIRY ||--o{ COMMENT : receives
    USER ||--o{ COMMENT : writes
    USER o|--o{ COMMENT : mentioned
    COMMENT o|--o{ COMMENT : replies
    INQUIRY o|--o{ SOCIAL_ATTACHMENT : has
    COMMENT o|--o{ SOCIAL_ATTACHMENT : has
    INQUIRY ||--o{ REACTION : receives
    USER ||--o{ REACTION : makes
    COMMENT ||--o{ COMMENT_REACTION : receives
    USER ||--o{ COMMENT_REACTION : makes
    INQUIRY ||--o{ COMMUNITY_REPORT : receives
    USER ||--o{ COMMUNITY_REPORT : files
    USER ||--o{ USER_INTERACTION : observes
    USER ||--o{ USER_INTERACTION : targeted_by
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
    USER ||--o{ NOTIFICATION : receives
    INQUIRY o|--o{ NOTIFICATION : groups
    USER ||--o{ NOTIFICATION_PREFERENCE : configures
    SUBJECT ||--o{ ACADEMIC_RESOURCE : groups
    USER ||--o{ ACADEMIC_RESOURCE : uploads
    USER ||--o{ ACADEMIC_PROGRESS : owns
    SUBJECT ||--o{ ACADEMIC_PROGRESS : evaluates
    USER ||--o{ ACADEMIC_PROGRESS : assigns
    USER ||--o{ JOB_OFFER : publishes
    JOB_OFFER ||--o{ JOB_APPLICATION : receives
    USER ||--o{ JOB_APPLICATION : submits
    USER ||--o{ USER_CV_EXPERIENCE : records
    USER ||--o{ USER_CV_EDUCATION : records
    USER ||--o{ USER_CV_PROJECT : records
    USER ||--o{ USER_CV_SKILL : records
    USER ||--o{ USER_CV_LANGUAGE : records
    USER o|--o{ AUDIT_LOG : acts
    USER ||--o{ MODERATION_AUDIT : performs
    USER o|--o{ MODERATION_AUDIT : target_user
    INQUIRY o|--o{ MODERATION_AUDIT : target_inquiry
    COMMENT o|--o{ MODERATION_AUDIT : target_comment
    COMMUNITY_REPORT o|--o{ MODERATION_AUDIT : target_report
```

**B) Descripción descriptiva exhaustiva**

El DER debe dibujarse por dominios para conservar legibilidad. En el centro se ubica `USER` en azul oscuro, porque concentra identidad y relaciones. A su lado se colocan `ACCOUNT` y `MAGIC_LINK` en azul claro, representando autenticación. `ACCOUNT` utiliza la misma clave del usuario en la relación uno a uno y puede contener password BCrypt o una identidad externa completa; la combinación proveedor, tenant y objeto Entra es única y los tokens no forman parte del modelo. Debajo se ubican `CAREER`, `USER_CAREER`, `SUBJECT` y `SUBJECT_PREREQUISITE` en verde suave, representando estructura académica.

El dominio social se pinta en celeste: `INQUIRY`, `COMMENT`, `SOCIAL_ATTACHMENT`, `REACTION`, `COMMENT_REACTION`, `COMMUNITY_REPORT` y `USER_INTERACTION`. `COMMENT` debe mostrar una flecha hacia sí misma para representar respuestas, con cardinalidad opcional en el padre y múltiple en los hijos. `SOCIAL_ATTACHMENT` puede pertenecer a una publicación o a un comentario; la validación de negocio aplica un **Constraint de Exclusividad Mutua (XOR)**: el archivo pertenece a una `Inquiry` o a un `Comment`, pero jamás a ambos simultáneamente. Se debe añadir una nota visual indicando que la relación exige exactamente un propietario.

El dominio de comunicación se pinta en violeta tenue: `MESSAGE`, `NOTIFICATION` y `NOTIFICATION_PREFERENCE`. Deben salir dos relaciones desde `USER` hacia `MESSAGE`, rotuladas “envía” y “recibe”. `NOTIFICATION` puede referenciar una publicación para agrupar eventos y navegar al contenido relacionado. El dominio académico operativo se pinta en verde más intenso: `ACADEMIC_RESOURCE` depende de Materia y Usuario cargador; `ACADEMIC_PROGRESS` depende de Estudiante, Materia y Usuario asignador.

El dominio laboral se pinta en naranja suave: `JOB_OFFER` pertenece al empleador y `JOB_APPLICATION` une la oferta con el postulante. Debe destacarse con una nota que el par oferta-postulante es único. `EMPLOYER_REQUEST` representa el alta B2B previa a la cuenta y se relaciona opcionalmente con el Administrador que la procesa y con el usuario aprovisionado. `EMPLOYER_ONBOARDING_OUTBOX` mantiene una relación uno a cero-o-uno con la solicitud aprobada y conserva solo estado técnico, intentos, lease y código de error sanitizado. Las cinco tablas `USER_CV_*` se ubican alrededor de Usuario en gris azulado y se conectan uno a muchos; cada registro puede ocultarse y posee orden de presentación.

Finalmente, `AUDIT_LOG` y `MODERATION_AUDIT` se pintan en rojo muy claro. `AUDIT_LOG` conserva valores anteriores y nuevos serializados para trazabilidad transversal. `MODERATION_AUDIT` referencia al actor y, opcionalmente, a usuario, publicación, comentario o reporte objetivo. Todas las relaciones críticas deben acompañarse con la leyenda “FK explícita / DeleteBehavior.Restrict”.

### Interfaces de Usuario

**Landing pública y autenticación.** La ruta `/` presenta la identidad visual, propósito, módulos y llamados a iniciar sesión o registrarse. Identifica a OneITB como proyecto académico complementario para la comunidad del Instituto Superior de Formación Técnica N.º 197 y diferencia expresamente la plataforma del portal oficial (Instituto Tecnológico Beltrán, s. f.). Los accesos al Portal Beltrán, SIU Guaraní y Microsoft 365 se muestran como enlaces externos seguros, no como integraciones productivas. También ofrece el acceso **Soy empresa / Publicar oferta**, que dirige a `/empleos/solicitud` sin conceder una cuenta directamente. El encabezado adapta navegación a escritorio y móvil. Login y registro incluyen visibilidad de contraseña, validación institucional, feedback de error y tema claro predeterminado para usuarios anónimos.

**Muro principal.** La ruta `/feed` organiza el compositor, búsqueda, filtros y publicaciones. La carga incremental utiliza un único hook de paginación: conserva carrera, materia, búsqueda y autor, deduplica por identificador, impide solicitudes concurrentes y diferencia carga inicial, error recuperable, reintento y fin. Cada tarjeta muestra autor, rol, materia, texto expandible, mosaico multimedia, reacciones, comentarios y acciones contextuales. El Media Grid limita la altura, combina portada, imágenes, PDF y YouTube, y deriva el excedente a un visor. Su algoritmo calcula dinámicamente el layout y adapta las fracciones disponibles según la orientación y proporción de la portada: una pieza apaisada puede ocupar el ancho superior completo, mientras los medios secundarios se redistribuyen en una grilla compacta. Para documentos PDF utiliza un motor ligero y diferido basado en PDF.js (Mozilla, s. f.), que previsualiza la primera página con una presentación similar a las aplicaciones de mensajería y conserva las acciones de apertura y descarga. Los reproductores de YouTube quedan encapsulados en contenedores con `aspect-ratio` y dimensiones estrictas para impedir que los `iframe` desborden su tarjeta o alteren el DOM circundante. Los comentarios distinguen nivel principal y respuesta mediante sangría y conexión visual.

**Perfil y CV.** `/profile` ofrece una lectura tipo currículum con hero, contacto, carreras, métricas, trayectoria y actividad. `/profile/edit` permanece en un skeleton integral hasta recibir el perfil completo que coincide con la sesión, aplica ese snapshot una sola vez y evita que un refetch tardío sobrescriba un borrador. La carga de avatar separa almacenamiento binario y asociación GraphQL: la imagen anterior sigue siendo canónica hasta que el guardado y un nuevo `me` confirman la URL. Ambas rutas comparten una única plantilla semántica de una columna para previsualización e impresión. El nodo exportado conserva texto seleccionable y enlaces visibles, permite paginación A4 guiada por contenido y omite avatar, tablas, canvas y adornos que puedan alterar el orden de lectura automatizada. El producto lo denomina **PDF optimizado para ATS** porque su verificación mide extracción, Unicode, orden, páginas, fuentes y enlaces; no se afirma compatibilidad universal con todos los sistemas de seguimiento de candidatos.

**Módulo académico.** `/academic` combina selector de carrera/materia, buscador local, recursos, progreso, exportaciones y acciones autorizadas. Las tarjetas distinguen archivos, enlaces, categoría y versión. El modal de carga utiliza primero el endpoint REST y luego la mutación GraphQL.

**Mensajería.** `/chat` presenta contactos y conversación en paneles. El widget compacto permite continuar una conversación sin abandonar la vista actual. Los badges, mensajes no leídos y avatares se obtienen de datos persistentes; no se muestra presencia “en línea” ficticia.

**Bolsa de Trabajo.** `/empleos` muestra ofertas con skeleton, filtros y estados vacíos. Estudiantes y egresados pueden postularse. `/empleos/mis-ofertas` permite al propietario abrir una oferta, filtrar postulaciones y consultar el Perfil Académico del candidato en un modal antes de actualizar su estado. `/empleos/solicitud` presenta el onboarding B2B con validación accesible, consentimiento y confirmación genérica. El panel Admin agrega **Solicitudes de Empleadores**, con filtros, paginación y acciones confirmadas para aprobar, rechazar o reintentar una entrega pendiente.

**Administración y moderación.** `/admin` reúne usuarios, carreras, materias, publicaciones, comentarios y reportes. Las tablas y acciones respetan jerarquía de roles. Moderar significa ocultar o restaurar con motivo, no editar contenido ajeno. Las acciones críticas presentan confirmación y feedback.

**Sistema visual.** **Clean Tech** y **Tech Noir** son las nomenclaturas internas utilizadas, respectivamente, para el Modo Claro y el Modo Oscuro. Ambos emplean fondos pizarra, neutros matizados y superficies suaves, evitando el blanco y el negro puros como colores principales. Esta decisión arquitectónica responde a criterios modernos de diseño de interfaces: reduce el contraste extremo y la fatiga visual durante sesiones prolongadas sin sacrificar legibilidad. La transición entre temas dura 1300 ms para hacer perceptible el cambio de paleta y se anula por completo ante `prefers-reduced-motion` o impresión. El encabezado mantiene navegación activa por ruta, overflow accesible calculado sobre el ancho real y exclusivamente el isotipo `only-logo` en ambos temas. Las superficies institucionales completas seleccionan `logo-oneitb` en modo claro y la variante `logo-oneitb-dark-mode` en oscuro, sin reconstruir el wordmark mediante texto DOM ni aplicar filtros o bloom. La tipografía principal se obtiene del sistema operativo y Font Awesome 6.7.2 se fija como dependencia oficial exacta y se empaqueta localmente mediante Vite; por ello la identidad y los controles esenciales no dependen de Google Fonts ni de CDNs durante una demostración sin Internet. El error boundary global evita una pantalla en blanco y ofrece recuperación institucional.

---

## 4. ARQUITECTURA

### Diagrama de Componentes

La arquitectura sigue una separación cliente-servidor. React no accede a SQL Server; toda regla de negocio y autorización se ejecuta en una API construida sobre ASP.NET Core 8, como parte de la plataforma .NET 8 (Microsoft, 2023a). Apollo separa operaciones HTTP y suscripciones WebSocket. Los archivos binarios usan un controlador REST, mientras sus metadatos quedan asociados en GraphQL.

**A) Código Mermaid renderizable**

```mermaid
%%{init: {"flowchart": {"curve": "step"}}}%%
flowchart TB
    subgraph CLIENT["Cliente web"]
        UI["React 18 + Tailwind CSS v4"]
        AP["Apollo Client"]
        AUTH["AuthContext + ThemeContext"]
        UI --> AP
        AUTH --> AP
    end

    subgraph EDGE["Capa de entrada"]
        NG["Nginx / Vite Dev Server"]
        HTTP["HTTP Link"]
        WS["GraphQLWsLink"]
    end

    subgraph API["API .NET 8"]
        GQL["HotChocolate GraphQL"]
        REST["UploadController REST"]
        SVC["Servicios de dominio"]
        DL["DataLoaders / Proyecciones"]
        BG["Background Services"]
        EF["Entity Framework Core 8"]
        AUD["Audit Interceptor"]
        GQL --> SVC
        GQL --> DL
        REST --> SVC
        SVC --> EF
        DL --> EF
        BG --> EF
        AUD --> EF
    end

    subgraph DATA["Persistencia e integración"]
        SQL[("SQL Server 2022")]
        REDIS[("Redis Pub/Sub opcional")]
        FILES["Local Development / Cloudinary Production"]
        SMTP["SMTP / Pickup local"]
        SIU["Adaptador SIU mock"]
    end

    AP --> HTTP
    AP --> WS
    HTTP --> NG
    WS --> NG
    NG -->|"/graphql HTTP"| GQL
    NG -->|"/graphql WebSocket"| GQL
    NG -->|"/api/upload"| REST
    EF --> SQL
    GQL <--> REDIS
    SVC --> FILES
    SVC --> SMTP
    SVC --> SIU

    classDef client fill:#dbeafe,stroke:#2563eb,color:#0f172a;
    classDef api fill:#e0f2fe,stroke:#0369a1,color:#0f172a;
    classDef data fill:#dcfce7,stroke:#15803d,color:#0f172a;
    class UI,AP,AUTH,NG,HTTP,WS client;
    class GQL,REST,SVC,DL,BG,EF,AUD api;
    class SQL,REDIS,FILES,SMTP,SIU data;
```

**B) Descripción descriptiva exhaustiva**

El diagrama se divide en cuatro franjas horizontales. La primera, azul claro, representa el navegador: React renderiza la UI, Tailwind aplica el diseño, AuthContext mantiene la frontera de sesión y Apollo Client administra caché y transporte. Desde Apollo salen dos líneas: HTTP para queries/mutations y WebSocket para subscriptions.

La segunda franja contiene Nginx en producción o Vite en desarrollo. Nginx debe mostrarse como proxy de entrada que enruta `/graphql`, `/api/upload` y `/uploads`, además de resolver el fallback de la SPA. La tercera franja, celeste, contiene la API .NET 8. HotChocolate recibe GraphQL; UploadController recibe multipart; los servicios aplican reglas; DataLoaders y proyecciones evitan N+1; los Background Services ejecutan limpieza y recordatorios; Entity Framework persiste; y el interceptor de auditoría registra cambios críticos.

La cuarta franja, verde, representa dependencias: SQL Server como fuente persistente; Redis como bus distribuido opcional; almacenamiento local explícito en Development o Cloudinary fail-closed en Production; SMTP productivo o pickup `.eml` de desarrollo como envío de correo; y el adaptador SIU mock como frontera externa. Redis y Cloudinary deben dibujarse con borde discontinuo por depender del ambiente; SMTP y el provider cloud son obligatorios en el perfil productivo. Todas las flechas hacia datos parten del backend, nunca del navegador.

### Diagrama de Despliegue

El despliegue productivo utiliza imágenes multi-stage y una red de Docker Compose. NGINX expone el frontend y funciona como reverse proxy. La API se comunica por red interna con SQL Server y Redis. Los volúmenes preservan datos y archivos locales. Los secretos se inyectan mediante variables de entorno. Los quality gates del repositorio se automatizan mediante GitHub Actions (GitHub, s. f.-a).

**A) Código Mermaid renderizable**

```mermaid
%%{init: {"flowchart": {"curve": "step"}}}%%
flowchart LR
    USER["Navegador del usuario"] -->|"HTTPS"| WEB["Contenedor Frontend<br/>Nginx Alpine"]

    subgraph HOST["Host Docker / servidor"]
        WEB -->|"/graphql y /api"| API["Contenedor Backend<br/>ASP.NET Core .NET 8"]
        API -->|"TDS / SQL Auth"| DB[("Contenedor SQL Server 2022")]
        API <-->|"Pub/Sub"| REDIS[("Contenedor Redis 7")]
        DB --> SQLVOL[("Volumen SQL")]
        API --> UPVOL[("Volumen uploads local")]
    end

    API -.->|"provider productivo explícito"| CLOUD["Cloudinary"]
    API -.->|"si está configurado"| MAIL["Proveedor SMTP"]
    CI["GitHub Actions<br/>Quality Gates"] -->|"build y tests"| HOST
    OPS["Administrador técnico"] -->|"variables y secretos"| HOST

    classDef external fill:#f1f5f9,stroke:#64748b,color:#0f172a;
    classDef container fill:#dbeafe,stroke:#2563eb,color:#0f172a,stroke-width:2px;
    classDef storage fill:#dcfce7,stroke:#15803d,color:#0f172a;
    class USER,CI,OPS,CLOUD,MAIL external;
    class WEB,API container;
    class DB,REDIS,SQLVOL,UPVOL storage;
    style HOST fill:#f8fafc,stroke:#0f172a,stroke-width:2px
```

**B) Descripción descriptiva exhaustiva**

Se dibuja un rectángulo grande titulado “Host Docker / servidor”. Dentro se ubican cuatro contenedores: Nginx, API .NET, SQL Server y Redis. Nginx y API deben ser azules; SQL Server y Redis, verdes. Fuera del host, a la izquierda, aparece el navegador conectado únicamente a Nginx por HTTPS. Nginx reenvía GraphQL, WebSocket y REST a la API por la red interna. La API se conecta con SQL Server mediante SQL Auth y con Redis mediante Pub/Sub.

Debajo de SQL Server se representa un cilindro “Volumen SQL”; debajo de la API, un cilindro “Volumen uploads local de Development”. A la derecha se muestran Cloudinary y Proveedor SMTP en gris y con flechas discontinuas desde la API: dependen del ambiente y son obligatorios en el perfil productivo, aunque no forman parte del host Docker. En la parte superior o inferior se agregan GitHub Actions, que ejecuta calidad antes del despliegue, y Administrador técnico, que aporta variables y secretos. No debe dibujarse ninguna contraseña dentro del diagrama.

**Configuración por entorno**

| Aspecto | Desarrollo local | Producción preparada |
|---|---|---|
| Frontend | Vite en `localhost:5173` | Nginx Alpine con estáticos y fallback SPA |
| API | Perfil HTTPS local en `localhost:44397` | Contenedor ASP.NET Core detrás de Nginx |
| Base de datos | SQL Server 2022 en Docker | SQL Server 2022 con volumen persistente |
| Pub/Sub | Memoria | Redis si existe connection string; memoria como fallback |
| Archivos | `FileStorage:Provider=Local`, `wwwroot/uploads` | `FileStorage:Provider=Cloudinary`; falla cerrado si falta configuración |
| Correo | Pickup `.eml` local ignorado | SMTP obligatorio con host, puerto y credenciales |
| Secretos | `dotnet user-secrets` | Variables/secret manager del entorno |

---

## 5. GESTIÓN Y PRUEBAS

El ciclo de vida adoptó un enfoque híbrido **Water-Scrum-Fall**, entendido como la combinación de etapas predictivas iniciales, construcción iterativa y cierre formal de entrega (West et al., 2011). El proyecto se inició en 2023 mediante un modelo predictivo en cascada para el relevamiento de requerimientos y el diseño de arquitectura, siguiendo una organización por fases asociada históricamente con el desarrollo secuencial (Royce, 1970). Después de una pausa operativa, la construcción y codificación se retomaron en 2026 bajo el marco de trabajo ágil Scrum, mediante Sprints, objetivos acotados e incrementos funcionales verificables (Schwaber & Sutherland, 2020). Esta evolución hacia prácticas ágiles permitió maximizar la eficiencia, reforzar el control de cambios y mejorar la comodidad operativa del equipo de desarrollo, sin perder los hitos documentales y de aprobación propios del contexto académico.

### Calendarización del proyecto

La calendarización reconstruye una secuencia humana razonable entre el relevamiento inicial y el cierre de calidad. Las actividades se superponen porque arquitectura, backend, frontend, documentación y QA evolucionaron de manera iterativa.

**A) Código Mermaid renderizable**

```mermaid
%%{init: {"theme": "default"}}%%
gantt
    title Calendarización OneITB23 - Abril a cierre de Julio de 2026
    dateFormat YYYY-MM-DD
    axisFormat %d/%m
    excludes weekends

    section Descubrimiento y diseño
    Relevamiento institucional                 :done, a1, 2026-04-15, 2026-04-24
    Requerimientos y alcance                   :done, a2, 2026-04-20, 2026-05-01
    Arquitectura y modelo de dominio           :done, a3, 2026-04-27, 2026-05-08

    section Núcleo técnico
    Autenticación, usuarios y EF Core          :done, b1, 2026-05-04, 2026-05-15
    GraphQL, autorización y administración     :done, b2, 2026-05-11, 2026-05-29
    Base React, Apollo y sistema visual        :done, b3, 2026-05-11, 2026-05-29

    section Módulos funcionales
    Muro social, comentarios y multimedia      :done, c1, 2026-05-18, 2026-06-12
    Mensajería y notificaciones en tiempo real :done, c2, 2026-05-28, 2026-06-16
    Perfil, CV, carreras y materias            :done, c3, 2026-06-01, 2026-06-23
    Recursos, progreso y adaptador SIU         :done, c4, 2026-06-08, 2026-06-26
    Moderación y auditoría                     :done, c5, 2026-06-15, 2026-07-01
    Bolsa de Trabajo y postulaciones           :done, c6, 2026-06-25, 2026-07-06

    section Hardening y entrega
    Docker, seguridad y observabilidad         :done, d1, 2026-06-29, 2026-07-08
    Pruebas y remediación de auditoría          :done, d2, 2026-07-02, 2026-07-27
    Aceptación operacional local               :done, d3, 2026-07-24, 2026-07-28
    Normalización documental y memoria final   :done, d4, 2026-07-08, 2026-07-28
    Maquetación DOCX PDF y ensayo de defensa   :active, d5, 2026-07-28, 2026-07-31
```

**B) Descripción descriptiva exhaustiva**

El gráfico debe ocupar una página horizontal. El eje superior comienza el 15 de abril de 2026 y finaliza el 31 de julio de 2026. Se agrupa en cuatro bandas: Descubrimiento y diseño, Núcleo técnico, Módulos funcionales, y Hardening y entrega. Cada banda utiliza un tono diferente: gris azulado para análisis, azul para núcleo, verde para módulos y naranja para cierre.

Relevamiento, requerimientos y arquitectura se superponen entre la segunda mitad de abril y la primera semana de mayo. Autenticación, GraphQL y base React comienzan en mayo. El muro es la barra funcional más extensa; mensajería, perfil y módulo académico se desarrollan en paralelo. Moderación comienza cuando el núcleo social ya es utilizable. La Bolsa de Trabajo aparece entre fines de junio y comienzos de julio. Docker, seguridad, remediaciones 186-193, aceptación operacional y documentación se solapan durante julio. La última barra debe mostrarse como actividad de cierre en curso: comprende exportación de diagramas, maquetación APA, auditoría del PDF y ensayo. La superposición comunica iteración realista y no ejecución lineal instantánea.

### Gráficos de gestión detallada para anexos

Por su densidad temporal y cantidad de relaciones, el **Cronograma Macro en Cascada**, la **Red PERT** y el **Calendario Scrum** deben maquetarse como gráficos independientes y adjuntarse en los Anexos. Las especificaciones siguientes constituyen el guion obligatorio para su recreación en Mermaid, Draw.io u otra herramienta de modelado, sin sustituir el Gantt ejecutivo incluido en esta sección.

#### Cronograma Macro en Cascada (2023-2026)

El gráfico debe adoptar el formato de tabla temporal o Gantt horizontal, con un eje dividido por trimestres desde `Q1 2023` hasta `Q3 2026`. Debe mostrar cuatro filas de fase, una leyenda cromática y líneas verticales que separen años y trimestres:

1. **Fase 1 - Planificación y Diseño (`Q1-Q2 2023`):** comprende relevamiento institucional, identificación de actores, especificación inicial de requerimientos, delimitación del alcance, diseño de arquitectura y primera versión del modelo de dominio. Debe representarse en azul institucional.
2. **Fase 2 - Standby del proyecto (`Q3 2023-Q4 2025`):** representa la pausa operativa sin construcción activa. Debe ocupar de forma continua los diez trimestres involucrados, utilizar gris neutro y mostrar una trama discontinua para diferenciarla de una fase productiva.
3. **Fase 3 - Ejecución Ágil por Módulos (`Q1-Q2 2026`):** incluye reactivación técnica, desarrollo por Sprints, backend, frontend, módulos social y académico, mensajería, moderación y Bolsa de Trabajo. Debe representarse en verde y contener marcadores internos por incremento funcional.
4. **Fase 4 - Testing, Ajustes APA y Defensa (`Q3 2026`):** incluye regresión, hardening, normalización UML, referencias APA, maquetación y preparación de la defensa. Debe representarse en naranja y finalizar con un hito romboidal denominado “Defensa académica”.

Las cuatro fases deben presentarse en orden cronológico. La transición de la Fase 1 a la Fase 2 y de la Fase 2 a la Fase 3 debe indicarse mediante hitos de pausa y reactivación, evitando que el período de standby se interprete como esfuerzo de desarrollo continuo.

#### Calendario Scrum (Sprint de dos semanas)

El gráfico debe representarse como una grilla de cinco columnas, de lunes a viernes, y dos filas principales, una por semana. Cada celda debe identificar ceremonia, duración cuando corresponda y tipo de trabajo:

| Período | Lunes | Martes | Miércoles | Jueves | Viernes |
|---|---|---|---|---|---|
| **Semana 1** | Sprint Planning de 4 horas y definición del Sprint Goal | Daily Standup de 15 minutos y desarrollo Backend/API | Daily Standup de 15 minutos y desarrollo Backend/API | Daily Standup de 15 minutos y desarrollo Backend/API | Refinamiento del Product Backlog |
| **Semana 2** | Daily Standup, desarrollo Frontend React y pruebas unitarias | Daily Standup, desarrollo Frontend React y pruebas unitarias | Daily Standup, desarrollo Frontend React y pruebas unitarias | Testing QA y Sprint Review con demostración funcional | Sprint Retrospective y merge a la rama principal |

Las ceremonias deben diferenciarse mediante color violeta, el desarrollo backend mediante azul, el frontend mediante celeste, las pruebas mediante naranja y el cierre mediante verde. Una flecha continua debe recorrer las diez celdas para comunicar la progresión del Sprint, mientras que un marcador al final del segundo viernes debe identificar el incremento potencialmente entregable.

#### Diagrama de Red PERT (Ruta Crítica)

La red debe utilizar nodos rectangulares divididos en tres campos: **Inicio Temprano (IT)** en la esquina superior izquierda, **Fin Temprano (FT)** en la esquina superior derecha y **Duración** en la franja inferior. Los tiempos se expresan en semanas desde el inicio del proyecto:

| Nodo | Actividad | IT | FT | Duración |
|---|---|---:|---:|---:|
| A | Relevamiento Institucional | 0 | 2 | 2 semanas |
| B | Diseño DER y Arquitectura | 2 | 5 | 3 semanas |
| C | Setup de Entorno y CI/CD | 5 | 6 | 1 semana |
| D | API Auth & Core | 6 | 9 | 3 semanas |
| E | UI React & Módulo Social | 9 | 13 | 4 semanas |
| F | Bolsa de Trabajo | 9 | 11 | 2 semanas |
| G | QA y Regresión | 13 | 15 | 2 semanas |
| H | Documentación APA y Despliegue | 15 | 16 | 1 semana |

La precedencia debe comenzar con `A -> B -> C -> D`. Desde `D` se abren dos ramas paralelas: `D -> E` y `D -> F`. Ambas convergen en `G`, pero `F` dispone de dos semanas de holgura porque finaliza antes que `E`; finalmente, `G -> H` cierra la red. La **Ruta Crítica**, destacada mediante flechas rojas de mayor grosor, debe marcar explícitamente `A -> B -> C -> D -> E -> G -> H`, con una duración total de 16 semanas. Las conexiones `D -> F -> G` deben mostrarse en gris para indicar que la rama no controla la fecha final mientras conserve su holgura.

### Pruebas

La estrategia combina análisis estático, pruebas automatizadas, compilación, validación de esquema, migraciones, smoke tests y regresión manual. La compilación por sí sola no se considera evidencia suficiente de un flujo GraphQL o de navegador.

**Pirámide de validación aplicada**

1. **Pruebas unitarias backend:** xUnit.net (xUnit.net, s. f.) para servicios académicos, notificaciones, autenticación, moderación, almacenamiento y utilidades.
2. **Pruebas de integración GraphQL:** ejecución mediante el executor real de HotChocolate con contexto de prueba.
3. **Pruebas de componentes frontend:** Vitest (Vitest, s. f.) y React Testing Library (Testing Library, 2024) para estados vacío, carga, éxito e interacción.
4. **Builds de entrega:** compilación .NET Release y bundle Vite de producción.
5. **Validación de persistencia:** migraciones aplicadas y comprobación `has-pending-model-changes`.
6. **Smoke runtime:** API conectada a SQL Server Docker y operación GraphQL `{ __typename }` con HTTP 200.
7. **Regresión manual:** navegación autenticada, responsive, multimedia, moderación, académico, empleos e impresión.

**Evidencia automatizada de cierre disponible**

Los baselines siguientes corresponden al worktree integrado consolidado en `2f20bce`.
Todavía no reemplazan el gate integral sobre el SHA candidato definitivo: el árbol debe
congelarse, quedar limpio y repetir los controles sin cambios posteriores.

| Control | Resultado documentado más reciente |
|---|---|
| Pruebas backend | 234/234 aprobadas; incluye bordes 0/1/15/16 del feed, provider explícito, storage, uploads, registro, academia, privacidad y carrera estudiantil única |
| Pruebas frontend | 251/251 aprobadas; incluye paginación observable, Strict Mode, aislamiento por carrera, hidratación/avatar, navegación adaptativa, branding institucional, tema accesible, CV semántico y transición Microsoft |
| Build backend Release | 0 errores y 0 advertencias en Spec 215 |
| Build frontend Vite | 562 módulos; 603 ms; 0 errores en Spec 215 |
| Modelo EF Core | Sin cambios pendientes respecto de migraciones |
| Sesión y roles | Reemplazo Estudiante -> Moderador sin fuga de identidad, caché ni transporte |
| Redis local | Entrega exacta entre dos proveedores Hot Chocolate y aislamiento de topic |
| SMTP local | Tres mensajes capturados e inspeccionados mediante Mailpit |
| Base demo e integridad | Backup verificado; 34 migraciones; seed doble estable; cero violaciones |
| Runtime GraphQL | Seis roles; feed, académico, chat, notificaciones, empleos, administración, moderación y upload aprobados |
| Microsoft Entra | 47 mutaciones en schema; login institucional real aceptado hasta onboarding/muro; restan cancelación/error, logout y segunda cuenta |

**Comandos canónicos de verificación**

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"

Set-Location "FrontEnd/OneItb-FE"
npm.cmd ci
npm.cmd run test -- --run
npm.cmd run build
```

**Controles de seguridad comprobables**

- JWT con expiración e intercepción de sesión vencida.
- Hash BCrypt y bloqueo temporal por intentos fallidos.
- Autorización por rol, propiedad y alcance académico en backend.
- Rate limiting con respuesta HTTP 429.
- Límite de profundidad GraphQL y paginación defensiva.
- Protección SSRF en previsualización de enlaces.
- Validación de tipo, cantidad y tamaño de archivos.
- Security headers, HSTS en producción y política de contenido.
- Limpieza de caché Apollo en cambio de sesión.
- Correlation ID, errores sanitizados y auditoría persistente.
- Restricción de borrado para relaciones EF Core.

**Riesgos residuales y criterio de honestidad técnica**

La Spec 201 cerró tres brechas de autorización/privacidad: registro público Student-only
con dominio server-side, Profesor acotado a carreras vinculadas y Follow sin capacidad de
revelar perfiles privados. También retiró el trust bypass SQL de la plantilla rastreada y
agregó probes diferenciados. Persisten límites de destino que no bloquean una demostración
local controlada, pero sí una afirmación de producción pública:

- `GAP-FILE-01`: `/uploads` sirve archivos estáticos sin autorización por recurso; un piloto externo requiere storage privado, URLs firmadas o un endpoint autorizado.
- `GAP-INFRA-01`: la configuración rastreada exige una cadena segura, pero su cierre requiere certificado CA verificable y smoke TLS en el SQL real.
- `GAP-OPS-01`: existen correlation ID, logs estructurados y `/health/live`/`ready`; todavía no existe una plataforma central de logs, métricas, trazas y alertas aceptada en un ambiente remoto.

- La regresión visual final debe repetirse en el navegador y la resolución que se utilizarán durante la defensa. Estudiante, Profesor, Egresado, Administrador y Empleador fueron recorridos en la aceptación operacional; resta documentar el recorrido visual de Moderador.
- Redis fue verificado localmente entre proveedores independientes. Falta el handshake WebSocket completo a través de la red con dos navegadores aislados.
- SMTP local fue verificado con Mailpit. SMTP público, Redis administrado y Cloudinary deben probarse con secretos reales antes de declarar validación productiva.
- La sincronización SIU de calificaciones es simulada y la validación de matrícula ITB/SIU permanece como puerto futuro; el modo vigente es `SelfDeclared`, no devuelve inscripciones ficticias y ninguna de las dos fronteras debe presentarse como conexión oficial.
- Microsoft Entra completó login real, callback, onboarding y acceso al muro con una
  cuenta institucional. Restan cancelación/error, logout y aislamiento con una segunda
  cuenta antes de cerrar su aceptación integral.
- Open Graph para crawlers externos puede requerir renderizado del lado servidor para una previsualización universal.
- El costo BCrypt debe medirse nuevamente sobre el hardware objetivo antes de un despliegue público.

**Checklist manual previo a la defensa**

- [ ] Consolidar las Specs 198-201, identificar el SHA candidato y confirmar `git status` limpio.
- [ ] Ejecutar `scripts/validate-predefense.ps1`.
- [ ] Ejecutar `scripts/validate-local-infrastructure.ps1` y comprobar que libere contenedores y puertos.
- [ ] Ejecutar `docker compose up -d` y verificar salud de SQL Server.
- [x] Reconstruir la base demo desde migraciones, ejecutar dos seeds y verificar integridad (Spec 196).
- [ ] Ejecutar `scripts/validate-demo-database.ps1` nuevamente en el equipo de defensa.
- [ ] Iniciar API y frontend desde el runbook canónico.
- [ ] Probar registro, login, logout y cambio entre dos cuentas sin fuga de caché.
- [ ] Crear una publicación con imagen, PDF y YouTube; comentar, reaccionar y abrir notificación.
- [ ] Probar chat con dos sesiones y badges de mensajes no leídos.
- [ ] Recorrer perfil público/privado, edición, avatar e impresión del CV.
- [ ] Cargar y consultar un recurso académico; revisar progreso y exportación.
- [ ] Publicar una oferta, postularse y cambiar estado desde el propietario.
- [ ] Recorrer administración, reportes, ocultamiento y restauración con auditoría.
- [ ] Verificar responsive, tema claro/oscuro y consola sin errores propios.

### Plan de cierre y estimación de esfuerzo

El estado defendible del sistema es **Release Candidate académico, Feature Complete core
y Code Freeze operativo local**. La preparación restante se divide en tareas
controlables y gates externos. El detalle operativo y el seguimiento vigente se
mantienen en `docs/project_docs/ROADMAP.md`.

**Cierre técnico y demostración**

| Actividad | Estimación | Resultado esperado |
|---|---:|---|
| Consolidar el SHA candidato y limpiar el repositorio | 50-85 min | Rama integrada, SHA remoto e inmutable, sin artefactos accidentales |
| Ejecutar los tres gates automatizados de predefensa | 75-105 min | Tests, builds, EF, base demo, Redis, Mailpit y cleanup en verde |
| Regresión manual por seis roles | 3-4 h | Evidencia visual y consola limpia |
| Chat y notificaciones con dos sesiones aisladas | 60-90 min | WebSocket, badges, lectura y aislamiento comprobados |
| Consolidar evidencia y congelar el corte | 45-60 min | Roadmap, auditoría y memoria alineados al mismo SHA |

**Producción documental**

| Actividad | Estimación | Resultado esperado |
|---|---:|---|
| Confirmar portada, metadatos y responsables | 10-20 min | Datos oficiales revisados y sin marcadores pendientes |
| Exportar los diez diagramas Mermaid renderizables | 2-3 h | SVG/PNG legibles, numerados y revisados visualmente |
| Recrear DER y tres gráficos de gestión en Draw.io | 4-6 h | Fuentes editables y exportaciones consistentes |
| Convertir a DOCX y aplicar APA 7 | 3-4 h | Documento editable con índice, estilos y figuras |
| Auditar y exportar PDF final | 2-3 h | PDF revisado página por página |
| Preparar guion, respaldo y ensayo | 4-5 h | Exposición base de 22-25 minutos dentro del rango oficial de 20-30 minutos, con contingencia |

El cierre técnico y académico pendiente demanda aproximadamente **23 horas 35 minutos
a 34 horas efectivas**, equivalentes a **cuatro jornadas concentradas**. Los proveedores públicos,
la aceptación Microsoft Entra, benchmark BCrypt y antivirus/CDR requieren entre **17 y 37 horas técnicas**
adicionales, además de tiempos de aprobación; no bloquean la defensa controlada ni deben
confundirse con funcionalidades ya verificadas.

---

## 6. MANUAL DE USUARIO

Esta sección constituye el Manual de Usuario requerido para la entrega académica. De
acuerdo con la confirmación del presidente de mesa, no se presenta como documento
separado porque sus flujos se encuentran integrados en la memoria técnica general.

### 6.1 Acceso y registro

1. Abrir la página principal de OneITB23.
2. Seleccionar **Registrarse**.
3. Completar nombre, apellido, correo institucional, contraseña y confirmación.
4. Seleccionar exactamente una carrera; el alta pública asigna el rol `Estudiante`.
5. Confirmar el registro y volver al inicio de sesión.
6. Ingresar correo y contraseña. Si se supera el límite de intentos fallidos, esperar el período de bloqueo informado.

### 6.2 Navegación general

El encabezado permite acceder al muro, módulo académico, mensajes, empleos, notificaciones y menú de usuario. Un cálculo basado en el ancho real mantiene visibles todos los destinos que entran y mueve únicamente el excedente a un menú compacto, sin depender de un breakpoint fijo. El isotipo `only-logo`, sin wordmark adicional y estable en ambos temas, regresa al inicio. Desde el menú de usuario se accede al perfil, edición, cambio de tema y cierre de sesión.

### 6.3 Perfil y currículum

1. Abrir **Perfil** para consultar la vista pública propia.
2. Seleccionar **Editar perfil**.
3. Actualizar biografía, contacto, redes, avatar y carreras.
4. Completar experiencia, educación, proyectos, habilidades e idiomas.
5. Activar o desactivar **Perfil público** según la privacidad deseada.
6. Guardar; la aplicación vuelve a la vista de perfil.
7. Utilizar **PDF optimizado para ATS** para abrir la plantilla formal compartida y generar
   el archivo desde el navegador. Comprobar que el texto pueda seleccionarse, buscarse y
   copiarse en orden antes de enviarlo a una organización.

### 6.4 Muro y publicaciones

1. Acceder a **Muro**.
2. Elegir carrera y materia dentro de las inscripciones habilitadas.
3. Escribir título y contenido.
4. Adjuntar archivos o pegar enlaces de YouTube. El total no puede superar diez archivos ni 15 MB.
5. Elegir una portada cuando existan varios medios.
6. Seleccionar **Publicar**.
7. En las tarjetas se puede reaccionar, comentar, responder, mencionar, compartir enlace o reportar.
8. El autor puede editar o desactivar su contenido. Moderadores y administradores pueden ocultarlo con motivo, sin alterar el texto original.

### 6.5 Comentarios y notificaciones

Los comentarios principales admiten respuestas. Una respuesta a otra respuesta se mantiene en el segundo nivel e incorpora una mención al destinatario. Las notificaciones agrupadas muestran solo pendientes no leídos y navegan a la publicación o comentario correspondiente. Las preferencias se configuran desde el panel de notificaciones.

### 6.6 Mensajería privada

1. Abrir **Mensajes** o el widget flotante.
2. Seleccionar un contacto permitido.
3. Escribir y enviar el mensaje.
4. Los nuevos mensajes llegan en tiempo real y quedan persistidos.
5. Al abrir la conversación se actualiza el estado de lectura. La aplicación no informa presencia en línea si no dispone de una señal real.

### 6.7 Módulo académico

1. Abrir **Académico**.
2. Elegir carrera y materia.
3. Consultar recursos por título, categoría y versión.
4. Descargar archivos o abrir enlaces autorizados.
5. Consultar progreso y notas propias.
6. Exportar CSV o imprimir una constancia cuando la opción esté disponible.
7. Profesores y administradores pueden cargar recursos o asignar progreso según permisos.

### 6.8 Bolsa de Trabajo

**Empresa sin cuenta**

1. Desde la portada, seleccionar **Soy empresa / Publicar oferta**.
2. Completar empresa, CUIT, contacto, correo, teléfono y consentimiento.
3. Enviar la solicitud. La confirmación no revela si el correo o CUIT ya estaban registrados.
4. Esperar la revisión administrativa y, si se aprueba, utilizar el enlace de acceso recibido por correo.

**Estudiante o egresado**

1. Abrir **Empleos**.
2. Revisar ofertas activas.
3. Seleccionar **Postularse**; el sistema impide duplicados.
4. Consultar el estado de la postulación.

**Empleador**

1. Abrir **Empleos** y publicar una oferta.
2. Ingresar a **Mis ofertas**.
3. Seleccionar una oferta y filtrar postulaciones.
4. Abrir el **Perfil Académico** del candidato.
5. Cambiar el estado a pendiente, revisado o rechazado. El sistema intenta enviar el aviso configurado sin revertir la operación si el proveedor de correo no está disponible.

### 6.9 Administración y moderación

El Administrador puede gestionar usuarios, catálogo académico, recursos, ofertas y auditoría. En **Solicitudes de Empleadores** filtra solicitudes pendientes, aprobadas o rechazadas; revisa la información empresarial; confirma la aprobación o el rechazo; y consulta el estado real de entrega del correo. La aprobación crea solo el rol `Empleador` y los reintentos no duplican cuentas. Las cuentas administradoras no pueden degradarse ni desactivarse desde el flujo ordinario. El Moderador revisa reportes, aplica silenciamientos temporales y oculta o restaura contenido con motivo. Ninguno puede editar el texto de otro usuario.

### 6.10 Cierre de sesión

Seleccionar **Salir** desde el menú de usuario. La operación elimina la sesión local y limpia la caché de Apollo, mensajes y notificaciones en memoria. En equipos compartidos se recomienda cerrar también la ventana del navegador.

---

## 7. ANEXOS

### 7.1 Repositorio de código fuente

- Repositorio principal: [https://github.com/fagdiaz/OneITB](https://github.com/fagdiaz/OneITB)
- El acceso, las ramas y los permisos dependen de la configuración del repositorio al momento de la evaluación.

### 7.2 Documentación técnica canónica

| Documento | Propósito |
|---|---|
| `docs/project_docs/ROADMAP.md` | Estado verificable, prioridades y brechas vigentes. |
| `docs/project_docs/scope-and-requirements.md` | Alcance y requerimientos consolidados. |
| `docs/project_docs/architecture-and-design.md` | Arquitectura, decisiones y contratos técnicos. |
| `docs/audit/RUNBOOK_DEV.md` | Puesta en marcha y validación local. |
| `docs/audit/DEVELOPMENT_LOG.md` | Historial técnico cronológico inverso por especificación. |
| `docs/audit/FINAL_AUDIT_REPORT.md` | Auditoría vigente para cierre institucional. |
| `docs/audit/DOCUMENTATION_STATUS.md` | Inventario y estado de la documentación. |
| `docs/academic/` | Material académico, requerimientos, diseño y diagramas formales. |

### 7.3 Estructura principal del repositorio

```text
OneITB23/
|-- API Graphql/
|   |-- Data/                 # DbContext, migraciones y seeding
|   |-- Entities/             # Entidades de dominio
|   |-- OneITB/               # API .NET, GraphQL, REST y servicios
|   `-- Tests/Services.Tests/ # xUnit e integración GraphQL
|-- FrontEnd/OneItb-FE/       # React, Apollo, Vite y Tailwind
|-- docs/                     # Documentación canónica y entrega final
|-- specs/                    # Especificaciones y evidencia Spec Kit
|-- docker-compose.yml        # SQL Server para desarrollo
|-- docker-compose.prod.yml   # Orquestación productiva
`-- .github/workflows/        # Quality gates de CI
```

### 7.4 Puesta en marcha local resumida

1. Instalar .NET SDK 8, una versión compatible de Node.js (OpenJS Foundation, s. f.), Docker Desktop y Git (Git Project, s. f.).
2. Configurar la cadena de SQL Server mediante `dotnet user-secrets`; no guardar contraseñas en `appsettings`.
3. Iniciar SQL Server con Docker Compose.
4. Aplicar migraciones EF Core.
5. Iniciar backend con el perfil documentado.
6. Ejecutar `npm ci` y `npm run dev` en el frontend.
7. Verificar `/graphql`, login y el flujo objetivo.

Los comandos, variables y resolución de problemas se mantienen en `docs/audit/RUNBOOK_DEV.md`. Ese documento prevalece sobre instrucciones antiguas o notas históricas.

### 7.5 Migraciones y datos de demostración

Las migraciones se generan desde el proyecto `Data` utilizando `GraphQL.csproj` como startup project. El seeder empresarial es idempotente, se ejecuta por fases y limpia el Change Tracker entre bloques para limitar memoria y evitar conflictos de identidad. Las credenciales demo se obtienen desde configuración segura (`Seed:DemoPassword`) y no deben fijarse en el repositorio.

Para la defensa se definió una base demo canónica y reproducible. El procedimiento
`scripts/reset-demo-database.ps1` identifica de forma estricta el SQL Server Docker
local, verifica un backup antes de cualquier eliminación, reconstruye el esquema desde
las 34 migraciones y exige que dos ejecuciones consecutivas del seeder produzcan el
mismo inventario. El grafo resultante contiene 15 cuentas/usuarios, 9 carreras
institucionales, 6 materias de muestra, recursos y progreso académico, CV relacional,
60 publicaciones, 80 comentarios, 240 reacciones, 280 mensajes, 127 notificaciones,
4 ofertas y 6 postulaciones.

La aceptación se completa con `scripts/validate-demo-database.ps1`, que controla
integridad referencial, exclusividad de adjuntos, profundidad de comentarios, claves
canónicas, estado de lockout, autenticación de los seis roles y contratos críticos. El
proceso es finito y elimina sus fixtures y servidor temporal. El reset conserva uploads
y volumen Docker; los backups se almacenan en una ruta ignorada por Git. La operación
está prohibida contra bases externas o productivas.

### 7.6 Trazabilidad metodológica

El proyecto utiliza Spec Kit. Cada intervención relevante dispone, cuando corresponde, de `spec.md`, `plan.md`, `tasks.md` y evidencia. La definición de terminado exige pruebas, compilación, actualización del roadmap y una única entrada nueva en el Development Log. Una tarea marcada como implementada no equivale automáticamente a verificada: la evidencia de runtime tiene prioridad.

### 7.7 Glosario

| Término | Definición |
|---|---|
| Apollo Client | Cliente GraphQL del frontend, responsable de transporte, caché y suscripciones. |
| BCrypt | Algoritmo utilizado para almacenar hashes de contraseña. |
| DataLoader | Patrón para agrupar y cachear cargas relacionadas, mitigando consultas N+1. |
| EF Core | ORM de .NET utilizado para mapear el dominio y SQL Server. |
| GraphQL | Contrato principal de consultas, mutaciones y suscripciones de negocio. |
| Hot Chocolate | Implementación de servidor GraphQL utilizada en .NET. |
| JWT | Token firmado que representa la sesión autenticada. |
| N+1 | Problema de rendimiento causado por ejecutar una consulta adicional por cada elemento relacionado. |
| Soft delete | Baja lógica que conserva el registro y lo excluye de consultas ordinarias. |
| WebSocket | Canal persistente utilizado para mensajes y notificaciones en tiempo real. |

### 7.8 Declaración de estado para la defensa

OneITB23 se presenta como un **Release Candidate académico**, con **Feature Complete del
core** y **Code Freeze operativo local**. Dispone de documentación canónica, pruebas
automatizadas, infraestructura de aceptación reproducible y una ruta controlada de
ejecución. Esta denominación es deliberadamente más precisa que “producción completa”:
reconoce que el software está preparado para la defensa y que los proveedores externos
todavía requieren credenciales y smokes en el ambiente de destino.

La base de demostración forma parte de ese Release Candidate: no depende de datos
históricos del equipo, se puede recuperar desde un backup verificado y cuenta con
credenciales no versionadas y un grafo relacional estable para los seis roles.

La presentación debe diferenciar con precisión:

- **Implementado:** existe código integrado y compilable.
- **Verificado:** existe evidencia de prueba o runtime sobre el flujo indicado.
- **Condicional:** requiere variables, secretos o proveedor externo.
- **Pendiente de validación manual:** requiere recorrido visual final en navegador.

Al corte del 5 de agosto de 2026, SMTP con Mailpit y Redis local poseen evidencia de
integración; no equivalen a validación de proveedor público. La aceptación Microsoft
Entra en el tenant institucional, Cloudinary productivo, Redis administrado, SMTP
público y el handshake WebSocket con dos navegadores
permanecen identificados como gates. Esta distinción evita sobreafirmaciones, facilita
preguntas técnicas y demuestra una gestión profesional de riesgos y evidencia.

### 7.9 Condiciones oficiales de presentación y entrega

La mesa evaluatoria comienza el **viernes 7 de agosto de 2026 a las 09:00**. El aula o
laboratorio será informado ese mismo día. La instancia comprende exposición,
demostración funcional y preguntas de los integrantes de la mesa. La duración oficial
de la exposición es de **20 a 30 minutos** y puede extenderse por las preguntas o por la
cantidad de integrantes. Para controlar el tiempo se planifica internamente una
presentación base de **22 a 25 minutos**.

La entrega y el equipamiento previstos son:

1. una copia impresa de esta memoria técnica, preferentemente a color, anillada o
   encuadernada;
2. presentación en PowerPoint, PDF o formato equivalente;
3. notebook propia con OneITB23 instalado, configurado y probado, además del cargador;
4. adaptador HDMI compatible con la notebook, aun cuando la institución normalmente
   disponga de adaptadores;
5. repositorio actualizado y un respaldo digital del sistema, la documentación y la
   presentación en un pendrive que no debe entregarse;
6. computadora institucional como alternativa de contingencia.

No existe una plantilla institucional adicional. Como recomendación operativa se prevé
llegar entre las 08:15 y las 08:30 para confirmar aula, proyección y conectividad antes
del inicio de la mesa.

---

## 8. REFERENCIAS BIBLIOGRÁFICAS

La selección, el orden y la presentación de las referencias siguen los criterios de la séptima edición del manual de la American Psychological Association (2020). Se priorizaron especificaciones normativas, publicaciones originales y documentación oficial de cada tecnología.

> **Criterio de maquetación para Word/PDF:** aplicar doble interlineado y sangría francesa de 1,27 cm a cada referencia. Mantener el orden alfabético y no agregar viñetas ni numeración.

American Psychological Association. (2020). *Publication manual of the American Psychological Association* (7th ed.). https://doi.org/10.1037/0000165-000

Apollo GraphQL. (s. f.). *Introduction to Apollo Client*. Recuperado el 18 de julio de 2026, de https://www.apollographql.com/docs/react

ChilliCream. (s. f.). *Hot Chocolate v14: Server overview*. Recuperado el 18 de julio de 2026, de https://chillicream.com/docs/hotchocolate/v14/server/

Cloudinary. (2026, 14 de junio). *Programmatically uploading images, videos, and other files*. https://cloudinary.com/documentation/upload_images

Docker, Inc. (s. f.). *What is Docker?* Recuperado el 18 de julio de 2026, de https://docs.docker.com/get-started/docker-overview/

Evans, E. (2003). *Domain-driven design: Tackling complexity in the heart of software*. Addison-Wesley. https://www.domainlanguage.com/ddd/

Fette, I., & Melnikov, A. (2011). *The WebSocket protocol* (RFC 6455). Internet Engineering Task Force. https://doi.org/10.17487/RFC6455

Fielding, R. T. (2000). *Architectural styles and the design of network-based software architectures* [Tesis doctoral, University of California, Irvine]. https://ics.uci.edu/~fielding/pubs/dissertation/top.htm

Git Project. (s. f.). *About Git*. Recuperado el 18 de julio de 2026, de https://git-scm.com/about

GitHub. (s. f.-a). *GitHub Actions documentation*. Recuperado el 18 de julio de 2026, de https://docs.github.com/en/actions

GitHub. (s. f.-b). *GitHub Spec Kit*. Recuperado el 18 de julio de 2026, de https://github.github.com/spec-kit/index.html

GraphQL Foundation. (s. f.). *DataLoader* [Código fuente]. GitHub. Recuperado el 18 de julio de 2026, de https://github.com/graphql/dataloader

GraphQL Foundation. (2021). *GraphQL specification: October 2021 edition*. https://spec.graphql.org/October2021/

Hardt, D. (Ed.). (2012). *The OAuth 2.0 authorization framework* (RFC 6749). Internet Engineering Task Force. https://doi.org/10.17487/RFC6749

Instituto Tecnológico Beltrán. (s. f.). *Instituto Tecnológico Beltrán*. Recuperado el 5 de agosto de 2026, de https://www.ibeltran.com.ar/

Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)* (RFC 7519). Internet Engineering Task Force. https://doi.org/10.17487/RFC7519

Klensin, J. (2008). *Simple Mail Transfer Protocol* (RFC 5321). Internet Engineering Task Force. https://doi.org/10.17487/RFC5321

Mermaid. (s. f.). *About Mermaid*. Recuperado el 18 de julio de 2026, de https://mermaid.js.org/intro/

Microsoft. (2023a, 14 de noviembre). *Announcing .NET 8*. .NET Blog. https://devblogs.microsoft.com/dotnet/announcing-dotnet-8/

Microsoft. (2023b, 22 de noviembre). *What's new in EF Core 8*. Microsoft Learn. https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-8.0/whatsnew

Microsoft. (2025, 8 de septiembre). *What's new in SQL Server 2022*. Microsoft Learn. https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2022

Microsoft. (s. f.). *OAuth 2.0 authorization code flow on the Microsoft identity platform*. Recuperado el 30 de julio de 2026, de https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow

Mozilla. (s. f.). *PDF.js*. Recuperado el 18 de julio de 2026, de https://mozilla.github.io/pdf.js/

Mozilla. (2025, 11 de julio). *SPA (single-page application)*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Glossary/SPA

NGINX, Inc. (s. f.). *Beginner's guide*. Recuperado el 18 de julio de 2026, de https://nginx.org/en/docs/beginners_guide.html

OpenJS Foundation. (s. f.). *About Node.js*. Recuperado el 18 de julio de 2026, de https://nodejs.org/en/about

OWASP Foundation. (s. f.). *GraphQL cheat sheet*. Recuperado el 18 de julio de 2026, de https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html

Provos, N., & Mazières, D. (1999). A future-adaptable password scheme. En *Proceedings of the 1999 USENIX Annual Technical Conference*. USENIX Association. https://www.usenix.org/conference/1999-usenix-annual-technical-conference/future-adaptable-password-scheme

React Team. (s. f.). *Component: Catching rendering errors with an error boundary*. Recuperado el 18 de julio de 2026, de https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

React Team. (2022, 29 de marzo). *React v18.0*. https://react.dev/blog/2022/03/29/react-v18

Redis Ltd. (s. f.). *Get started with Redis Open Source*. Recuperado el 18 de julio de 2026, de https://redis.io/docs/latest/get-started/

Royce, W. W. (1970). Managing the development of large software systems. En *Proceedings of IEEE WESCON* (pp. 1-9). https://www.praxisframework.org/files/royce1970.pdf

Schwaber, K., & Sutherland, J. (2020). *The Scrum guide: The definitive guide to Scrum: The rules of the game*. https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf

Sistema de Información Universitaria. (s. f.). *SIU-Guaraní: Módulo de gestión académica*. Recuperado el 18 de julio de 2026, de https://www.siu.edu.ar/siu-guarani

Testing Library. (2024, 3 de junio). *React Testing Library*. https://testing-library.com/docs/react-testing-library/intro/

Vite Team. (2026, 12 de marzo). *Vite 8.0 is out!* https://vite.dev/blog/announcing-vite8

Vitest. (s. f.). *Getting started*. Recuperado el 18 de julio de 2026, de https://vitest.dev/guide/

Wathan, A. (2025, 22 de enero). *Tailwind CSS v4.0*. Tailwind CSS. https://tailwindcss.com/blog/tailwindcss-v4

West, D., Gilpin, M., Grant, T., & Anderson, A. (2011, 26 de julio). *Water-Scrum-Fall is the reality of Agile for most organizations today*. Forrester Research. https://www.forrester.com/report/WaterScrumFall-Is-The-Reality-Of-Agile-For-Most-Organizations-Today/RES60109

xUnit.net. (s. f.). *Home*. Recuperado el 18 de julio de 2026, de https://xunit.net/
