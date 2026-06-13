# Estado Actual de la Arquitectura del Sistema (Conforme a la Constitución v1.0.0)

> Snapshot histórico. La fuente vigente es
> `docs/audit/fix-roadmap-13-06-2026.md`. El stack actual utiliza .NET 8,
> EF Core 8.0.6, HotChocolate 14.2.0 y Vite 8.

Este documento describe la arquitectura real y los flujos de datos de la plataforma OneITB23, garantizando el cumplimiento de los principios fundamentales de diseño y gobernanza establecidos en la Constitución del Proyecto.

## 1. Visión General de la Pila Tecnológica

El sistema se divide en una arquitectura clásica Cliente-Servidor (Frontend y Backend desacoplados), comunicados de manera exclusiva a través de un único endpoint GraphQL, conforme al **Principio de Arquitectura GraphQL Desacoplada (Principio I)**.

### Backend (API)
- **Framework Core**: .NET 6 (ASP.NET Core).
- **Servidor GraphQL**: HotChocolate (integrado con ASP.NET Core).
- **Acceso a Datos**: Entity Framework Core (`Microsoft.EntityFrameworkCore`).
- **Base de Datos**: SQL Server.
- **Autenticación**: JSON Web Tokens (JWT) gestionados a través de `JwtBearerDefaults` con expiración estricta y validación activa.
- **Arquitectura de Código**: Dividida en 4 proyectos lógicos dentro de la misma solución (`.sln`):
  - `Data`: Define el contexto de Entity Framework (`OneItbContext`) y almacena las migraciones (Code-First).
  - `Entities`: Contiene los modelos del dominio (ej. `User`, `Account`) y las enumeraciones (ej. `States`, `Countries`).
  - `Services`: Contiene la lógica de negocio (`UsersService`, `AccountsService`).
  - `OneITB` (Proyecto Principal): Inicialización de la API, middlewares (`Startup.cs`, `Program.cs`) y la definición estricta de Mutaciones (`Mutation.cs`) y Consultas (`Query.cs`) para HotChocolate.

### Frontend (SPA)
- **Librería Core**: React (v18.2.0).
- **Bundler / Build Tool**: Vite (v4.2.0).
- **Cliente GraphQL**: Apollo Client (`@apollo/client` v3.7.12) para gestión de estado remoto y fetching.
- **Enrutamiento**: React Router DOM (v6.10.0) implementando layouts públicos y privados.
- **Estilos**: Vanilla CSS (`styles.css`, `responsive.css`) integrados de forma global.

---

## 2. Flujos de Datos Principales

### Flujo de Inicialización (Frontend)
1. Vite sirve `index.html` que carga `main.jsx`.
2. `main.jsx` envuelve la aplicación en el `<ApolloProvider>` (configurado en `GraphqlProvider.js` apuntando a `https://localhost:44397/graphql`).
3. El `App.jsx` instancia el `<AuthProvider>` (contexto de React) que lee inmediatamente el `localStorage` para hidratar la sesión previa si existe.
4. `Routing.jsx` decide qué layout renderizar (`PublicLayout` o `PrivateLayout`) basándose en la variable de estado proporcionada por `AuthProvider`.

### Flujo de Autenticación (Login)
1. El componente `Login.jsx` captura las credenciales del formulario.
2. Dispara la mutación GraphQL `authenticateUser` a través de Apollo Client.
3. **Backend**: HotChocolate recibe la petición, enruta al método `AuthenticateUser` en `Mutation.cs`.
4. `Mutation.cs` delega a `UsersService.GetByEmailAndPassword`.
5. `UsersService` consulta directamente a SQL Server vía `OneItbContext`.
6. Si es exitoso, `UsersService.GenerateToken` crea un string JWT.
7. Se retorna un objeto `UserPayload` que contiene el token y la data del usuario.
8. **Frontend**: Guarda el `token` y el `user` en `localStorage` y actualiza el estado de `AuthProvider`.

### Flujo de Consultas de Datos (Ej. Obtener Usuarios)
1. Un componente dispara el hook de Apollo `useQuery(GET_USERS)`.
2. La petición se envía a `/graphql`.
3. **Backend**: `Query.GetUsers` enruta la solicitud a `UsersService.GetAllAsync()`.
4. Devuelve un `IQueryable<User>` (o lista). Entity Framework construye la sentencia SQL y la ejecuta contra la base de datos.
5. Los modelos de la capa `Entities` son serializados automáticamente por HotChocolate y enviados al Frontend en formato JSON.

---

## 3. Puntos Críticos y Blindaje Arquitectónico

Con la ratificación de la Constitución de OneITB23, se resolvieron las vulnerabilidades heredadas:
- **Protección de Datos Sensibles**: Se implementó el decorador `[GraphQLIgnore]` en la propiedad `Password` de `User.cs` para evitar la fuga de contraseñas de texto plano por GraphQL.
- **Pipeline de Seguridad Riguroso**: Se configuró `app.UseAuthentication()` justo antes de `app.UseAuthorization()` para asegurar todas las consultas del backend.
- **Conexiones Seguras de Desarrollo**: Se formalizó el uso de `TrustServerCertificate=True` para entornos de desarrollo local en `RUNBOOK_DEV.md`.
