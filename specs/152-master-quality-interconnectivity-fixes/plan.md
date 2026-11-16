# Implementation Plan: Master Quality & Interconnectivity Fixes

## Technical Context

- Router real: `FrontEnd/OneItb-FE/src/router/Routing.jsx`.
- `/profile`: `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`.
- `/profile/edit`: `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`.
- Archivo fantasma detectado: `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`.
- Feed real: `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`.
- Header real: `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx` y `Nav.jsx`.

## Approach

1. Consolidar el contrato de perfil agregando `totalComments` a `PublicProfileSummary` y a `GET_PUBLIC_PROFILE`.
2. Corregir metricas de `UserProfile.tsx` con helper de pluralizacion.
3. Reemplazar el template de impresion por un A4 puro en `CVPrintTemplate.tsx`, evitando reusar `ResumePreview` en `/profile`.
4. Agregar boton Cancelar en `CvEditorProfile.tsx` usando `useNavigate`.
5. Fortalecer `UserAvatar` en `Feed.jsx` con cache local de URLs fallidas.
6. Confirmar Header/Nav reales y mantener spotlight por CSS variables.
7. Eliminar `EditProfile.jsx` si no tiene imports.

## Validation

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` porque cambia el contrato GraphQL de perfil.
- `npm.cmd run build` desde `FrontEnd/OneItb-FE`.

## Risks

- GraphQL runtime no queda validado solo con build; si el backend no esta levantado, registrar como no ejecutado.
- La impresion A4 puede truncar contenido excesivamente largo por decision de UX para evitar hojas extra en perfiles compactos.
