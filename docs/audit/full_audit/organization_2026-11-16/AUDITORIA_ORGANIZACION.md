# Auditoría de organización y mantenibilidad — OneITB23
Fecha: 16/11/2026. Tipo: revisión estática de organización, documentación, gobierno y herramientas; muestreo estructural de código.

## Dictamen

**REQUIERE AJUSTES DE ORGANIZACIÓN Y REPRODUCIBILIDAD.** La separación React/Apollo, API/GraphQL, servicios y persistencia ya existe y permite mejorar por partes. No hay fundamento en esta revisión para reescribir el sistema, migrar a microservicios ni mover todos los proyectos a una estructura nueva.

El problema principal es la acumulación de estados y fuentes parcialmente sincronizados: instrucciones de agosto, manifiesto de noviembre, tag ya existente, resultados de auditorías anteriores y salidas editoriales con varios nombres “finales”. A esto se suman diferencias concretas entre el preflight, CI y los runners locales. Una carpeta más prolija por sí sola no resolvería estos problemas.

Esta auditoría **no revoca la ratificación CF-05**, no vuelve a certificar funcionalidad y no afirma que haya cero errores. Tampoco autoriza una publicación pública ni cambia los riesgos externos aceptados para la demo.

## Corte y método

- HEAD inspeccionado: **d806822102eb7eec7542318c3d134eadadd390ea**.
- Código candidato de producción/tests: **37ed3608887f3871a8ca2c555004ab63fd6d1e6a**.
- Git diff entre ambos cortes en API Graphql y FrontEnd: vacío.
- Tag anotado local **v1.0.0-rc**: destino d806822, fecha de tag 16/11/2026 01:44:44 -0300. Esto prueba existencia local, no aprobación ni publicación remota.
- Spec activa: 220, según .specify/feature.json. No se cambió el puntero.
- Al inicio, único cambio tracked: prompt.txt, del inventario previo.
- Inventario Git: **822 archivos versionados**. Índice local de tipos textuales seleccionados: **721 archivos**, con **97 Markdown**. No son conteos de documentos aprobados ni de archivos leídos exhaustivamente.
- Se revisaron instrucciones, constitución, roadmap, contratos canónicos, manifiesto, runbook, política Git, tres workflows y herramientas de estabilización/realtime; se inspeccionaron responsabilidades concretas de Feed, AcademicDashboard, Mutation y Startup.
- Para enlaces se recorrieron **48 Markdown** fuera de specs, skills y contexto derivado: **140 referencias locales relativas** y **44 URI file:///**. Un candidato ausente era una cita histórica de un error ya documentado: se descartó como enlace vigente roto. No se verificaron anchors, sitios externos ni todos los enlaces embebidos en diagramas.
- Se compararon hashes de archivos textuales seleccionados de más de 100 bytes: solo apareció la pareja de configuración/template de la extensión Git de SpecKit. No se demostró duplicación masiva de código.
- Las specs históricas no se auditaron ni reorganizaron. La spec activa se consultó únicamente como contexto obligatorio.
- Evidencia reproducible y referencias: [audit-data.json](audit-data.json). Ejecución por etapas: [PLAN_POR_SPECS.md](PLAN_POR_SPECS.md).

### Límites de esta revisión

No se corrieron suites, preflight, servidores, migraciones, navegadores, resets ni despliegues. Los 396/389 y 11 SQL son resultados **registrados** en el manifiesto, no nuevas ejecuciones. CI se revisó estáticamente: no se afirma que una corrida remota haya fallado ni que Azure haya publicado un artefacto incorrecto. No se inspeccionaron configuraciones remotas de protección de ramas/entornos. No se hizo render visual de DOCX/PDF; se auditó su organización y procedencia.

P1 significa prioridad alta de proceso/reproducibilidad, no vulnerabilidad explotable demostrada. P2 corresponde a organización y operación; P3 a mejoras opcionales. Se identificaron 15 hallazgos: 5 P1, 8 P2 y 2 P3. No se afirma ausencia de P0 fuera del alcance.

## Matriz de hallazgos

