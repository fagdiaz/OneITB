# Implementation Plan: frontend-tracing

**Branch**: `010-frontend-tracing` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-frontend-tracing/spec.md`

## Summary

Modificar `Register.jsx` en el frontend React para:
1. Incluir un log de trazabilidad (`console.log`) que imprima el campo de Apellidos (`form.surname`) antes del envío.
2. Asegurar que las variables pasadas a la mutación (`useMutation`) están completamente sincronizadas con el estado local del formulario de React.

## Technical Context

**Language/Version**: JavaScript / React

**Testing**: Inspección del output de la consola.

## Project Structure

### Documentation (this feature)

```text
specs/010-frontend-tracing/
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
