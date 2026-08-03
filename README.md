# OneITB23

Plataforma web institucional que integra red social académica, perfiles tipo CV,
recursos por materia, mensajería privada, moderación y Bolsa de Trabajo con gestión de
ofertas y postulaciones.

El repositorio corresponde a la Práctica Profesionalizante III de la Tecnicatura
Superior en Análisis de Sistemas del Instituto Tecnológico Beltrán.

## Estado del proyecto

| Indicador | Estado documentado al 03/08/2026 |
|---|---|
| Alcance contabilizado | **100 % (117/117)**: 45 ítems verificados `[V]` y 72 implementados `[I]` |
| Backend automatizado | **198/198** pruebas aprobadas en el worktree de Spec 201 |
| Frontend automatizado | **144/144** pruebas aprobadas en el mismo worktree |
| Entrega | **Release Candidate académico**, core Feature Complete y Code Freeze operativo local |
| Base de datos | 34 migraciones; base demo canónica con doble seed idempotente y seis roles |

La Spec 201 ejecutó ambas suites sobre el mismo worktree, pero ese resultado todavía no
identifica un SHA candidato inmutable. Antes de congelar el corte de la defensa deben
repetirse los gates sobre ese SHA y completar la regresión manual definida en el
[Roadmap](docs/project_docs/ROADMAP.md) y el
[Runbook](docs/audit/RUNBOOK_DEV.md).

El 100 % contabilizado expresa cobertura del alcance comprometido. No equivale a
certificación de seguridad, despliegue cloud aceptado ni validación de proveedores
externos.

## Capacidades principales

- Autenticación local con JWT, BCrypt, lockout y autorización por rol.
- Microsoft Entra ID organizacional mediante redirect, Authorization Code + PKCE y
  canje por una sesión local; la aceptación contra el tenant real continúa pendiente.
- Perfiles académicos y CV relacional con privacidad, avatar, carreras e impresión.
- Feed contextual por carrera con publicaciones multimedia, comentarios, menciones,
  reacciones, seguimiento, reportes y moderación reversible.
- Chat uno a uno y notificaciones en tiempo real mediante GraphQL Subscriptions.
- Materias, correlatividades, recursos académicos, progreso, constancias y adaptador SIU
  simulado.
- Bolsa de Trabajo y Gestor de Ofertas y Postulaciones con onboarding B2B de empleadores.
- Panel administrativo, Audit Trail, auditoría de moderación y seeder empresarial.
- Infraestructura Docker, Redis y Mailpit locales; adaptadores condicionales para Redis,
  SMTP y Cloudinary externos.

## Stack técnico

| Capa | Tecnologías |
|---|---|
| Backend | .NET 8, Hot Chocolate 14.2.0, Entity Framework Core 8.0.6 |
| Persistencia | SQL Server 2022 |
| Frontend | React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4 |
| Tiempo real | GraphQL sobre WebSocket; Redis Pub/Sub opcional |
| Infraestructura | Docker Compose y Nginx para la plantilla productiva |
| Testing | xUnit, Hot Chocolate executor, Vitest y React Testing Library |

Las operaciones de negocio utilizan `/graphql`. La carga binaria desacoplada utiliza el
endpoint autenticado `POST /api/upload`; no se transportan archivos como `Upload` de
GraphQL.

## Estructura del repositorio

```text
API Graphql/             Backend, dominio, servicios, GraphQL y migraciones
FrontEnd/OneItb-FE/      Cliente React/Vite
docs/project_docs/       Alcance, arquitectura y Roadmap
docs/audit/              Runbook, auditoría, estado e historial técnico
docs/academic/           Síntesis académica, requisitos, casos de uso y diagramas
docs/entrega_final/      Memoria APA 7 y guía de maquetación
scripts/                 Gates finitos, validación y recuperación de la demo
```

`specs/`, `.specify/`, `.agents/` y `core-web/` son espacios locales de trabajo
ignorados por Git. La evidencia y documentación que forman parte del repositorio se
consolidan en `docs/`.

## Requisitos locales

- Windows con PowerShell 5.1 o superior.
- .NET SDK 8.x y `dotnet-ef` 8.0.6.
- Node.js `^20.19.0` o `>=22.12.0`.
- Docker Desktop/Engine con Compose v2.
- Certificado HTTPS de desarrollo confiable.

Puertos canónicos:

| Servicio | Dirección local |
|---|---|
| Frontend Vite | `http://localhost:5173` |
| Backend HTTPS | `https://localhost:44397` |
| Backend HTTP | `http://localhost:5000` |
| SQL Server Docker | `localhost,1433` |

## Inicio local seguro

