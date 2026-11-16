# Feature Specification: Institutional Landing and Theme Polish

**Created**: 2026-08-05  
**Status**: Implemented `[I]`; final perceptual dark/reduced-motion acceptance pending  
**Priority**: P2  
**Recommended reasoning**: Medium

## Goal

Extender en 0,5 segundos la transición temática y acercar Home/footer a la identidad y
servicios reales del Instituto Tecnológico Beltrán, manteniendo el sistema visual OneITB
y sin copiar contenido o imágenes institucionales sin autorización.

## User Scenarios & Testing

### User Story 1 - Tema apreciable y accesible (P1)

El cambio claro/oscuro dura 1,3 segundos, no afecta impresión y queda desactivado con
`prefers-reduced-motion`.

### User Story 2 - Home institucional (P2)

El visitante identifica al Instituto Superior de Formación Técnica N.º 197, la comunidad
educativa, Office 365, SIU, sedes y propósito de vincular educación tecnológica, trabajo
y comunidad, sin confundir OneITB con el sitio oficial.

### User Story 3 - Enlaces confiables (P2)

Los accesos externos relevantes están claramente marcados y usan destinos oficiales.

## Functional Requirements

- **FR-001**: La transición global MUST pasar de 800 ms a 1300 ms.
- **FR-002**: Reduced motion y print MUST conservar duración cero.
- **FR-003**: Los estilos OneITB MUST dominar; se reutilizan tono institucional y
  conceptos, no se clona la web pública.
- **FR-004**: Contenido MUST basarse en fuentes oficiales y llevar fecha de consulta.
- **FR-005**: Enlaces externos MUST indicar que abandonan OneITB y ser accesibles.
- **FR-006**: No se MUST descargar/republicar imágenes protegidas sin permiso.
- **FR-007**: Home MUST seguir siendo responsive, rápido y legible en ambos temas.

## Success Criteria

- Cambio de tema visible durante 1,3 s y cero movimiento con reduced motion.
- QA identifica claramente institución, plataforma y enlaces oficiales.
- Sin regresión de contraste, overflow, impresión ni rendimiento relevante.
