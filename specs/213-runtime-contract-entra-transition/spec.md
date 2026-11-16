# Feature Specification: Runtime Contract and Entra Transition

**Created**: 2026-08-05  
**Status**: Implemented `[I]`; Microsoft browser acceptance pending  
**Priority**: P0  
**Recommended reasoning**: High

## Goal

Garantizar que la SPA y el backend ejecutado pertenecen al mismo corte, y que el retorno
de Microsoft Entra permanece en una única pantalla de transición hasta confirmar la
sesión OneITB, sin destellos de `/login` ni rutas privadas prematuras.

## User Scenarios & Testing

### User Story 1 - Contrato ejecutado correcto (P1)

Al iniciar la demo, el operador obtiene una comprobación finita que falla si el schema
activo no contiene las operaciones requeridas por el frontend, incluyendo
`microsoftLogin` y `confirmStudentCareer`.

### User Story 2 - Retorno institucional continuo (P1)

Al volver de Microsoft, el usuario ve solo el estado institucional de procesamiento
hasta que token, identidad, caché y ruta destino estén confirmados. `/login` se muestra
únicamente ante cancelación o error controlado.

### User Story 3 - Diagnóstico honesto (P2)

El equipo distingue errores propios de advertencias emitidas por páginas de Microsoft o
Firefox, sin debilitar CSP, CORS ni políticas de cookies para ocultarlas.

## Functional Requirements

- **FR-001**: El preflight MUST identificar puertos, procesos y contrato GraphQL activo.
- **FR-002**: El preflight MUST fallar ante una operación requerida ausente.
- **FR-003**: El callback MUST conservar una única vista hasta el commit de sesión.
- **FR-004**: Ningún guard MUST redirigir durante `HandleRedirect`, intercambio o commit.
- **FR-005**: Reintentos y doble montaje MUST ser idempotentes por flujo e identidad.
- **FR-006**: Errores propios MUST incluir correlación sanitizada; tokens quedan excluidos.
- **FR-007**: Ruido CSP/BSSO/cookies/telemetría de dominios Microsoft MUST clasificarse
  como tercero, no “corregirse” desde OneITB.

## Edge Cases

- Backend antiguo ocupando `44397`; HMR con frontend nuevo; callback recargado; dos
  cuentas MSAL; cancelación; token backend expirado; StrictMode; pestaña duplicada.

## Success Criteria

- El preflight detecta de forma determinista un schema viejo antes del QA.
- Cero render intermedio de Login en un acceso exitoso observado cuadro a cuadro.
- Un único intercambio backend y una única sesión persistida por redirect.

## Out of Scope

- Cambiar CSP o páginas de Microsoft; modificar el registro de aplicación en Azure.
