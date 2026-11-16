# Feature Specification: Link Preview AdBlocker Bypass

**Feature Branch**: `127-link-preview-adblocker-bypass`

**Created**: 2026-06-19

**Status**: Draft

## Overview

Refactorizar el sistema de previsualización de enlaces para que funcione de forma confiable en navegadores con extensiones de bloqueo de anuncios activas (uBlock Origin, AdBlock, etc.), sin requerir modo incógnito ni desactivar extensiones.

## User Scenarios & Testing

### User Story 1 — Previsualización funciona con uBlock activo (Priority: P1)

Un usuario con uBlock Origin activo pega una URL en el redactor de publicaciones del Feed. La previsualización del enlace aparece correctamente con título, descripción e imagen, sin errores en consola.

**Why this priority**: Es la funcionalidad nuclear de la spec 123. Sin esto, la feature de Link Preview es inutilizable para la mayoría de usuarios que tienen bloqueadores.

**Independent Test**: Pegar una URL en el campo de texto del Feed con uBlock Origin activo → verificar que aparece la tarjeta de preview sin errores CORS ni bloqueos en consola.

**Acceptance Scenarios**:

1. **Given** el usuario tiene uBlock Origin activo, **When** pega `https://github.com` en el redactor, **Then** aparece una tarjeta de preview con el título y descripción del sitio.
2. **Given** el backend responde con `{ success: false }`, **When** el fetch llega al cliente, **Then** no se muestra ninguna tarjeta y la UI no se rompe.
3. **Given** el backend está caído, **When** el fetch falla, **Then** el error se captura silenciosamente y el redactor sigue funcional.

---

### User Story 2 — CORS simplificado sin AllowCredentials (Priority: P2)

El endpoint de link-info no requiere cookies de sesión; el JWT viaja en el header `Authorization`. La política CORS no necesita `AllowCredentials()`, lo que simplifica la configuración y elimina la restricción de que `credentials: 'include'` deba estar presente en el fetch.

**Why this priority**: `AllowCredentials()` + `credentials: 'include'` obliga al navegador a tratar la petición como credenciada, lo que activa más escrutinio de los bloqueadores de anuncios.

**Independent Test**: Verificar que la petición al nuevo endpoint no envía cookies y que el backend responde con los headers CORS correctos sin `Access-Control-Allow-Credentials`.

**Acceptance Scenarios**:

1. **Given** el frontend hace `fetch` al endpoint con `mode: 'cors'` sin `credentials: 'include'`, **When** el backend responde, **Then** el browser acepta la respuesta sin error.
2. **Given** el token JWT existe en `localStorage`, **When** se hace la petición, **Then** el header `Authorization: Bearer ...` se incluye correctamente.

---

### Edge Cases

- ¿Qué pasa si la URL pegada es inaccesible desde el servidor? → El controlador devuelve `{ success: false }` y el frontend no renderiza preview.
- ¿Qué pasa si no hay token JWT en el momento de pegar la URL? → El fetch omite el header `Authorization` y el controlador retorna 401/403; el cliente captura el error silenciosamente.
- ¿Qué pasa si el usuario pega una URL de YouTube? → El `useEffect` del Feed detecta YouTube y omite la llamada al endpoint.

## Requirements

### Functional Requirements

- **FR-001**: El endpoint de extracción de metadata DEBE usar una ruta neutral que no coincida con los filtros de bloqueadores (e.g. `/api/link-info` en lugar de `/api/metadata`).
- **FR-002**: El fetch desde el frontend DEBE usar `mode: 'cors'` pero NO `credentials: 'include'`.
- **FR-003**: La política CORS del backend NO DEBE incluir `AllowCredentials()`.
- **FR-004**: El token JWT DEBE seguir enviándose en el header `Authorization: Bearer ...` (no en cookies).
- **FR-005**: El frontend DEBE manejar errores de red/CORS silenciosamente sin romper la UI.
- **FR-006**: Todas las referencias al endpoint antiguo (`/api/metadata`) deben actualizarse a la nueva ruta.

### Key Entities

- **MetadataController** (a renombrar `LinkInfoController`): Controlador REST que actúa como proxy para extraer Open Graph tags.
- **Feed.jsx**: Componente con el `useEffect` que detecta URLs y llama al endpoint.
- **MediaComponent.jsx**: Componente que renderiza la tarjeta de preview.

## Success Criteria

### Measurable Outcomes

- **SC-001**: La previsualización de enlaces funciona con uBlock Origin activo en Firefox y Chrome sin errores en consola.
- **SC-002**: No aparece ningún bloqueo de CORS ni advertencia de CSP en la consola del navegador al pegar una URL.
- **SC-003**: Backend compila con 0 errores (`dotnet build -c Release`).
- **SC-004**: Frontend compila con 0 errores (`npm run build`).

## Assumptions

- El JWT se almacena en `localStorage` bajo la clave `token` y también está disponible via el hook `useAuth`.
- El servidor backend corre en `https://localhost:44397` en desarrollo.
- No se modifican migraciones de base de datos ni el esquema GraphQL.
- La lista de blocklist de uBlock (EasyList/EasyPrivacy) bloquea rutas que contienen "metadata", "tracker", "pixel", "analytics", "ad" entre otras keywords.
