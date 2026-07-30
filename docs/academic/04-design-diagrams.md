# 4. Diagramas de diseno

Este documento resume la arquitectura vigente de OneITB23 con diagramas Mermaid renderizables. La explicacion narrativa completa se mantiene en [architecture-and-design.md](../project_docs/architecture-and-design.md).

## 4.1 Diagrama ER resumido

```mermaid
erDiagram
    ACCOUNT {
        guid Id PK
        string Email
        string PasswordHash "nullable only for external-only account"
        string ExternalProvider
        string ExternalTenantId
        string ExternalSubjectId
        datetime LastExternalLoginAt
        int FailedLoginAttempts
        datetime LockoutEnd
    }

    USER {
        guid Id PK
        string FirstName
        string LastName
        string Role
        string Biography
        string AvatarUrl
        bool IsActive
        datetime MutedUntil
    }

    CAREER {
        int Id PK
        string Name
        string Code
        bool IsActive
    }

    SUBJECT {
        int Id PK
        int CareerId FK
        string Name
        string Code
        int Year
        bool IsActive
    }

    INQUIRY {
        guid Id PK
        guid UserId FK
        int SubjectId FK
        string Title
        string Content
        string FileUrl
        bool IsActive
    }

    COMMENT {
        guid Id PK
        guid InquiryId FK
        guid UserId FK
        guid ParentCommentId FK
        string Content
        string FileUrl
        bool IsActive
    }

    SOCIAL_ATTACHMENT {
        guid Id PK
        guid InquiryId FK
        guid CommentId FK
        string FileUrl
        string OriginalFileName
        string ContentType
        long Size
        int SortOrder
    }

    COMMENT_REACTION {
        guid Id PK
        guid CommentId FK
        guid UserId FK
        datetime CreatedAt
    }

    MESSAGE {
        guid Id PK
        guid SenderId FK
        guid ReceiverId FK
        string Content
        bool IsRead
        datetime SentAt
    }

    ACADEMIC_RESOURCE {
        guid Id PK
        int SubjectId FK
        guid UploaderId FK
        string Title
        string Category
        int Version
        string FileUrl
        string ExternalUrl
        bool IsActive
    }

    ACADEMIC_PROGRESS {
        guid Id PK
        guid UserId FK
        int SubjectId FK
        guid AssignedById FK
        decimal Score
        string Status
    }

    JOB_OFFER {
        guid Id PK
        guid EmployerId FK
        string Title
        string Company
        string Location
        bool IsActive
    }

    JOB_APPLICATION {
        guid Id PK
        guid JobOfferId FK
        guid ApplicantId FK
        string Status
        datetime AppliedAt
    }

    NOTIFICATION {
        guid Id PK
        guid UserId FK
        guid RelatedInquiryId FK
        string Type
        string Message
        string ActionUrl
        bool IsRead
        string GroupKey
        int AggregateCount
        datetime UpdatedAt
    }

    AUDIT_LOG {
        guid Id PK
        guid ActorUserId FK
        string CorrelationId
        string Action
        string EntityName
        string EntityId
    }

    ACCOUNT ||--|| USER : authenticates
    USER ||--o{ CAREER : "via UserCareer"
    CAREER ||--o{ SUBJECT : defines
    SUBJECT ||--o{ SUBJECT : prerequisites
    USER ||--o{ INQUIRY : authors
    SUBJECT ||--o{ INQUIRY : classifies
    INQUIRY ||--o{ COMMENT : contains
    COMMENT ||--o{ COMMENT : replies
    USER ||--o{ COMMENT : writes
    INQUIRY ||--o{ SOCIAL_ATTACHMENT : attaches
    COMMENT ||--o{ SOCIAL_ATTACHMENT : attaches
    COMMENT ||--o{ COMMENT_REACTION : receives
    USER ||--o{ COMMENT_REACTION : creates
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
    SUBJECT ||--o{ ACADEMIC_RESOURCE : provides
    USER ||--o{ ACADEMIC_RESOURCE : uploads
    SUBJECT ||--o{ ACADEMIC_PROGRESS : tracks
    USER ||--o{ ACADEMIC_PROGRESS : owns
    USER ||--o{ JOB_OFFER : publishes
    JOB_OFFER ||--o{ JOB_APPLICATION : receives
    USER ||--o{ JOB_APPLICATION : applies
    USER ||--o{ NOTIFICATION : receives
    INQUIRY ||--o{ NOTIFICATION : groups
    USER ||--o{ AUDIT_LOG : performs
```

## 4.2 Secuencia de sincronizacion SIU Guarani

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador
    participant FE as AcademicDashboard
    participant GQL as HotChocolate Mutation
    participant Academic as AcademicService
    participant SIU as MockSiuIntegrationService
    participant EF as OneItbContext
    participant Notify as NotificationService
    participant DB as SQL Server

    Admin->>FE: Click "Sincronizar SIU"
    FE->>GQL: syncSiuGrades(subjectId)
    GQL->>Academic: SyncSiuGradesAsync(actorId, role, subjectId)
    Academic->>Academic: Validar rol Administrador
    Academic->>EF: Cargar materia, carrera y usuarios locales
    EF->>DB: SELECT Subject, Career, Accounts, Users
    DB-->>EF: Datos locales
    Academic->>SIU: GetGradesAsync(subjectId)
    SIU-->>Academic: Registros simulados

    loop Por cada registro SIU
        Academic->>Academic: Validar usuario, rol y carrera
        alt Usuario valido
            Academic->>EF: Upsert AcademicProgress
        else Usuario no sincronizable
            Academic->>Academic: Agregar skipped item
        end
    end

    Academic->>EF: SaveChangesAsync()
    EF->>DB: INSERT/UPDATE AcademicProgress
    Academic->>Notify: Crear notificaciones academicas
    Notify->>DB: INSERT Notifications
    Academic-->>GQL: SiuSyncResult
    GQL-->>FE: Resumen de sincronizacion
