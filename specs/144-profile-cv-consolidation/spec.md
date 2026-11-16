# Feature Specification: Profile/CV Consolidation & Cleanup

**Feature Branch**: `144-profile-cv-consolidation`  
**Created**: 2026-06-29  
**Status**: Draft  
**Input**: Consolidar `/profile` como CV Builder, corregir permisos de edicion y eliminar `src/_temp_cv_reference`.

## User Scenarios & Testing

### Primary User Story

Un usuario autenticado Estudiante, Profesor o Egresado puede abrir "Editar Perfil" desde su perfil, cargar sus datos profesionales basicos y guardar biografia, telefono y redes sociales sin usar endpoints administrativos.

### Acceptance Scenarios

1. **Given** un usuario autenticado no administrador, **When** abre `/profile/edit`, **Then** el frontend consulta `me` y no `users`, evitando el error de autorizacion.
2. **Given** un usuario autenticado, **When** guarda biografia y redes, **Then** `updateProfile` solo acepta cambios sobre su propio usuario salvo rol Administrador.
3. **Given** el modulo CV, **When** compila el frontend, **Then** no existe ninguna dependencia ni import hacia `src/_temp_cv_reference`.

## Requirements

### Functional Requirements

- **FR-001**: El backend debe exponer un query GraphQL `me` autenticado con los campos necesarios para edicion de perfil.
- **FR-002**: `updateProfile` debe requerir autenticacion y validar que el actor edite su propio perfil, excepto Administrador.
- **FR-003**: El frontend debe reemplazar la consulta administrativa `users` por `me` en el flujo de edicion.
- **FR-004**: El CV Builder debe permitir guardar biografia, telefono y redes sociales persistidas.
- **FR-005**: La aplicacion debe eliminar `src/_temp_cv_reference` y quedar sin referencias colgantes.

### Non-Functional Requirements

- **NFR-001**: No se agregan migraciones ni cambios de schema de base de datos para esta estabilizacion.
- **NFR-002**: La UI nueva o modificada debe usar Tailwind v4.
- **NFR-003**: La validacion minima requerida es build backend, build frontend y busqueda sin referencias temporales.

## Out of Scope

- Persistencia de imagen/avatar como archivo real. El editor puede ofrecer previsualizacion local, pero almacenar avatar requiere una entidad/campo nuevo y queda fuera de esta limpieza.
- Redisenar por completo el CV publico aprobado visualmente.
