# Feature Specification: Theme Logo Asset Contract

**Created**: 2026-08-05  
**Status**: Implemented `[I]`; manual dark/responsive acceptance pending

## Goal

Restaurar la identidad visual basada en los assets aprobados: las superficies de marca
usan el logo completo original en modo claro y `logo-oneitb-dark-mode` en modo oscuro,
mientras el header conserva exclusivamente el isotipo `only-logo` en ambos temas.

## User Scenarios & Acceptance

### User Story 1 - Marca correcta por tema (P1)

Como visitante o usuario autenticado, veo el logo completo diseñado para el tema activo
sin filtros artificiales ni un wordmark reconstruido en HTML.

1. En tema claro, Hero, identidad, onboarding y footers muestran `logo-oneitb.png`.
2. En tema oscuro, esas superficies muestran `logo-oneitb-dark-mode.png`.
3. Cambiar de tema reemplaza el asset sin duplicar el nombre accesible.

### User Story 2 - Header compacto e invariable (P1)

Como usuario, el header muestra solamente el isotipo `only-logo.png`, sin `neITB`,
`oneITB`, glow ni sustitución por tema.

### User Story 3 - Composición estable (P2)

Como usuario en cualquier tamaño, los PNG completos mantienen proporción, no desbordan
su superficie y su lienzo cuadrado no introduce altura excesiva en footers o Hero.

## Requirements

- **FR-001**: El logo completo MUST usar `logo-oneitb.png` en tema claro.
- **FR-002**: El logo completo MUST usar `logo-oneitb-dark-mode.png` en tema oscuro.
- **FR-003**: El header MUST usar solo `only-logo.png` en ambos temas.
- **FR-004**: No se MUST aplicar filtros, glow, recoloreado ni wordmark DOM al asset.
- **FR-005**: Cada instancia MUST exponer un único nombre accesible o ser decorativa.
- **FR-006**: El cambio MUST preservar loading, decoding y fetch priority existentes.
- **FR-007**: Los assets MUST conservar relación de aspecto y no causar overflow.

## Edge Cases

- Preferencia oscura restaurada desde almacenamiento antes de montar la aplicación.
- Override claro temporal del onboarding con preferencia oscura persistida.
- Logo decorativo dentro de un enlace que ya posee nombre accesible.
- Fallo de carga del asset y cambios de tema durante transición.

## Out of Scope

- Editar los PNG, crear nuevos assets o modificar el sistema general de temas.
- Cambiar navegación, contenido del Home o comportamiento del onboarding.

## Success Criteria

- Las tres reglas de selección de asset tienen regresión automatizada.
- No existe texto `neITB` dentro del header ni del componente de logo completo.
- Suite frontend y build finalizan sin errores.
- QA visual pendiente se limita a contraste, encuadre y responsive en ambos temas.
