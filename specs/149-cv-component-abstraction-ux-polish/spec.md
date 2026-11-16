# Feature Specification: CV Component Abstraction & UX Polish

**Feature Branch**: `149-cv-component-abstraction-ux-polish`
**Created**: 2026-06-30
**Status**: Draft

## User Story

Como usuario de OneITB23, quiero que el boton "Imprimir CV" imprima un documento formal tipo A4, reutilizando el mismo diseno de previsualizacion del editor de CV, sin imprimir la interfaz web del perfil.

## Scope

- Extraer un componente reutilizable para el template imprimible del CV.
- Usar ese template desde `/profile` con visibilidad exclusiva de impresion.
- Mantener la interfaz web del perfil oculta durante la impresion.
- Corregir la navegacion hacia `/profile/edit` para iniciar en la parte superior.

## Acceptance Criteria

1. `/profile` mantiene la vista web normal en pantalla.
2. Al ejecutar `window.print()` desde `/profile`, solo se imprime el template formal del CV.
3. El template usa los datos persistidos del perfil/CV sin introducir estado paralelo.
4. El enlace "Editar CV" navega a `/profile/edit` sin conservar scroll inferior.
5. `npm.cmd run build` pasa sin errores.

## Out of Scope

- Cambios backend o migraciones.
- Nuevos campos de CV.
- Modificaciones de persistencia.