```

## 4.3 Arquitectura Pub/Sub de notificaciones

```mermaid
flowchart LR
    subgraph Frontend["React + Apollo Client"]
        Bell["NotificationBell"]
        Toasts["NotificationProvider / Toasts"]
        HttpLink["HTTP Link"]
        WsLink["GraphQLWsLink"]
    end

    subgraph Backend[".NET 8 + HotChocolate"]
        QueryResolver["Queries"]
        MutationResolver["Mutations"]
        NotificationService["NotificationService"]
        SubscriptionResolver["notificationReceived"]
        Topic["notification:{userId}"]
    end

    subgraph Persistence["SQL Server"]
        Notifications[(Notifications)]
        Preferences[(NotificationPreferences)]
    end

    Bell --> HttpLink
    Toasts --> WsLink
    HttpLink --> QueryResolver
    WsLink --> SubscriptionResolver
    MutationResolver --> NotificationService
    QueryResolver --> Notifications
    NotificationService --> Preferences
    NotificationService --> Notifications
    NotificationService --> Topic
    Topic --> SubscriptionResolver
    SubscriptionResolver --> WsLink
```

## 4.4 Flujo de empleos, postulaciones y correo

```mermaid
sequenceDiagram
    autonumber
    actor Employer as Empleador
    actor Applicant as Estudiante/Egresado
    participant FE as Jobs UI
    participant GQL as GraphQL
    participant Jobs as JobService
    participant Notify as NotificationService
    participant Email as IEmailSender
    participant DB as SQL Server

    Employer->>FE: Publicar oferta
    FE->>GQL: createJobOffer
    GQL->>Jobs: Validar rol y normalizar input
    Jobs->>DB: INSERT JobOffer
    GQL->>Notify: Notificar nueva oferta
    Applicant->>FE: Postularse
    FE->>GQL: applyToJob(jobOfferId)
    GQL->>Jobs: Validar rol y postulacion unica
    Jobs->>DB: INSERT JobApplication
    Employer->>FE: Marcar Revisado/Rechazado
    FE->>GQL: updateApplicationStatus
    GQL->>Jobs: Validar EmployerId == currentUserId
    Jobs->>DB: UPDATE JobApplication
    GQL->>Notify: Notificacion en plataforma
    GQL->>Email: SMTP o pickup local ignorado
```

## 4.5 Contexto de despliegue local y productivo

```mermaid
flowchart TB
    Developer["Desarrollador"]
    Browser["Navegador / Vite"]
    Api["ASP.NET Core OneITB"]
    DockerSql["SQL Server 2022 Docker"]
    Redis["Redis opcional"]
    Storage["Local uploads o Cloudinary"]
    Smtp["SMTP productivo / pickup local"]
    Nginx["Nginx frontend productivo"]

    Developer --> Browser
    Browser -->|HTTPS/WSS /graphql| Api
    Browser -->|POST /api/upload| Api
    Api -->|EF Core| DockerSql
    Api -->|Pub/Sub si configurado| Redis
    Api -->|Archivos| Storage
    Api -->|Correo| Smtp
    Nginx -->|proxy /graphql /api /uploads| Api
```

## 4.6 Reconstruccion y aceptacion de la base demo

```mermaid
%%{init: {"flowchart": {"curve": "linear"}}}%%
flowchart LR
    Guard["Guardas: contenedor, puerto, DB y secretos"] --> Build["Build Release + EF sin drift"]
    Build --> Backup["BACKUP COPY_ONLY + CHECKSUM"]
    Backup --> Verify["RESTORE VERIFYONLY"]
    Verify --> Drop["DROP exclusivo de OneItb"]
    Drop --> Migrate["Aplicar migraciones EF Core"]
    Migrate --> Seed1["Seed canonico por fases"]
    Seed1 --> Clear1["SaveChanges + ChangeTracker.Clear"]
    Clear1 --> Seed2["Segunda ejecucion idempotente"]
    Seed2 --> Compare{"Inventarios identicos"}
    Compare -->|No| Fail["Abortar y restaurar backup"]
    Compare -->|Si| Integrity["Integridad relacional = 0"]
    Integrity --> Roles["Login de 6 roles"]
    Roles --> Smoke["Smoke GraphQL + upload"]
    Smoke --> Done["Base demo aceptada"]
```

El flujo esta limitado al SQL Server Docker local `oneitb23-sql` y a la base `OneItb`.
La copia verificada se conserva fuera de Git. El seed abarca identidad, nueve carreras
institucionales, materias de muestra, recursos y progreso, muro, comentarios,
reacciones, mensajeria, notificaciones, CV y empleos. Las migraciones son la unica
fuente del esquema; el seeder aporta datos, pero no crea ni corrige tablas.
