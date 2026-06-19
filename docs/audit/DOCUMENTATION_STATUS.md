# Estado de documentacion

**Ultima verificacion**: 2026-06-18

## Documentos canonicos

| Documento | Proposito | Estado |
|---|---|---|
| `AGENTS.md` | Reglas operativas para agentes | Vigente |
| `.specify/memory/constitution.md` | Reglas superiores del proyecto | Vigente, v1.3.0 |
| `docs/audit/fix-roadmap-13-06-2026.md` | Baseline de estabilizacion | Vigente |
| `docs/project_docs/ROADMAP.md` | Avance funcional por checklist | Vigente |
| `docs/audit/RUNBOOK_DEV.md` | Ejecucion y validacion local | Vigente |
| `docs/audit/DEVELOPMENT_LOG.md` | Historial inverso de cambios | Vigente |
| `README.md` | Entrada al repositorio | Vigente |
| `specs/099-social-admin-ecosystem/` | Ecosistema social, seed y administracion | Completa y verificada |
| `specs/104-realtime-private-messaging/` | Mensajeria privada persistente y en tiempo real | Completa y verificada |
| `specs/106-chat-smart-search/` | Buscador inteligente de chats y mensajes | Completa y verificada |
| `specs/107-chat-ux-refinement/` | Refinamiento de estado, cache y UX de chat | Completa y verificada |
| `specs/118-end-to-end-subjects-module/` | Gestion academica de materias, carreras y correlatividades | Implementada; build y migracion verificados, runtime bloqueado por entorno |
| `specs/119-superadmin-security/` | Proteccion de administradores y confirmacion reforzada de promociones | Implementada; builds verificados, runtime bloqueado por entorno |

## Snapshots historicos

Los siguientes documentos conservan valor de auditoria, pero no deben usarse
como fuente unica del estado actual:

- `docs/audit/SYSTEM_AUDIT_V1.md`
- `docs/audit/BACKEND_AUDIT_REPORT.md`
- `docs/audit/FRONTEND_AUDIT_REPORT.md`
- `docs/audit/SECURITY_AUDIT_V1.md`
- `docs/audit/DEPENDENCY_MAP_V1.md`

## Brechas documentadas

- El feed, el seed y el panel administrativo fueron verificados end-to-end en
  la spec `099-social-admin-ecosystem`.
- `Inquiry.user`, materias, publicaciones, comentarios, reacciones y reportes
  responden con el contrato GraphQL vigente.
- Los aliases `idUsuario`, `nombre` y `apellidos` son compatibilidad temporal;
  el contrato canonico permanece en ingles.
- JWT valida vigencia y CORS queda restringido a los origenes configurados.
- La mensajeria privada persiste historial, autentica HTTP/WebSocket y entrega
  eventos aislados por usuario; el pub/sub actual es para una sola instancia.
- Archivos educativos y recursos academicos siguen fuera del alcance completado.
- El arbol npm reporta vulnerabilidades heredadas que requieren una actualizacion
  de dependencias separada y controlada.

Estas brechas se gestionan en `docs/audit/fix-roadmap-13-06-2026.md`.
