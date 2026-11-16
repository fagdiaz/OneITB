# Feature Specification: Reestructuración de Documentación Académica y Gobernanza Core-Web

**Feature Branch**: `003-docs-governance`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Estructurar la documentación académica en /docs/academic/ (Requerimientos, Casos de Uso, DER, Diagramas) basada en las 3 funcionalidades core (Auth, Muro, Mensajería) y optimizar los archivos de gobernanza en /core-web/ para Gemini Web."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Estructuración Modular Académica (Priority: P1)

El estudiante y el jurado académico deben poder leer la documentación del proyecto de forma modular, ordenada exactamente según las directivas de la plantilla de "Prácticas Profesionalizantes III", enfocándose en las 3 funcionalidades core: Gestión de Identidad/Roles, Muro de Publicaciones Interactivo y Sistema de Mensajería.

**Why this priority**: Es el entregable académico mandatorio del proyecto para su evaluación.

**Independent Test**: Se puede validar verificando la existencia de los archivos `.md` correspondientes a cada sección del entregable en `/docs/academic/` y comprobando que no contienen placeholders vacíos.

**Acceptance Scenarios**:
1. **Given** un directorio de documentación académica `/docs/academic/`, **When** se revisan los archivos, **Then** deben existir `01_Presentacion_General.md`, `02_Requerimientos.md`, `03_Casos_De_Uso.md` y `04_Diagramas.md` con contenido alineado a las 3 funcionalidades core.
2. **Given** los casos de uso generados, **When** se leen en `03_Casos_De_Uso.md`, **Then** deben describir detalladamente las interacciones para Auth, Muro y Mensajería sin lagunas técnicas.

---

### User Story 2 - Optimización de Gobernanza Core-Web (Priority: P2)

El administrador del sistema y los agentes de IA (como Gemini Web) deben poder consumir las directivas de gobernanza y especificaciones del sistema de forma optimizada en cuanto a consumo de tokens, sin perder ninguna regla constitucional ni compatibilidad con speckit.

**Why this priority**: Optimiza los costos y límites de contexto para el desarrollo asistido por IA.

**Independent Test**: Comprobar la reducción de tamaño en caracteres/tokens de los archivos en `/core-web/` y validar que las herramientas de speckit siguen funcionando.

**Acceptance Scenarios**:
1. **Given** los archivos `system.md`, `agent_contracts.md` y `decisions_log.md` en `/core-web/`, **When** se optimizan, **Then** su contenido debe ser conciso y retener las reglas clave de seguridad de la Constitución v1.0.0 (BCrypt, ReDoS, JWT) y el flujo de specify.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema debe proveer la documentación académica estructurada de forma modular en el directorio `/docs/academic/` siguiendo exactamente las secciones del documento base.
- **FR-002**: El archivo `01_Presentacion_General.md` debe detallar la organización, objetivos globales del proyecto y justificación.
- **FR-003**: El archivo `02_Requerimientos.md` debe detallar los requisitos funcionales y no funcionales de las 3 características core (Auth, Muro, Mensajería).
- **FR-004**: El archivo `03_Casos_De_Uso.md` debe mapear detalladamente los casos de uso utilizando el formato estricto (CU-01 a CU-X, actor, descripción, flujo, postcondición).
- **FR-005**: El archivo `04_Diagramas.md` debe contener los diagramas de secuencia corregidos, diagrama de clases corregido y DER normalizado (País, Cuentas con State).
- **FR-006**: Los archivos de `/core-web/` (`system.md`, `agent_contracts.md`, `decisions_log.md`) deben ser compactados para máxima eficiencia de tokens de entrada de IA, reteniendo las reglas constitucionales.
- **FR-007**: El archivo `DOCUMENTATION_STATUS.md` y `DEVELOPMENT_LOG.md` deben ser actualizados con las referencias a los nuevos entregables de la documentación académica modular.

### Key Entities *(include if feature involves data)*

- **Subject (Materia)**: Representa el espacio curricular/materia donde se asocian cursos, profesores y estudiantes.
- **Consulta (Publicación)**: Publicación en el muro interactivo realizada por un usuario, vinculada a una Materia.
- **Message (Mensaje)**: Mensaje privado entre dos usuarios (remitente y destinatario) para comunicación en tiempo real.
- **Account (Cuenta)**: Cuenta de usuario con credenciales, rol y estado de admisión.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todos los 4 archivos modulares académicos existen en `/docs/academic/` y están 100% redactados (cero placeholders).
- **SC-002**: Reducción de al menos un 30% en el tamaño físico (caracteres) de los archivos en `/core-web/` mediante la simplificación de descripciones redundantes.
- **SC-003**: Cero fallas en los hooks de speckit al ejecutar los comandos de planificación y tareas.

## Assumptions

- Se asume que las 3 funcionalidades core (Identidad/Roles, Muro, Mensajería) son la base exclusiva para el desglose académico.
- No se realiza modificación de código fuente C# (.cs) ni JavaScript (.js/.jsx) en esta iteración.
- La Constitución v1.0.0 sigue siendo el estándar de seguridad obligatorio del backend.
