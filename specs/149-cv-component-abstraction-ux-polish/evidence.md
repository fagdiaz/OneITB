# Evidence: CV Component Abstraction & UX Polish

## Cambios ejecutados

- Se agrego `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx` como wrapper reutilizable del diseno A4 existente.
- `/profile` ahora construye un `CVData` desde `publicProfile` y monta `CVPrintTemplate` fuera de pantalla en modo web, visible solo durante impresion con `print:block`.
- La interfaz web completa de `/profile` queda dentro de `print:hidden`, por lo que `window.print()` captura solo el CV formal sin romper la medicion de paginas A4.
- Los enlaces "Editar CV/Perfil" y "Editar CV" ejecutan reset de scroll antes de navegar.
- `/profile/edit` ejecuta `window.scrollTo({ top: 0, left: 0, behavior: 'auto' })` al montar.

## Validacion

- `npm.cmd run build` desde `FrontEnd/OneItb-FE`: PASS.
- Resultado: 339 modulos transformados, build completado en 706ms.
- Advertencia residual: `vite:react-babel` informa opcion `esbuild` deprecada; es una deuda existente de tooling y no bloquea esta spec.

## No ejecutado

- No se ejecuto build backend porque no hubo cambios .NET, GraphQL ni EF Core.
- No se ejecuto validacion visual en navegador desde esta sesion.
