# Feature Specification: Link Preview Anonymous Endpoint

**Feature Branch**: `128-link-preview-anonymous`

**Created**: 2026-06-19

## Overview

Finalizar la evasión de bloqueadores de anuncios convirtiendo el endpoint de previsualización de enlaces en un recurso anónimo (`[AllowAnonymous]`) con ruta `api/link-preview`. Al no requerir autenticación, el fetch del frontend se convierte en una petición GET limpia sin headers de autorización, lo que elimina el último vector de bloqueo por extensiones de privacidad.

## User Scenarios & Testing

### User Story 1 — Previsualización anónima funcional (Priority: P1)

Un usuario autenticado pega una URL en el redactor. El navegador hace un GET simple a `/api/link-preview` sin cookies ni headers de autorización. uBlock Origin no lo intercepta y la tarjeta de preview aparece.

**Acceptance Scenarios**:

1. **Given** uBlock Origin activo, **When** se pega una URL, **Then** el fetch llega al backend sin ser bloqueado.
2. **Given** el backend responde con `{ success: true }`, **Then** la tarjeta se renderiza.
3. **Given** el backend no disponible, **Then** el error se captura silenciosamente.

### Edge Cases

- URL inválida → backend retorna `{ success: false }`, sin preview.
- YouTube → el `useEffect` lo detecta antes de hacer fetch, no hay llamada.

## Requirements

- **FR-001**: El controlador DEBE usar `[AllowAnonymous]` — no se requiere JWT para leer etiquetas Open Graph públicas.
- **FR-002**: La ruta DEBE ser `api/link-preview`.
- **FR-003**: El fetch del frontend DEBE ser un GET limpio: sin `Authorization` header, sin `credentials`.
- **FR-004**: `MediaComponent.jsx` NO debe modificarse (constraint del usuario).

## Success Criteria

- **SC-001**: Backend compila con 0 errores.
- **SC-002**: Frontend compila con 0 errores.
- **SC-003**: El fetch a `/api/link-preview` no contiene `Authorization` ni `credentials` en las opciones.

## Assumptions

- El controlador anterior (`LinkInfoController.cs`) será eliminado y reemplazado.
- La política CORS ya tiene `AllowCredentials()` eliminado (spec 127).
- El pipeline CORS en Startup.cs ya está en orden correcto (spec 124).
