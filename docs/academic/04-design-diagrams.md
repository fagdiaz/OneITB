# 4. Diagramas de diseño

| Dato de control | Valor |
|---|---|
| **Sistema** | OneITB23 |
| **Versión documental** | 2.1 |
| **Fecha de revisión** | 5 de agosto de 2026 |
| **Clasificación** | Vistas arquitectónicas derivadas |
| **Notación** | Mermaid; DER con cardinalidad Crow's Foot |
| **Fuente normativa** | [`architecture-and-design.md`](../project_docs/architecture-and-design.md) y modelo EF Core |

Los diagramas resumen el corte arquitectónico actual y están preparados para exportarse
con tema claro. No reemplazan el modelo EF Core, las migraciones ni los contratos
ejecutados. Los diagramas de flujo fuerzan líneas rectas u ortogonales para mejorar su
lectura impresa; los DER se dividen por subdominio para evitar una única lámina ilegible.

---

## 4.1 Índice y estrategia de exportación

| Figura | Vista | Uso recomendado |
|---:|---|---|
| 1 | Contexto del sistema | Presentación y memoria técnica |
| 2 | Componentes lógicos | Explicación arquitectónica |
| 3 | DER de identidad, perfil y catálogo | Anexo de datos |
| 4 | DER social, mensajería y moderación | Anexo de datos |
| 5 | DER académico, empleabilidad y auditoría | Anexo de datos |
| 6 | Autenticación Microsoft Entra | Seguridad e identidad |
| 7 | Publicación multimedia desacoplada | Contrato REST + GraphQL |
| 8 | Sincronización SIU mock | Patrón Adapter |
| 9 | Onboarding empresarial | B2B, transacción y Outbox |
| 10 | Notificaciones Pub/Sub | Tiempo real y escalabilidad |
| 11 | Despliegue local/aceptación | Reproducibilidad de demo |
| 12 | Plantilla productiva | Evolución cloud |
| 13 | Rebaseline de base demo | Operación y recuperación |

Para la entrega se recomienda exportar las figuras 1, 2, 6, 9, 10, 11 y 12 como SVG. Los
tres DER deben recrearse o ajustarse en diagrams.net si la exportación Mermaid no permite
controlar el enrutamiento Crow's Foot y el tamaño tipográfico requerido por la impresión.
Estas 13 vistas forman un paquete técnico complementario y no coinciden uno a uno con las
10 figuras principales enumeradas en `GUIA_MAQUETACION_FINAL.md`; las vistas adicionales
se incorporan al Word únicamente como anexos citados y después de revisar su legibilidad.

## 4.2 Figura 1 - Contexto del sistema

```mermaid
%%{init: {"theme": "default", "flowchart": {"curve": "linear"}}}%%
flowchart LR
    VIS["Visitante"]
    EST["Estudiante"]
    PRO["Profesor"]
    EGR["Egresado"]
    EMP["Empleador"]
    MOD["Moderador"]
    ADM["Administrador"]

    SYS["OneITB<br/>Red social académica y Bolsa de Trabajo"]

    ENTRA["Microsoft Entra ID"]
    SMTP["SMTP / Mailpit"]
    SIU["SIU Guaraní<br/>adaptador mock"]
    STORAGE["Disco local / Cloudinary"]

    VIS -->|"registro, login, solicitud empresarial"| SYS
    EST -->|"comunidad, académico, chat, postulaciones"| SYS
    PRO -->|"comunidad y gestión académica autorizada"| SYS
    EGR -->|"comunidad, perfil y postulaciones"| SYS
    EMP -->|"ofertas y postulaciones propias"| SYS
    MOD -->|"reportes y moderación"| SYS
    ADM -->|"gobierno y auditoría"| SYS

    SYS <-->|"OIDC / OAuth 2.0 + PKCE"| ENTRA
    SYS -->|"correo"| SMTP
    SYS <-->|"registros simulados"| SIU
    SYS -->|"archivos"| STORAGE

    classDef actor fill:#dbeafe,stroke:#1d4ed8,color:#0f172a,stroke-width:1.5px;
    classDef system fill:#0f172a,stroke:#38bdf8,color:#f8fafc,stroke-width:3px;
    classDef external fill:#f1f5f9,stroke:#64748b,color:#0f172a,stroke-dasharray:5 3;
    class VIS,EST,PRO,EGR,EMP,MOD,ADM actor;
    class SYS system;
    class ENTRA,SMTP,SIU,STORAGE external;
```

**Lectura.** OneITB constituye la frontera central. Los siete actores interactúan con
capacidades diferentes y toda autorización se resuelve dentro de la API. Entra, correo,
SIU y almacenamiento son sistemas externos o adaptadores; el gráfico no implica que sus
proveedores productivos estén aceptados.

**Recomendación A4.** Orientación horizontal (Landscape). Inserción recomendada en cuerpo principal. Exportable directamente desde Mermaid o recreable en diagrams.net. Mantener tipografía mínima equivalente a 10 pt. Riesgo muy bajo de saturación visual.

