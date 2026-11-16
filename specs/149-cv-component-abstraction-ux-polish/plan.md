# Implementation Plan: CV Component Abstraction & UX Polish

## Technical Approach

1. Crear `CVPrintTemplate.tsx` en `src/Components/resume/` como punto reutilizable del diseno formal del CV.
2. Reutilizar `ResumePreview` dentro del template para conservar el formato A4 validado en `/profile/edit`.
3. Construir en `UserProfile.tsx` un `CVData` desde `publicProfile`, incluyendo avatar, bio, contacto, carreras y secciones normalizadas.
4. Encapsular toda la UI web de `/profile` con `print:hidden` y montar `CVPrintTemplate` fuera de pantalla en modo web, visible solo bajo `print:block`, para que el calculo de paginas A4 siga siendo medible.
5. Agregar reset de scroll en `/profile/edit` y en los links de edicion desde `/profile`.

## Validation

- Frontend build: `npm.cmd run build` desde `FrontEnd/OneItb-FE`.
- No aplica build backend porque no hay cambios .NET.

## Risk Notes

- El template debe mantenerse conectado a `CVData`; no debe duplicar estado ni leer LocalStorage.
- El cambio de impresion debe evitar imprimir headers, chat, cards sociales y botones.