| ID / prioridad | Hallazgo y evidencia | Impacto | Corrección / spec propuesta |
|---|---|---|---|
| ORG-01 / P1 | **Estado del release desalineado con Git**. Existe el tag anotado v1.0.0-rc, cuyo destino es d806822; los documentos actuales todavía declaran pendiente su creación. Fuente: docs/audit/CANDIDATE_MANIFEST_RC.md:117-121; docs/project_docs/ROADMAP.md:653,669; git show-ref --tags -d | El siguiente operador puede repetir el cierre o etiquetar un corte equivocado. | Registrar el tag observado, SHA de código y SHA documental por separado; confirmar procedencia de autorización sin inventarla. No mover ni recrear el tag. **221** |
| ORG-02 / P1 | **Certificador con baseline y spec histórica hardcodeadas**. La certificación acepta mínimos de 234 backend y 258 frontend; el manifiesto vigente declara 396 y 389. La comprobación del log admite menciones de Spec 218/219. Fuente: .agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1:167-168,236-237,320-325 | La compuerta de conteos no detectaría todas las pérdidas de descubrimiento del corte actual; la compuerta documental no deriva siempre de la spec activa. | Baseline estructurada vinculada al corte y filtros; política explícita de cambios de conteo; resolver spec activa y no aceptar excepciones históricas. **223** |
| ORG-03 / P1 | **Quickstart de operación incluye reset de datos y rama antigua**. El arranque propone checkout/pull de codex/199-ux-b2b-academic-onboarding y reset-demo-database.ps1 con -ConfirmDatabaseReset. Fuente: docs/audit/RUNBOOK_DEV.md:21-40 | Un operador puede seleccionar un corte obsoleto o resetear una base existente siguiendo el camino principal. | Separar arranque no destructivo, aprovisionamiento vacío y recuperación; exigir identificación de destino y respaldo antes del reset. **222** |
| ORG-04 / P1 | **CI no restaura el proyecto de tests y difiere del preflight**. Restore apunta a la API; test apunta a Services.Tests con --no-restore. API no referencia Tests. CI no replica filtros de categorías ni oxlint. Fuente: .github/workflows/quality-gates.yml:26-30,60-67; API Graphql/OneITB/GraphQL.csproj:30-31; .agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1:131 | Riesgo de error de assets en checkout limpio y resultados no comparables entre CI y la certificación local. | Restore explícito de Tests o solución adecuada; contrato único de suites; canario upstream y SQL en carriles visibles separados; lint y reportes persistidos. **224** |
| ORG-05 / P1 | **Despliegue sin dependencia explícita de Quality Gates**. Los workflows de despliegue se disparan por main independientemente de Quality Gates; el backend solo declara needs: build. Fuente: .github/workflows/main_oneitbapi.yml:7,41; .github/workflows/azure-static-web-apps-agreeable-moss-01ccbda10.yml | Los YAML no garantizan que el artefacto desplegado haya superado Quality Gates en el mismo SHA. Protecciones remotas no inspeccionadas. | Diseñar dependencia por SHA/artefacto y comprobar protecciones existentes; demostrar con pipeline de prueba sin despliegue productivo. **224** |
| ORG-06 / P2 | **Publicación real y .gitignore contradicen la guía**. README llama locales/ignorados a .agents y .specify, pero hay 37 archivos tracked en cada directorio. PDF/DOCX se ignoran globalmente. Fuente: README.md:76-77; .gitignore:165-186; git ls-files | Nuevas herramientas pueden faltar en un clon mientras otras instrucciones sí se publican; entrega binaria depende de un canal no explicitado. | Matriz tracked/local/generado/entrega externa; versionar explícitamente gobierno y herramientas necesarias, manteniendo secretos y borradores locales. No desindexar en masa. **226** |
| ORG-07 / P2 | **Credencial demo literal en runbook vigente**. El encabezado de credenciales incluye una contraseña demo literal. No se reprodujo su valor ni se comprobó su vigencia. Fuente: docs/audit/RUNBOOK_DEV.md:60 | La guía contradice el criterio de material saneado y fomenta reutilización de credenciales. | Referencia a User Secrets/entrega controlada; revisar alcance real y rotar si corresponde. Quitar texto actual no elimina exposición histórica. **222** |
| ORG-08 / P2 | **Runner UI dependiente de máquina y cleanup no esperado**. Chrome usa ruta fija, puertos 9230-9233 y perfiles en scratch. taskkill se inicia sin esperar su salida antes de borrar el perfil. TLS se deshabilita globalmente en el proceso Node. Fuente: scripts/verify-cf05-ui-live.mjs:6-9,42,166-179,227-230 | Colisiones, perfiles bloqueados y falso supuesto de teardown completo; relajación TLS se aplicaría a destinos configurables. | Parámetros y validación de endpoints locales, perfiles por ejecución y procesos propios; esperar cierre y verificar liberación; confianza TLS acotada. **225** |
| ORG-09 / P2 | **Evidencia mutable sin directorio exclusivo por ejecución**. Las capturas se escriben en una carpeta y nombres estables; coexisten actas actuales y auditorías con corte histórico. El estado COMPLETED de full_audit corresponde a su auditoría previa. Fuente: scripts/verify-cf05-ui-live.mjs:9,159-163; docs/audit/CF05_UI_AUTOMATED_RUNNER_OUTPUT.md; docs/audit/full_audit/audit_state.json | Una nueva corrida puede sustituir capturas citadas por otra; un índice puede presentar cobertura histórica como actual. | runId exclusivo y manifiesto de hashes/corte/herramientas; índice que distingue raw, derivado e histórico. Preservar evidencias ratificadas existentes. **225** |
| ORG-10 / P2 | **Entradas documentales históricas presentadas como referencia principal**. README y guía editorial muestran cortes de agosto y conteos 234/252; las instrucciones aún tienen encabezado operativo de agosto, mientras la evidencia actual es de noviembre. Fuente: README.md:12-20; docs/entrega_final/GUIA_MAQUETACION_FINAL.md:13-16; AGENTS.md encabezado | Cada agente debe reconciliar repetidamente contexto antiguo con el estado vigente. | Separar estado vigente enlazado de antecedentes fechados. Mantener la fecha histórica de defensa fallida; no reemplazarla por una fecha inventada. **221** |
| ORG-11 / P2 | **Enlaces históricos dependientes del equipo**. El barrido inicial examinó 140 enlaces relativos y señaló uno ausente: la revisión manual comprobó que es una cita de un error histórico, no un vínculo operativo vigente. Además detectó 44 enlaces file:/// dependientes del equipo. Fuente: docs/audit/full_audit/MODULE_09_DOCUMENTATION_ALIGNMENT.md:46; revisión de enlaces en audit-data.json | Las referencias históricas no son portables a otro checkout. No se confirmó un enlace operativo roto en este muestreo. | Priorizar índices portables; conservar la cita histórica sin corregir su significado. Clasificar antes de automatizar reparaciones y no llamar rotos a los 44 URI locales. **226** |
| ORG-12 / P2 | **Entrega académica con varias salidas finales y procedencia incompleta**. Conviven v2_OFICIAL_IMPRENTA y v2.3_FINAL_IMPRENTA, además de borradores. Hay fuentes de diagramas académicas y editoriales con fines distintos. Fuente: docs/entrega_final/salida/; docs/entrega_final/GUIA_MAQUETACION_FINAL.md; docs/entrega_final/diagramas_fuente/FIGURE_MANIFEST.md:9,28 | No basta el nombre FINAL ni la fecha para elegir la entrega; cambios en una fuente no garantizan regenerar sus derivados. | Un manifiesto de entrega selecciona fuente, plantilla, exportación, hash, revisión visual y destino. Mapear diagramas por uso, no borrar variantes por semejanza. **227** |
| ORG-13 / P3 | **Feed concentra estados, mutaciones, carga y presentación**. Archivo de 1256 líneas, múltiples estados UI y 12 llamadas useMutation, además de upload, navegación y render. Fuente: FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx:203-223,285-299,391-486 | Cambios pequeños pueden cruzar responsabilidades; tamaño por sí solo no prueba defecto. | Después del freeze, extraer una única pieza de presentación con contrato de props estable, preservando estado y Apollo. Medir claridad y superficie de cambio. **228** |
| ORG-14 / P3 | **Resolución GraphQL contiene composición y envío de correo**. Mutation reúne dominios y helpers de notificación, incluyendo composición de correo de postulaciones. Startup concentra registro/configuración. Fuente: API Graphql/OneITB/GraphQL/Mutation.cs:1689-1785; API Graphql/OneITB/Startup.cs | Responsabilidades transversales dificultan cambios aislados; no implica que autorización o esquema estén rotos. | Opcional: extraer solo notificación de cambio de postulación a servicio, conservando semántica de cancelación, errores y esquema. No dividir todo Mutation/Startup simultáneamente. **229** |
| ORG-15 / P2 | **Lint no fijado en el contrato de herramientas**. Preflight ejecuta npx --yes oxlint sin versión explícita; package.json frontend no declara oxlint. Fuente: .agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1:254-259; FrontEnd/OneItb-FE/package.json:26-36 | La resolución puede depender de caché o red y cambiar entre máquinas; CI omite ese control. | Fijar versión y lockfile de tooling compartido, sin actualizar dependencias de producción por esta tarea. **224** |

