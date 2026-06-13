# Tasks: Fix Shadow Properties

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: DB Fix

- [x] T001 Actualizar entidad `Subject.cs` (Agregar `Inquiries`).
- [x] T002 Actualizar entidad `Inquiry.cs` (Agregar `Subject`).
- [x] T003 Actualizar `OneItbContext.cs` (Mapeo explícito de Fluent API).
- [x] T004 Generar migración `FixShadowProperties`.
- [x] T005 Ejecutar Database Update.
