# Backend Audit Report - OneITB23

> Historical snapshot. For the current verified baseline, use
> `docs/audit/fix-roadmap-13-06-2026.md` and `docs/audit/DOCUMENTATION_STATUS.md`.
> The current backend is .NET 8, EF Core 8.0.6, and HotChocolate 14.2.0.

Este documento funciona como un mapa topográfico y arquitectónico del backend del proyecto, desarrollado en .NET 8 con GraphQL. Es la contraparte del reporte frontend y proporciona contexto de la estructura, entidades y endpoints expuestos.

---

## 1. Arquitectura y Stack

El backend de OneITB23 está construido bajo una arquitectura modular y en capas utilizando las siguientes tecnologías:
* **Framework Principal**: .NET 8 LTS (ASP.NET Core 8.0)
* **Acceso a Datos**: Entity Framework Core 8.0.6
* **Motor GraphQL**: HotChocolate 14.2.0
* **Base de Datos**: SQL Server

---

## 2. Estructura de Directorios

La solución está subdividida en distintos proyectos para separar las responsabilidades:

| Directorio | Propósito / Capa |
| :--- | :--- |
| **`API Graphql/Data/`** | Capa de Acceso a Datos. Contiene el contexto de base de datos (`OneItbContext`) y todas las migraciones de EF Core. |
| **`API Graphql/Entities/`** | Capa de Dominio. Contiene los modelos físicos que mapean a la base de datos (POCO classes). |
| **`API Graphql/Services/`** | Capa de Lógica de Negocio. Aloja interfaces y servicios concretos (ej. `UsersService`, `AccountService`, `EmployerAuthService`, `ModerationService`). |
| **`API Graphql/OneITB/`** | Capa de Presentación (API). Punto de entrada de la aplicación (`Program.cs`, `Startup.cs`) y la definición de los resolvers de GraphQL (`Query.cs`, `Mutation.cs`). |

---

## 3. Mapa de Base de Datos (EF Core)

El contexto central de la aplicación se llama **`OneItbContext`** y expone los siguientes `DbSets` (Tablas):

* `Accounts`: Credenciales de acceso y hash de contraseña.
* `Users`: Información de perfiles, roles y biografías (relación 1:1 con `Accounts`).
* `Subjects`: Entidades de materias o áreas de estudio.
* `Inquiries`: Consultas realizadas por usuarios dentro de materias específicas.
* `CommunityReports`: Reportes de moderación de contenido comunitario.
* `MagicLinks`: Tokens efímeros utilizados en el flujo Passwordless para Empleadores.

---

## 4. Endpoints GraphQL

El motor de HotChocolate expone actualmente un esquema central con las siguientes operaciones:

### Queries Principales (`Query.cs`)
* `getUsers`: Retorna la lista de usuarios.
* `getUserById(id)`: Retorna un usuario específico por su identificador.

### Mutaciones Principales (`Mutation.cs`)
* **Autenticación y Registro**:
  * `registerUserAsync(input)`: Registro de nuevos usuarios con validaciones de seguridad.
  * `login(input)`: Autenticación estándar que retorna el JWT (`AuthPayload`).
* **Gestión de Perfil**:
  * `updateProfile(input)`: Actualización de datos, biografía y redes sociales del perfil.
* **Administración**:
  * `updateUserRole(userId, newRole)`: Cambia el rol de un usuario (solo Administradores).
  * `updateUserStatus(userId, isActive)`: Habilita o deshabilita a un usuario (solo Administradores).
* **Empleadores (Passwordless)**:
  * `requestMagicLink(email, cuit)`: Emite y envía un Magic Link temporal.
  * `loginWithMagicLink(token)`: Consumo del token y acceso autenticado para empleadores.
* **Moderación**:
  * `reportContent(reporterId, contentId, contentType, reason)`: Envío de un reporte sobre contenido problemático.
