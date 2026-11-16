# Research: Runtime Schema Onboarding Recovery

## Finding

El repositorio actual contiene `ConfirmStudentCareer(int careerId)` en `Mutation`, lo registra con `AddMutationType<Mutation>()` y el documento Apollo envía `$careerId`. El mensaje observado solo puede ser producido por un schema activo que no contiene ese campo, por lo que la hipótesis principal es un proceso backend iniciado con un corte anterior.

## Decision

No renombrar ni duplicar la mutación. Se añade detección defensiva, prueba de schema y procedimiento operativo para evitar que reinicios parciales de Vite oculten un backend obsoleto.
