# Implementation Plan: frontend-validations

**Branch**: `008-frontend-validations` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-frontend-validations/spec.md`

## Summary

Modificar el método `saveUser` en `Register.jsx` del frontend para validar los campos del formulario antes de disparar la mutación. Se validará que todos los campos requeridos por `CU-01` estén completos, que el correo institucional finalice en `@itbeltran.com.ar`, que la contraseña tenga al menos 8 caracteres y que el alias/nombre de usuario tenga al menos 3 caracteres.

## Technical Context

**Language/Version**: JavaScript / React

**Testing**: Inspección de consola de React.

## Project Structure

### Documentation (this feature)

```text
specs/008-frontend-validations/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Task list
```

### Affected Files

```text
FrontEnd/OneItb-FE/src/Components/user/Register.jsx
```
