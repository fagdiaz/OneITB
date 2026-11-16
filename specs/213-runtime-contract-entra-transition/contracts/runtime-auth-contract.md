# Contract: Runtime and Redirect Acceptance

## Runtime preflight

- Confirma `/graphql`, `microsoftLogin`, `confirmStudentCareer`, `inquiriesPage` y versión.
- Sale distinto de cero ante ausencia, timeout o mismatch.
- No inicia servidores ni imprime secretos.

## Redirect invariant

`Entra redirect -> callback processing -> OneITB JWT committed -> onboarding/feed`.
No se permite `callback -> login -> private route` en éxito.

