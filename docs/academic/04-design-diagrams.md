# 4. Diagramas de diseno

Este documento resume la arquitectura vigente de OneITB23 con diagramas Mermaid renderizables. La explicacion narrativa completa se mantiene en [architecture-and-design.md](../project_docs/architecture-and-design.md).

## 4.1 Diagrama ER completo

```mermaid
erDiagram
    ACCOUNT {
        guid Id PK
        string Email
        string PasswordHash
        datetime CreatedAt
    }

    USER {
        guid Id PK
        string FirstName
        string LastName
        string Role
        string Biography
        string LinkedIn
        string Facebook
        string Instagram
        string Phone
        datetime MutedUntil
        bool IsActive
    }

    CAREER {
        int Id PK
        string Name
        string Code
        bool IsActive
    }

    USER_CAREER {
        guid UserId PK,FK
        int CareerId PK,FK
    }

    SUBJECT {
        int Id PK
        string Name
        string Code
        int CareerId FK
        int Year
        bool IsActive
    }

    SUBJECT_PREREQUISITE {
        int SubjectId PK,FK
        int PrerequisiteId PK,FK
    }

    INQUIRY {
        guid Id PK
        guid UserId FK
        int SubjectId FK
        string Title
        string Content
        string FileUrl
        datetime PublishDate
        datetime UpdatedAt
        bool IsActive
    }

    COMMENT {
        guid Id PK
        guid InquiryId FK
        guid UserId FK
        guid ParentCommentId FK
        string Content
        string FileUrl
        datetime CreatedAt
        datetime UpdatedAt
        bool IsActive
    }

    REACTION {
        guid Id PK
        guid InquiryId FK
        guid UserId FK
        datetime CreatedAt
    }

    COMMUNITY_REPORT {
        guid Id PK
        guid InquiryId FK
        guid ReporterId FK
        string Reason
        string Status
        datetime CreatedAt
    }

    MODERATION_AUDIT {
        guid Id PK
        guid ActorUserId FK
        guid TargetUserId FK
        guid TargetInquiryId FK
        guid TargetCommentId FK
        guid TargetReportId FK
        string Action
        string Summary
        datetime CreatedAt
    }

    USER_INTERACTION {
        guid Id PK
        guid ObserverId FK
        guid TargetId FK
        string Type
        datetime CreatedAt
    }

    MESSAGE {
        guid Id PK
        guid SenderId FK
        guid ReceiverId FK
        string Content
        datetime SentAt
        bool IsRead
    }

    ACADEMIC_RESOURCE {
        guid Id PK
        int SubjectId FK
        guid UploaderId FK
        string Title
        string Description
        string FileUrl
        string ExternalUrl
        string ResourceType
        datetime CreatedAt
        datetime UpdatedAt
        bool IsActive
    }

    ACADEMIC_PROGRESS {
        guid Id PK
        guid UserId FK
        int SubjectId FK
        guid AssignedById FK
        decimal Score
        string Status
        string Notes
        datetime UpdatedAt
    }

    NOTIFICATION {
        guid Id PK
        guid UserId FK
        string Type
        string Message
        string ActionUrl
        bool IsRead
        datetime CreatedAt
    }

    NOTIFICATION_PREFERENCE {
        guid Id PK
        guid UserId FK
        string Type
        bool IsEnabled
        datetime UpdatedAt
    }

    MAGIC_LINK {
        guid Id PK
        guid AccountId FK
        string Token
        datetime ExpiresAt
        datetime CreatedAt
    }

    ACCOUNT ||--|| USER : authenticates
    ACCOUNT ||--o{ MAGIC_LINK : owns

    USER ||--o{ USER_CAREER : enrolls
    CAREER ||--o{ USER_CAREER : includes
    CAREER ||--o{ SUBJECT : defines

    SUBJECT ||--o{ SUBJECT_PREREQUISITE : subject
    SUBJECT ||--o{ SUBJECT_PREREQUISITE : prerequisite

    USER ||--o{ INQUIRY : authors
    SUBJECT ||--o{ INQUIRY : classifies
    INQUIRY ||--o{ COMMENT : contains
    COMMENT ||--o{ COMMENT : replies
    USER ||--o{ COMMENT : writes
    INQUIRY ||--o{ REACTION : receives
    USER ||--o{ REACTION : creates
    INQUIRY ||--o{ COMMUNITY_REPORT : reported
    USER ||--o{ COMMUNITY_REPORT : reports

    USER ||--o{ MODERATION_AUDIT : acts
    USER ||--o{ MODERATION_AUDIT : targetUser
    INQUIRY ||--o{ MODERATION_AUDIT : targetInquiry
    COMMENT ||--o{ MODERATION_AUDIT : targetComment
    COMMUNITY_REPORT ||--o{ MODERATION_AUDIT : targetReport

    USER ||--o{ USER_INTERACTION : observes
    USER ||--o{ USER_INTERACTION : targeted

    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives

    SUBJECT ||--o{ ACADEMIC_RESOURCE : provides
    USER ||--o{ ACADEMIC_RESOURCE : uploads
    SUBJECT ||--o{ ACADEMIC_PROGRESS : tracks
    USER ||--o{ ACADEMIC_PROGRESS : owns
    USER ||--o{ ACADEMIC_PROGRESS : assigns

    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ NOTIFICATION_PREFERENCE : configures
```