## Interpretación y mejoras exactas

### 1. Gobierno: una fuente por responsabilidad

La solución no es copiar el mismo estado en diez archivos. Mantener ROADMAP como autoridad de progreso, el manifiesto como descripción del corte y sus evidencias, Constitución como norma y README como puerta de entrada. El README debe enlazar al estado vigente y mantener los datos de agosto identificados como historia, sin presentarlos como baseline actual.

Separar tres identidades: SHA del código, SHA de documentación/herramientas y tag publicado u observado. Una edición documental futura no debe fingir que el código ratificado cambió. Tampoco se debe reetiquetar el release existente para corregir su descripción.

Las skills son instrucciones de procedimiento; los comandos verificables y sus versiones deben tener una ubicación estable accesible desde un clon. Eliminar la contradicción entre declarar todo el tooling “local” y depender de parte de él para certificar. Conservar el estado histórico de la defensa que no ocurrió; no inventar nueva fecha.

El handoff debe contener una única tarea siguiente, archivos permitidos, base, evidencia esperada y criterio de parada. No reenviar el historial completo del chat ni exigir otra auditoría integral por cada corrección editorial.

### 2. Certificación: impedir una falsa equivalencia

Los mínimos 234/258 no invalidan retrospectivamente las ejecuciones que registraron 396/389. Sí son insuficientes para detectar una reducción futura respecto del candidato. Para el corte congelado, exigir los conteos declarados por suite, sin fallos ni omisiones, con categorías/filtros explícitos. Si cambia el conjunto de pruebas en una nueva spec, aprobar y registrar su nueva baseline antes del cierre; no bajar mínimos para obtener PASS.

