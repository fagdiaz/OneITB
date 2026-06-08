# 4. Diagramas de Diseño, Flujo y Persistencia

## 4.1. Diagrama Entidad-Relación (DER) Normalizado

```mermaid
erDiagram
    ACCOUNT {
        Guid Id PK
        string Email
        string PasswordHash
        string State
    }
    USER {
        Guid Id PK
        Guid AccountId FK
        string Nombre
        string Apellido
        string Alias
        int CountryId FK
    }
    COUNTRY {
        int Id PK
        string Nombre
    }
    SUBJECT {
        int Id PK
        string Nombre
    }
    CONSULTA {
        Guid Id PK
        string Titulo
        string Contenido
        DateTime FechaPublicacion
        Guid UsuarioId FK
        int SubjectId FK
        Guid FileId FK
    }
    COMENTARIO {
        Guid Id PK
        string Contenido
        DateTime Fecha
        Guid ConsultaId FK
        Guid UsuarioId FK
    }

    ACCOUNT ||--|| USER : "pertenece a"
    COUNTRY ||--o{ USER : "residencia de"
    USER ||--o{ CONSULTA : "crea"
    SUBJECT ||--o{ CONSULTA : "pertenece a"
    CONSULTA ||--o{ COMENTARIO : "composición (depende de)"
    USER ||--o{ COMENTARIO : "escribe"
```

---

## 4.2. Diagramas de Secuencia Corregidos

### 4.2.1. Registro de Usuario ➡️ Login
```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend (Vite)
    participant API Backend (Mutation)
    participant UnitOfWork
    participant DB (SQL Server)

    Usuario->>Frontend (Vite): Completa datos de registro
    Frontend (Vite)->>API Backend (Mutation): Mutation RegisterUserAsync(RegisterInput)
    API Backend (Mutation)->>UnitOfWork: AddAsync(User + Account)
    UnitOfWork->>DB (SQL Server): SaveChangesAsync()
    DB (SQL Server)-->>UnitOfWork: Confirmación física
    UnitOfWork-->>API Backend (Mutation): Retorna entidad
    API Backend (Mutation)-->>Frontend (Vite): UserPayload (Success = true)
    Frontend (Vite)->>Usuario: Redirección automática a /login
```

### 4.2.2. Flujo de Inicio de Sesión (Login)
```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend (Vite)
    participant API Backend (Mutation)
    participant UnitOfWork
    participant DB (SQL Server)

    Usuario->>Frontend (Vite): Ingresa credenciales (Email + Password)
    Frontend (Vite)->>API Backend (Mutation): Mutation LoginAsync(LoginInput)
    API Backend (Mutation)->>UnitOfWork: GetByEmailAsync(Email)
    UnitOfWork->>DB (SQL Server): Consulta física de Cuenta
    DB (SQL Server)-->>UnitOfWork: Retorna hash BCrypt
    UnitOfWork-->>API Backend (Mutation): Retorna Cuenta
    API Backend (Mutation)->>API Backend (Mutation): Verifica hash BCrypt
    Note over API Backend (Mutation): Si es exitoso, genera JWT (2h)
    API Backend (Mutation)-->>Frontend (Vite): LoginPayload (Token + Nombre)
    Frontend (Vite)->>Frontend (Vite): Guarda token en localStorage
    Frontend (Vite)->>Usuario: Acceso a layout privado
```

### 4.2.3. Flujo de Cierre de Sesión (Logout)
```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend (Vite)
    
    Usuario->>Frontend (Vite): Presiona "Cerrar Sesión"
    Frontend (Vite)->>Frontend (Vite): Remueve "token" e "id" de localStorage
    Frontend (Vite)->>Frontend (Vite): Limpia estado de AuthProvider
    Frontend (Vite)->>Usuario: Redirección automática a /login
```

### 4.2.4. Creación de Publicación con Carga Desacoplada
```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend (Vite)
    participant FileStorage (API / CDN)
    participant API Backend (GraphQL Mutation)
    participant DB (SQL Server)

    Usuario->>Frontend (Vite): Selecciona archivo adjunto y completa texto de publicación
    Frontend (Vite)->>FileStorage (API / CDN): POST /api/files/upload (FormFile)
    FileStorage (API / CDN)-->>Frontend (Vite): Retorna URL del recurso / FileId (UUID)
    Frontend (Vite)->>API Backend (GraphQL Mutation): Mutation CreatePublicationAsync(Title, Content, FileId, SubjectId)
    API Backend (GraphQL Mutation)->>DB (SQL Server): INSERT INTO Consultas / Publicaciones
    DB (SQL Server)-->>API Backend (GraphQL Mutation): Confirmación física de registro
    API Backend (GraphQL Mutation)-->>Frontend (Vite): PublicationPayload (Success = true)
    Frontend (Vite)-->>Usuario: Muestra la nueva publicación con el recurso vinculado
```

### 4.2.5. Flujo de Vista Previa de Archivo (Preview Endpoint)
```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend (Vite)
    participant API Backend (Preview Controller)
    participant FileStorage (Local/S3/CDN)

    Usuario->>Frontend (Vite): Presiona "Ver Archivo" en la publicación
    Frontend (Vite)->>API Backend (Preview Controller): GET /api/files/preview/{FileId} (Token JWT)
    API Backend (Preview Controller)->>API Backend (Preview Controller): Valida autorización y firma del JWT
    API Backend (Preview Controller)->>FileStorage (Local/S3/CDN): Stream archivo desde almacenamiento
    FileStorage (Local/S3/CDN)-->>API Backend (Preview Controller): Stream de bytes (FileStream)
    API Backend (Preview Controller)-->>Frontend (Vite): Response HTTP 200 (Content-Type: application/pdf o image/*, Inline)
    Frontend (Vite)->>Usuario: Renderiza visor integrado en pantalla sin descargar archivo localmente
```