## 4.3 Figura 2 - Componentes lógicos

```mermaid
%%{init: {"theme": "default", "flowchart": {"curve": "linear"}}}%%
flowchart TB
    subgraph CLIENT["Navegador"]
        UI["React 18 + Tailwind CSS 4"]
        AUTH["AuthContext + ThemeContext"]
        APOLLO["Apollo Client + InMemoryCache"]
        REST["Upload client"]
        ERROR["Global Error Boundary"]
        UI --> AUTH
        UI --> APOLLO
        UI --> REST
        ERROR --> UI
    end

    subgraph API["API ASP.NET Core .NET 8"]
        HTTP["GraphQL HTTP<br/>Queries + Mutations"]
        WS["GraphQL WebSocket<br/>Subscriptions"]
        UPLOAD["UploadController REST"]
        SERVICES["Servicios de dominio"]
        WORKERS["Hosted services<br/>cleanup + reminders + Outbox"]
        ADAPTERS["Adaptadores<br/>Entra + SIU + email + storage"]
        AUDIT["Audit interceptor + middleware"]
        HTTP --> SERVICES
        WS --> SERVICES
        UPLOAD --> SERVICES
        WORKERS --> SERVICES
        SERVICES --> ADAPTERS
        SERVICES --> AUDIT
    end

    subgraph DATA["Persistencia e infraestructura"]
        SQL[("SQL Server 2022")]
        REDIS[("Redis opcional")]
        FILES[("Storage local / Cloudinary")]
        MAIL["SMTP / pickup"]
    end

    APOLLO -->|"HTTPS /graphql"| HTTP
    APOLLO -->|"WSS /graphql"| WS
    REST -->|"multipart/form-data /api/upload"| UPLOAD
    SERVICES -->|"EF Core 8"| SQL
    AUDIT --> SQL
    WS --> REDIS
    ADAPTERS --> FILES
    ADAPTERS --> MAIL

    classDef client fill:#e0f2fe,stroke:#0284c7,color:#0f172a;
    classDef backend fill:#ede9fe,stroke:#7c3aed,color:#0f172a;
    classDef data fill:#ecfccb,stroke:#65a30d,color:#0f172a;
    class UI,AUTH,APOLLO,REST,ERROR client;
    class HTTP,WS,UPLOAD,SERVICES,WORKERS,ADAPTERS,AUDIT backend;
    class SQL,REDIS,FILES,MAIL data;
```

**Lectura.** GraphQL transporta negocio; `POST /api/upload` es la excepción binaria
autenticada. Apollo separa HTTP y WebSocket. Los servicios de dominio concentran
autorización y reglas, mientras EF Core persiste y el interceptor registra cambios
críticos. Redis, Cloudinary y SMTP se seleccionan por ambiente.

**Recomendación A4.** Orientación vertical (Portrait). Inserción recomendada en cuerpo principal. Exportable directamente desde Mermaid. Mantener tipografía mínima equivalente a 10 pt. Riesgo bajo de saturación visual.

## 4.4 Modelo de dominio relacional

En el corte post-Spec 220, `OneItbContext` expone **39 DbSet** y el inventario
GOB-11 registra **67 relaciones FK**. Para maquetar la versión actual usar los
DER de [identidad, perfil y catálogo](diagrams/03-der-identidad-perfil-catalogo.mmd),
[muro, mensajería y moderación](diagrams/04-der-social-mensajeria-moderacion.mmd)
y [académico, empleo y auditoría](diagrams/05-der-academico-empleo-auditoria.mmd).
El [inventario GOB-11](diagrams/GOB-20261109-11-entrega.md) distingue entidades
propias de referencias repetidas. Las figuras 3 a 5 reproducidas abajo documentan
el modelo anterior de 30 conjuntos; para imprimir se toman las fuentes enlazadas.

### Figura 3 - DER de identidad, perfil y catálogo académico