## 4.2 Secuencia de sincronizacion SIU Guarani

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador
    participant FE as AcademicDashboard React
    participant GQL as HotChocolate Mutation
    participant Academic as AcademicService
    participant SIU as MockSiuIntegrationService
    participant EF as OneItbContext EF Core
    participant Notify as NotificationService
    participant WS as InMemory Pub/Sub
    participant DB as SQL Server

    Admin->>FE: Click "Sincronizar SIU"
    FE->>GQL: mutation syncSiuGrades(subjectId)
    GQL->>Academic: SyncSiuGradesAsync(actorId, role, subjectId)
    Academic->>Academic: Validar rol Administrador
    Academic->>EF: Cargar materia activa y carrera
    EF->>DB: SELECT Subject + Career
    DB-->>EF: Materia activa
    Academic->>SIU: GetGradesAsync(subjectId)
    SIU-->>Academic: Registros simulados de alumnos y notas

    loop Por cada registro SIU
        Academic->>EF: Buscar Account/User por email
        EF->>DB: SELECT Account + User
        DB-->>EF: Usuario local o null
        Academic->>EF: Validar UserCareer de la carrera
        EF->>DB: SELECT UserCareer
        DB-->>EF: Pertenencia valida o no
        alt Usuario valido y estudiante
            Academic->>EF: Upsert AcademicProgress por UserId + SubjectId
        else Usuario desconocido o inelegible
            Academic->>Academic: Agregar motivo a skippedItems
        end
    end

    Academic->>EF: SaveChangesAsync()
    EF->>DB: INSERT/UPDATE AcademicProgress
    DB-->>EF: Persistido
    Academic->>Notify: CreateNotificationsAsync(usuarios, SiuSync, mensaje, actionUrl)
    Notify->>EF: Insert Notifications segun preferencias
    EF->>DB: INSERT Notifications
    DB-->>EF: Persistido
    Notify->>WS: SendAsync(notification:{userId})
    Academic-->>GQL: SiuSyncResult
    GQL-->>FE: processed, created, updated, skipped
    FE-->>Admin: Resumen de sincronizacion
```

## 4.3 Arquitectura Pub/Sub de notificaciones

```mermaid
flowchart LR
    subgraph Frontend["Frontend React + Apollo Client"]
        Bell["NotificationBell"]
        Queries["myNotifications / unreadNotificationCount"]
        Subscription["useSubscription(notificationReceived)"]
        HttpLink["Apollo HTTP Link"]
        WsLink["Apollo GraphQLWsLink"]
    end

    subgraph Backend["Backend .NET 8 + HotChocolate"]
        QueryResolver["Query resolvers"]
        MutationResolver["Academic mutations"]
        NotificationService["NotificationService"]
        SubscriptionResolver["Subscription.notificationReceived"]
        Topic["In-memory topic notification:{userId}"]
    end

    subgraph Persistence["SQL Server"]
        Notifications[(Notifications)]
        Preferences[(NotificationPreferences)]
    end

    Bell --> Queries
    Bell --> Subscription
    Queries --> HttpLink
    Subscription --> WsLink
    HttpLink --> QueryResolver
    WsLink --> SubscriptionResolver

    MutationResolver --> NotificationService
    QueryResolver --> Notifications
    QueryResolver --> Preferences
    NotificationService --> Preferences
    NotificationService --> Notifications
    NotificationService --> Topic
    Topic --> SubscriptionResolver
    SubscriptionResolver --> WsLink
    WsLink --> Bell

    classDef client fill:#eff6ff,stroke:#2563eb,color:#1e3a8a
    classDef server fill:#f8fafc,stroke:#475569,color:#0f172a
    classDef data fill:#ecfdf5,stroke:#059669,color:#064e3b

    class Bell,Queries,Subscription,HttpLink,WsLink client
    class QueryResolver,MutationResolver,NotificationService,SubscriptionResolver,Topic server
    class Notifications,Preferences data
```

## 4.4 Contexto de despliegue local actual

```mermaid
flowchart TB
    Developer["Desarrollador"]
    Browser["Navegador / Vite"]
    Api["ASP.NET Core OneITB"]
    DockerSql["SQL Server 2022 Docker"]
    Uploads["wwwroot/uploads local"]

    Developer --> Browser
    Browser -->|HTTPS /graphql| Api
    Browser -->|WSS /graphql| Api
    Browser -->|POST /api/upload| Api
    Api -->|EF Core| DockerSql
    Api --> Uploads
```
