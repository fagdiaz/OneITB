# Feature Specification: Master Quality & Interconnectivity Fixes

**Feature Branch**: `152-master-quality-interconnectivity-fixes`
**Created**: 2026-06-30
**Status**: Completed

## User Stories & Acceptance Criteria

### US1 - Route Truth And Ghost File Removal (P1)

Como equipo de estabilizacion, necesitamos identificar los componentes reales para `/profile` y `/profile/edit` y eliminar archivos heredados que confunden futuras correcciones.

**Acceptance Criteria**

1. La spec documenta que `/profile` usa `UserProfile.tsx` y `/profile/edit` usa `CvEditorProfile.tsx`.
2. `EditProfile.jsx` no queda disponible si no participa del router ni tiene imports reales.

### US2 - Safe Profile Editing Escape (P1)

Como usuario editando mi CV, quiero cancelar y volver a `/profile` sin guardar cambios ni disparar mutaciones GraphQL.

**Acceptance Criteria**

1. El formulario real de `/profile/edit` muestra "Cancelar" al lado de "Guardar perfil y CV".
2. El boton navega a `/profile` sin ejecutar `updateProfile`.

### US3 - Defensive Avatar Rendering (P1)

Como usuario navegando el feed, no quiero que avatares corruptos o truncados ensucien la UI ni repitan fallos visuales.

**Acceptance Criteria**

1. Los avatares del feed usan fallback con iniciales si no hay URL o si la imagen falla.
2. Las URLs fallidas quedan cacheadas para evitar reintentos repetidos en el mismo render de la SPA.

### US4 - Profile Metrics And Print Quality (P1)

Como usuario viendo mi perfil, quiero metricas relevantes y un boton de impresion que genere un CV formal A4, no una captura de la web.

**Acceptance Criteria**

1. Las metricas superiores eliminan "Carreras" y "Materias" como contadores principales.
2. Se muestran "Aportes en la Comunidad" y "Materias Aprobadas" con datos reales y pluralizacion correcta.
3. El CV imprimible usa un template A4 puro, sin controles de zoom ni contenedores web.
4. El chat/header/web UI quedan ocultos en impresion.

### US5 - Header Spotlight Polish (P2)

Como usuario desktop, quiero un Header con spotlight sutil que siga el cursor y refuerce la interactividad sin provocar re-renders innecesarios.

**Acceptance Criteria**

1. El Header real usa `onMouseMove` y CSS variables, no estado React para coordenadas.
2. Los enlaces del Nav mantienen hover lift y shadow suave.

## Out of Scope

- Cambios de schema EF o migraciones.
- Nuevos modulos funcionales.
- Commit/push automatico.
