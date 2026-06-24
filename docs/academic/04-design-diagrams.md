# 4. Diagramas de diseno

La explicacion tecnica completa se mantiene en [architecture-and-design.md](../project_docs/architecture-and-design.md).

## 4.1 Contexto

```mermaid
flowchart LR
    User[Usuario] --> React[Web Client React]
    User --> Mobile[Mobile Client React Native]
    React -->|HTTP GraphQL| API[API HotChocolate / Docker]
    Mobile -->|HTTP GraphQL| API
    React -->|WebSocket| API
    Mobile -->|WebSocket| API
    React -->|multipart + JWT| Upload[UploadController]
    Mobile -->|multipart + JWT| Upload
    API --> EF[EF Core]
    EF --> SQL[(Azure SQL Free Tier)]
    Upload --> Files[(Cloudinary)]
```

## 4.2 Dominio social y academico

```mermaid
erDiagram
    USER ||--o{ USER_CAREER : has
    CAREER ||--o{ USER_CAREER : groups
    CAREER ||--o{ SUBJECT : owns
    SUBJECT ||--o{ INQUIRY : classifies
    USER ||--o{ INQUIRY : authors
    INQUIRY ||--o{ COMMENT : contains
    COMMENT ||--o{ COMMENT : replies
    INQUIRY ||--o{ REACTION : receives
    INQUIRY ||--o{ COMMUNITY_REPORT : receives
```

## 4.3 Carga desacoplada

```mermaid
sequenceDiagram
    actor Usuario
    participant FE as Frontend
    participant REST as POST /api/upload
    participant GQL as GraphQL
    participant DB as SQL Server
    Usuario->>FE: selecciona archivo
    FE->>REST: multipart/form-data + JWT
    REST-->>FE: fileUrl
    FE->>GQL: addInquiry/addComment(fileUrl)
    GQL->>DB: persiste URL
    GQL-->>FE: entidad creada
```

## 4.4 Mensaje en tiempo real

```mermaid
sequenceDiagram
    actor Sender
    participant FE as Apollo Client
    participant API as GraphQL
    participant DB as SQL Server
    participant WS as Subscription
    actor Receiver
    Sender->>FE: envia mensaje
    FE->>API: sendMessage
    API->>DB: persiste Message
    API->>WS: publica topico privado
    WS-->>Receiver: onMessageReceived
```
