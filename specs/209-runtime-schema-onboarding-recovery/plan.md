# Implementation Plan: Runtime Schema Onboarding Recovery

**Risk:** HIGH, por afectar el cierre de SSO, autorización GraphQL y estado de sesión.

## Summary

Verificar el contrato tanto al construir el schema como sobre el proceso activo, clasificar explícitamente el desfasaje de binarios y endurecer el mapeo de errores del onboarding. La mutación y el servicio existentes siguen siendo la fuente de verdad.

## Technical Design

1. Conservar `Mutation.ConfirmStudentCareer` y su autorización declarativa.
2. Ampliar la prueba de schema para ejecutar la operación hasta la fase de autorización, demostrando que el campo y argumento se validan.
3. Clasificar en frontend errores de validación que indiquen una API incompatible mediante un mensaje estable en español.
4. Documentar una introspección HTTP finita y el procedimiento para identificar/reiniciar solo el proceso local obsoleto.

## Constitution Check

- Contrato y autorización backend: PASS.
- Frontera de sesión Apollo: no cambia.
- Persistencia/EF: no cambia.
- Errores: no se filtran detalles internos al usuario.
- Evidencia: build, pruebas e introspección real separadas.

## Planned Files

- `FrontEnd/OneItb-FE/src/Components/onboarding/academicOnboardingState.js`
- `FrontEnd/OneItb-FE/src/Components/onboarding/academicOnboardingState.test.js`
- `FrontEnd/OneItb-FE/src/Components/onboarding/AcademicOnboarding.test.jsx`
- `API Graphql/Tests/Services.Tests/GraphQL/StudentEnrollmentGraphQLContractTests.cs`
- `docs/audit/RUNBOOK_DEV.md`
- documentación de seguimiento y evidencia de esta spec.