```mermaid
erDiagram
    ACCOUNT {
        guid Id PK
        string Email UK
        string PasswordHash "nullable para cuenta externa"
        bool MagicLinkEnabled
        string ExternalProvider "nullable; UK compuesto con TenantId y SubjectId"
        string ExternalTenantId "nullable"
        string ExternalSubjectId "nullable"
        datetime LastExternalLoginAt "nullable"
        int FailedLoginAttempts
        datetime LockoutEnd "nullable"
        datetime CreatedAt
    }
    USER {
        guid Id PK,FK "1:1 con Account"
        string FirstName
        string LastName
        string Role
        bool IsActive
        bool IsPublicProfile
        string Biography "nullable"
        string Phone "nullable"
        string AvatarUrl "nullable"
        datetime MutedUntil "nullable"
    }
    MAGIC_LINK {
        guid Id PK
        guid AccountId FK
        string Token "digest SHA-256; secreto viaja fuera de banda"
        datetime ExpiresAt
        bool IsUsed
        datetime CreatedAt
    }
    CAREER {
        int Id PK
        string Name UK
        string Code
        bool IsActive
    }
    USER_CAREER {
        guid UserId PK,FK
        int CareerId PK,FK
    }
    SUBJECT {
        int Id PK
        int CareerId FK
        string Name UK
        string Code UK
        int Year
        bool IsActive
    }
    SUBJECT_PREREQUISITE {
        int SubjectId PK,FK
        int PrerequisiteId PK,FK
    }
    USER_CV_EXPERIENCE {
        guid Id PK
        guid UserId FK
        string Company
        string Role
        int SortOrder "índice compuesto con UserId"
    }
    USER_CV_EDUCATION {
        guid Id PK
        guid UserId FK
        string Institution
        string Degree
        int SortOrder "índice compuesto con UserId"
    }
    USER_CV_PROJECT {
        guid Id PK
        guid UserId FK
        string Name
        string Role "nullable"
        int SortOrder "índice compuesto con UserId"
    }
    USER_CV_SKILL {
        guid Id PK
        guid UserId FK
        string Name
        string Level "nullable"
        int SortOrder "índice compuesto con UserId"
    }
    USER_CV_LANGUAGE {
        guid Id PK
        guid UserId FK
        string Name
        string Level "nullable"
        int SortOrder "índice compuesto con UserId"
    }

    ACCOUNT ||--|| USER : authenticates
    ACCOUNT ||--o{ MAGIC_LINK : owns
    USER ||--o{ USER_CAREER : enrolls
    CAREER ||--o{ USER_CAREER : includes
    CAREER ||--o{ SUBJECT : defines
    SUBJECT ||--o{ SUBJECT_PREREQUISITE : subject
    SUBJECT ||--o{ SUBJECT_PREREQUISITE : prerequisite
    USER ||--o{ USER_CV_EXPERIENCE : has
    USER ||--o{ USER_CV_EDUCATION : has
    USER ||--o{ USER_CV_PROJECT : has
    USER ||--o{ USER_CV_SKILL : has
    USER ||--o{ USER_CV_LANGUAGE : has
```

**Reglas destacadas.** `Account`-`User` es uno a uno (la PK de `Users` es FK a `Accounts.Id`);
`Account` no tiene `IsActive` propio (la activación reside en `User.IsActive`).
La identidad Microsoft se almacena en tres campos nullable con índice único compuesto filtrado sobre
`ExternalProvider+ExternalTenantId+ExternalSubjectId`. `MagicLinkEnabled` controla si el flujo sin
contraseña está activo para la cuenta. `UserCareer` y `SubjectPrerequisite` poseen claves compuestas.
Las secciones del CV son entidades normalizadas, ordenables y con campos descriptivos mínimos; no se
persisten como JSON o LocalStorage. `Career.Name`, `Subject.Name` y `Subject.Code` tienen índices
únicos; `Career.Code` existe como propiedad pero no posee índice único en la configuración EF ni en el
snapshot actual. `Token` de `MagicLink` persiste el digest SHA-256, sin índice único. El DER es una
vista estructural resumida; el modelo EF/migraciones constituye el diccionario completo.

**Recomendación A4.** Orientación horizontal (Landscape). Destino recomendado: Anexo de datos. Recreación sugerida en diagrams.net para control de conectores Crow's Foot ortogonales. Mantener tipografía mínima equivalente a 10 pt. Riesgo medio de saturación por 12 entidades.

### Figura 4 - DER social, mensajería y moderación

