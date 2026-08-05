# Estado y gobierno documental de OneITB23

| Dato de control | Valor |
|---|---|
| **Última revisión de este índice** | 2026-08-04 |
| **Estado funcional de referencia** | 117/117 ítems: 45 verificados `[V]` y 72 implementados `[I]`; Specs 202-203 y 208-211 son gates de calidad fuera del denominador |
| **Clasificación del producto** | Release Candidate académico, core Feature Complete y Code Freeze operativo local |
| **Próxima mesa** | Viernes 7 de agosto de 2026, 09:00 |
| **Fuentes normalizadas en esta pasada** | `ROADMAP.md`, `FINAL_AUDIT_REPORT.md`, `scope-and-requirements.md`, `architecture-and-design.md`, `RUNBOOK_DEV.md`, `DEVELOPMENT_LOG.md`, `01-project-overview.md`, `02-software-requirements.md`, `03-use-cases.md`, `04-design-diagrams.md` y este documento |

Este archivo no reemplaza al roadmap, a la arquitectura, al runbook ni a la auditoría.
Su función es identificar **qué documento gobierna cada decisión**, cuál es su estado de
revisión, qué materiales son derivados y qué debe actualizarse cuando cambia el código o
la evidencia. No se utiliza para inferir que una feature funciona.

---

## 1. Propósito y reglas de gobierno

### 1.1 Objetivos

1. Mantener una única fuente autorizada para cada tipo de información.
2. Evitar que resúmenes académicos, specs o logs históricos contradigan al código actual.
3. Separar documentación técnica canónica, evidencia, entregables de la mesa y material
   auxiliar para agentes.
4. Registrar el nivel de revisión real sin presentar como vigente un documento que aún
   no fue contrastado contra las últimas specs.
5. Facilitar la auditoría académica y la reconstrucción del contexto por otra persona.

### 1.2 Estados documentales

| Estado | Significado |
|---|---|
| **Normalizado** | Revisado contra las fuentes de mayor precedencia en la fecha indicada; estructura y contenido vigentes |
| **Vigente, pendiente de revisión** | Utilizable, pero debe recorrerse en esta normalización integral antes de congelar la entrega |
| **Derivado** | Resume o adapta documentos canónicos; nunca prevalece sobre ellos |
| **Histórico** | Conserva trazabilidad de un corte anterior; sus métricas o decisiones pueden haber sido supersedidas |
| **En preparación** | Entregable aún incompleto o pendiente de maquetación/validación |
| **Local/ignorado** | Herramienta o evidencia de trabajo que no forma parte del repositorio profesional |

### 1.3 Regla de no inferencia

Una casilla marcada, una entrada del development log o una descripción académica no
constituyen evidencia de runtime. El estado funcional solo cambia desde el checklist del
roadmap y debe estar respaldado por código, schema/migración y evidencia proporcional al
riesgo.

---

## 2. Jerarquía de fuentes

Ante una contradicción se aplica el siguiente orden:

1. **Código y configuración versionados** en el SHA evaluado.
2. **Schema GraphQL, modelo EF, migraciones y base ejecutada**.
3. **Evidencia reproducible** de tests, builds, runtime y aceptación manual.
4. **Constitución y decisiones arquitectónicas** aplicables.
5. **Documentos canónicos** de alcance, arquitectura, roadmap, runbook y auditoría.
6. **Memoria técnica y documentación académica derivada**.
7. **Development log, specs históricas y paquetes de contexto para agentes**.

Si una fuente inferior contradice a una superior, debe corregirse o marcarse como
histórica. No se modifica el código para hacerlo coincidir con una narrativa obsoleta.

---

## 3. Matriz de documentación canónica

| Documento | Autoridad y propósito | Estado al 2026-08-03 | Próxima acción |
|---|---|---|---|
| `README.md` | Puerta de entrada al repositorio, requisitos mínimos, estructura y enlaces | **Normalizado**: estado 45 V/72 I, capacidades, stack, arranque seguro, validaciones finitas, fuentes canónicas y límites vigentes | Mantener breve; actualizar métricas solo desde evidencia y no duplicar procedimientos completos del Runbook |
| `docs/project_docs/ROADMAP.md` | Única fuente de avance, prioridades, estados y planificación del cierre | **Normalizado**: 109 ítems funcionales/operativos + 8 remediaciones; 117/117; separa defensa, producción y evolución | Actualizar solo con evidencia de `CF`, `DF`, `LG` o `PR`; no inflar el denominador con aceptación redundante |
| `docs/project_docs/scope-and-requirements.md` | Contrato de alcance, actores, requisitos funcionales/no funcionales y exclusiones | **Normalizado y remediado**: Spec 201 cerró registro público privilegiado y alcance Profesor cross-career con contratos/pruebas | Mantener la política y reevaluar una entidad Profesor-Materia solo si se exige granularidad de cursada |
| `docs/project_docs/architecture-and-design.md` | Arquitectura lógica/física, decisiones, datos, integraciones, seguridad y flujos | **Normalizado**: privacidad Follow y TLS de plantilla remediados; uploads públicos y observabilidad central conservan gates explícitos | Renderizar diagramas y no promover aceptación productiva sin cerrar `GAP-FILE-01` y controles de destino |
| `docs/audit/RUNBOOK_DEV.md` | Instalación, secretos, Docker, migraciones, base demo, operación, recuperación y gates | **Normalizado**: procedimientos clasificados por riesgo, setup reproducible, seis roles, Entra redirect, scripts finitos/runtime, rebaseline y límites productivos contrastados | Mantener sincronizado con parámetros de scripts, migraciones, puertos, callbacks y brechas; repetir revisión antes de congelar el SHA |
| `docs/audit/FINAL_AUDIT_REPORT.md` | Dictamen técnico, controles, riesgos residuales, evidencia y recomendación de liberación | **Normalizado**: 8 secciones, riesgos `RR-01` a `RR-12`, matriz 186-193 y trazabilidad 194-201 | Actualizar después de `CF-03`/`CF-06` con SHA y resultados del gate integral |
| `docs/audit/DEVELOPMENT_LOG.md` | Historial técnico cronológico inverso | **Normalizado**: 148 entradas principales ordenadas; entregas parciales de Specs 140 y 152 consolidadas; colisión nominal de Spec 146 eliminada sin perder evidencia | Agregar cada nuevo cierre inmediatamente debajo de la introducción y conservar el estado vigente únicamente en el Roadmap |
| `docs/audit/DOCUMENTATION_STATUS.md` | Índice de gobierno, precedencia y estado de revisión | **Normalizado** | Actualizar cada vez que un documento cambie de estado o se agregue/elimine un artefacto canónico |
| `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md` | Memoria técnica integral y fuente de la futura entrega DOCX/PDF | **Contenido normalizado**: APA 7, 48 RF, 12 BR, 12 RNF, 10 Mermaid, 30 entidades, baseline conjunto 198/144 y riesgos residuales Spec 201 alineados | Renderizar figuras, maquetar DOCX, ejecutar revisión visual/APA y exportar el PDF; no declarar listo para imprenta hasta completar `DF-03` a `DF-06` |

