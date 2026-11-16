# Implementation Plan: hotfix-institutional-domain-alignment

## Design Decisions

1. El dominio institucional oficial es `@itbeltran.com.ar`.
2. Se realizará una auditoría transversal en la base de datos, seeders, frontend y tests para verificar que no queden referencias a `@oneitb.edu.ar`.
3. Tras la verificación, como se determinó que la base de código actual ya se encuentra correctamente configurada con `@itbeltran.com.ar`, no se requerirán cambios de código invasivos, manteniendo el Code Freeze.

## Implementation Steps

1. **Auditoría de Dominio**: Búsqueda global de `@oneitb.edu.ar`.
2. **Auditoría de Reemplazo**: Búsqueda global de `@itbeltran.com.ar` para asegurar que está implementado.
3. **Validación de Tests**: Ejecución de pruebas automatizadas del backend.
4. **Validación del Frontend**: Ejecución del build productivo de Vite.
5. **Cierre de Spec**: Actualización del log de desarrollo.