```mermaid
erDiagram
    USER {
        guid Id PK
        string Role
    }
    SUBJECT {
        int Id PK
    }
    INQUIRY {
        guid Id PK
        guid UserId FK
        int SubjectId FK
        bool IsActive
        bool IsHiddenByModerator
        datetime CreatedAt
    }
    COMMENT {
        guid Id PK
        guid InquiryId FK
        guid UserId FK
        guid ParentCommentId FK "nullable"
        guid ReplyToUserId FK "nullable"
        bool IsActive
        bool IsHiddenByModerator
    }
    REACTION {
        guid Id PK
        guid InquiryId FK
        guid UserId FK "UK compuesto InquiryId+UserId"
    }
    COMMENT_REACTION {
        guid Id PK
        guid CommentId FK
        guid UserId FK "UK compuesto CommentId+UserId"
    }
    SOCIAL_ATTACHMENT {
        guid Id PK
        guid InquiryId FK "nullable XOR"
        guid CommentId FK "nullable XOR"
        string FileUrl
        string OriginalFileName
        string ContentType
        long Size
        int SortOrder
    }
    COMMUNITY_REPORT {
        guid Id PK
        guid InquiryId FK
        guid ReporterId FK
        string Status
    }
    USER_INTERACTION {
        guid Id PK
        guid ObserverId FK
        guid TargetId FK
        string Type "UK compuesto ObserverId+TargetId+Type"
    }
    MESSAGE {
        guid Id PK
        guid SenderId FK
        guid ReceiverId FK
        bool IsRead
        datetime SentAt
    }
    NOTIFICATION {
        guid Id PK
        guid UserId FK
        guid RelatedInquiryId FK "nullable"
        string Type
        bool IsRead
        string GroupKey "nullable; UK compuesto UserId+GroupKey filtrado GroupKey IS NOT NULL"
        int AggregateCount
    }
    NOTIFICATION_PREFERENCE {
        guid Id PK
        guid UserId FK
        string Type "UK compuesto UserId+Type"
        bool IsEnabled
    }
    MODERATION_AUDIT {
        guid Id PK
        guid ActorUserId FK
        guid TargetUserId FK "nullable"
        guid TargetInquiryId FK "nullable"
        guid TargetCommentId FK "nullable"
        guid TargetReportId FK "nullable"
        string Action
        string Summary
        datetime CreatedAt
    }

    USER ||--o{ INQUIRY : authors
    SUBJECT ||--o{ INQUIRY : classifies
    INQUIRY ||--o{ COMMENT : contains
    USER ||--o{ COMMENT : writes
    COMMENT o|--o{ COMMENT : replies
    USER o|--o{ COMMENT : mentioned
    INQUIRY ||--o{ REACTION : receives
    USER ||--o{ REACTION : creates
    COMMENT ||--o{ COMMENT_REACTION : receives
    USER ||--o{ COMMENT_REACTION : creates
    INQUIRY o|--o{ SOCIAL_ATTACHMENT : attaches
    COMMENT o|--o{ SOCIAL_ATTACHMENT : attaches
    INQUIRY ||--o{ COMMUNITY_REPORT : reported
    USER ||--o{ COMMUNITY_REPORT : reports
    USER ||--o{ USER_INTERACTION : observes
    USER ||--o{ USER_INTERACTION : targeted
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
    USER ||--o{ NOTIFICATION : receives
    INQUIRY o|--o{ NOTIFICATION : groups
    USER ||--o{ NOTIFICATION_PREFERENCE : configures
    USER ||--o{ MODERATION_AUDIT : acts
    USER o|--o{ MODERATION_AUDIT : targeted
    INQUIRY o|--o{ MODERATION_AUDIT : targeted
    COMMENT o|--o{ MODERATION_AUDIT : targeted
    COMMUNITY_REPORT o|--o{ MODERATION_AUDIT : targeted
```

**Reglas destacadas.** Inquiry y Comment utilizan soft delete y ocultamiento moderado
separados. `Reaction` es única por `InquiryId+UserId`; `CommentReaction` por `CommentId+UserId`;
`UserInteraction` por `ObserverId+TargetId+Type`; `NotificationPreference` por `UserId+Type`;
`Notification` tiene UK compuesto `UserId+GroupKey` filtrado donde `GroupKey IS NOT NULL` (GroupKey
es nullable). `SocialAttachment` exige XOR: pertenece a una Inquiry o a un Comment, nunca a ambos ni
a ninguno. El nivel lógico de respuestas se limita a dos aunque la FK sea autorreferencial. Mensajes
tienen dos FKs restrictivas a User. `CommunityReport` tiene índice único parcial sobre
`InquiryId+ReporterId+Status` con filtro `[Status] = 'Pending'`: la unicidad solo aplica a reportes
pendientes, no a todos los estados.

**Recomendación A4.** Orientación horizontal (Landscape). Destino recomendado: Anexo de datos. Recreación sugerida en diagrams.net para evitar superposición de conectores. Mantener tipografía mínima equivalente a 10 pt. Riesgo alto de saturación por 13 entidades; mantener estrictamente separado de las otras vistas DER.

### Figura 5 - DER académico, empleabilidad, onboarding y auditoría

