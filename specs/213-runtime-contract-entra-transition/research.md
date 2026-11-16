# Research: Runtime Contract and Entra Transition

## Findings

- El código actual ya declara `confirmStudentCareer`; el error informado prueba que el
  backend ejecutado no correspondía al consumidor actual.
- Las advertencias CSP, BSSO, `Me.htm`, cookies y OneCollector nacen en dominios de
  Microsoft/Firefox. OneITB no puede eliminarlas ni debe relajar sus headers.
- La ruta callback ya está fuera de `PublicLayout`; el destello exige instrumentar la
  carrera entre MSAL, AuthContext, Apollo y guards, no añadir optional chaining.

## Decision

Primero validar paridad runtime; después corregir transiciones reproducibles sobre el
mismo corte. No atribuir al código nuevo fallos de un proceso antiguo.

