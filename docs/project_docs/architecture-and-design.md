# Arquitectura y diseno de OneITB23

**Ultima alineacion con codigo**: 2026-06-29

## 1. Stack vigente

| Capa | Tecnologia |
|---|---|
| Backend | .NET 8 / ASP.NET Core |
| API de negocio | HotChocolate GraphQL 14.2.0 |
| Persistencia | Entity Framework Core 8.0.6 / SQL Server 2022 Docker local / Azure SQL Free Tier objetivo |
| Frontend Web | React 18 / Apollo Client 3.7 / Vite 8 |
| Frontend Mobile | React Native / Expo |
| UI | Tailwind CSS 4 / FontAwesome 6.6 |
| Tiempo real | GraphQL Subscriptions sobre WebSocket |
| Despliegue e Infra | Docker / Azure App Service F1 / Cloudinary / GitHub Actions |

## 2. Estructura fisica

```text
API Graphql/
|-- Entities/     modelos de dominio
|-- Data/         DbContext, inicializacion y migraciones
|-- Services/     reglas de negocio y acceso a datos
`-- OneITB/       host ASP.NET Core, GraphQL y controladores REST

FrontEnd/OneItb-FE/src/
|-- Components/   vistas y componentes por dominio
|-- context/      autenticacion
|-- data/graphql/ operaciones Apollo
|-- hooks/        hooks compartidos
|-- router/       rutas publicas y privadas
`-- utils/        parsing y utilidades sin estado

Mobile/OneItb-App/src/
|-- components/   componentes nativos y UI
|-- navigation/   enrutamiento React Navigation
`-- screens/      pantallas principales
```

## 3. Contratos de transporte

- `/graphql` por HTTP: queries y mutations de aplicacion.
- `/graphql` por WebSocket: mensajes privados y notificaciones academicas en tiempo real.
- `POST /api/upload`: transferencia binaria autenticada y desacoplada, maximo 15 MB.
- `/uploads/{file}`: lectura de archivos estaticos almacenados localmente.

Los binarios no se envian mediante GraphQL. Primero se obtiene una URL desde `/api/upload`; luego esa URL se persiste en `Inquiry.FileUrl`, `Comment.FileUrl` o `AcademicResource.FileUrl`.

## 4. Modelo de dominio actual

```mermaid
erDiagram
    ACCOUNT ||--|| USER : credentials
    USER ||--o{ USER_CV_EXPERIENCE : records
    USER ||--o{ USER_CV_EDUCATION : records
    USER ||--o{ USER_CV_PROJECT : records
    USER ||--o{ USER_CV_SKILL : records
    USER ||--o{ USER_CV_LANGUAGE : records
    USER ||--o{ USER_CAREER : enrolls
    CAREER ||--o{ USER_CAREER : contains
    CAREER ||--o{ SUBJECT : defines
    SUBJECT ||--o{ SUBJECT_PREREQUISITE : requires
    USER ||--o{ INQUIRY : authors
    SUBJECT ||--o{ INQUIRY : classifies
    SUBJECT ||--o{ ACADEMIC_RESOURCE : provides
    SUBJECT ||--o{ ACADEMIC_PROGRESS : tracks
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ NOTIFICATION_PREFERENCE : configures
    INQUIRY ||--o{ COMMENT : contains
    COMMENT ||--o{ COMMENT : replies
    INQUIRY ||--o{ REACTION : receives
    INQUIRY ||--o{ COMMUNITY_REPORT : receives
    USER ||--o{ USER_INTERACTION : observes
    USER ||--o{ ACADEMIC_RESOURCE : uploads
    USER ||--o{ ACADEMIC_PROGRESS : owns
    USER ||--o{ ACADEMIC_PROGRESS : assigns
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
```

Entidades persistidas: `Account`, `User`, `Career`, `UserCareer`, `Subject`, `SubjectPrerequisite`, `Inquiry`, `Comment`, `Reaction`, `CommunityReport`, `UserInteraction`, `Message`, `AcademicResource`, `AcademicProgress`, `Notification`, `NotificationPreference`, `ModerationAudit`, `MagicLink`, `UserCvExperience`, `UserCvEducation`, `UserCvProject`, `UserCvSkill` y `UserCvLanguage`.

## 5. Integridad y borrado

- Las relaciones sociales, academicas, de publicaciones, comentarios y mensajes usan `DeleteBehavior.Restrict`.
- `Inquiry` y `Comment` usan soft-delete mediante `IsActive` y filtros globales.
- La relacion 1:1 `Account`-`User` conserva cascade como excepcion explicita del agregado de identidad.
- Todas las claves foraneas relevantes se modelan de forma explicita; no se admiten shadow properties.

## 6. Flujos principales

### Publicacion con archivo

```mermaid
sequenceDiagram
    actor User
    participant FE as React
    participant Upload as POST /api/upload
    participant GQL as GraphQL
    participant DB as SQL Server
    User->>FE: selecciona archivo y contenido
    FE->>Upload: multipart/form-data + JWT
    Upload-->>FE: /uploads/{guid.ext}
    FE->>GQL: addInquiry(fileUrl)
    GQL->>DB: INSERT Inquiry
    GQL-->>FE: Inquiry
```

### Comentario con archivo

El flujo reutiliza el mismo endpoint y finaliza con `addComment(inquiryId, content, parentCommentId, fileUrl)`. Las respuestas usan `ParentCommentId` y se limitan al mismo `Inquiry`.

### Mensajeria privada

El historial se persiste en `Messages`. El envio publica un evento al topico privado del receptor; Apollo reconcilia historial, eventos y estado optimista.

### Recursos y progreso academico

Los recursos academicos se consultan por materia mediante `academicResources(subjectId)`. Administradores y profesores pueden cargar enlaces o URLs de archivos ya subidos por `/api/upload`; estudiantes solo leen recursos de materias asociadas a sus carreras.

El progreso academico se persiste como un registro actual por estudiante y materia. Administradores y profesores asignan estado/nota mediante `upsertAcademicProgress`; el estudiante consulta solo su propio historial con `myAcademicProgress`, mientras que `academicProgressForUser` queda reservado a administradores.

### Adaptador SIU y notificaciones academicas

La integracion SIU usa un puerto `ISiuIntegrationService` para aislar la plataforma externa del dominio propio. La implementacion actual `MockSiuIntegrationService` devuelve calificaciones simuladas; `AcademicService.SyncSiuGradesAsync` consume esos registros y hace upsert idempotente en `AcademicProgress`, validando cuenta local, rol estudiante y pertenencia a la carrera de la materia. La mutacion `syncSiuGrades(subjectId)` esta restringida a administradores.

Las notificaciones se persisten en `Notifications` y las preferencias por tipo en `NotificationPreferences`. `NotificationService` aplica preferencias por defecto habilitadas, guarda eventos academicos y publica en el topico privado `notification:{userId}`. El cliente web consume `notificationReceived` con Apollo WebSocket y expone una campanita global con lectura y preferencias.

## 7. Estado y limites conocidos

- El pub/sub de subscriptions esta en memoria y sirve a una sola instancia.
- Los archivos se migrarán hacia Cloudinary para soportar entornos efímeros (Docker/Azure).
- Busqueda, categorias y versionado de recursos siguen planificados.
- El arranque temporal usado por Codex puede fallar por cifrado SQL Server y permisos de Windows Event Log; las migraciones EF CLI y builds funcionan.
- La convivencia del cliente Web y el Mobile Client (React Native) requiere asegurar un diseño de queries y fragments compartido para no duplicar lógica en el Apollo Cache.