```mermaid
erDiagram
    USER {
        guid Id PK
        string Role
    }
    SUBJECT {
        int Id PK
    }
    ACADEMIC_RESOURCE {
        guid Id PK
        int SubjectId FK
        guid UploaderId FK
        string Title
        string ResourceType "File u otros"
        string Category "enum AcademicResourceCategory"
        string FileUrl "nullable"
        string ExternalUrl "nullable"
        int Version
        bool IsActive
    }
    ACADEMIC_PROGRESS {
        guid Id PK
        guid UserId FK
        int SubjectId FK
        guid AssignedById FK
        decimal Score "nullable"
        string Status "enum AcademicProgressStatus"
        string Notes "nullable"
    }
    JOB_OFFER {
        guid Id PK
        guid EmployerId FK
        string Title
        string Company
        bool IsActive
        datetime CreatedAt
    }
    JOB_APPLICATION {
        guid Id PK
        guid JobOfferId FK
        guid ApplicantId FK
        string Status "UK compuesto JobOfferId+ApplicantId"
        datetime AppliedAt
    }
    EMPLOYER_REQUEST {
        guid Id PK
        string CompanyName
        string Email "UK filtrado Pending/Approved"
        string TaxId "UK filtrado Pending/Approved"
        string Status
        guid ProcessedByAdminId FK "nullable"
        guid ProvisionedUserId FK "nullable"
        datetime ProcessedAt "nullable"
    }
    EMPLOYER_ONBOARDING_OUTBOX {
        guid Id PK
        guid EmployerRequestId FK "UK"
        string Status
        int Attempts
        datetime NextAttemptAt
        datetime LeaseExpiresAt "nullable"
    }
    AUDIT_LOG {
        guid Id PK
        guid ActorUserId FK "nullable"
        string CorrelationId "nullable"
        string Action
        string EntityName
        string EntityId
        datetime CreatedAt
    }

    SUBJECT ||--o{ ACADEMIC_RESOURCE : provides
    USER ||--o{ ACADEMIC_RESOURCE : uploads
    SUBJECT ||--o{ ACADEMIC_PROGRESS : tracks
    USER ||--o{ ACADEMIC_PROGRESS : owns
    USER ||--o{ ACADEMIC_PROGRESS : assigns
    USER ||--o{ JOB_OFFER : publishes
    JOB_OFFER ||--o{ JOB_APPLICATION : receives
    USER ||--o{ JOB_APPLICATION : applies
    USER o|--o{ EMPLOYER_REQUEST : processes
    USER o|--o| EMPLOYER_REQUEST : provisioned_as
    EMPLOYER_REQUEST ||--o| EMPLOYER_ONBOARDING_OUTBOX : enqueues
    USER o|--o{ AUDIT_LOG : performs
```

**Reglas destacadas.** `AcademicProgress` tiene UK compuesto `UserId+SubjectId` (no sobre `Score`)
y conserva al asignador; `Score` es `decimal?` nullable. `AcademicResource` omite `Description`
(nullable) por brevedad del DER. `JobApplication` es única por `JobOfferId+ApplicantId`.
La aprobación empresarial vincula opcionalmente procesador y usuario aprovisionado; el
`EmployerOnboardingOutbox` tiene índice único sobre `EmployerRequestId`. `AuditLog` acepta actor nulo
para procesos técnicos, pero nunca secretos. `EmployerRequest.TaxId` y `Email` son únicos con filtro
`[Status] IN ('Pending','Approved')`. El DER es una vista estructural resumida; el modelo
EF/migraciones constituye el diccionario completo.

**Recomendación A4.** Orientación horizontal (Landscape). Destino recomendado: Anexo de datos. Recreación sugerida en diagrams.net. Mantener tipografía mínima equivalente a 10 pt. Riesgo medio de saturación visual por 9 entidades.

## 4.5 Secuencias críticas

### Figura 6 - Autenticación Microsoft Entra por redirect

```mermaid
%%{init: {"theme": "default"}}%%
sequenceDiagram
    autonumber
    actor U as Usuario
    participant SPA as React + MSAL
    participant E as Microsoft Entra ID
    participant GQL as GraphQL API
    participant V as Token Validator
    participant DB as SQL Server

    U->>SPA: Seleccionar acceso Microsoft
    SPA->>E: loginRedirect (PKCE + scope API)
    E-->>SPA: /auth/microsoft/callback
    SPA->>SPA: handleRedirect + flow ID idempotente
    SPA->>E: acquireTokenSilent
    E-->>SPA: Access token delegado
    SPA->>GQL: microsoftLogin(accessToken)
    GQL->>V: ValidateAsync(token)
    V->>E: Metadata y claves OpenID cacheadas
    E-->>V: Issuer + JWKS
    V->>V: Firma, audience, lifetime, tid, oid, scp, dominio
    V-->>GQL: Identidad validada
    GQL->>DB: Vincular/provisionar Account + User + AuditLog
    DB-->>GQL: Usuario local
    GQL-->>SPA: AuthPayload con JWT OneITB
    SPA->>SPA: Limpiar sesión previa e hidratar nueva identidad
    SPA-->>U: Feed u onboarding académico
```

**Seguridad.** La autoridad `common` admite directorios organizacionales, pero la API
valida el tenant concreto del token. El access token externo no sustituye el JWT local.
Múltiples cuentas ambiguas o configuración incompleta fallan de forma cerrada.

**Recomendación A4.** Orientación vertical (Portrait). Inserción recomendada en cuerpo principal o anexo de seguridad. Exportable directamente desde Mermaid. Mantener tipografía mínima equivalente a 10 pt. Riesgo bajo de saturación.

### Figura 7 - Publicación multimedia con carga desacoplada

