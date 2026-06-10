# Feature Specification: Actualización Documental - Rol Empleador (044)

**Feature Branch**: `044-docs-employer-role-update`
**Created**: 2026-06-10
**Scope**: Documentation Only

## Problem Statement
The software architecture has evolved to include an "Employer" role and a "Moderator" role, alongside "Passwordless" authentication and community moderation. These critical system mechanics must be formally documented in the Software Requirements Specification to ensure alignment between business rules and code.

## Proposed Solution
Modify `02_Requerimientos.md` to:
1. Update domain restrictions (RF-001) to exempt the Employer role.
2. Introduce Passwordless + AFIP authentication (RF-003).
3. Add a new Functional Requirement for Community Moderation (RF-013).
4. Define the `Empleador` and `Moderador` roles in section 2.3.

## Success Criteria
- SC-001: The `02_Requerimientos.md` file reflects the aforementioned changes accurately.
