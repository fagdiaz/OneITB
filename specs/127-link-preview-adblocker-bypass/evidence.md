# Evidence — 127-link-preview-adblocker-bypass

## Build Evidence

| Check | Result |
|---|---|
| `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` | ✅ Compilación correcta — 0 Errores |
| `npm run build` (Vite) | ✅ 329 módulos transformados — 0 Errores |

## Changes Applied

### Backend
- **Eliminado**: `API Graphql/OneITB/Controllers/MetadataController.cs`
- **Creado**: `API Graphql/OneITB/Controllers/LinkInfoController.cs`
  - Ruta cambiada de `api/metadata` → `api/link-info`
  - Clase renombrada de `MetadataController` → `LinkInfoController`
  - Método renombrado de `GetMetadata` → `GetLinkInfo`
  - User-Agent cambiado de `OneITB-LinkPreviewBot/1.0` → `OneITB-Bot/1.0`
- **Modificado**: `API Graphql/OneITB/Startup.cs`
  - Eliminado `.AllowCredentials()` de la política CORS

### Frontend
- **Modificado**: `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - Endpoint actualizado: `/api/metadata` → `/api/link-info`
  - Eliminado `credentials: 'include'`
- **Modificado**: `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - Endpoint actualizado: `/api/metadata` → `/api/link-info`
  - Eliminado `credentials: 'include'`
  - Añadido `apiUrl` absoluto (antes era relativo `/api/metadata`)
  - Errores silenciados sin `console.error`

## Rationale

Los bloqueadores de anuncios (uBlock Origin, AdBlock Plus) usan listas de bloqueo (EasyList/EasyPrivacy) 
que filtran URLs por keywords heurísticas. La ruta `/api/metadata` coincide con patrones comunes de 
rastreadores de metadata. La ruta `/api/link-info` es semánticamente neutral y no aparece en ninguna 
blocklist conocida.

Adicionalmente, eliminar `credentials: 'include'` hace que el fetch sea un request CORS simple 
(non-credentialed), lo que reduce el escrutinio de las extensiones de privacidad del navegador.

## Runtime Status

- Runtime no verificado en browser (backend local requiere SQL Server cifrado).
- Compilación limpia confirma corrección sintáctica y de contratos estáticos.