Conservar el bloqueo existente de Certified=true para simulaciones: el script ya lo implementa. No se propone “corregir” un fallo inexistente. Los controles negativos deberán evaluar el motivo preciso de rechazo, no solo un código distinto de cero.

El canario VendorAdvisoryGHSA debe continuar visible como riesgo separado. Igualar CI y local no significa ocultar ese fallo ni sumar SQL/benchmarks otra vez al total core.

### 3. Operación: arranque, reparación y certificación son flujos diferentes

El arranque normal no debe incluir reset/reseed ni elegir una rama antigua. El runbook debe distinguir:
1. usar una base existente;
2. provisionar una base nueva identificada;
3. recuperar/resetear tras aprobación y respaldo;
4. ejecutar validación con teardown.

Los procesos temporales deben pertenecer a la corrida. La terminación por PID del runner actual es mejor que matar todo Chrome, pero falta esperar su fin antes de eliminar perfiles. Parametrizar herramientas/puertos y verificar cleanup con tiempos máximos; no convertir errores de limpieza en silencio.

La relajación TLS debe acotarse al entorno y destino de prueba. No habilitar por defecto una excepción global para URLs configurables. Esta observación no se presenta como una vulnerabilidad de la API de producción.

### 4. Evidencia: preservar originales, navegar desde índices

No mover de inmediato las actas CF04/CF05 que sostienen la ratificación. Crear referencias canónicas que distingan acta, salida original, captura, comprobación automatizada y antecedente. Para corridas futuras usar directorios únicos y un manifiesto de artefactos; un nombre fijo como “última corrida” solo debe apuntar a una ejecución, no reemplazarla.

Los documentos de full_audit son cortes históricos con su propio alcance. No cambiar su COMPLETED para hacerlos pasar por esta auditoría. DEVELOPMENT_LOG permanece histórico e inmutable; las correcciones de interpretación se registran fuera de entradas anteriores.

### 5. Entrega académica: identificar antes de mover

No seleccionar automáticamente v2.3_FINAL_IMPRENTA por su nombre. La versión entregable debe quedar asociada a fuente, plantilla, exportador, hash y aprobación visual. Los diagramas técnicos y editoriales pueden ser variantes legítimas, no duplicados prescindibles.

Aprovechar FIGURE_MANIFEST y EXPORT_CHECKLIST existentes. Ampliarlos antes que crear manifiestos paralelos. Cuando un documento se archive, registrar origen/destino, hash y enlaces dependientes; no borrar material sin clasificación. Los archivos Word de bloqueo se excluyen del catálogo de entrega y solo se limpian cuando se verifica que el editor ya no los usa.

