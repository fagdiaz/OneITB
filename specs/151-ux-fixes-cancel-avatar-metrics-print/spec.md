# Feature Spec: UX Fixes — Cancel Button, Avatar Fallback, Metrics & Print

**Branch**: `151-ux-fixes-cancel-avatar-metrics-print`
**Created**: 2026-06-30
**Status**: In Progress

## Scope (frontend-only, no backend changes)

### FR-001 — Botón Cancelar en /profile/edit
En `EditProfile.jsx`, agregar un botón "Cancelar" de estilo secundario (borde gris) junto al botón "Guardar Cambios". Solo ejecuta `navigate('/profile')` sin mutaciones ni localStorage.

### FR-002 — Fallback de iniciales para avatares rotos en Feed
En `Feed.jsx`, el `<img>` del avatar usa `resolveAvatarUrl()` pero si la URL falla el navegador muestra imagen rota. Reemplazar el `<img>` desnudo por un componente inline que: a) muestra la imagen si carga, b) si `onError` dispara, oculta la imagen y muestra un div con las iniciales del usuario (mismo patrón que `getInitials` en `UserProfile.tsx`).

### FR-003 — Métricas del perfil con pluralización correcta
Las tarjetas de métricas (Publicaciones / Carreras / Materias) muestran la etiqueta en singular aunque el valor sea plural. Unificar la presentación: el label en singular/plural según el valor, o pasar a un subtítulo descriptivo más claro.

### FR-004 — Limpieza estricta de @media print en /profile
Problemas reportados: doble margen superior, fondos grises oscuros, 2 páginas por desbordamiento. Aplicar en el contenedor raíz y secciones principales de `UserProfile.tsx`:
- `print:shadow-none` en todas las `section` con sombra
- `print:bg-transparent` / `print:bg-white` en contenedores con fondo oscuro
- `print:overflow-hidden` en el wrapper para forzar una sola hoja
- `print:-ml-4` o equivalente en el avatar para alineación en print

## Success Criteria

- **SC-001**: Botón "Cancelar" visible en `/profile/edit`, navega a `/profile` al pulsarlo, sin ejecutar ninguna mutación.
- **SC-002**: Si el avatar de un post en el feed falla, se muestra fondo gris con iniciales en lugar del ícono roto del navegador.
- **SC-003**: Las métricas del perfil muestran etiquetas semánticamente correctas.
- **SC-004**: Al imprimir `/profile`, el documento ocupa una sola hoja sin márgenes extra ni fondos grises.
- **SC-005**: `npm.cmd run build` pasa sin errores TypeScript.
