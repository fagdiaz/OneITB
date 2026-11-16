# Plan: Local Icon Font Integrity

**Risk:** MEDIUM.

Auditar versión/hash del bundle vendorizado. Preferir una dependencia npm oficial fijada y eliminar el bundle incoherente solo tras migrar el import; si la dependencia no puede obtenerse, regenerar el subconjunto local desde una fuente oficial verificable. Validar CSS, WOFF2, build y Firefox.

## Design

1. Fijar `@fortawesome/fontawesome-free` 6.7.2 como dependencia runtime exacta.
2. Importar `css/all.min.css` desde el paquete; Vite resolverá sus WOFF2 y les asignará
   nombres versionados por contenido.
3. Utilizar la metadata del mismo paquete para validar todas las clases `fa-*` activas.
4. Eliminar la distribución 6.1.2 vendorizada para impedir resoluciones ambiguas.
5. Verificar manifiesto, lockfile, licencia, archivos requeridos, bundle y ausencia de
   referencias externas o a la ruta retirada.

## Risk controls

- No se usa CDN ni carga diferida remota.
- No se aplican filtros de consola ni user-agent workarounds.
- Se conserva Font Awesome 6 para evitar reescribir más de 50 iconos durante Code Freeze.
- La aceptación Firefox se registra aparte de build/tests; si no se ejecuta, permanece
  pendiente y el estado no asciende a `[V]`.