La instalación completa, creación de secretos, recuperación de base y resolución de
problemas están documentadas en el
[Runbook de desarrollo](docs/audit/RUNBOOK_DEV.md). El flujo resumido es:

1. Crear `.env` desde `.env.example` sin sobrescribir uno existente.
2. Configurar una contraseña SQL local fuerte y los `dotnet user-secrets` requeridos.
3. Levantar SQL Server con Docker Compose y esperar el estado `healthy`.
4. Restaurar dependencias y aplicar las migraciones.
5. Iniciar backend y frontend en terminales dedicadas.

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose config --quiet
docker compose up -d oneitb-sql
docker compose ps
```

No continuar con migraciones hasta configurar la cadena local mediante user-secrets.
No se incluyen contraseñas demo ni secretos en este README.

Después de completar las secciones 3.2 a 3.5 del Runbook:

```powershell
dotnet ef database update `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

Terminal dedicada para backend:

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Terminal dedicada para frontend:

```powershell
Push-Location "FrontEnd/OneItb-FE"
npm.cmd ci
npm.cmd run dev
```

`dotnet run` y `npm.cmd run dev` son procesos bloqueantes. Deben detenerse con `Ctrl+C`.

## Validación finita

Estos comandos compilan y ejecutan suites sin iniciar servidores persistentes:

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations has-pending-model-changes `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"

Push-Location "FrontEnd/OneItb-FE"
npm.cmd run test -- --run
npm.cmd run build
Pop-Location
```

Los scripts `validate-predefense.ps1`, `validate-local-infrastructure.ps1` y
`validate-demo-database.ps1` tienen precondiciones y efectos diferentes. Leer la matriz
de validación del Runbook antes de ejecutarlos. El script `reset-demo-database.ps1` es
destructivo y solo se admite contra la base demo local con confirmación explícita.

Compilar es necesario, pero no demuestra por sí solo que GraphQL, autenticación,
persistencia, WebSockets o un recorrido de navegador funcionen.

## Documentación canónica

| Documento | Propósito |
|---|---|
| [Roadmap](docs/project_docs/ROADMAP.md) | Única fuente de avance, pendientes, prioridades y tiempos de cierre |
| [Alcance y requerimientos](docs/project_docs/scope-and-requirements.md) | Actores, permisos, 48 RF, 12 BR, 12 RNF y exclusiones |
| [Arquitectura](docs/project_docs/architecture-and-design.md) | Componentes, dominio, seguridad, integraciones y decisiones |
| [Runbook](docs/audit/RUNBOOK_DEV.md) | Instalación, secretos, operación, validación y recuperación |
| [Auditoría final](docs/audit/FINAL_AUDIT_REPORT.md) | Dictamen técnico, riesgos, evidencia y recomendación de liberación |
| [Estado documental](docs/audit/DOCUMENTATION_STATUS.md) | Precedencia y preparación de cada documento |
| [Development Log](docs/audit/DEVELOPMENT_LOG.md) | Historial técnico en cronología inversa |
| [Memoria técnica](docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md) | Documento académico integral en Markdown y APA 7 |
| [Guía de maquetación](docs/entrega_final/GUIA_MAQUETACION_FINAL.md) | Gates para figuras, DOCX, PDF, imprenta y defensa |

La memoria Markdown tiene el contenido normalizado, pero todavía requiere render de
figuras, maquetación DOCX y auditoría visual del PDF antes de considerarse lista para
imprenta.

## Límites vigentes

La demostración local controlada no queda bloqueada por estos puntos, pero no deben
ocultarse al evaluar un piloto o producción:

- Registro público y alcance Profesor-Materia pendientes de endurecimiento.
- Seguimiento unilateral incompatible con una política estricta de perfil privado.
- Archivos locales servidos sin autorización por objeto.
- Certificado SQL productivo y observabilidad central todavía no aceptados.
- Microsoft Entra, SMTP, Redis y Cloudinary reales pendientes de credenciales y smoke
  tests en el ambiente de destino.
- Integración SIU implementada mediante un adaptador simulado, no oficial.

El detalle, severidad y tratamiento esperado se mantienen en el Roadmap y en el reporte
de auditoría final.

## Flujo de contribución

1. Leer `.specify/feature.json`, la constitución y la spec activa.
2. Consultar el Roadmap antes de modificar alcance o estado.
3. Implementar con autorización, errores, rendimiento y pruebas proporcionales al riesgo.
4. Registrar evidencia realmente ejecutada; no promover `[I]` a `[V]` por inferencia.
5. Agregar una sola entrada al inicio del Development Log y sincronizar los documentos
   afectados.
6. Mantener secretos, artefactos temporales, specs locales y logs fuera del commit.

No se realizan commits automáticos: cada commit debe ser manual, explicable y limitado a
una unidad de cambio coherente.
