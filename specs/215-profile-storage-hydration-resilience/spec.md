# Feature Specification: Profile Storage and Hydration Resilience

**Created**: 2026-08-05  
**Status**: Implemented `[I]`; runtime acceptance pending  
**Priority**: P1  
**Recommended reasoning**: High

## Goal

Eliminar el `503` ambiguo del avatar mediante selección explícita y observable del
proveedor, conservar el avatar anterior ante fallos y evitar que el editor muestre datos
parciales de AuthContext antes de hidratar el perfil completo.

## User Scenarios & Testing

### User Story 1 - Editor coherente (P1)

El formulario muestra skeleton hasta cargar `me` y catálogo de carreras de la identidad
actual; nunca alterna de “Diaz” a “Diaz Francisco Agustin” ni muestra placeholders como
si fueran datos definitivos.

### User Story 2 - Avatar persistente en desarrollo (P1)

En Development, el modo local explícito permite subir, guardar, refrescar y volver a ver
el avatar. Un error no borra la URL previa.

### User Story 3 - Cloudinary operable (P2)

Cloudinary se selecciona solo de forma explícita, tiene diagnóstico finito y falla
cerrado en producción; nunca cae silenciosamente a disco tras un fallo remoto.

## Functional Requirements

- **FR-001**: El editor MUST renderizar solo snapshot completo de la sesión activa.
- **FR-002**: La selección de carreras MUST permanecer oculta/skeleton hasta hidratar.
- **FR-003**: `FileStorage:Provider` MUST seleccionar `Local` o `Cloudinary` explícitamente.
- **FR-004**: Development MUST admitir `Local` sin secretos externos.
- **FR-005**: Production con provider requerido incompleto MUST fallar al iniciar.
- **FR-006**: Upload remoto MUST tener timeout, cancelación y error sanitizado con correlación.
- **FR-007**: El frontend MUST mostrar modo/acción recuperable sin repetir automáticamente.
- **FR-008**: Guardar otros campos MUST preservar el avatar persistido.

## Success Criteria

- Upload-save-refresh local exitoso con una imagen válida.
- Cloudinary inválido produce diagnóstico controlado, sin filtración ni fallback oculto.
- Cero contenido parcial visible durante throttling de perfil/carreras.
