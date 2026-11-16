# Feature Specification: Full Profile & CV Schema Normalization

**Feature Branch**: `145-profile-cv-schema-normalization`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Consolidar `/profile/edit` para que perfil basico y CV extendido sean una sola estructura persistida, sin campos duplicados ni estado local huerfano.

## User Scenarios & Testing

### User Story 1 - Guardar un CV unificado (Priority: P1)

Un usuario autenticado edita su perfil profesional desde una unica pantalla, completa biografia, contacto, redes y secciones extendidas del CV, y guarda todo con una sola accion.

**Why this priority**: Es el bloqueo funcional directo detectado en auditoria manual: el usuario ve campos duplicados y no puede confiar en que el CV extendido quede persistido.

**Independent Test**: Iniciar sesion, abrir `/profile/edit`, editar biografia y una experiencia laboral, guardar, recargar la pagina y confirmar que ambos datos vuelven cargados desde el sistema.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado con datos de perfil existentes, **When** abre `/profile/edit`, **Then** ve un unico bloque para foto, biografia y redes, y debajo solo secciones extendidas del CV.
2. **Given** un usuario autenticado edita experiencia, educacion, proyectos, habilidades o idiomas, **When** presiona guardar, **Then** todos los datos quedan persistidos y se restauran al recargar.
3. **Given** el usuario cambia biografia o LinkedIn, **When** guarda, **Then** el preview del CV y el perfil publico usan el mismo dato.

---

### User Story 2 - Proteger integridad del contrato de perfil (Priority: P2)

El sistema rechaza CV extendido invalido o excesivo y mantiene las reglas de autorizacion existentes para que un usuario no pueda editar el perfil de otra persona.

**Why this priority**: Consolidar datos sin validacion abriria riesgo de payloads gigantes o JSON corrupto.

**Independent Test**: Enviar un CV extendido invalido o editar un `id` distinto al propio y confirmar rechazo controlado.

**Acceptance Scenarios**:

1. **Given** una mutacion de perfil con JSON invalido, **When** el backend la procesa, **Then** rechaza la solicitud con un error claro.
2. **Given** un usuario no administrador intenta editar otro perfil, **When** envia la mutacion, **Then** recibe rechazo de autorizacion.

### Edge Cases

- Si el usuario no tiene CV extendido guardado, el editor inicializa secciones vacias.
- Si el CV guardado no puede parsearse, la UI debe caer a estructura vacia sin romper la pantalla.
- Si el payload supera el limite aceptado, el backend debe rechazarlo antes de persistir.

## Requirements

### Functional Requirements

- **FR-001**: El sistema MUST tener una unica fuente persistida para los datos extendidos del CV del usuario.
- **FR-002**: El editor MUST eliminar los inputs duplicados de foto, biografia, telefono y redes dentro del bloque extendido.
- **FR-003**: El editor MUST cargar datos basicos y CV extendido desde una consulta unificada del usuario autenticado.
- **FR-004**: El editor MUST guardar datos basicos y CV extendido con una sola accion.
- **FR-005**: El sistema MUST validar que el CV extendido sea estructuralmente valido y tenga tamano razonable antes de persistirlo.
- **FR-006**: La actualizacion de perfil MUST conservar la regla de que un usuario comun solo puede editar su propio perfil.
- **FR-007**: El preview del CV MUST derivarse de la misma estructura que se guarda.

### Key Entities

- **User Profile**: Perfil persistido del usuario, incluyendo biografia, telefono, redes y CV extendido.
- **CV Extended Data**: Secciones editables de experiencia, educacion, proyectos, habilidades e idiomas.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Un usuario puede guardar y recargar un CV con al menos una experiencia y una educacion sin perdida de datos.
- **SC-002**: La pantalla `/profile/edit` no muestra mas de un grupo de inputs para biografia, telefono o redes.
- **SC-003**: El guardado completo del perfil se completa con una sola accion del usuario.
- **SC-004**: Payloads invalidos o no autorizados son rechazados sin modificar datos existentes.

## Assumptions

- La persistencia de avatar real queda fuera de esta spec; la pantalla puede conservar preview local mientras no exista campo de archivo de avatar.
- Para el MVP, el CV extendido se puede persistir como documento estructurado asociado al usuario.
- Las secciones extendidas del CV son personales y editables solo por el propietario o un administrador.
