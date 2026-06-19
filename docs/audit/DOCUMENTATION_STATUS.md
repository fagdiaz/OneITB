# Estado de documentacion

**Ultima verificacion**: 2026-06-19

## Fuentes canonicas

| Documento | Proposito | Estado |
|---|---|---|
| `README.md` | Unico indice general del repositorio | Vigente |
| `docs/project_docs/ROADMAP.md` | Unica fuente de avance, estabilizacion y prioridades | Vigente, 52/75 (69%) |
| `docs/project_docs/scope-and-requirements.md` | Alcance, roles y requisitos | Vigente |
| `docs/project_docs/architecture-and-design.md` | Arquitectura alineada al codigo | Vigente |
| `docs/audit/RUNBOOK_DEV.md` | Ejecucion, migraciones y validacion | Vigente |
| `docs/audit/DEVELOPMENT_LOG.md` | Historial inverso de implementaciones | Vigente |
| `.specify/memory/constitution.md` | Reglas superiores del proyecto | Vigente, v1.4.0 |
| `AGENTS.md` | Reglas operativas para agentes | Vigente |

## Documentacion complementaria

| Documento | Proposito |
|---|---|
| `docs/academic/01-project-overview.md` | Presentacion academica |
| `docs/academic/02-software-requirements.md` | Resumen academico de requisitos |
| `docs/academic/03-use-cases.md` | Casos de uso principales |
| `docs/academic/04-design-diagrams.md` | Diagramas resumidos |
| `docs/audit/HISTORICAL_AUDITS.md` | Auditorias supersedidas consolidadas |

## Evidencia reciente

| Spec | Estado verificable |
|---|---|
| `specs/099-social-admin-ecosystem/` | Feed social, seed y administracion verificados end-to-end |
| `specs/104-realtime-private-messaging/` | Mensajeria persistente y tiempo real verificados |
| `specs/118-end-to-end-subjects-module/` | Implementada; migracion/build verificados, runtime reciente bloqueado |
| `specs/119-superadmin-security/` | Implementada; builds verificados, runtime reciente bloqueado |
| `specs/121-file-upload-inquiries/` | Implementada; migracion/build verificados, runtime reciente bloqueado |
| `specs/122-rich-media-comment-files/` | Implementada; migracion/build/parser verificados, runtime reciente bloqueado |

## Brechas vigentes

- Recursos, notas, SIU y notificaciones academicas permanecen pendientes.
- Faltan suites automatizadas de autenticacion, feed, GraphQL y componentes.
- Pub/sub y almacenamiento de archivos sirven a una sola instancia.
- Los aliases GraphQL historicos en espanol siguen como compatibilidad temporal.
- El entorno temporal de validacion reciente esta bloqueado por cifrado SQL Server y permisos de Windows Event Log.
- El frontend conserva deuda de dependencias y tamano de bundle.

Ante contradicciones, prevalecen codigo, esquema ejecutado y evidencia runtime. Los porcentajes se recalculan exclusivamente desde los checklists de `ROADMAP.md`.
