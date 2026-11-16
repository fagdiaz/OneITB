# Implementation Plan: align-graphql-mutation

**Branch**: `005-align-graphql-mutation` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-align-graphql-mutation/spec.md`

## Summary

Alinear la mutación GraphQL `addUser` en el frontend a `registerUser` para coincidir exactamente con el esquema del backend (HotChocolate). Esto requiere actualizar las variables que recibe (`username`, `email`, `password`) y los campos que retorna en `UserPayload` (`id`, `success`, `message`).

## Technical Context

**Language/Version**: JavaScript / React v18, Apollo Client v3.7.

**Primary Dependencies**: `@apollo/client`

**Testing**: Inspección de red/consola en frontend.

## Project Structure

### Documentation (this feature)

```text
specs/005-align-graphql-mutation/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Task list
```

### Affected Files

```text
FrontEnd/OneItb-FE/src/data/graphql/mutations/addUser.js
FrontEnd/OneItb-FE/src/Components/user/Register.jsx
```
