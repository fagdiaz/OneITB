# Implementation Plan

## Component Changes

### 1. Backend: `API Graphql/OneITB/Controllers/MetadataController.cs`
- **Current State**: Extrae la etiqueta `og:image` y la retorna cruda al cliente.
- **New State**: Saneamiento estricto de la URL de la imagen. Solo retornará la URL si comienza con `http://` o `https://`. Caso contrario, retornará `null`.
- **Reasoning**: Evita enviar URIs inválidas, especialmente `data:text/plain;base64,...` o rutas relativas que rompen la seguridad CSP y CORS del frontend.

### 2. Frontend: `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
- **Current State**: El iframe de YouTube tiene el atributo `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`.
- **New State**: Se reducirá el atributo `allow` a `"autoplay; encrypted-media; picture-in-picture"`.
- **Reasoning**: Las características de hardware (`accelerometer`, `gyroscope`, `clipboard-write`) están deprecadas o bloqueadas por defecto en varios navegadores, lo cual genera advertencias innecesarias de Feature Policy.