```mermaid
%%{init: {"theme": "default"}}%%
sequenceDiagram
    autonumber
    actor U as Usuario
    participant FE as Feed React
    participant REST as UploadController
    participant FS as FileStorageService
    participant GQL as GraphQL Mutation
    participant Social as SocialService
    participant DB as SQL Server

    U->>FE: Completar publicación y elegir adjuntos/portada
    FE->>FE: Validar 10 archivos, 15 MB, previews y 2 YouTube
    loop Por cada archivo
        FE->>REST: POST /api/upload + JWT
        REST->>REST: Validar tamaño, extensión, MIME, magic bytes y estructura
        REST->>FS: SaveAsync(nombre GUID)
        FS-->>REST: URL + metadata
        REST-->>FE: UploadResult
    end
    FE->>GQL: addInquiry(input, attachments)
    GQL->>Social: CreateInquiryAsync(actor, input)
    Social->>Social: Validar sanción, materia, carrera, metadata y XOR
    Social->>DB: INSERT Inquiry + SocialAttachments
    DB-->>Social: Commit
    Social-->>GQL: Publicación creada
    GQL-->>FE: Payload GraphQL
    FE->>FE: Actualizar caché y renderizar Media Grid
```

**Frontera.** El upload físico no crea por sí solo una publicación. Los archivos quedan
referenciados recién al completar GraphQL; un worker limpia uploads huérfanos. La entrega
estática por recurso permanece como `GAP-FILE-01`.

**Recomendación A4.** Orientación vertical (Portrait). Inserción recomendada en anexo técnico. Exportable directamente desde Mermaid. Mantener tipografía mínima equivalente a 10 pt. Riesgo bajo de saturación.

### Figura 8 - Sincronización académica mediante SIU mock

```mermaid
%%{init: {"theme": "default"}}%%
sequenceDiagram
    autonumber
    actor A as Administrador
    participant FE as AcademicDashboard
    participant GQL as GraphQL Mutation
    participant S as AcademicService
    participant SIU as ISiuIntegrationService (Mock)
    participant DB as SQL Server
    participant N as NotificationService

    A->>FE: Sincronizar materia
    FE->>GQL: syncSiuGrades(subjectId)
    GQL->>S: SyncSiuGradesAsync(actor, subjectId)
    S->>S: Validar rol y materia
    S->>SIU: GetGradesAsync(subjectId)
    SIU-->>S: Registros simulados
    loop Cada registro
        S->>S: Validar identidad, nota 0-10 y estado
        alt Registro válido
            S->>DB: Upsert AcademicProgress
        else Registro inválido
            S->>S: Agregar skipped item
        end
    end
    S->>DB: SaveChangesAsync + AuditLog
    S->>N: Crear notificaciones académicas
    N->>DB: INSERT Notifications
    S-->>GQL: SiuSyncResult
    GQL-->>FE: Totales, actualizados y omitidos
```

**Límite.** El adaptador demuestra desacoplamiento y upsert; no representa una conexión
real ni procesa información del SIU institucional.

**Recomendación A4.** Orientación vertical (Portrait). Inserción recomendada en anexo técnico. Exportable directamente desde Mermaid. Mantener tipografía mínima equivalente a 10 pt. Riesgo bajo de saturación.

### Figura 9 - Solicitud, aprobación y bienvenida de empleador

```mermaid
%%{init: {"theme": "default"}}%%
sequenceDiagram
    autonumber
    actor V as Visitante empresa
    actor A as Administrador
    participant FE as React
    participant GQL as GraphQL API
    participant S as EmployerRequestService
    participant DB as SQL Server
    participant W as Outbox Worker
    participant MAIL as IEmailSender

    V->>FE: Enviar solicitud empresarial
    FE->>GQL: submitEmployerRequest(input)
    GQL->>S: SubmitAsync(input, fingerprint)
    S->>S: Honeypot temprano + normalización + rate limit
    S->>DB: INSERT Pending si corresponde
    S-->>GQL: Respuesta genérica anti-enumeración
    GQL-->>FE: Confirmación uniforme

    A->>FE: Aprobar solicitud Pendiente
    FE->>GQL: approveEmployerRequest(requestId)
    GQL->>S: ApproveAsync(admin, requestId)
    S->>DB: BEGIN TRANSACTION SERIALIZABLE
    S->>DB: Status Approved + Account/User Empleador + Audit + Outbox
    DB-->>S: COMMIT
    S-->>GQL: Solicitud aprobada

    W->>DB: Adquirir lease de Outbox
    W->>MAIL: Enviar bienvenida + Magic Link
    alt Entrega exitosa
        W->>DB: Marcar Delivered
    else Falla transitoria
        W->>DB: Incrementar intento y programar retry
    end
```

**Seguridad y consistencia.** El rol aprovisionado es siempre Empleador. La transacción
evita estados parciales y el Outbox impide que una falla SMTP deshaga la cuenta o genere
duplicados. El rechazo registra acción sin copiar el motivo sensible al audit transversal.

**Recomendación A4.** Orientación vertical (Portrait). Inserción recomendada en cuerpo principal (sección B2B). Exportable directamente desde Mermaid. Mantener tipografía mínima equivalente a 10 pt. Riesgo medio de saturación por secuencia en dos fases.

## 4.6 Figura 10 - Notificaciones y mensajes en tiempo real

