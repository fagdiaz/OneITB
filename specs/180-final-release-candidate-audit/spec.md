# Feature Specification: Final Release Candidate Audit

**Feature Branch**: `179-social-polish-quick-wins` *(Spec 180 runs on the current dirty branch to avoid losing uncommitted Spec 179 work)*

**Created**: 2026-07-12

**Status**: Draft

**Input**: Execute a final release candidate audit using Speckit: validate runtime, Git hygiene, backend/frontend builds/tests, GraphQL smoke, browser-facing flows when available, security contracts, console cleanliness, documentation sync, and elevate `[I]` to `[V]` only with real evidence. Do not add features; implement only low-risk fixes justified by findings.

## User Scenarios & Testing

### User Story 1 - Confirmar un release candidate estable (Priority: P1)

Como responsable de la defensa, quiero saber si el sistema levanta, compila, prueba y responde en rutas criticas para presentarlo sin depender de supuestos.

**Why this priority**: Es el cierre operativo de mayor valor: evita declarar estabilidad solo por historial documental.

**Independent Test**: Ejecutar builds, tests, migraciones pendientes, smoke GraphQL y frontend build; registrar resultados y bloqueos reales.

**Acceptance Scenarios**:

1. **Given** el repositorio actual, **When** se ejecutan los gates de backend y frontend, **Then** cada resultado queda registrado como PASS, FAIL o BLOCKED con causa concreta.
2. **Given** un runtime local disponible, **When** se ejecutan operaciones GraphQL criticas, **Then** se valida respuesta real o se documenta el bloqueo sin elevar estado a verificado.

---

### User Story 2 - Mantener el repo limpio para commit final (Priority: P1)

Como release manager, quiero asegurar que el commit final no incluya secretos, basura, dist, uploads o artefactos internos no deseados.

**Why this priority**: Un repo profesional para autoridades y GitHub debe mostrar codigo/documentacion canonica, no scratch files ni evidencia local innecesaria.

**Independent Test**: Revisar `git status`, `.gitignore`, archivos ignorados y cambios staged/untracked; confirmar que solo hay cambios intencionales.

**Acceptance Scenarios**:

1. **Given** el arbol de trabajo, **When** se revisa Git, **Then** se listan cambios intencionales y se detectan fugas.
2. **Given** un archivo temporal o secreto rastreable, **When** se detecta, **Then** se corrige `.gitignore` o se documenta para no commitear.

---

### User Story 3 - Corregir quick wins de bajo riesgo si aparecen (Priority: P2)

Como equipo tecnico, quiero resolver fallos menores encontrados en auditoria sin abrir alcance funcional nuevo.

**Why this priority**: Una correccion chica basada en evidencia puede mejorar mucho la demo; una feature nueva cerca del cierre aumenta riesgo.

**Independent Test**: Todo fix aplicado debe tener validacion especifica y no tocar contratos de negocio salvo bug reproducible.

**Acceptance Scenarios**:

1. **Given** un warning/error propio reproducible, **When** existe un fix bajo riesgo, **Then** se implementa y valida.
2. **Given** un warning externo de proveedor/navegador, **When** no pertenece al codigo propio, **Then** se documenta y no se silencia artificialmente.

## Requirements

### Functional Requirements

- **FR-001**: La auditoria MUST ejecutar y registrar estado de Git, builds, tests y validaciones disponibles.
- **FR-002**: La auditoria MUST verificar EF model drift y migraciones pendientes cuando el entorno lo permita.
- **FR-003**: La auditoria MUST ejecutar GraphQL smoke real si el backend puede levantarse localmente.
- **FR-004**: La auditoria MUST revisar rutas criticas de frontend y consola si el navegador/dev server estan disponibles.
- **FR-005**: La auditoria MUST revisar seguridad de alto impacto: auth, privacidad, upload, CORS/static files, cache/logout y limites GraphQL.
- **FR-006**: La auditoria MUST implementar solo fixes de bajo riesgo con causa reproducible.
- **FR-007**: El roadmap MUST elevar items `[I]` a `[V]` solo cuando exista evidencia runtime/browser real.
- **FR-008**: La documentacion MUST quedar sincronizada con una entrada unica de Spec 180 y evidencia ejecutada.
- **FR-009**: No se debe hacer commit ni push salvo instruccion explicita posterior del usuario.

## Success Criteria

### Measurable Outcomes

- **SC-001**: El 100% de los comandos ejecutados queda registrado con resultado claro.
- **SC-002**: Backend build, frontend build y tests relevantes pasan o quedan bloqueados con causa concreta.
- **SC-003**: No se detectan secretos ni artefactos temporales listos para commit.
- **SC-004**: Todo cambio de estado en roadmap se respalda con evidencia verificable.
- **SC-005**: Los riesgos residuales quedan explicitados para la auditoria manual final.

## Assumptions

- Docker SQL local sigue siendo el runtime canonico.
- Specs, `.specify`, `.agents` y `AGENTS.md` permanecen ignorados por el repo profesional.
- Si el entorno bloquea procesos persistentes o navegador, se registra como bloqueo operativo y no como verificacion.
