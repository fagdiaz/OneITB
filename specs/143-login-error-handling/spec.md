# Feature Specification: Login Error Handling

**Feature Branch**: `143-login-error-handling`  
**Created**: 2026-06-29  
**Status**: Completed  
**Input**: Reconciliacion documental de la spec registrada en `DEVELOPMENT_LOG.md` como "Spec 143: Login Error Handling - Crash al acceder data.login undefined".

## User Scenarios & Testing

### Primary User Story

Como usuario que ingresa credenciales invalidas, quiero recibir feedback de error sin que la pantalla de login produzca un `TypeError` al leer una respuesta GraphQL con `data` indefinida.

## Requirements

- **FR-001**: `Login.jsx` debe verificar `data?.login` antes de acceder a propiedades anidadas.
- **FR-002**: El callback `onError` de Apollo debe seguir siendo la fuente del mensaje visible.
- **FR-003**: El fix no debe duplicar flujos de error ni introducir navegacion incorrecta.

## Scope

Esta spec es una reconciliacion documental. El codigo asociado ya fue implementado antes de crear este directorio de spec.
