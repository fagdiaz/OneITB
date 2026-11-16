# Implementation Plan: Authoritative Student Enrollment

## Technical Context

`StudentEnrollmentService` y `StudentCareerSelectionPolicy` ya implementan la regla
central. La spec debe cerrar consumidores, caché y adapter boundary; no requiere nueva
entidad salvo que el proveedor institucional exija trazabilidad posterior.

## Design

1. Auditar todas las escrituras de `UserCareer` y centralizarlas en el servicio.
2. Probar onboarding y edición contra schema actual, incluyendo denegación multi-ID.
3. Invalidar `me`, carreras, feed, materias y recursos tras reemplazo.
4. Introducir `IInstitutionalEnrollmentProvider` con implementación local explícita.
5. Reservar provider SIU/Beltrán real como gate bloqueado por contrato externo.

## Constitution Check

Autorización deriva del JWT; FKs restrictivas; transacción e idempotencia; no se inventan
garantías de integración externa.

