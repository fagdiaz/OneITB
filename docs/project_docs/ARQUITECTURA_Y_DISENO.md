# Especificación de Diseño y Arquitectura - OneITB23

Este documento recopila las decisiones de diseño técnico, el Diagrama de Entidad-Relación (DER) y los diagramas de secuencia corregidos para la evaluación de arquitectura de **OneITB23**.

---

## 1. Patrones Arquitectónicos y Estructura
El sistema implementa una arquitectura desacoplada por dominios:
* **Backend**: Desarrollado en .NET 6 con Entity Framework Core. Implementa el patrón **Repository y Unit of Work** para desacoplar el acceso a datos del resolver GraphQL (HotChocolate).
* **Frontend**: Desarrollado en React + Vite, consumiendo datos mediante **Apollo Client** de forma asíncrona.

---

## 2. Correcciones de Diseño Técnico (Resolución de Evaluaciones)

### 2.1. Normalización del Modelo de Datos (DER)
* **Tabla Cuentas (`Account`)**: Se agregó el campo `State` (estado de admisión/bloqueo de la cuenta) para dar soporte al control de admisión.
* **Países (`Country`)**: Normalización física de la entidad país en una tabla independiente, vinculada mediante llaves foráneas en lugar de almacenar strings duplicados.
* **Exclusiones de Seguridad**: Se aplica la exclusión física del campo `Password` en el esquema de resolvedores mediante `[GraphQLIgnore]` para cumplir con las directivas constitucionales.

### 2.2. Diagrama de Clases (Correcciones Aplicadas)
* **Clase Usuario (`User`)**: 
  - El método `Add` se documenta con su tipo de retorno específico (`Task<UserPayload>`).
  - El método `Edit` se re-especifica listando únicamente los parámetros editables (Nombre, Apellido, Rol) y exponiendo métodos accesores `GET` explícitos.
* **Clase Publicación (`Publication`)**:
  - Se añade de forma obligatoria la relación directa con la entidad `Subject` (Materia/Curso).
* **Relación Publicación-Comentario**:
  - Se define físicamente mediante una **Composición** (rombo negro), dado que la existencia del comentario depende de manera exclusiva de la publicación padre.
* **Enumeraciones de Usuario (`UserEnum`)**:
  - Mapeadas en el diagrama de clases usando flechas con punta abierta (Generalización).

---

## 3. Diagramas de Secuencia Corregidos (Flujos de Negocio)

### 3.1. Flujo de Registro de Usuario
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

### 3.2. Flujo de Inicio de Sesión (Login)
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

### 3.3. Flujo de Cierre de Sesión (Logout)
```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend (Vite)
    
    Usuario->>Frontend (Vite): Presiona "Cerrar Sesión"
    Frontend (Vite)->>Frontend (Vite): Remueve "token" e "id" de localStorage
    Frontend (Vite)->>Frontend (Vite): Limpia estado de AuthProvider
    Frontend (Vite)->>Usuario: Redirección automática a /login
```
*(Nota: Conforme a las correcciones evaluadas, el cierre de sesión se realiza enteramente en el lado del cliente limpiando los estados locales de sesión, sin disparar operaciones de creación en el servidor).*
