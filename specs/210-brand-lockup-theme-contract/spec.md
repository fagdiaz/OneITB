# Feature Specification: Brand Lockup and Theme Contract

**Created**: 2026-08-04  
**Status**: Implemented; visual acceptance pending

## Goal

Corregir el lockup para que el isotipo represente la `O` y el texto adyacente sea `neITB`, preservar el asset sin filtros en modo claro y presentar el onboarding en tema claro sin destruir la preferencia persistida del usuario.

## Requirements

- El nombre accesible completo sigue siendo `OneITB`.
- El DOM visible del lockup contiene isotipo + `neITB`, nunca isotipo + `oneITB`.
- Ningún filtro, glow o alteración cromática se aplica al logo en modo claro.
- Un override visual de onboarding no sobrescribe `oneitb-theme`; al salir se restaura la preferencia.
- Header, Landing, Hero y Footer consumen un único componente atómico.

## User Scenarios

### Scenario 1 - Identidad visual inequívoca

Al visualizar una superficie OneITB, el usuario percibe el isotipo como la letra `O` y
el texto adyacente como `neITB`. El nombre accesible completo continúa siendo `OneITB`.

### Scenario 2 - Onboarding estable tras una recarga

Un Estudiante con preferencia oscura almacenada abre o recarga directamente
`/onboarding/academic`. La configuración inicial se presenta en tema claro, no modifica
`oneitb-theme` y, al abandonar esa ruta, la aplicación restaura el tema oscuro guardado.

### Scenario 3 - Tema claro sin alteración del asset

En modo claro, el archivo del isotipo se renderiza sin filtros CSS, brillo, recoloreado
ni sombras aplicadas sobre la imagen.

## Out of Scope

- Rediseñar los archivos PNG o producir nuevas variantes de marca.
- Cambiar la preferencia de tema elegida por el usuario.
- Resolver los warnings de integridad de la fuente Font Awesome; pertenecen a Spec 211.

## Acceptance

- Tests verifican contenido, accesibilidad, light/dark y montaje/desmontaje del override.
- QA visual cubre 320-1440 px y recarga directa de `/onboarding/academic`.
- Las pruebas automáticas no deben depender de `localStorage` residual de otra prueba.