```mermaid
%%{init: {"theme": "default", "flowchart": {"curve": "linear"}}}%%
flowchart LR
    subgraph SPA["React + Apollo"]
        BELL["NotificationBell"]
        TOAST["NotificationProvider"]
        CHAT["PrivateChat / MiniChat"]
        HTTP["HttpLink"]
        WSL["GraphQLWsLink"]
        CACHE["InMemoryCache + session epoch"]
        BELL --> HTTP
        TOAST --> WSL
        CHAT --> HTTP
        CHAT --> WSL
        HTTP --> CACHE
        WSL --> CACHE
    end

    subgraph API["HotChocolate"]
        QUERY["Queries paginadas"]
        MUT["Mutations"]
        SUB["Subscriptions"]
        NS["NotificationService"]
        TOPIC["Topic por userId"]
        MUT --> NS
        NS --> TOPIC
        TOPIC --> SUB
    end

    DB[("SQL Server<br/>Notifications + Messages + Preferences")]
    REDIS[("Redis Pub/Sub<br/>si está configurado")]

    HTTP --> QUERY
    HTTP --> MUT
    WSL --> SUB
    QUERY --> DB
    MUT --> DB
    NS --> DB
    TOPIC <--> REDIS
```

**Lectura.** El evento realtime no reemplaza la persistencia. Queries recuperan estado y
badges desde registros no leídos; subscriptions aceleran la UI. Los topics se derivan de
la identidad autenticada. En memoria sirve una instancia; Redis permite distribución
entre réplicas. Logout cierra el socket y descarta respuestas de una época anterior.

**Recomendación A4.** Orientación horizontal (Landscape). Inserción recomendada en cuerpo principal. Exportable directamente desde Mermaid. Mantener tipografía mínima equivalente a 10 pt. Riesgo bajo de saturación visual.

## 4.7 Despliegue y operación

### Figura 11 - Entorno local y de aceptación

```mermaid
%%{init: {"theme": "default", "flowchart": {"curve": "linear"}}}%%
flowchart LR
    DEV["Notebook del desarrollador"]
    BROWSER["Browser"]
    VITE["Vite :5173"]
    API["ASP.NET Core :44397"]

    subgraph DOCKER["Docker local"]
        SQL["SQL Server 2022<br/>host 1433 → contenedor 1433"]
        REDIS["Redis<br/>host 16379 → contenedor 6379<br/>aceptación"]
        MAILPIT["Mailpit<br/>SMTP host 11025 → 1025<br/>UI host 18025 → 8025<br/>aceptación"]
        VOL[("Volumen SQL")]
        SQL --> VOL
    end

    UPLOADS[("wwwroot/uploads")]
    PICKUP[("pickup .eml ignorado")]

    DEV --> BROWSER
    BROWSER --> VITE
    VITE -->|"proxy HTTP + WS + REST"| API
    API -->|"EF Core / SQL Auth"| SQL
    API -->|"Pub/Sub opcional"| REDIS
    API -->|"SMTP local opcional"| MAILPIT
    API --> UPLOADS
    API --> PICKUP
```

**Lectura.** SQL Server Docker es la base local canónica. Redis y Mailpit se agregan en
aceptación sin reemplazar SQL. Vite conserva origen simple mediante proxy. Secretos y
archivos generados permanecen fuera de Git.

**Recomendación A4.** Orientación horizontal (Landscape). Inserción recomendada en cuerpo principal. Exportable directamente desde Mermaid. Mantener tipografía mínima equivalente a 10 pt. Riesgo bajo de saturación visual.

### Figura 12 - Plantilla de despliegue productivo

```mermaid
%%{init: {"theme": "default", "flowchart": {"curve": "linear"}}}%%
flowchart LR
    USER["Usuarios HTTPS"]
    DNS["DNS + certificado TLS"]
    NGINX["Nginx<br/>React estático + reverse proxy"]
    API1["API OneITB réplica A"]
    API2["API OneITB réplica B<br/>(escalado horizontal futuro)"]
    SQL[("SQL Server / Azure SQL")]
    REDIS[("Redis administrado")]
    CLOUD["Cloudinary / storage privado"]
    SMTP["Proveedor SMTP"]
    ENTRA["Microsoft Entra ID"]
    OBS["Logs + métricas + trazas + alertas"]
    CICD["GitHub Actions"]

    USER --> DNS --> NGINX
    NGINX -->|"GraphQL HTTP/WS + REST"| API1
    NGINX -->|"GraphQL HTTP/WS + REST"| API2
    API1 --> SQL
    API2 --> SQL
    API1 <--> REDIS
    API2 <--> REDIS
    API1 --> CLOUD
    API2 --> CLOUD
    API1 --> SMTP
    API2 --> SMTP
    API1 <--> ENTRA
    API2 <--> ENTRA
    API1 --> OBS
    API2 --> OBS
    CICD -.->|"build, tests, imagen y despliegue"| NGINX
    CICD -.-> API1
    CICD -.-> API2
```

