# Feature Specification: Auth UX Fixes

**Feature Branch**: `141-auth-ux-fixes`  
**Created**: 2026-06-29  
**Status**: Completed  
**Input**: Reconciliacion documental de la spec registrada en `DEVELOPMENT_LOG.md` como "Spec 141: UX Fixes - F5 en Rutas Protegidas y Manejo de Errores en Login".

## User Scenarios & Testing

### Primary User Story

Como usuario autenticado, quiero poder recargar una ruta protegida sin ser expulsado prematuramente al login, y como usuario que ingresa credenciales invalidas quiero ver un error claro sin crash de UI.

## Requirements

- **FR-001**: `AuthContext` debe exponer estado de hidratacion para evitar evaluar rutas privadas antes de leer `localStorage`.
- **FR-002**: `PrivateLayout` debe mostrar estado de carga mientras la sesion se hidrata.
- **FR-003**: El backend debe serializar errores de login como `GraphQLException`.
- **FR-004**: El frontend debe mostrar el error GraphQL de login sin romper la pantalla.

## Scope

Esta spec es una reconciliacion documental. El codigo asociado ya fue implementado antes de crear este directorio de spec.