### 3.1 Límites de responsabilidad

- El **roadmap** responde qué está hecho, qué está verificado y qué falta.
- El **scope** responde qué debe hacer el producto y para quién.
- La **arquitectura** responde cómo está construido y qué decisiones lo condicionan.
- El **runbook** responde cómo instalarlo, ejecutarlo, validarlo y recuperarlo.
- La **auditoría** responde qué riesgos se encontraron, cómo se trataron y qué gates
  permanecen.
- El **development log** responde cuándo y por qué cambió el proyecto.
- Este archivo responde cuál de esas fuentes está lista para ser utilizada.

---

## 4. Entregables académicos

| Documento o artefacto | Propósito | Estado | Dependencia / criterio de cierre |
|---|---|---|---|
| `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md` | Memoria integral de Práctica Profesionalizante III con APA 7, requisitos, diseño, arquitectura, gestión, pruebas, manual y anexos | **Contenido normalizado; materialización pendiente**: portada precargada, contratos canónicos, baseline 198/144 y riesgos alineados hasta Spec 201; todavía no es el PDF final | Confirmar metadatos de portada, sustituir diagramas, generar DOCX y auditar PDF (`DF-01`, `DF-03` a `DF-06`) |
| `docs/entrega_final/GUIA_MAQUETACION_FINAL.md` | Procedimiento para diagramas, DOCX/PDF, APA 7, impresión, exposición y contingencia | **Normalizada**: 10 Mermaid + 3 gráficos de gestión, gates A-D, APA, preflight de imprenta, paquete digital y defensa de 20-30 minutos | Ejecutar el procedimiento, registrar evidencia de cada gate y ajustar únicamente si la imprenta o la cátedra comunican una condición nueva |
| `DOCUMENTO_MAQUETACION.md` | Versión intermedia sin bloques Mermaid para conversión | **No creado** | Se genera después de exportar las figuras (`DF-05`) |
| DOCX APA 7 | Editable institucional con índice, estilos, tablas y figuras | **No creado** | Depende de diagramas y documento de maquetación |
| PDF definitivo | Copia digital e insumo de impresión | **No creado** | Auditoría en cuatro pasadas, enlaces/figuras legibles y paginación estable (`DF-06`) |
| Presentación PPTX/PDF | Narrativa de defensa y guía de demostración | **No creada** | Problema, solución, arquitectura, demo, evidencia, límites y cierre en 22-25 minutos (`DF-07`) |
| Copia física | Entrega para la mesa | **Pendiente** | Una copia preferentemente a color, anillada o encuadernada (`LG-01`) |

El Manual de Usuario permanece integrado en la sección 6 de la memoria y, según la
confirmación del presidente de mesa, no se entrega como documento separado.

---

## 5. Documentación derivada, complementaria y local

### 5.1 Resúmenes académicos derivados

| Documento | Función | Estado y regla de uso |
|---|---|---|
| `docs/academic/01-project-overview.md` | Síntesis ejecutiva de organización, problema, actores, alcance, arquitectura, seguridad, estado y límites | **Derivado normalizado**: distingue 45 `[V]`/72 `[I]`, límites de defensa/producción y brechas vigentes sin duplicar el contrato canónico | Mantener sincronizado después de cambios en scope, arquitectura, Roadmap, auditoría o memoria |
| `docs/academic/02-software-requirements.md` | Especificación académica con actores, permisos, requisitos, reglas, calidad, integraciones y aceptación | **Derivado normalizado**: 48 RF, 12 BR y 12 RNF con correspondencia exacta al contrato canónico; brechas y gates explícitos | Mantener sincronizado después de modificar `scope-and-requirements.md` o aceptar/remediar gaps |
| `docs/academic/03-use-cases.md` | Catálogo de casos de uso con actores, condiciones, flujos, alternativas y trazabilidad RF-CU | **Derivado normalizado**: 26 CU únicos y cobertura exacta de los 48 RF; brechas insertadas en los flujos afectados | Mantener sincronizado después de cambios de permisos, requisitos o aceptación de gaps |
| `docs/academic/04-design-diagrams.md` | Paquete de contexto, componentes, DER, secuencias, realtime, despliegue y operación | **Derivado normalizado estáticamente**: 13 Mermaid; DER dividido con las 30 entidades persistidas; campos/cardinalidades contrastados | Renderizar/exportar y revisar visualmente SVG antes de incorporarlos al entregable (`QA-DIAG-01`) |