El ignore global de DOCX/PDF puede ser una decisión válida si hay un canal externo de entrega con hashes y respaldo probado. Lo incorrecto es asumir que el repositorio contiene los originales editables y exportaciones cuando no es así.

### 6. Código: mejoras opcionales, después de lo necesario

Feed ya usa componentes y hooks extraídos. La mejora viable es aislar una responsabilidad adicional pequeña, con props claras, sin tocar a la vez Apollo, permisos, uploads y modales. AcademicDashboard también mezcla recursos, progreso e integración SIU, pero debe quedar como siguiente candidato, no incorporarse de golpe al primer refactor.

Mutation delega gran parte del negocio a servicios; aun así contiene composición/envío de correo de postulaciones. Esa pieza acotada es mejor primer candidato que dividir todos los resolvers y alterar registro de HotChocolate. No modificar autorización, nombres GraphQL, nullability o errores durante una reorganización.

OneItbContext, migraciones y seeder no deben fraccionarse solo para bajar el número de líneas. Una organización profesional se mide por responsabilidades, contratos y facilidad de cambio, no por cantidad de carpetas.

## Arquitectura de información objetivo

Preservar en la primera etapa las rutas utilizadas por scripts, proyectos y referencias:

| Ubicación | Responsabilidad propuesta |
|---|---|
| README.md | Entrada breve: arranque seguro, mapa, enlaces al estado y al corte |
| docs/project_docs/ | Contratos y arquitectura vigentes; ROADMAP único |
| docs/audit/ | Runbook, riesgos, manifiesto e índices de evidencia |
| docs/audit/full_audit/ | Auditorías identificadas por corte y alcance; no todas “vigentes” |
| docs/audit/evidence/ (futuro) | Corridas nuevas por runId con manifiesto y artefactos saneados |
| docs/academic/ | Insumos para defensa y vistas académicas |
| docs/entrega_final/ | Fuente editorial, plantillas, figuras y salidas con procedencia |
| .specify/ y .agents/ | Gobierno/tooling con política tracked/local explícita |
| scripts/ | Herramientas ejecutables, configuración y dependencias fijadas |
| API Graphql/ y FrontEnd/ | Código existente; conservar nombres en esta iniciativa |
| core-web/ | Contexto derivado regenerable; nunca autoridad |
| temporales/perfiles locales | Fuera de la entrega, exclusión Git comprobada y cleanup propio |

Esta tabla es una propuesta de responsabilidad, no un permiso para mover carpetas ahora. No crear una segunda versión completa del árbol ni un “docs_v2”.

## Criterio de finalización organizativa

- El corte y su tag se identifican sin leer un chat previo.
- README, ROADMAP y manifiesto no contradicen su estado vigente.
- Un clon con los prerrequisitos declarados puede ejecutar los controles sin depender de archivos ocultos ausentes.
- Una sola definición de suites, categorías, herramientas y baseline alimenta local/CI, con riesgos externos explícitos.
- Cada entrega y corrida tiene fuente y procedencia; lo histórico no se borra ni se presenta como ejecución nueva.
- AGY puede completar un lote, verificarlo y detenerse sin dejar un refactor a medias.
- No se ampliaron 117/117 ni F05, ni se dieron por cerradas GAP-FILE/INFRA/OPS o aceptación externa por limpiar documentos.

## Cambios realizados durante esta auditoría

Solo se añadieron este informe, el plan y audit-data.json en esta carpeta y se actualizó prompt.txt con el relevo acotado. No se cambió el roadmap canónico, el manifiesto, la constitución, la spec activa, código, tests, workflows ni tags. La planificación no equivale a autorización de implementación ni a cierre de ninguna spec futura.

### Verificación de los entregables de esta sesión

- JSON de evidencia parseado correctamente; 15 IDs únicos y prioridades conciliadas (5/8/2).
- Enlaces internos entre informe, plan y evidencia resuelven en disco. Fences del plan balanceados; el diagrama se revisó como texto, no se renderizó.
- Archivos nuevos revisados sin espacios finales. git diff --check sin errores.
- git status: solo prompt.txt modificado y esta carpeta nueva sin versionar. Producción, tests, workflows y puntero sin cambios.
- No se realizaron commits, push ni tags.
