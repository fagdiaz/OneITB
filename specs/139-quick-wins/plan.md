# Implementation Plan: Quick Wins & Warning Cleanup

## Architecture

- **Frontend**: Vite Config `vite.config.js`. Uso de `rollupOptions.output.manualChunks` y `build.chunkSizeWarningLimit`.
- **Backend**: .NET `csproj` properties. Uso de `<NoWarn>` en PropertyGroup.

## Steps

1. Editar `vite.config.js` para añadir configuración de build y chunks.
2. Editar `GraphQL.csproj`, `Services.csproj` y `Entities.csproj` para añadir `<NoWarn>CS8632;CS8618;CS8604;CS8603</NoWarn>`.
3. Actualizar `DEVELOPMENT_LOG.md` con la auditoría.
4. Actualizar `ROADMAP.md` para reflejar el estado actual.
