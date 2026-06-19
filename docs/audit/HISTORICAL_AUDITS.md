# Auditorias historicas consolidadas

Este archivo resume auditorias y planes realizados entre el 2026-06-08 y el 2026-06-13. No representa el estado actual. Para avance y brechas vigentes consultar `docs/project_docs/ROADMAP.md`.

## 2026-06-08 - Evaluacion academica

### Observaciones recibidas

- Corregir secuencias de registro, login y logout.
- Explicitar relaciones entre publicaciones, usuarios y materias.
- Desacoplar la transferencia de archivos de la mutation GraphQL.
- Mejorar diagramas de clases, persistencia y alcance institucional.

### Decisiones que siguen vigentes

- Logout local sin mutation de creacion.
- Upload binario separado del contrato de datos.
- `Subject` como clasificador obligatorio de publicaciones.
- Passwords mediante BCrypt.
- Integridad relacional explicita.

### Afirmaciones supersedidas

- `Country` normalizado y `Account.State`: no forman parte del modelo actual.
- `POST /api/files/upload` y preview controller: reemplazados por `POST /api/upload` y archivos estaticos `/uploads/{file}`.
- `Publication`/`Consulta`: el modelo canonico actual es `Inquiry`.

## 2026-06-13 - Auditoria de sistema

### Hallazgos

- Stack fragmentado y documentacion que mezclaba versiones de .NET/GraphQL.
- Contratos frontend/backend desalineados en `Inquiry.user`.
- Sesion, CORS y expiracion JWT requerian normalizacion.
- Faltaba distinguir compilacion de verificacion runtime.

### Resultado posterior

- Stack unificado en .NET 8, EF Core 8.0.6 y HotChocolate 14.2.0.
- Contrato GraphQL canonico en ingles.
- JWT lifetime y CORS normalizados.
- Specs y evidence adoptados como prueba de implementacion.

## 2026-06-13 - Auditoria backend

### Mapa util conservado

- `Entities`: dominio persistente.
- `Data`: contexto, seed y migraciones.
- `Services`: reglas de negocio.
- `OneITB`: host, GraphQL y upload REST.

### Informacion supersedida

El inventario original no incluia carreras, correlatividades, comentarios, reacciones, mensajes, grafo social ni adjuntos actuales. Consultar `architecture-and-design.md` para el modelo vigente.

## 2026-06-13 - Auditoria frontend

### Hallazgos

- Feed y navegacion contenian maquetas o enlaces inactivos.
- Apollo solicitaba campos incompatibles con el esquema.
- Existian estilos legacy y riesgo de reglas de hooks incumplidas.

### Resultado posterior

- Feed social integrado con GraphQL.
- Tailwind CSS 4 como sistema visual.
- Chat, perfiles, administracion y rich media implementados por specs posteriores.
- Permanece deuda de bundle, dependencias y pruebas de componentes.

## 2026-06-13 - Auditoria de seguridad

### Controles incorporados

- BCrypt `char(60)`.
- JWT con expiracion validada.
- Pipeline Authentication antes de Authorization.
- CORS restringido.
- Regex con timeout para entradas sensibles.
- `DeleteBehavior.Restrict` en relaciones criticas.

### Deuda posterior

- Pruebas automatizadas de seguridad y autorizacion.
- Logging estructurado de acciones administrativas.
- Entorno local reproducible para pruebas runtime.

## 2026-06-13 - Mapa de dependencias

El mapa inicial ayudo a ubicar GraphQL, servicios, entidades, Apollo y feed. Quedo supersedido por la arquitectura actual y por los artefactos de cada spec.

## Trazabilidad

Los documentos originales consolidados fueron:

- `PLAN_DE_MITIGACION_EVALUACION.md`
- `SYSTEM_AUDIT_V1.md`
- `BACKEND_AUDIT_REPORT.md`
- `FRONTEND_AUDIT_REPORT.md`
- `SECURITY_AUDIT_V1.md`
- `DEPENDENCY_MAP_V1.md`

Se eliminaron como archivos independientes para evitar duplicacion y afirmaciones obsoletas.