**Límite de esta vista.** Es una arquitectura objetivo, no el `docker-compose.prod.yml` ejecutado.
El compose de producción actual declara un solo servicio `oneitb-api` (expose 8080, sin port mapping
al host) y un `oneitb-web` con Nginx embebido (host 80→contenedor 80, escucha HTTP); las réplicas A/B
representan una escala horizontal futura. El Nginx incluido no termina TLS (solo escucha puerto 80);
la terminación TLS se muestra como externa (`DNS + certificado TLS`). El destino requiere certificado
SQL verificable (`TrustServerCertificate=False`), SMTP real, Redis administrado, storage privado,
observabilidad, backup/restore, rotación de secretos y respuesta a incidentes (`GAP-INFRA-01`, `GAP-OPS-01`).

**Recomendación A4.** Orientación horizontal (Landscape). Inserción recomendada en cuerpo principal. Exportable directamente desde Mermaid o recreable en diagrams.net. Mantener tipografía mínima equivalente a 10 pt. Riesgo medio de saturación.

### Figura 13 - Rebaseline y aceptación de la base demo

```mermaid
%%{init: {"theme": "default", "flowchart": {"curve": "linear"}}}%%
flowchart LR
    GUARD["Validar contenedor, puerto, DB y secretos"] --> BUILD["Build Release + EF sin drift"]
    BUILD --> BACKUP["BACKUP COPY_ONLY + CHECKSUM"]
    BACKUP --> VERIFY["RESTORE VERIFYONLY"]
    VERIFY --> DROP["Eliminar solo OneItb"]
    DROP --> MIGRATE["Aplicar migraciones EF Core"]
    MIGRATE --> SEED1["Seed canónico por fases"]
    SEED1 --> CLEAR1["SaveChanges + ChangeTracker.Clear"]
    CLEAR1 --> SNAP1["Inventario 1"]
    SNAP1 --> SEED2["Segunda ejecución idempotente"]
    SEED2 --> SNAP2["Inventario 2"]
    SNAP2 --> SAME{"Inventarios idénticos"}
    SAME -->|"No"| RESTORE["Abortar y restaurar backup"]
    SAME -->|"Sí"| INTEGRITY["Integridad relacional = 0"]
    INTEGRITY --> ROLES["Login de 6 roles"]
    ROLES --> SMOKE["Smoke GraphQL + upload"]
    SMOKE --> DONE["Base demo aceptada"]
```

**Seguridad operativa.** El procedimiento se limita al contenedor y base canónicos,
requiere confirmación destructiva y conserva backup fuera de Git. Las migraciones crean
el esquema; el seeder aporta únicamente datos y debe producir el mismo inventario en una
segunda ejecución.

**Recomendación A4.** Orientación horizontal (Landscape). Inserción recomendada en anexo operativo / Runbook. Exportable directamente desde Mermaid. Mantener tipografía mínima equivalente a 10 pt. Riesgo medio de saturación por flujo lineal de 14 pasos.

## 4.8 Reglas de consistencia y mantenimiento

1. Un cambio de entidad o FK obliga a actualizar las figuras 3, 4 o 5 después de aplicar
   la migración correspondiente.
2. Un cambio de transporte, provider o middleware obliga a revisar figuras 1, 2, 10, 11
   y 12.
3. Los diagramas de secuencia deben usar nombres reales de contratos y no convertir una
   intención futura en comportamiento vigente.
4. Las líneas de asociación en DER indican cardinalidad, no orden de ejecución.
5. Los componentes externos con aceptación pendiente deben conservar estilo diferenciado
   o una nota de límite.
6. Ningún diagrama debe incluir passwords, tokens, connection strings, CUIT reales o PII.
7. Antes de imprimir, cada SVG debe comprobarse al 100 % de zoom y en escala de grises.
8. La memoria final puede reutilizar estas vistas, pero debe numerarlas como figuras y
   mantener título, fuente y descripción accesible.

## 4.9 Correspondencia con fuentes

| Vista | Fuentes de contraste |
|---|---|
| Contexto y componentes | `Startup.cs`, frontend providers, arquitectura secciones 2-5 |
| DER | `OneItbContext.cs`, 39 `DbSet`, 67 FK del inventario GOB-11 y migraciones post-Spec 220 |
| Entra | `MicrosoftEntraOptions`, validator, auth service y callback React |
| Multimedia | `UploadController`, storage service, social service y Media Grid |
| SIU | `ISiuIntegrationService`, mock y `AcademicService` |
| B2B | `EmployerRequestService`, entidades de request/Outbox y worker |
| Pub/Sub | configuración HotChocolate, `NotificationService`, Apollo WS y Redis |
| Despliegue | Dockerfiles, Compose local/acceptance/productivo, Nginx y Runbook |
| Rebaseline | script de rebaseline, seeder, migraciones y evidencia de Spec 196 |

La fuente de verdad continúa siendo el código ejecutado. Si una figura contradice una
migración o un contrato runtime, debe corregirse la figura y registrar la desviación; no
se modifica el sistema para hacerlo coincidir con una representación desactualizada.
