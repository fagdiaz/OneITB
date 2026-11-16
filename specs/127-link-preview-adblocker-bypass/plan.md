# Implementation Plan — 127-link-preview-adblocker-bypass

## Technical Context

- **Stack**: .NET 8, ASP.NET Core, HotChocolate 14, React 18, Vite, Tailwind CSS v4
- **Affected files**:
  - `API Graphql/OneITB/Controllers/MetadataController.cs` → renombrar a `LinkInfoController.cs`
  - `API Graphql/OneITB/Startup.cs` → quitar `AllowCredentials()`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` → actualizar URL y quitar `credentials: 'include'`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx` → actualizar URL del fetch interno (si aplica)

## Constitution Check

| Principio | Estado |
|---|---|
| I. Decoupled Application Contracts | ✅ El endpoint `/api/link-info` sigue siendo la excepción REST autorizada (proxy, sin persistencia) |
| II. Strict Security | ✅ JWT sigue en `Authorization` header, no en cookies |
| III. Input Validation | ✅ La validación de URL en el controlador se mantiene |
| IV. Relational Integrity | ✅ No hay cambios de modelo o migraciones |
| V. Secure Session & CORS | ✅ CORS sigue siendo restringido (WithOrigins explícitos), se simplifica eliminando AllowCredentials |
| VI. Evidence-Based Completion | ✅ Se ejecutarán builds de backend y frontend |

## Design Decisions

### ¿Por qué `/api/link-info`?
Los bloqueadores de anuncios usan listas de bloqueo (EasyList, EasyPrivacy, uBlock filter lists) que bloquean rutas por nombre. La palabra `metadata` aparece en varios patrones de bloqueo. Una ruta semánticamente neutral como `/api/link-info` no coincide con estos filtros.

### ¿Por qué eliminar `AllowCredentials()` y `credentials: 'include'`?
`credentials: 'include'` hace que el navegador adjunte cookies de sesión a la petición. Esto activa el modo "credenciado" del protocolo CORS, que:
1. Es más restrictivo (requiere `Access-Control-Allow-Credentials: true` en la respuesta).
2. Es más fácilmente detectado y bloqueado por extensiones de privacidad.
3. Es innecesario: el token JWT se envía como header `Authorization`, no como cookie.

Con `mode: 'cors'` sin `credentials: 'include'`, la petición es un simple CORS no credenciado, que los bloqueadores no interceptan.

## Component Changes

### Backend: `LinkInfoController.cs`
- Renombrar clase de `MetadataController` a `LinkInfoController`
- Cambiar ruta de `[Route("api/metadata")]` a `[Route("api/link-info")]`
- Sin cambios funcionales al cuerpo del controlador

### Backend: `Startup.cs`
- Eliminar `.AllowCredentials()` de la política CORS
- La política queda: `.WithOrigins(...).AllowAnyHeader().AllowAnyMethod()`

### Frontend: `Feed.jsx`
- Cambiar `${apiUrl}/api/metadata` → `${apiUrl}/api/link-info`
- Eliminar `credentials: 'include'` del objeto de opciones del `fetch`
- Mantener `mode: 'cors'`

### Frontend: `MediaComponent.jsx`
- Cambiar `/api/metadata` → `/api/link-info` en el fetch interno del `useEffect`
- Eliminar `credentials: 'include'` si estaba presente