Estos cuatro documentos son útiles para exposición y consulta rápida, pero duplican
parcialmente la memoria. Se conservarán solo si, después de su auditoría, aportan una
vista resumida claramente identificada y de mantenimiento razonable.

### 5.2 Paquetes para agentes y tooling

| Recurso | Función | Política |
|---|---|---|
| `core-web/` | Contexto compacto para Gemini u otra IA externa | **Normalizado**: los cuatro archivos comparten el corte 2026-08-03, precedencia, 117/117 (45 V + 72 I), decisiones, contratos, snapshot técnico y seis gaps | Apto para subir como contexto derivado; regenerar cuando cambien contratos, métricas, arquitectura o riesgos canónicos |
| `.specify/`, `.agents/`, `AGENTS.md`, `GUIA_SPECKIT.md`, `specs/` | Constitución, templates, flujo Speckit, instrucciones y evidencia granular | **Local/ignorado** según la política actual; Constitución 1.5.0, `AGENTS.md`, guía y template de plan normalizados al corte 2026-08-03 con seguridad, privacidad, resiliencia, Code Freeze, gates por riesgo y precedencia vigentes; el circuito TXT redundante fue retirado; no sustituyen documentación entregable |
| Plantilla DOCX y programa de la materia en raíz | Fuentes institucionales de entrada | Conservar como referencia local; no tratarlos como documentación técnica del sistema |
| Scripts de secretos y archivos `.env` locales | Configuración privada | Deben permanecer ignorados, sin valores reales en documentación ni commits |

---

## 6. Estado operativo y brechas vigentes

### 6.1 Baseline técnico documentado

- Último baseline backend: **216/216** en el worktree de Spec 205.
- Último baseline frontend: **224/224** en el worktree de Spec 211.
- Son los baselines más recientes por capa, pero no se ejecutaron juntos después de
  Spec 208; deben repetirse sobre el SHA candidato limpio antes de convertirlos en
  evidencia de release (`REL-001`).
- Base local canónica: SQL Server 2022 en Docker con SQL Auth y secretos fuera de Git.
- No quedan hallazgos Críticos/Altos de Specs 186-193 en condición vulnerable original.
- El schema actual contiene **47 resolvers mutacionales**: seis públicos controlados y 41
  autorizados declarativamente.
- Spec 201 cerró `GAP-AUTH-01`, `GAP-AUTH-02` mediante política equivalente por carrera,
  `GAP-PRIV-01`, la configuración rastreada de `GAP-INFRA-01` y `QA-UI-001`.
- `GAP-FILE-01` permanece aceptado únicamente para demo controlada; `GAP-OPS-01` cuenta
  con correlation ID, logs y probes live/ready, pero la plataforma central sigue bloqueada
  por el ambiente de destino.

### 6.2 Cierre técnico antes de la defensa

| Bloque | Estado | Trabajo pendiente | Estimación canónica |
|---|---|---|---:|
| `CF-01` a `CF-06` | `[ ] [P]` | Integración Git, higiene, gates conjuntos, seis roles, realtime con dos sesiones y congelamiento del SHA | 6 h 45 min a 9 h 30 min |
| Riesgos manuales `RR-04` a `RR-06` | `[I]` | Moderador visual, WebSocket aislado y onboarding B2B completo | Incluidos en `CF-04`/`CF-05` |
| Evidencia final | `[ ] [P]` | Registrar fecha, SHA, comandos, métricas, capturas y desviaciones | Incluida en `CF-06` |

### 6.3 Producción documental y logística

| Bloque | Estado | Trabajo pendiente | Estimación canónica |
|---|---|---|---:|
| `DF-01`, `DF-03` a `DF-08` | `[ ] [P]` | Portada, 10 Mermaid, 4 recreaciones manuales, DOCX, PDF, presentación y dos ensayos | 16 h 50 min a 24 h 30 min |
| `LG-01` a `LG-05` | `[ ] [P]` | Impresión, notebook/HDMI, pendrive, snapshot offline y llegada anticipada | Se solapa con `DF-05` a `DF-08` |
| Cierre técnico + académico | `[ ] [P]` | Paquete reproducible completo | 23 h 35 min a 34 h efectivas |

### 6.4 Gates externos y evolución

- `PR-01` a `PR-03`: SMTP, Redis administrado y Cloudinary reales.
- `PR-04`: el acceso Microsoft Entra real ya alcanzó onboarding/muro; restan
  cancelación/error, logout y aislamiento con una segunda cuenta organizacional.
- `PR-05`: benchmark BCrypt sobre hardware objetivo.
- `PR-06`: alertas y política de fallos persistentes de I/O.
- `PR-07`: antivirus/CDR para uploads.
- React Router 6.30.4 conserva advisories moderados aceptados; 7.x se reevaluará fuera
  del Code Freeze.
- Azure y aplicación móvil son evolución postdefensa, no deuda del core académico.

Estos gates representan **17-37 horas técnicas**, sin contar aprobación, compras o
provisionamiento. No bloquean la defensa controlada, pero sí una afirmación de producción
pública completamente aceptada.

---

## 7. Catálogo cronológico de evidencia

La tabla conserva los resultados registrados por cada spec. Sus métricas pertenecen al
corte indicado y pueden haber sido ampliadas por specs posteriores. Para conocer el
estado actual prevalecen las secciones 3 y 6, el roadmap y el informe final de auditoría.

