# Implementation Plan: Profile Storage and Hydration Resilience

## Technical Context

El `503` llega desde Kestrel después de autenticación y validación: el proxy funciona y
falló `IFileStorageService`. Actualmente la presencia de `CloudinarySettings:Url` elige
provider; se reemplazará por modo explícito. Sin migración EF.

## Design

1. Agregar opciones validadas `FileStorage:Provider` y timeout.
2. Declarar `Local` de forma explícita en Development; Production usa `Cloudinary`
   explícito y falla cerrado si su configuración está incompleta.
3. Añadir smoke automatizado del contrato del adapter con transporte simulado y dejar el
   smoke contra Cloudinary real como gate externo separado, sin exponer secretos.
4. Mejorar respuesta 503 y traducción frontend.
5. Consolidar el gate de hidratación existente y sus regresiones con red lenta.

## Primary Files

- `API Graphql/OneITB/Services/Storage/FileStorageRegistration.cs`
- `API Graphql/OneITB/Services/Storage/CloudinaryStorageService.cs`
- `API Graphql/OneITB/Controllers/UploadController.cs`
- `FrontEnd/OneItb-FE/src/utils/uploadFile.js`
- `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`

## Constitution Check

Fallback local queda limitado a Development; Production no degrada seguridad; no se
registran URLs con secretos; archivos mantienen validación magic bytes y límites.
