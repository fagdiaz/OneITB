# Specification: Pre-Commit Stabilization (049)

## Feature Description
Barrido de análisis estático (Linting) y estabilización de código en el Frontend (React) para eliminar deuda técnica residual antes del commit de cierre de hito.

## Scope
- Solo archivos `.jsx` y `.tsx` del Frontend.
- Prohibido modificar `.cs` del Backend.

## Issues Detected & Fixed
1. `Login.jsx` — `console.log(err)` en bloque catch (debug expuesto).
2. `Register.jsx` — `useQuery(GET_USERS)` huérfana + 3× `console.log` de debug.
3. `Feed.jsx` — `import { useQuery }` y `import { GET_USERS }` huérfanas (bundle bloat).
