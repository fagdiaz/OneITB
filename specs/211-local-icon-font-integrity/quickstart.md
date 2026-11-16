# Quickstart

Desde `FrontEnd/OneItb-FE`:

```powershell
npm.cmd run test -- --run src/visualAssets.test.js
npm.cmd run test -- --run
npm.cmd run build
npm.cmd audit --omit=dev
```

Aceptación Firefox:

1. Abrir la aplicación con DevTools y caché deshabilitada.
2. Recargar Login, Landing y una ruta privada con iconos.
3. Confirmar en Network que los WOFF2 responden localmente.
4. Confirmar ausencia de `download failed` y `glyf bbox` para recursos OneITB.
5. Repetir con red externa bloqueada y registrar navegador, URL, consola y resultado.
