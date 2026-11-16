# Error Log Fixes

## Overview

Resolver las advertencias y bloqueos registrados en los logs del navegador (Errores.txt), específicamente enfocados en las advertencias de Feature Policy del iframe de YouTube y los bloqueos CORS ocasionados por data URIs inválidas retornadas desde el proxy de metadatos.

## Context and Problem Statement

El registro de errores del navegador arroja varios problemas:
1. Advertencias de Feature Policy relacionadas con atributos del `iframe` de YouTube (`accelerometer`, `clipboard-write`, `encrypted-media`, `gyroscope`, `picture-in-picture`).
2. Solicitudes de origen cruzado bloqueadas debido a que el backend retorna una imagen con formato inválido (`data:text/plain;base64,Cg==`), lo que provoca que el frontend intente cargarlo.
3. Advertencias de "unreachable code" provocadas por extensiones del navegador y protección contra fingerprinting de Firefox (Fuera de alcance).
4. Desconexión de GraphQL (`Socket closed`), la cual es un comportamiento natural durante el hot-reload de desarrollo.

## Target User/Persona

- **Desarrolladores/Administradores**: Reducir el ruido en la consola del navegador para facilitar el debug.
- **Usuarios Finales**: Evitar fallas de renderizado y peticiones CORS innecesarias que degraden la red.

## Scope and Boundaries

### In Scope
- Saneamiento estricto de la URL de la imagen en `MetadataController.cs`. Solo se aceptarán URLs absolutas HTTP/HTTPS válidas. Si es una URI de tipo `data:`, se descartará desde el backend para evitar inyecciones maliciosas o textos base64 inválidos.
- Simplificación de los atributos `allow` en el `iframe` de YouTube dentro de `MediaComponent.jsx` para suprimir advertencias de Feature Policy.

### Out of Scope
- Corrección de scripts inyectados por el navegador o extensiones (`Drz51tb_*.js`).
- Modificación del cliente Apollo para suprimir errores de desconexión por Hot-Reload.

## User Experience / Workflows

1. **Workflow**: Al previsualizar un enlace, el proxy extrae la metadata. Si la imagen es un base64 inválido de tipo texto, el proxy simplemente devuelve `null` en lugar de una URL rota.
2. **Workflow**: Al renderizar un video de YouTube, la consola del navegador se mantiene limpia de advertencias de Feature Policy.

## Success Criteria

- La consola no muestra advertencias de Feature Policy al cargar videos.
- No hay solicitudes CORS bloqueadas hacia rutas `data:text/plain;base64...`.
- Compilación exitosa en backend y frontend.

## Assumptions

- Se pueden remover los atributos de `allow` del iframe de YouTube sin afectar su reproducción básica.
- El backend puede omitir URLs que no comiencen con `http://` o `https://`.

## Quality Checklist

- [X] The problem is clearly defined and testable
- [X] Scope is explicitly bounded (in/out)
- [X] Success criteria are measurable and unambiguous
- [X] Edge cases are identified (e.g., image loading failures)
- [X] Dependencies on other systems are noted
- [X] Does not describe implementation details (how to code it)
