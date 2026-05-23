# RUNBOOK_DEV

## Prerrequisitos
- .NET SDK 6 (backend).
- Node.js + npm (frontend).
- SQL Server accesible para `DefaultConnection`.
- Herramienta `dotnet-ef` si se ejecuta `dotnet ef database update`.

## Variables de entorno observadas
- `ASPNETCORE_ENVIRONMENT=Development` (definido en `API Graphql/OneITB/Properties/launchSettings.json`).

## Backend (API GraphQL)

### Ubicaci?n
- `API Graphql/OneITB/GraphQL.csproj`

### Comandos (exactos)
```
dotnet --info
dotnet build "API Graphql/OneITB/GraphQL.csproj"
dotnet run --project "API Graphql/OneITB/GraphQL.csproj"
```

### Migraciones EF Core
```
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

### Notas de configuraci?n
- Cadena de conexi?n en `API Graphql/OneITB/appsettings.json`:
  - `ConnectionStrings:DefaultConnection`.
- JWT en `API Graphql/OneITB/appsettings.json`:
  - `Jwt:Issuer`, `Jwt:Audience`, `Jwt:Key`.

## Frontend (React/Vite)

### Ubicaci?n
- `FrontEnd/OneItb-FE`

### Comandos (exactos)
```
npm ci
npm run dev
npm run build
npm run preview
```

### Notas de configuraci?n
- Endpoint GraphQL fijo en `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`:
  - `https://localhost:44397/graphql`.

## Smoke tests manuales (35)
1. Ejecutar `dotnet run` en backend y verificar que el proceso inicia sin errores.
2. Verificar que el backend expone endpoint `/graphql` (HTTP 200/400 seg?n cliente).
3. Ejecutar `npm run dev` y abrir la app en el navegador.
4. Verificar que la ruta `/` renderiza Login.
5. Verificar que `/login` renderiza Login.
6. Verificar que `/register` renderiza Register.
7. Intentar acceder a `/social` sin sesi?n y confirmar redirecci?n a `/login`.
8. Ejecutar mutation `authenticateUser` con credenciales v?lidas y verificar respuesta con `user` y `token`.
9. Ejecutar mutation `authenticateUser` con credenciales inv?lidas y verificar error.
10. Verificar que Login guarda `token` y `user` en `localStorage`.
11. Verificar que `AuthProvider` carga `auth` desde `localStorage` al refrescar.
12. Verificar que `PrivateLayout` permite acceso con `auth.id` presente.
13. Verificar que `Logout` limpia `localStorage` y navega a `/login`.
14. Ejecutar query `users` y verificar respuesta con lista.
15. Verificar que `users` incluye `password` en el payload (si el backend lo retorna).
16. Ejecutar query `userById` con un id existente.
17. Ejecutar query `userById` con un id inexistente y observar respuesta.
18. Ejecutar mutation `addUser` con email v?lido (dominio coincide con cuenta).
19. Ejecutar mutation `addUser` con email inv?lido (dominio no coincide) y verificar error.
20. Ejecutar mutation `addUser` con email duplicado y verificar error.
21. Verificar que `UsersService.CreateAsync` crea registro en DB.
22. Verificar que `UsersService.GetByEmailAndPassword` recupera usuario con password correcto.
23. Verificar que `AccountsService.GetById` devuelve cuenta.
24. Verificar que `GraphqlProvider` apunta a `https://localhost:44397/graphql`.
25. Verificar que `ApolloProvider` se inicializa en `main.jsx`.
26. Verificar que `Routing.jsx` contiene rutas p?blicas y privadas.
27. Verificar que `AuthProvider` no valida token contra servidor.
28. Verificar que `UseAuthorization` est? en pipeline.
29. Verificar que `UseAuthentication` no est? en pipeline.
30. Verificar que `ValidateLifetime` est? en `false`.
31. Verificar que CORS permite cualquier origen.
32. Verificar que `appsettings.json` contiene `DefaultConnection`.
33. Verificar que `Jwt:Key` est? definido en config.
34. Verificar que `GraphQL` est? mapeado en `Startup.cs` (`MapGraphQL`).
35. Verificar que `GetUsers` devuelve `Task<List<User>>` y no DTOs.