| Spec | Estado verificable |
|---|---|
| `specs/204-student-enrollment-onboarding` | **Implementada `[I]`**: confirmación única para Estudiantes, reconciliación de múltiples vínculos, enforcement en servicio/registro/perfil/legacy y puerto ITB/SIU manual fail-closed. Backend 210/210, frontend 172/172, builds y schema PASS, EF sin drift. Navegador confirmó un Estudiante persistido con una sola carrera en feed/perfil/editor; resta ejecutar el ciclo cero/múltiples -> cancelar -> confirmar -> relogin para `[V]` |
| `specs/205-profile-hydration-avatar-storage` | **Implementada `[I]`**: hidratación exclusiva desde `me` coincidente, skeleton integral, protección de borradores, upload cancelable, preservación de avatar y confirmación por refetch. Backend 216/216, frontend 186/186 y builds PASS. El navegador no reprodujo el flash de nombre/selección provisional; upload-refresh, sesión A -> B y Cloudinary real permanecen como gates separados |
| `specs/206-adaptive-navigation-brand-lockup` | **Implementada `[I]`**: descriptores por rol, overflow medido por ancho real, conservación de badges/estado, cierre accesible y lockup atómico sin bloom. Focalizadas 27/27, frontend 205/205 y Vite PASS. Matriz real Anonymous/Student/Employer/Admin en 320-1440 px sin overflow y ruta Admin desde menú PASS; restan teclado, zoom y reduced-motion para `[V]` |
| `specs/207-local-visual-assets-resilience` | **Implementada `[I]`**: Google Fonts/cdnjs y avatares remotos retirados, Font Awesome local validado contra metadata, stack de sistema, metadata española y favicon OneITB. Build sin referencias visuales externas y rutas reales legibles en light/dark a 320-1440 px; preimpresión CV compartida PASS. Restan red bloqueada y diálogo nativo de impresión/PDF para `[V]` |
| `specs/208-ats-friendly-cv-export` | **Implementada `[I]`**: `/profile` y `/profile/edit` comparten un único documento semántico de una columna e impresión aislada con `react-to-print`; se retiraron altura fija, overflow oculto, paginación DOM simulada y componentes duplicados. Analizador Poppler acotado y sin persistencia de PII. Focalizadas 23/23, frontend 217/217 y Vite 559 módulos PASS. Browser Estudiante confirmó paridad, estructura lineal, consola limpia y ausencia de overflow entre 320-1440 px; PDF nativo de dos páginas/extracción siguen bloqueados por diálogo y herramientas faltantes, por lo que no corresponde `[V]` |
| `specs/210-brand-lockup-theme-contract` | **Implementada `[I]`**: lockup definitivo isotipo `O` + `neITB`, nombre accesible OneITB y asset sin filtros; preferencia persistida separada de overrides visuales apilables. Onboarding fuerza claro sin alterar `oneitb-theme` y restaura el tema al salir. Focalizadas 20/20, frontend 223/223 y Vite 559 módulos PASS; matriz visual 320-1440 px pendiente para `[V]` |
| `specs/211-local-icon-font-integrity` | **Verificada `[V]`**: copia Font Awesome 6.1.2 retirada y reemplazada por paquete oficial 6.7.2 exacto con integridad SHA-512, licencia y guard de CSS/metadata/WOFF2/iconos. Focalizadas 6/6, frontend 224/224 y Vite 559 módulos PASS. Firefox nativo sobre `2f20bce` registró el WOFF2 local, renderizó la landing y no emitió `download failed`, `glyf bbox` ni errores Font Awesome; inspección independiente confirmó iconos y consola limpia |
| `specs/203-microsoft-session-commit-stabilization` | Limpieza diferenciada por proveedor, commit observado, purga de sesiones parciales, operaciones públicas fuera de la expiración global, recuperación acotada si MSAL restaura Login y timeout cancelable de backend. QA HIGH PASS, callback 11/11, frontend 163/163 y Vite sin errores; acceso institucional real aceptado hasta onboarding/muro, con logout/segunda cuenta pendientes |
| `specs/202-entra-redirect-acceptance` | `AADSTS50011` acotado a App Registration; callback local/configuración backend verificados sin exponer valores, HTTP restringido a loopback y casos de URI inseguros cubiertos. QA HIGH PASS, Entra focalizadas 46/46, frontend 151/151 y Vite 862 ms; aceptación Microsoft 365 real continúa bloqueada hasta el smoke de tenant |
| `specs/201-final-audit-closure` | Registro Student-only con dominio/anti-enumeración/limiter, Profesor acotado por carrera, privacidad sin Follow, SQL productivo sin trust bypass predeterminado y probes live/ready. Backend 198/198, frontend 144/144, builds y EF PASS en worktree; SHA, DOCX/PDF y diagramas siguen como gates separados |
| `specs/200-microsoft-entra-redirect-auth` | Popup eliminado; `loginRedirect`, callback aislado, selección de cuenta fail-closed, adquisición silenciosa del scope API, canje GraphQL idempotente y destino interno sanitizado implementados. Speckit QA PASS, focalizadas 41/41, frontend 144/144 y Vite 1,69 s; App Registration y aceptación Microsoft 365 real pendientes |
| `specs/199-ux-b2b-and-academic-onboarding` | Configuracion Entra centralizada con `common`, client ID canonico y alias temporal; CTA empresarial responsive; guard previo al layout y seleccion academica persistida/refetch para Estudiantes sin carreras. Speckit QA PASS, tests focalizados 34/34, frontend 118/118 y build Vite 686 ms; regresion visual y tenant real pendientes |
| `specs/198-employer-onboarding-workflow` | Onboarding B2B implementado: solicitud publica anti-enumeracion con honeypot temprano y limiter HMAC; aprobacion Admin serializable e idempotente; rol `Empleador` fijo; auditoria sanitizada; Outbox con lease/reintentos y Magic Link generico. Backend 183/183, frontend 85/85, builds limpios, migracion aplicada sin drift y entrega `.eml` local `Delivered`; regresion visual publica/Admin pendiente por decision del usuario |
| `specs/197-microsoft-entra-sso` | Base Microsoft Entra implementada con MSAL PKCE, validacion backend completa, identidad externa unica, provisioning sin privilegios, auditoria/rate limit y limpieza de sesion; Spec 199 amplio la autoridad a `common` con validacion tenant-specific. Backend 174/174, frontend 82/82, builds limpios, 33 migraciones sin drift y schema runtime 43 mutaciones con rechazo `ENTRA_NOT_CONFIGURED`; aceptacion real permanece `[B]` |
| `specs/196-demo-database-rebaseline` | Base Docker local respaldada y reconstruida desde 32 migraciones; dos seeds con inventario identico, integridad SQL en cero y login de los seis roles. Smokes de feed, academico, mensajeria, notificaciones, empleos, administracion, moderacion y upload PASS. Backend 153/153, frontend 80/80, builds limpios y EF sin drift |
| `Hotfix transport local 2026-07-29` | Vite proxy same-origin verificado para GraphQL HTTP, WebSocket, REST y uploads; login real de `Empleador` por `http://localhost:5173/graphql` PASS; frontend 80/80 y build Vite PASS. El secreto demo permanece fuera del repo |
| `specs/195-local-infrastructure-and-moderator-acceptance` | Moderador canonico/idempotente y JWT/limites cubiertos; Redis cross-provider y aislamiento de topic verificados; tres escenarios SMTP capturados en Mailpit; backend 152/152, frontend 79/79, builds y EF PASS; cleanup de contenedores/puertos y preservacion SQL comprobados. Proveedores publicos y WebSocket de red siguen `[B]` |
| `specs/194-final-operational-acceptance` | Aceptacion local cerrada: backend 147/147, frontend 79/79, builds Release/Vite, EF sin drift, Compose y diff-check PASS. Runtime ya ejecutado para uploads, paginacion, silenciamiento y Magic Link; navegador limpio con Estudiante, Profesor, Egresado, Administrador y Empleador, incluido A -> logout -> B. Moderator, dos sesiones realtime y SMTP/Redis/Cloudinary reales quedan `[B]` por ambiente/configuracion |
| `specs/193-social-bootstrap-hardening` | Verificada localmente: `MutedUntil` bloquea like/unlike con cero delta de reaccion/notificacion; Apollo y providers permanecen bajo frontera global. Backend 147/147, frontend 79/79 y navegador sin errores propios |
| `specs/192-credential-crypto-hardening` | Verificada localmente: respuesta Magic Link generica, digest SHA-256, pickup, consumo unico/replay y limpieza de credencial ejecutados; BCrypt central y JWT externalizado cubiertos. SMTP real permanece `[B]` |
| `specs/191-query-pagination-hardening` | Verificada localmente: contrato social acotado, orden/deduplicacion/next page/filtro de autor y paginacion academica con autorizacion ejecutados; cancelacion mantiene cobertura sin escritura |
| `specs/190-upload-magiclink-hardening` | Verificada localmente: PDF valido aceptado, ejecutable renombrado y PDF truncado rechazados; limites Magic Link y recuperacion cuentan con evidencia previa. Redis distribuido permanece `[B]` |
| `specs/186-189` | Cierre de seguridad verificado: JWT central y Magic Link atomico; cancelacion end-to-end con guard automatizado; frontera de sesion Apollo/React/WebSocket; la matriz del corte cubria 42 mutaciones. Backend 82/82, frontend 54/54, builds PASS, EF sin drift, GraphQL runtime y browser smoke PASS. El schema crecio posteriormente a 47 resolvers, todos cubiertos por la matriz vigente |
| `specs/185-media-notification-polish/` | Media Grid orientado por dimensiones, dos YouTube con limite UI/backend, PDF con primera hoja y pie de acciones, logo/nombres legibles en dark, transicion de tema accesible, textura global visible, preferencias en portal y badge estrictamente no leido. Backend 65/65, frontend 49/49, builds PASS, Vite 858 ms en el gate final, EF sin drift, npm audit 0 vulnerabilidades y runtime GraphQL HTTP 200; regresion visual manual pendiente |
| `specs/184-qa-master-polish-and-layout/` | Header auto-hide defensivo, Footer unificado, textura global, dark mode suavizado, compositor acotado, mosaico mixto con portada/YouTube/overflow, menciones respaldadas por identidad, preferencias en drawer y deep-link laboral exacto. Backend 63/63, frontend 39/39, builds PASS, Vite 1.19 s, npm audit 0 vulnerabilidades y schema GraphQL runtime HTTP 200; regresion visual manual pendiente |
| `specs/183-premium-branding-landing/` | Identidad final normalizada en cuatro assets canonicos, Header con isotipo aprobado y landing institucional unica Clean Tech/Tech Noir. Spotlight usa RAF sin re-render, reveals respetan reduced-motion y limpian observers; los PNG de fondo de 4.47/5.12 MB quedan fuera del bundle. Frontend 31/31, Vite build PASS en 941 ms, npm audit 0 vulnerabilidades y diff-check PASS; aprobacion visual responsive/manual pendiente |
| `specs/182-qa-session4-feed-hierarchy-and-media-grid/` | Mosaico acotado 4/3, portada PDF por worker local diferido, respuestas dirigidas sin tercer nivel, deep-link exacto con highlight, widget no leido independiente y follow/unfollow explicito. Migracion aplicada a Docker SQL, EF sin drift, tests backend 62/62, frontend 25/25, Vite build PASS, npm audit 0 vulnerabilidades y smoke GraphQL autenticado PASS; regresion visual manual pendiente |
| `specs/181-qa-session3-media-moderation/` | Portada multimedia y carrusel, PDF por Blob URL, reemplazo de adjuntos, texto expandible, reaccion unificada, nesting maximo de dos niveles, edicion exclusiva del autor, ocultamiento moderado auditado, badges de chat, recordatorio idempotente con reintentos de concurrencia y preferencias separadas. Migracion aplicada a Docker SQL, EF sin drift, backend build con 0 warnings/0 errores y tests 55/55, frontend tests 18/18 y Vite build PASS; schema/runtime HTTP 200. La regresion visual autenticada final queda explicitamente pendiente |
| `specs/180-final-release-candidate-audit/` | Auditoria Release Candidate ejecutada: Git hygiene revisado, builds/tests backend y frontend PASS, EF sin drift, runtime GraphQL HTTP 200 contra Docker SQL y contratos criticos auditados. Se corrigio idempotencia del `EnterpriseDemoSeeder` para `JobApplications` ya existentes por `Id` y por par `JobOfferId + ApplicantId`, evitando fallos de arranque sobre bases demo previamente pobladas |
| `specs/179-social-polish-quick-wins/` | Quick wins del muro implementados: enlace copiable por publicacion con deep-link estable, drag-and-drop de adjuntos reutilizando validaciones existentes, restauracion de foco en visores/listado de reacciones, guard contra cargas duplicadas y fallback de preview de enlaces rotos. Frontend tests PASS 12/12 y Vite build PASS |
| `specs/178-qa-session2-social-core-fixes/` | Nucleo social estabilizado: scoping de materias backend/UI, `SocialAttachment`, `CommentReaction`, adjuntos multiples con nombre original, galeria multimedia no excluyente, visores, autofocus, listado paginado de likes, notificaciones agrupadas con deep-link, footer y retiro del compositor legacy del sidebar. Migracion aplicada a Docker SQL, EF sin cambios pendientes, backend build PASS, tests 47/47, frontend tests 6/6, build Vite PASS y smoke GraphQL autenticado PASS. Browser QA fue parcial: detecto el sidebar duplicado y motivo el fix; la recarga post-fix quedo bloqueada por politica de URL de la herramienta |
| `specs/175-privacy-controls-and-smoke-tests/` | Controles de privacidad implementados: `User.IsPublicProfile`, migracion `AddUserProfilePrivacy`, `toggleProfilePrivacy`, masking backend-side en `publicProfile`/`searchPublicProfiles`, switch en `/profile/edit` con toast local, badges de perfil privado en busqueda, y `testSmtpConnection` admin-only con errores controlados. Backend build PASS, backend tests 39/39, frontend build PASS, EF sin cambios pendientes y diff-check PASS; smoke runtime temporal bloqueado por revisor automatico del entorno Codex al iniciar proceso persistente |
| `docs/` audit 2026-07-08 | Registro historico de la normalizacion institucional. La configuracion de correo opcional documentada en ese corte fue reemplazada por la politica Production/pickup de Spec 192 |
| `specs/174-ux-alignment-and-smtp/` | Registro historico del primer adaptador SMTP y terminologia laboral. Su fallback de consola fue retirado por Spec 192; actualmente Production exige SMTP y Development usa pickup `.eml` ignorado |
| `specs/173-enterprise-jobs-ats-seeder-qa/` | Modulo de empleos y Gestor de Postulaciones implementado end-to-end: `JobOffer`, `JobApplication`, FKs restrictivas, indice unico por oferta/postulante, migraciones `AddJobOffers` y `AddJobApplications`, `jobOffers`, `myJobOffers`, `createJobOffer`, `applyToJob`, `updateApplicationStatus`, `jobOfferCreated`, `/empleos`, `/empleos/mis-ofertas`, badge realtime en Nav y seeder enterprise con postulaciones. Backend build PASS, EF sin cambios pendientes, backend tests 38/38 y frontend build PASS; Vitest bloqueado por EPERM en cache temporal de `node_modules/.vite-temp` y smoke runtime bloqueado por restriccion del entorno Codex al iniciar proceso temporal |
| `specs/171-production-security-and-seeding/` | Hardening final de seguridad/backend: profundidad maxima GraphQL configurable, paging global, lockout persistente por cuenta, migracion `AddAccountLockout`, seeding demo/productivo configurable sin reset de passwords existentes, backend build PASS, backend tests 38/38, EF sin cambios pendientes y compose productivo validado con `ONEITB_SEED_DEMO_PASSWORD` efimero |
| `specs/170-cloud-devops-scalability/` | Preparacion cloud/devops: Dockerfiles multi-stage API/Web, `docker-compose.prod.yml` con SQL Server/Redis/API/Nginx, Redis Pub/Sub condicional con fallback InMemory, Cloudinary opcional con fallback local, rate limiting, security headers, healthcheck, npm audit productivo 0 vulnerabilidades, backend build PASS, backend tests 35/35, frontend tests 3/3, frontend build PASS, compose config/build PASS |
| `specs/169-final-qa-and-hardening/` | Code Freeze hardening: `GraphQLErrorFilter` para sanitizar errores inesperados, `GlobalErrorBoundary` institucional, baseline Vitest/Testing Library para `CertificateExport` (3/3), baseline de integracion GraphQL con executor real HotChocolate + EF Core InMemory, workflow CI ejecuta tests frontend, backend tests 35/35, frontend build PASS; `npm audit --omit=dev` bloqueado por endpoint npm |
| `specs/168-wow-production-polish/` | Registro historico del over-delivery: `AuditLog`, constancias, credenciales y toasts verificados. Su plan Google SSO fue reemplazado por Microsoft Entra en Spec 197 |
| `specs/167-production-readiness-hardening/` | Hardening de produccion: middleware de correlation id, logging estructurado de metodo/path/status/duracion, metricas GraphQL sociales con DataLoaders para evitar N+1, smoke runtime GraphQL HTTP 200 con `X-Correlation-ID`, metric smoke admin y backend tests 34/34; build host PASS con cache NuGet local y warnings `NU1900` por metadata de vulnerabilidades inaccesible |
| `specs/166-roadmap-quality-closure/` | Cierre de calidad roadmap/docs: tests backend de auth/feed agregados y pasando 34/34, bug de login con usuario inactivo corregido, busqueda social normalizada, workflow `quality-gates.yml` agregado, workflows Azure actualizados a .NET/actions vigentes, README/project_docs/academic/runbook alineados; build frontend y `git diff --check` verificados, build final del host .NET bloqueado por NuGet/red tras intento de EF restore |
| `specs/165-academic-hub-hardening/` | Cierre de brechas de Specs 163/164: upload academico convertido a modal, busqueda local instantanea por titulo, mutaciones de recursos con Apollo cache update, alias GraphQL `resourcesBySubject`, feed social con `AsSplitQuery` y respuestas anidadas; tests backend 16/16, backend Release, frontend build, schema smoke y `git diff --check` verificados |
| `specs/164-academic-hub-resources/` | Hub academico de recursos implementado: `AcademicResource` agrega categoria/version, filtros GraphQL por materia/busqueda/categoria, `uploadAcademicResource`, `deleteResource` soft-delete, UI `/academic` con sidebar/filtros/grid/upload y migracion `AddAcademicResourceCategoryVersion`; tests backend 16/16, backend Release, frontend build, migracion aplicada y schema GraphQL temporal validados |
| `specs/163-zero-debt-audit/` | Deuda tecnica acotada: Apollo agrega key policies para entidades principales y cache scope de `academicResources`, el servicio academico usa graph loading explicito con `AsSplitQuery`, Vite conserva vendor split y no se eliminaron dependencias sin evidencia fuerte; builds backend/frontend verificados |
| `specs/162-session-boundary-header-fix/` | Bleed de sesion en Header corregido: `/logout` usa `AuthContext.logout()`, login/logout limpian Apollo en frontera de sesion, `Query.me` y notificaciones tienen policies de reemplazo, y Header/GlobalSearch/Profile Edit ignoran `me` si no coincide con `auth.id`; build frontend y checks estaticos verificados, QA manual usuario A -> usuario B pendiente |
| `specs/161-session-cache-search-avatar-hardening/` | Session bleed mitigado con `clearStore()` en logout/expiracion, Apollo type policies para feed/mensajes, busqueda de perfiles por email, registro institucional/copy de contrasena y export de avatar 1:1 con preview; builds backend/frontend verificados, smoke GraphQL bloqueado por certificado HTTPS dev local ausente/vencido |
| `specs/160-registration-avatar-chat-search-hardening/` | Registro con rol/carreras, retencion de avatar, canvas clamp, chat con avatares/no leidos/sin presencia falsa y filtros inteligentes implementados; builds backend/frontend verificados, runtime/browser QA pendiente |
| `specs/159-auth-guard-search-scope-avatar-math/` | Guardias anonimos, selector `Todas`, scoping cross-career backend, metricas de perfil acotadas, contactos de CV unificados y editor de avatar con crop cuadrado/zoom 0.1/drag-to-pan; builds backend/frontend verificados |
| `specs/158-masterization-navigation-search-cv-avatar/` | Masterizacion UX: navegacion activa estricta por ruta, notificaciones iluminadas al abrirse, busqueda global multi-filtro con materias por codigo/nombre, publicaciones por autor/comentarios con `careerIds`, resultados paginados de 15, contactos de CV semanticos y editor de avatar canvas compacto; builds backend/frontend verificados |
| `specs/157-core-ux-session-header-constraints/` | Core UX/session/header constraints: active glow por `useLocation`, logo estatico, omni-search como popover, Light Mode por defecto anonimo/no-preferencia, toggles de password y expiracion JWT interceptada; build frontend verificado |
| `specs/156-header-omni-search-print-stabilization/` | Header/omni-search/print estabilizados: logo estatico, overlay sin doble input, perfiles publicos buscables con query segura, filtros por carreras de `me`, avatar real hidratado y modal de impresion CV; builds backend/frontend verificados |
| `specs/155-ux-master-polish-grid-layout/` | UX master polish: Header reordenado con buscador expansible, active glow por ruta, perfil en grid responsivo, WhatsApp link, `/profile/edit` con Tech Noir y CV print unificado; build frontend verificado |
| `specs/154-ui-consistency-theme-polish/` | Pulido de consistencia UI: Header brand oscuro restaurado, glow homogéneo, widget de chat compacto, comentarios/academico/admin con Tech Noir y CV print limpio; build frontend verificado |
| `specs/153-tech-noir-clean-tech-theming/` | Sistema visual Clean Tech / Tech Noir implementado con ThemeContext, bootstrap anti-FOUC, selector en Header y build frontend verificado |
| `specs/152-master-quality-interconnectivity-fixes/` | Master quality fixes: rutas reales de perfil auditadas, archivo fantasma eliminado, metricas normalizadas, avatares defensivos, print A4 puro y spotlight header; builds backend/frontend verificados |
| `specs/149-cv-component-abstraction-ux-polish/` | Impresion formal del CV desde `/profile` abstraida en template reutilizable; build frontend verificado |
| `specs/148-profile-data-binding-fixes/` | Avatar persistente, carreras editables desde perfil y normalizacion de identidad verificados por migracion, build y runtime REST/GraphQL |
| `specs/151-ux-fixes-cancel-avatar-metrics-print/` | UX fixes en perfiles y avatars en el nav/header y posts |
| `specs/150-ux-print-polish/` | UX polish: Portfolio Social print:hidden, fallback imagen rota, botón cerrar comentarios, métricas '—'; build verificado |
| `specs/147-profile-cv-print-styles/` | Estilos @media print para UserProfile.tsx: header blanco, layout 1 col, botones ocultos, URLs textuales; build verificado |
| `specs/146-data-normalization/` | Normalizacion a Title Case de Nombres/CV y de Email a lower case verificada |
| `specs/146-enterprise-profile-cv-normalization/` | Perfil/CV enterprise normalizado en tablas relacionales; migracion con traslado desde JSON, builds y runtime GraphQL verificados |
| `specs/145-profile-cv-schema-normalization/` | Transicion MVP con `CvDataJson`; supersedida por spec 146 para persistencia final |
| `specs/144-profile-cv-consolidation/` | Edicion de perfil/CV consolidada sobre query `me`; build backend/frontend verificados, browser runtime pendiente |
| `specs/143-login-error-handling/` | Crash de login por `data.login` indefinido documentado y reconciliado; build frontend verificado |
| `specs/142-profile-as-cv/` | Perfil redisenado como CV institucional; build frontend verificado, browser runtime pendiente |
| `specs/141-auth-ux-fixes/` | F5 en rutas protegidas y errores de login documentados y reconciliados; builds backend/frontend verificados |
| `specs/140-nullability-strict-fix/` | Implementada; backend build limpio (0 warnings) validado sin usar supresiones `<NoWarn>` |
| `specs/139-quick-wins/` | Implementada; advertencias de compilacion frontend/backend silenciadas (Vite chunk size, CS nullability) |
| `specs/138-p2-closure-qa/` | Diagramas Mermaid academicos actualizados; xUnit/Moq para `AcademicService` y `NotificationService` pasando 12/12 |
| `specs/137-siu-notifications/` | SIU mock, upsert de notas, notificaciones persistentes, preferencias y subscription privada verificados contra Docker SQL |
| `specs/136-academic-module/` | Recursos por materia y progreso/notas implementados; runtime GraphQL contra Docker SQL verificado |
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
| `specs/132-realtime-chat-console-contract/` | Draft; consolidado posteriomente en estabilizacion general y quick-wins |
| `specs/133-media-preview-stabilization/` | Implementada; miniaturas YouTube, resolucion de imagenes upload y builds verificados |
| `specs/134-local-backend-runtime-unblock/` | Implementada; backend local, HTTPS y GraphQL smoke test verificados |
| `specs/135-core-stabilization-sprint/` | Paginacion feed, cleanup uploads, auditoria persistente y runtime local Docker SQL verificados end-to-end |

