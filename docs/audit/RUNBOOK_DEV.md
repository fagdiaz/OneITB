# RUNBOOK_DEV - Guía de Desarrollo Local y Pruebas

Este manual describe detalladamente los pasos para iniciar, configurar y validar de forma local la plataforma OneITB23.

---

## 1. Prerrequisitos de Entorno

Para ejecutar el sistema completo de forma local, asegúrese de contar con:
* **.NET SDK 6.0**: Para construir y correr el backend en C#.
* **Node.js (v16+) & npm (v8+)**: Para construir e iniciar el cliente React + Vite.
* **SQL Server**: Instancia accesible de forma local (por ejemplo, SQL Server Express).
* **dotnet-ef**: Herramienta instalada de forma global (`dotnet tool install --global dotnet-ef`).

---

## 2. Configuración de Base de Datos y Backend

### Variables de Entorno y Conexión
Para permitir que la API se conecte a instancias locales de SQL Server sin fallas de certificados SSL de desarrollo, configure la propiedad `TrustServerCertificate=True` en la cadena de conexión de desarrollo del archivo `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=OneItb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### Ejecutar Migraciones de EF Core (Code-First)
Aplique el esquema inicial y las actualizaciones relacionales en la base de datos corriendo el siguiente comando exacto desde la raíz del proyecto:
```bash
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

### Construcción y Ejecución
Para compilar y correr el servidor de la API GraphQL:
```bash
# Compilar el proyecto backend
dotnet build "API Graphql/OneITB/GraphQL.csproj"

# Ejecutar el servidor de desarrollo
dotnet run --project "API Graphql/OneITB/GraphQL.csproj"
```
*El backend iniciará en el puerto local y expondrá el playground/endpoint GraphQL en `https://localhost:44397/graphql`.*

---

## 3. Configuración y Ejecución del Frontend

Navegue al directorio cliente e instale dependencias limpiamente antes de levantar el servidor Vite:

```bash
# Cambiar al directorio del cliente
cd FrontEnd/OneItb-FE

# Instalar dependencias con bloqueo limpio
npm ci

# Iniciar servidor de desarrollo local
npm run dev
```
*El cliente frontend se levantará por defecto en `http://localhost:5173` y enviará consultas al endpoint GraphQL.*

---

## 4. Lista Oficial de 35 Smoke Tests de Calidad y Seguridad

Antes de subir cambios, cada desarrollador o agente de IA debe validar de forma manual o automatizada los siguientes 35 escenarios fundamentales para garantizar la integridad y robustez del sistema:

### Backend & GraphQL Server (1-5)
1. Ejecutar `dotnet run` en backend y verificar que el proceso inicia sin errores de compilación o runtime.
2. Confirmar que el backend expone el endpoint `/graphql` respondiendo HTTP 200 para consultas de prueba.
3. Verificar que la API no exponga endpoints REST antiguos que puedan saltarse los resolvedores de GraphQL.
4. Validar que la cadena de conexión en `appsettings.json` apunta correctamente al target del entorno local.
5. Comprobar que `GraphQL` está correctamente mapeado mediante `MapGraphQL` en el archivo de inicio.

### Autenticación y JWT (6-13)
6. Ejecutar la mutation `authenticateUser` con credenciales de prueba válidas y verificar que retorna un `UserPayload` con token JWT y datos de usuario válidos.
7. Ejecutar la mutation `authenticateUser` con credenciales inválidas y verificar que la respuesta contenga un error de autenticación explícito.
8. Validar que el token JWT generado expira de forma estricta (por ejemplo, a las 2 horas) y que no posee tiempo de vida indefinido.
9. Verificar la configuración del JWT en el pipeline con `ValidateLifetime = true`.
10. Validar que el middleware `app.UseAuthentication()` esté registrado obligatoriamente en `Startup.cs` justo **antes** de `app.UseAuthorization()`.
11. Confirmar que las consultas protegidas en GraphQL tengan aplicado el atributo `[Authorize]` y rechacen solicitudes sin cabecera de autenticación.
12. Comprobar que el login del frontend guarda de forma segura `token` y `user` en el `localStorage`.
13. Comprobar que al presionar `Logout` en el frontend, se limpia el `localStorage` y se redirige al usuario a la ruta pública `/login`.

### Hashing de Contraseñas (14-17)
14. Comprobar que al registrar un nuevo usuario mediante `addUser`, la contraseña en la base de datos se almacena hasheada utilizando **BCrypt** de forma estricta.
15. Verificar que el hash resultante ocupe exactamente un espacio físico de **`char(60)`** en la base de datos SQL Server.
16. Comprobar en el modelo `User.cs` que la propiedad `Password` esté ignorada mediante el decorador `[GraphQLIgnore]` para prevenir la fuga de contraseñas.
17. Intentar consultar el campo `password` desde el cliente GraphQL y verificar que el servidor de HotChocolate devuelva un error de esquema de validación.

### Reglas Relacionales e Integridad (18-20)
18. Validar que el motor de base de datos relacional tenga las claves foráneas configuradas con `DeleteBehavior.Restrict` mediante la Fluent API de EF Core.
19. Intentar borrar un usuario que posee registros relacionados (ej. consultas, registros académicos) y verificar que SQL Server lance un error de integridad relacional bloqueando la eliminación.
20. Confirmar que no existen comportamientos de eliminación en cascada por defecto en las tablas de negocio críticas.

### Validación de Entradas y ReDoS (21-23)
21. Comprobar que la validación de correos electrónicos (`EmailRegex`) utilice una Regex optimizada y **compilada** (`RegexOptions.Compiled`).
22. Validar que se haya establecido un timeout estricto de **250ms** en la expresión regular de emails para prevenir ataques de denegación de servicio (ReDoS).
23. Intentar registrar un email con una cadena maliciosa de backtracking y verificar que el motor aborte el procesamiento devolviendo un error controlado en vez de colgar la CPU.

### Flujo Frontend, Apollo y Rutas (24-35)
24. Ejecutar `npm run dev` y confirmar que el cliente abre en el navegador web local sin excepciones de compilación de Vite.
25. Abrir la URL `/` y confirmar que renderiza correctamente el formulario de Login.
26. Navegar a `/login` y verificar la visualización correcta de la UI.
27. Navegar a `/register` y verificar la correcta visualización del formulario de registro.
28. Intentar ingresar a la ruta privada `/social` sin haber iniciado sesión y confirmar la redirección inmediata a `/login`.
29. Validar que el `AuthProvider` del cliente hidrate correctamente el estado inicial leyendo los tokens de `localStorage` al refrescar el navegador.
30. Comprobar que `PrivateLayout` restrinja el acceso a las vistas de negocio si no hay sesión activa en el estado global.
31. Ejecutar una consulta de datos general (ej. `getUsers`) y corroborar que los datos cargan en pantalla.
32. Confirmar que el cliente Apollo instancie correctamente el provider con un `authLink` que inyecte de manera dinámica la cabecera `Authorization: Bearer <token>` en cada consulta del frontend.
33. Validar que no existan discrepancias ni variables duplicadas al leer el token en el cliente frontend (standardizar su acceso).
34. Verificar que el build de producción del frontend (`npm run build`) compile de forma exitosa y genere la carpeta `dist`.
35. Validar que la configuración de orígenes permitidos de CORS no contenga el comodín `*` en entornos productivos, restringiéndose al host local del cliente frontend.
