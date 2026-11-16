# Feature Specification: P2 Closure QA

**Feature Branch**: `137-siu-notifications`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "Cierre exhaustivo de P2 con diagramas formales Mermaid y suite de pruebas unitarias automatizadas para AcademicService y NotificationService."

## User Scenarios & Testing

### User Story 1 - Arquitectura P2 documentada (Priority: P1)

Como equipo de entrega, necesito diagramas formales y actualizados para explicar el modelo de datos, la sincronizacion SIU y el flujo de notificaciones en tiempo real durante la presentacion y futuras revisiones.

**Why this priority**: Sin documentacion formal, el proyecto no queda listo para auditoria ni para avanzar con nube/mobile.

**Independent Test**: Revisar `docs/academic/04-design-diagrams.md` y confirmar que contiene Mermaid renderizable para ER completo, secuencia SIU y arquitectura Pub/Sub.

**Acceptance Scenarios**:

1. **Given** el codigo actual del backend y frontend, **When** se abre el documento de diagramas, **Then** el ER incluye entidades academicas, sociales, mensajeria, notificaciones y preferencias.
2. **Given** el flujo SIU implementado, **When** se revisa el diagrama de secuencia, **Then** queda claro el paso por GraphQL, `AcademicService`, adapter SIU, EF Core y notificaciones.
3. **Given** las notificaciones WebSocket, **When** se revisa el diagrama Pub/Sub, **Then** se visualiza la interaccion entre Apollo Client, HotChocolate, el topic privado y SQL Server.

---

### User Story 2 - Servicios academicos protegidos por tests (Priority: P2)

Como tech lead, necesito pruebas unitarias del servicio academico para detectar regresiones de autorizacion, pertenencia a carrera, upsert idempotente y emision de notificaciones antes de tocar nube o mobile.

**Why this priority**: `AcademicService` concentra reglas sensibles de P2: roles, notas, SIU y carrera.

**Independent Test**: Ejecutar `dotnet test` y verificar casos positivos y negativos de `AcademicService`.

**Acceptance Scenarios**:

1. **Given** un actor estudiante, **When** intenta cargar progreso, **Then** el servicio rechaza antes de guardar.
2. **Given** un administrador y un estudiante valido de la carrera, **When** se sincroniza SIU dos veces, **Then** no se crean duplicados y se actualiza el registro existente.
3. **Given** un recurso academico nuevo, **When** el actor es admin o profesor, **Then** se persiste y se solicita notificacion a estudiantes elegibles.

---

### User Story 3 - Notificaciones protegidas por tests (Priority: P3)

Como QA lead, necesito pruebas unitarias del motor de notificaciones para cubrir preferencias, lectura, limites de listado y tolerancia a fallos de Pub/Sub.

**Why this priority**: Las notificaciones son transversales y cualquier fuga entre usuarios o preferencia rota afecta confianza del sistema.

**Independent Test**: Ejecutar `dotnet test` y verificar casos de `NotificationService`.

**Acceptance Scenarios**:

1. **Given** un usuario activo sin preferencias, **When** consulta preferencias, **Then** se crean defaults habilitados para todos los tipos.
2. **Given** un tipo de notificacion deshabilitado, **When** se crea una notificacion de ese tipo, **Then** no se persiste para ese usuario.
3. **Given** una notificacion no leida, **When** el usuario la marca como leida, **Then** el estado cambia y el contador baja.

### Edge Cases

- SIU devuelve alumnos sin cuenta local, inactivos o fuera de carrera.
- Pub/Sub falla despues de persistir la notificacion.
- Un usuario intenta marcar una notificacion que no le pertenece.
- La documentacion debe renderizar Mermaid sin depender de imagenes externas.

## Requirements

### Functional Requirements

- **FR-001**: El documento `04-design-diagrams.md` MUST contener Mermaid real para ER completo, secuencia SIU y Pub/Sub de notificaciones.
- **FR-002**: La suite de tests MUST cubrir autorizacion y validaciones criticas de `AcademicService`.
- **FR-003**: La suite de tests MUST cubrir preferencias, persistencia, lectura y tolerancia Pub/Sub de `NotificationService`.
- **FR-004**: Los tests MUST ejecutarse con `dotnet test` sin requerir SQL Server Docker ni secretos.
- **FR-005**: El roadmap y estado documental MUST reflejar el inicio verificable de reduccion de deuda tecnica.

### Key Entities

- **Design Diagram Set**: Documento academico con diagramas Mermaid formales.
- **Backend Unit Test Suite**: Proyecto de pruebas automatizadas para servicios core.
- **Service Test Fixture**: Datos controlados para usuarios, carreras, materias, progreso y notificaciones.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Los diagramas requeridos renderizan como Mermaid valido en markdown.
- **SC-002**: `dotnet test` ejecuta una suite backend con al menos 10 pruebas automatizadas nuevas.
- **SC-003**: Las pruebas cubren al menos 3 escenarios negativos de autorizacion/pertenencia/preferencias.
- **SC-004**: El roadmap aumenta la evidencia de deuda tecnica reducida sin marcar pruebas frontend/GraphQL no implementadas.

## Assumptions

- Los tests de servicio pueden usar EF Core InMemory para aislar reglas de servicio y Moq para dependencias externas.
- No se deben tocar migraciones ni contratos GraphQL para esta spec.
- La verificacion visual de navegador queda fuera de alcance.