---

## 8. Política de mantenimiento documental

### 8.1 Cuándo actualizar cada fuente

| Evento | Documentos obligatorios |
|---|---|
| Feature o corrección cerrada | Spec/evidence, `DEVELOPMENT_LOG.md` y roadmap si cambia un estado contabilizado |
| Cambio de contrato o requisito | Scope, arquitectura, tests/contratos y memoria derivada |
| Cambio de modelo EF o integración | Arquitectura, runbook, migraciones y diagramas afectados |
| Nuevo hallazgo o remediación | Informe final, roadmap si genera trabajo y development log al cerrarse |
| Cambio de comandos, puertos, secretos o Docker | Runbook, `.env.example`/compose cuando corresponda y README si afecta el ingreso |
| Gate de aceptación final | Roadmap, informe final, estado documental, memoria y presentación con el mismo SHA/métricas |
| Alta o baja de un documento | Este índice, README y enlaces internos afectados |

### 8.2 Checklist de consistencia

Antes de declarar normalizado un documento se debe comprobar:

1. Nombre, ruta y propósito únicos; ausencia de duplicado canónico.
2. Roles, términos y nombres GraphQL coherentes con el código actual.
3. Métricas asociadas a fecha, spec y SHA/corte, sin sumar suites de ejecuciones distintas.
4. Estados `[V]`, `[I]` y `[B]` utilizados con el mismo criterio que el roadmap.
5. Ausencia de secretos, credenciales reales, enlaces absolutos locales o datos personales.
6. Enlaces relativos válidos y encabezados jerárquicos sin numeración duplicada.
7. UTF-8, tablas Markdown y bloques Mermaid/código sintácticamente válidos.
8. Riesgos y límites escritos en presente; historia conservada como historia.
9. Terminología institucional: “Bolsa de Trabajo” y “Gestor de Ofertas y
   Postulaciones”, sin denominaciones que sobreprometan el producto.
10. `git diff --check` sin errores y cambios acotados al documento auditado.

### 8.3 Orden de normalización restante

El recorrido recomendado, un documento por vez, es:

1. `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`.
2. `docs/entrega_final/GUIA_MAQUETACION_FINAL.md`.
3. `README.md` y, después, `core-web/` como paquete derivado final.

La secuencia parte de contratos y arquitectura, continúa con operación/evidencia y solo
después actualiza resúmenes y entregables. Así se evita perfeccionar una copia derivada
antes de estabilizar su fuente.

### 8.4 Definition of Done documental global

1. Todos los documentos de la sección 3 figuran como **Normalizados**.
2. Los derivados de la sección 5 coinciden con sus fuentes o se eliminan si no aportan
   valor suficiente para justificar su mantenimiento.
3. La memoria, los diagramas, DOCX, PDF y presentación cumplen `DF-01` a `DF-08`.
4. Roadmap, auditoría, memoria y presentación citan el mismo SHA, fecha, métricas y
   limitaciones.
5. README enlaza únicamente archivos existentes y explica cuál es canónico.
6. No hay secretos, temporales, prompts de trabajo ni outputs personales en el corte.
7. La copia impresa y los respaldos digitales cumplen `LG-01` a `LG-05`.
