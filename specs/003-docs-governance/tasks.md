# Tasks: docs-governance

**Input**: Design documents from `/specs/003-docs-governance/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Las tareas están agrupadas por fases y por historias de usuario para facilitar la implementación.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del entorno de documentación académica modular.

- [x] T001 Crear el directorio `/docs/academic/` y los archivos vacíos:
  * `docs/academic/01_Presentacion_General.md`
  * `docs/academic/02_Requerimientos.md`
  * `docs/academic/03_Casos_De_Uso.md`
  * `docs/academic/04_Diagramas.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Optimización de la gobernanza de agentes en `/core-web/`.

- [x] T002 Reducir y optimizar `/core-web/system.md` para máxima eficiencia de tokens de IA, reteniendo los requerimientos del stack.
- [x] T003 Reducir y optimizar `/core-web/agent_contracts.md` para máxima eficiencia de tokens, reteniendo las reglas de specify y speckit.
- [x] T004 Reducir y optimizar `/core-web/decisions_log.md` para máxima eficiencia de tokens, reteniendo los registros de decisiones arquitectónicas (AD-001 al AD-005).

**Checkpoint**: Estructura académica creada y gobernanza base de agentes optimizada.

---

## Phase 3: User Story 1 - Estructuración Modular Académica (Priority: P1) 🎯 MVP

**Goal**: Redactar e implementar el contenido de cada archivo modular académico sin placeholders genéricos.

**Independent Test**: Inspección visual de la legibilidad de la documentación y su concordancia exacta con los archivos base extraídos.

### Implementation for User Story 1

- [x] T005 [US1] Redactar `docs/academic/01_Presentacion_General.md` (Presentación de la Organización, Objetivo Global).
- [x] T006 [US1] Redactar `docs/academic/02_Requerimientos.md` (Mapear Requerimientos Funcionales y No Funcionales para Identidad, Muro y Mensajería).
- [x] T007 [US1] Redactar `docs/academic/03_Casos_De_Uso.md` (Casos de uso detallados de Auth, Muro, Mensajería).
- [x] T008 [US1] Redactar `docs/academic/04_Diagramas.md` (Contener diagramas corregidos en formato Mermaid: registro/login/logout, subir archivo, preview y DER).

**Checkpoint**: Los entregables académicos modulares están completos y verificados.

---

## Phase 4: User Story 2 - Optimización de Gobernanza Core-Web (Priority: P2)

**Goal**: Verificar y garantizar la máxima compactación del directorio `/core-web/`.

- [x] T009 [US2] Validar tamaño y contenido de los archivos de gobernanza en `/core-web/` para asegurar que el porcentaje de tokens consumido se redujo y que no se rompieron reglas clave de la constitución.

---

## Phase 5: Polish & Logs Update

**Purpose**: Registro y cierre del sprint documental.

- [x] T010 Actualizar `docs/audit/DOCUMENTATION_STATUS.md` reflejando el estado de completado de los nuevos documentos de `/docs/academic/` y la optimización de `/core-web/`.
- [x] T011 Registrar los cambios de esta especificación en `docs/audit/DEVELOPMENT_LOG.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias, inicio inmediato.
- **Foundational (Phase 2)**: Depende de Phase 1.
- **User Stories (Phase 3 y 4)**: Depende de la finalización de Phase 2.
- **Polish (Phase 5)**: Depende de que todas las historias de usuario estén completadas.
