# Evidencia del despacho GOB-20261108-09

Fecha local 2026-11-08. Base f22766df0ee3f981f074489b59a6fca4ec30c63d y rama feature/2026-11-01-debugger-cv-builder. La baseline de 271 Vitest, 237 xUnit y cero advertencias oxlint fue comunicada por el titular. Los conteos de este despacho pertenecen a una **copia de trabajo aislada** que incluye los cambios locales de chat y sesión previos al despacho; no certifican el commit base por sí solo.

| Verificación | Resultado observado |
|---|---|
| Reproducción con el SocialService original y el nuevo caso HiddenCareerTargetCannotBeCommentedOnOrReactedToById | Rojo. La lectura devuelve cero publicaciones, pero AddCommentAsync no lanza la excepción esperada y acepta el comentario de otra carrera. Las dos aserciones de reacción posteriores no llegaron a ejecutarse en este control rojo. |
| Primera regresión después del filtro compartido | 237 pasan y 1 falla. El caso positivo de respuesta dirigida usaba un estudiante que solo pertenecía a la otra carrera. La corrección asigna al interlocutor la carrera del hilo en ese caso positivo y conserva todas sus comprobaciones. La prueba adversarial independiente sigue usando carreras distintas. |
| Parche del muro, Release completo | 238/238 xUnit, 0 omitidas. Incluye comprobaciones de denegación para comentario, reacción a publicación y reacción a comentario, filas y ausencia de notificaciones. EF InMemory en el caso nuevo. |
| Parche más los dos archivos de domain | 239/239 xUnit, 0 omitidas. El segundo caso nuevo comprueba hash estable, exclusión de datos ocultos, orden, proyectos, idiomas y conservación de la captura tras mutar el perfil. El helper no está conectado al resolver ni a una migración en esta entrega. |
| Frontend con el parche | 272/272 Vitest en 62 archivos. El caso nuevo monta Feed en una ruta con MemoryRouter y MockedProvider, comprueba variables exactas, estado de objeto ausente y regreso. Las dos pruebas del enlace compartido usan el formato canónico. El render de la ruta completa y la impresión en navegador real quedan para Local AGY. |
| Vite 8.0.16 build de producción | Éxito, 564 módulos. |
| SDL | graphql.parse aceptó las 21 definiciones/extensiones del delta. La composición con el esquema real y su autorización son gates pendientes. |
| Parche | SHA-256 BC089D424445AF52C09ACEDBA712D14E4789418CE539F6FA00F92FC9BAEC661B. git apply --check --whitespace=error en el checkout original y git apply --reverse --check en la copia con los cambios dieron salida 0. Siete archivos, 122 inserciones y 59 eliminaciones. git diff --check dio salida 0 con avisos de normalización LF/CRLF sobre trabajo preexistente. |

### Comandos de referencia

Desde la raíz de la copia aislada, restauración desde la caché NuGet local, sin descargar dependencias; se usaron las dependencias frontend existentes.

```powershell
dotnet restore "API Graphql/Tests/Services.Tests/Services.Tests.csproj" --source "C:/Users/Fran/.nuget/packages" -p:NuGetAudit=false -m:1
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore -m:1 --filter FullyQualifiedName~HiddenCareerTargetCannot
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore -m:1
```

Desde FrontEnd/OneItb-FE:

```powershell
npm.cmd run test -- --run --maxWorkers=3
npm.cmd run build
```

Los primeros intentos en el sandbox se interrumpieron por IPC de VSTest y EPERM al renombrar archivos temporales de Vite. Los resultados de la tabla proceden de las repeticiones completas con los permisos correspondientes. No se arrancaron servidores de desarrollo ni se aplicaron migraciones. No se ejecutó oxlint en esta copia; no se encontró el ejecutable en el proyecto ni en PATH. No se verificaron SQL Server, roles reales por HTTP, WebSockets en navegadores, proveedores externos, maquetación de impresión ni las operaciones propuestas del SDL. No se activó la 220, no se modificó el ledger ni se emitió certificación de release.
