# CORS and CSP Fix

## Overview

Resolver los bloqueos de seguridad del navegador (CORS y CSP) que impiden el funcionamiento del `MetadataController` y la correcta previsualización de imágenes en el frontend. Se requiere configurar CORS en .NET 8 para habilitar peticiones del frontend y manejar las URIs (Data URIs / Blob) de forma segura para respetar el CSP del navegador.

## Context and Problem Statement

El frontend (Vite en puerto 5173) intenta consumir el nuevo endpoint REST `GET /api/metadata`, pero el backend rechaza la petición porque el controlador no tiene los encabezados de orígenes cruzados (CORS) permitidos, a diferencia de los endpoints de GraphQL que sí lo permitían. Adicionalmente, el frontend está intentando renderizar orígenes de imágenes utilizando formatos `data:text/plain;base64` u otros formatos inválidos, activando las alarmas del `Content-Security-Policy` del navegador.

## Target User/Persona

- **Desarrolladores/Administradores**: Asegurar que las funcionalidades de previsualización funcionen en el frontend sin errores de consola (CORS / CSP).
- **Usuarios Finales**: Experimentar una vista previa de enlaces con sus imágenes cargando de forma fluida y nativa.

## Scope and Boundaries

### In Scope
- Habilitar una política CORS en el backend de .NET 8 que permita al frontend (ej. `http://localhost:5173`) comunicarse correctamente con los controladores REST, específicamente el `/api/metadata`.
- Configurar adecuadamente o sanear las URLs e imágenes devueltas (CORS/CSP bypass) para que el navegador las acepte y renderice.
- Ajustar `MediaComponent.jsx` para que el renderizado de imágenes cumpla con la política CSP en la respuesta de metadata.

### Out of Scope
- Implementación de nuevas funcionalidades de proxy adicionales o descarga y hospedaje propio de imágenes generadas.
- Cambios arquitectónicos grandes en la política de seguridad general del servidor o la base de datos.

## User Experience / Workflows

1. **Workflow**: Al pegar un enlace en el publicador de estado, el frontend hace la petición `GET /api/metadata?url=...`.
2. **Backend**: El backend .NET 8 responde exitosamente permitiendo el acceso cruzado (Headers: `Access-Control-Allow-Origin`).
3. **Frontend**: El cliente recibe el JSON con la metadata y renderiza un Link Preview. La imagen asociada carga exitosamente sin desencadenar bloqueos de seguridad del CSP.

## Success Criteria

- Las llamadas desde el frontend en localhost (Vite) hacia los controladores REST (`/api/metadata`) no arrojan errores de CORS.
- Las imágenes extraídas mediante la metadata se muestran en la pantalla correctamente y sin alertas rojas de CSP o formato de imagen inválido (`data:image/...`).
- Compilación limpia de Frontend (Vite) y Backend sin romper integraciones existentes.

## Assumptions

- Las políticas de CORS deben aplicarse solo a orígenes autorizados o a todos durante desarrollo local, manteniendo seguridad para producción.
- El servidor backend y frontend operan en el entorno local (localhost puertos 44397 y 5173 respectivamente) o bajo orígenes conocidos.

## Quality Checklist

- [X] The problem is clearly defined and testable
- [X] Scope is explicitly bounded (in/out)
- [X] Success criteria are measurable and unambiguous
- [X] Edge cases are identified (e.g., image loading failures)
- [X] Dependencies on other systems are noted
- [X] Does not describe implementation details (how to code it)
