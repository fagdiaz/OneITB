# Feature Specification: Local Icon Font Integrity

**Created**: 2026-08-04  
**Status**: Verified in Firefox on 2026-08-05

## Goal

Eliminar los fallos y advertencias propias de la fuente Font Awesome local en Firefox manteniendo iconos offline y sin ocultar mensajes de consola.

## Requirements

- Los archivos de fuente deben provenir de una distribución coherente, versionada y declarada.
- CSS y webfonts deben pertenecer a la misma versión y pasar carga local.
- No se incorporan CDN ni excepciones de consola.
- Los iconos usados conservan nombre accesible o texto alternativo cuando corresponda.
- Los banners de desarrollo de React/Apollo/Vite se clasifican como informativos y no se intentan silenciar.

## User Scenarios

### Scenario 1 - Carga local íntegra

Al abrir OneITB en Firefox, el navegador obtiene CSS y WOFF2 desde el mismo artefacto
Vite, sin CDN, errores de descarga ni advertencias `glyf bbox` atribuibles a OneITB.

### Scenario 2 - Demo sin Internet

Con la red externa bloqueada, los controles conservan sus iconos porque la distribución
oficial forma parte de las dependencias fijadas y del bundle generado.

### Scenario 3 - Regresión detectable

Si CSS, metadata, versión o webfonts dejan de coincidir, la suite frontend falla antes
de la demostración.

## Out of Scope

- Ocultar banners informativos de React, Apollo o Vite en Development.
- Modificar warnings generados dentro de páginas de Microsoft.
- Sustituir todos los iconos por una nueva biblioteca visual durante Code Freeze.

## Acceptance

- Build emite fuentes versionadas sin referencias externas.
- Firefox carga cada fuente requerida sin `download failed` ni `glyf bbox` propios.
- Pruebas de assets y rutas principales pasan offline.
- El lockfile conserva una versión exacta, checksum de integridad y licencia oficial.
