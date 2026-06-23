# Estado de documentacion

**Ultima verificacion**: 2026-06-23

## Fuentes canonicas

| Documento | Proposito | Estado |
|---|---|---|
| `README.md` | Unico indice general del repositorio | Vigente |
| `docs/project_docs/ROADMAP.md` | Unica fuente de avance, estabilizacion y prioridades | Vigente, 53/76 (70%) |
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
| `specs/123-link-preview/` | Implementada; endpoint/build verificados, runtime reciente bloqueado |
| `specs/129-console-runtime-cleanup/` | Implementada; builds/schema/seguridad verificados, chat y preview publico pendientes en entorno normal |
| `specs/130-presentation-runtime-baseline/` | Implementada; puerto/DataProtection/CORS/media estáticos verificados, feed autenticado bloqueado por SQL SSPI y certificado HTTPS |
| `specs/131-media-embed-console-contract/` | Implementada; YouTube click-to-load y build frontend verificados, feed autenticado bloqueado por SQL SSPI y certificado HTTPS |
| `specs/133-media-preview-stabilization/` | Implementada; miniaturas YouTube, resolucion de imagenes upload y builds verificados |

## Brechas vigentes

- Recursos, notas, SIU y notificaciones academicas permanecen pendientes.
- Faltan suites automatizadas de autenticacion, feed, GraphQL y componentes.
- Pub/sub y almacenamiento de archivos sirven a una sola instancia.
- Los aliases GraphQL historicos en espanol siguen como compatibilidad temporal.
- El Event Log, cifrado local de Development, puerto Kestrel y DataProtection fueron corregidos; el entorno actual aun bloquea SQL SSPI y certificado HTTPS para la regresion autenticada completa.
- El frontend conserva deuda de dependencias y tamano de bundle.
- YouTube ya no monta iframes en el render inicial; los warnings residuales posteriores al click pertenecen al proveedor/navegador.
- Las miniaturas de YouTube usan imagen estatica y los adjuntos de imagen se resuelven contra el backend antes de renderizar inline.

Ante contradicciones, prevalecen codigo, esquema ejecutado y evidencia runtime. Los porcentajes se recalculan exclusivamente desde los checklists de `ROADMAP.md`.
