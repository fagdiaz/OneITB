# Plan de organización por specs y lotes pequeños

Fecha: 16/11/2026. Base de auditoría: d806822. Estado: **PROPUESTA, NO ACTIVADA**.
Fuente de hallazgos: [AUDITORIA_ORGANIZACION.md](AUDITORIA_ORGANIZACION.md).

## Decisión recomendada

Ejecutar siete specs de organización/herramientas y dejar dos refactors como opcionales posteriores. No hacer una “spec de limpieza general”. Cada spec tiene un resultado independiente y una frontera de archivos; ninguna se activa hasta cerrar la anterior.

Los números **221–229 son propuestos**: al inspeccionar el repositorio solo existía 220 desde ese número. AGY debe comprobar colisiones antes de materializar cada carpeta. Este documento contiene las fichas de alcance, plan y tareas; no crea nueve specs activas ni modifica .specify/feature.json. El progreso oficial se registrará en ROADMAP cuando se autorice ejecutar, no en un roadmap paralelo.

### Etapas y dependencias

| Etapa | Specs propuestas | Resultado y criterio de paso |
|---|---|---|
| 0. Preparación de la siguiente tarea | 221, lote A | Corte, tag y divergencias identificados; sin edición funcional |
| 1. Gobierno y operación segura | 221 → 222 | Estado único comprensible y arranque que no resetea datos por defecto |
| 2. Reproducibilidad técnica | 223 → 224 → 225 | Certificador coherente, CI comparable y runners aislados |
| 3. Organización documental y entrega | 226 → 227 | Catálogo vigente/histórico y paquete académico de procedencia verificable |
| 4. Refactors opcionales post-freeze | 228 → 229 | Una extracción frontend y una backend, solo si se autoriza cada alcance |

Orden secuencial por el invariante de una spec. Las urgencias de runbook y certificación preceden los traslados de documentos. Si la entrega académica se vuelve prioritaria, se puede reordenar la planificación de 226/227 antes de 224/225, conservando sus dependencias y sin implementar dos specs simultáneas.

~~~mermaid
flowchart TD
    A[221 Estado y fuentes de verdad] --> B[222 Runbook seguro]
    B --> C[223 Certificacion reproducible]
    C --> D[224 CI y artefactos]
    D --> E[225 Runners y evidencia]
    E --> F[226 Catalogo y publicacion]
    F --> G[227 Entrega academica]
    G -. Autorizacion post-freeze .-> H[228 Extraccion frontend]
    H -. Alcance independiente .-> I[229 Notificacion backend]
~~~

## Protocolo de trabajo de AGY

1. Leer puntero, spec activa y únicamente los documentos del lote. Verificar HEAD y cambios del usuario. No incorporar automáticamente todo el historial de chats.
2. Preparar spec.md, plan.md y tasks.md de la siguiente spec cuando corresponda; delimitar contratos afectados. Cerrar/conciliar el estado de 220 antes de activar otra. La existencia del tag local no prueba por sí sola su publicación o autorización.
3. Una sesión de implementación trabaja **un lote A, B o C**, con 30–45 minutos orientativos de trabajo concentrado, y un resultado verificable. Ese tiempo no autoriza dejar procesos o un parche a medias: al llegar al límite, cerrar un sublote seguro y documentar el siguiente paso.
4. **Objetivo: 3–5 archivos sustantivos por lote**, aparte de spec/tareas y asientos de gobierno exigidos. Para más archivos, dividir por responsabilidad antes de editar. No imponer un límite artificial de líneas que fuerce parches incompletos.
5. Ejecutar solo verificaciones proporcionales mientras se trabaja. Antes de cerrar cada spec, aplicar las exigencias vigentes de Constitución IX y speckit-stabilize, incluidas suites completas y trazabilidad del corte. Este plan **no introduce una exención documental** ni sustituye la certificación por git diff --check.
6. Cerrar con: archivos cambiados, evidencia, límites, limpieza y siguiente lote. prompt.txt debe pedir una única acción. Agregar la entrada exigida de DEVELOPMENT_LOG al cierre de spec sin modificar entradas previas.
7. Commit/push/tag solo con autorización explícita ya otorgada para esa acción. No solicitar autorización de nuevo para cada lectura, corrección reversible o test dentro del alcance autorizado. Esta sesión solo autorizó el relevamiento y plan.
8. Si surge una dependencia externa: registrar resultado BLOCKED concreto y seguir con tareas independientes de la misma spec. No fabricar PASS ni abrir otra spec de código para “avanzar”.
9. No escalar a Astra/Sol por conteos, renombres o enlaces rutinarios. Escalar una duda de contrato, seguridad o concurrencia concreta con evidencia mínima y una pregunta delimitada.

**Estimación de carga:** siete specs necesarias × tres lotes = 21 unidades pequeñas, más preparación, gates y revisión. Es una división de carga, no una promesa de horas ni una fecha de defensa. Las dos specs opcionales agregan seis unidades y pueden omitirse sin impedir la organización documental.

## Spec propuesta 221 — Estado actual y fuentes de verdad

**Objetivo:** que una persona identifique corte, tag, fase y fuente canónica sin reconstruir el chat.
**Hallazgos:** ORG-01 y ORG-10. **Riesgo de cambio:** bajo, documental.
**Depende de:** resolver administrativamente el cierre de 220 sin inventar autorización.
**Archivos de trabajo:** README.md; docs/audit/CANDIDATE_MANIFEST_RC.md; docs/project_docs/ROADMAP.md; AGENTS.md. Índice/documentación y log solo como seguimiento requerido.

### Plan y tareas

- [x] **A — Capturar estado (solo lectura).** Verificar rama/HEAD, tag anotado y destino, diffs de producción/tests respecto de 37ed360 y situación local/remota disponible. Registrar discrepancias documento por documento. No cambiar tag ni ejecutar push.
- [x] **B — Conciliar.** Diferenciar código candidato, documentación/herramientas y tag observado. Mantener ROADMAP como fuente de progreso. README pasa a entrada breve con enlaces; los conteos antiguos quedan fechados como historia. Corregir el encabezado operativo sin alterar la fecha de defensa fallida.
- [x] **C — Verificar navegación y cerrar.** Comprobar que las fuentes coinciden, que no se prometen gates externos cerrados y que no se duplica una nueva tabla de progreso.

**Aceptación falsable:** cualquier lector local puede resolver tag→commit→código/evidencias desde README. Un tag ausente o divergente se reporta como tal, nunca se “corrige” recreándolo. El manifiesto no declara pendiente crear un tag que ya se observa. Si falta evidencia de autorización/remoto, el límite queda explícito.

**Validación:** consultas Git read-only, links locales y diff de texto; gates de cierre conforme a norma vigente. **Reversión:** restaurar únicamente ediciones propias mediante diff revisado; ninguna operación sobre tags.
**No incluye:** recertificar CF-05, cambiar conteos de resultados ni actualizar todas las memorias.

## Spec propuesta 222 — Runbook de operación segura

**Objetivo:** un arranque normal reproducible y no destructivo.
**Hallazgos:** ORG-03 y ORG-07. **Riesgo:** bajo si se limita al runbook.
**Depende de:** 221.
**Archivos:** docs/audit/RUNBOOK_DEV.md; README.md solo si su enlace/comando lo requiere. Referencias de credenciales afectadas, en lote separado si superan el límite.

### Plan y tareas

- [x] **A — Auditar caminos.** Clasificar startup, instalación inicial, diagnóstico, certificación, recuperación y reset. Verificar nombres reales de servicios Docker y scripts. Leer las guardas de reset sin ejecutarlo.
- [x] **B — Reescribir el quickstart.** Usar corte elegido explícitamente y base existente. Mover reset a procedimiento separado con destino, backup verificado y aprobación. Sustituir contraseña demo literal por referencia a User Secrets. No reemplazarla por otra contraseña publicada.
- [x] **C — Ensayar lectura y arranque seguro.** En entorno local autorizado, seguir el camino de base existente y demostrar que no ejecuta drop/reset/reseed. Registrar prerrequisitos y cleanup. Si no hay runtime, dejar ese ensayo pendiente, sin llamarlo validado.

**Aceptación:** un lector no recibe un reset como paso obligatorio. Comando para base existente nunca invoca reset-demo-database. No hay contraseña literal en el documento vigente. La operación destructiva permanece separada y condicionada.

**Validación:** revisión de comandos contra scripts y compose; smoke limitado cuando corresponda. Una credencial de demo no se da por segura solo por borrarla del texto: revisar reutilización/rotación fuera del historial.
**Reversión:** solo documentos; no se toca base de datos.
**No incluye:** limpieza de historia Git ni rotación indiscriminada de claves.

## Spec propuesta 223 — Certificador ligado al corte

**Objetivo:** que preflight valide el conjunto correcto y no mínimos históricos.
**Hallazgo:** ORG-02. **Riesgo:** medio, herramienta que decide certificación.
**Depende de:** 221–222.
**Archivos:** preflight_stabilize.ps1; tests/test_governance_stabilize.ps1; configuración estructurada de baseline propuesta; SKILL.md de stabilize si cambia el contrato de uso.

### Plan y tareas

- [x] **A — Definir contrato.** Baseline de un corte con suite, categorías, conteo esperado, identidad de configuración y herramientas. ROADMAP conserva progreso; el manifiesto referencia la baseline ejecutada. Especificar tratamiento de aumentos/disminuciones antes de programar.
- [x] **B — Implementar en herramienta.** Reemplazar 234/258 y excepciones Spec218/219 por datos del corte/puntero. Fallar si falta configuración o no corresponde al candidato. Mantener Certified=false para simulaciones y suites omitidas.
- [x] **C — Regresiones y corrida real.** Ejecutar los controles negativos en fixture aislada, sin corromper el puntero real. Luego ejecutar certificación real con configuración del corte y guardar original.

**Casos adversariales obligatorios:**
- baseline 396/389, resumen 395/389 → rechazo backend por conteo;
- resumen 396/388 → rechazo frontend;
- 397 en un corte congelado de 396 → discrepancia explícita; no aprobación silenciosa;
- configuración ausente, malformed o SHA/filtros distintos → rechazo específico;
- log que solo cita 218/219 y no satisface la regla de spec activa → rechazo;
- mocks con conteos correctos → IsSimulated=true y Certified=false;
- resumen con omitidas, cero tests o Test Files sin Tests → mantener rechazos existentes.

**Aceptación:** cada rechazo tiene motivo verificable; corrida real correcta certifica solo el corte/configuración declarados. No se cambia la baseline para encubrir pérdida de pruebas.
**Reversión:** cambio de tooling en diff independiente; conservar evidencia anterior con su hash.
**No incluye:** modificar tests de producto para que pasen ni rebajar Constitución IX.

## Spec propuesta 224 — Paridad de CI y contrato de artefactos

**Objetivo:** controles comparables en máquina limpia y publicación dependiente del resultado del mismo SHA.
**Hallazgos:** ORG-04, ORG-05 y ORG-15. **Riesgo:** medio; deployment no se ejecuta en esta spec sin autorización específica.
**Depende de:** 223.
**Archivos:** tres workflows existentes; manifiesto/lock de tooling y comando de lint fijado, en lotes separados. Evitar cambios al lockfile de producción solo por organizar.

### Plan y tareas

- [x] **A — Calidad reproducible.** Restore de Services.Tests o solución que realmente lo incluya; compartir filtros/categorías declarados con preflight y añadir oxlint fijado a versión. Capturar resultados y versiones.
- [x] **B — Diseñar la dependencia de despliegue.** Revisar las protecciones remotas disponibles. Encadenar calidad y artefactos por SHA, usando una estrategia única compatible con los workflows existentes. No introducir despliegues de PR no confiables con secretos.
- [x] **C — Verificar sin publicar.** Checkout limpio/caché vacía en entorno de prueba; fallos deliberados de test/lint impiden promover artefactos. Vendor canary y SQL separados y visibles.

**Aceptación falsable:** assets del proyecto Tests existen tras restore limpio; el comando ordinario usa el mismo filtro que local; lint no descarga una versión flotante; un quality job fallido del SHA X impide su despliegue. El éxito de SHA Y no habilita X.

**Validación:** sintaxis YAML, revisión de permisos/events, runner de prueba sin credenciales de producción y artefactos identificados. Si no se puede ejecutar CI remoto, separar implementación de aceptación remota y no declarar cierre.
**Reversión:** restaurar configuración de workflows propia, sin alterar recursos desplegados.
**No incluye:** cambiar versión de framework, proveedor cloud o política de producción por estética.

## Spec propuesta 225 — Runners aislados y evidencia por ejecución

**Objetivo:** repetir pruebas instrumentales sin huérfanos ni reemplazar evidencia ratificada.
**Hallazgos:** ORG-08 y ORG-09. **Riesgo:** medio, solo tooling.
**Depende de:** 223–224.
**Archivos:** verify-cf05-ui-live.mjs, run-cf05-ui-live-validation.ps1 y un helper/configuración si resulta necesario; formato de manifiesto de corrida.

### Plan y tareas

- [x] **A — Parámetros y fronteras.** Definir navegador, puertos, endpoints y directorio temporal por runId. Validar antes de iniciar; acotar excepciones TLS a destino local o usar confianza explícita. No exponer secretos por parámetros/logs.
- [x] **B — Lifecycle.** Esperar la finalización del árbol de procesos propios, confirmar puertos liberados y luego borrar perfiles. Timeout/abort producen resultado explícito; no matar Chrome ajeno. Crear cada corrida en directorio nuevo.
- [x] **C — Evidencia.** Guardar salida original, capturas y manifest con códigoSHA, toolingSHA/hash, versiones, comandos saneados, exit codes, tiempo y hashes. Un índice enlaza la corrida aceptada; conservar intacta la evidencia CF05 anterior.

**Casos adversariales:** puerto ocupado por proceso ajeno → bloqueo sin matarlo; Chrome no encontrado → error claro; login falla → exit no cero y cleanup; timeout → termina solo procesos propios; dos runId no pisan capturas; URL externa con bypass TLS → rechazo antes de conectar.

**Aceptación:** tras PASS, fallo y timeout no quedan procesos/perfiles propios en uso; toda captura tiene runId y hash. El observador y las aserciones UI existentes conservan su semántica.
**Validación:** pruebas finitas del instrumento y una corrida real cuando el entorno esté disponible. No repetir CF05 por cada ajuste editorial.
**Reversión:** runner previo y sus evidencias siguen identificados; no borrar artefactos originales.
**No incluye:** instrumentar globals de producción ni modificar Apollo para facilitar pruebas.

## Spec propuesta 226 — Catálogo documental y política Git

**Objetivo:** distinguir lo vigente, histórico, derivado, local y entregable sin una mudanza masiva.
**Hallazgos:** ORG-06, ORG-11; complemento de ORG-09.
**Riesgo:** bajo en catálogo, medio si se mueven rutas.
**Depende de:** 221; usar el esquema de evidencia de 225 para corridas nuevas.
**Archivos:** DOCUMENTATION_STATUS.md y .gitignore; README y mapas de referencias según lotes. Los documentos históricos no se reescriben.

### Plan y tareas

- [x] **A — Catalogar sin mover.** Extender DOCUMENTATION_STATUS existente con clase, responsable, autoridad, estado, origen/derivado y política Git. Decidir qué gobierno/tooling necesita un clon. Clasificar locales/entregables sin leer secretos.
- [x] **B — Publicación explícita.** Ajustar ignore de forma selectiva y verificar con git ls-files/check-ignore. No usar desindexación masiva. Excluir scratch de raíz y perfiles; conservar templates y herramientas necesarias. Definir dónde se respaldan binarios ignorados.
- [x] **C — Navegación y archivo.** Crear índices/alias documentales portables; si un traslado aporta valor, mapear hasta cinco documentos por lote, conservar hashes y actualizar referencias. Mantener actas ratificadas en su ruta o un puntero duradero. No mover DEVELOPMENT_LOG.

**Aceptación:** desde README se localiza cada documento canónico; cada candidato a archivo tiene origen/destino y motivo. Los 44 URI locales se clasifican antes de convertirlos. La cita histórica detectada no se repara como si fuese un fallo vigente. Un clon contiene lo necesario para reproducir controles, con prerrequisitos explícitos.

**Validación:** links relativos de documentos activos, lectura desde checkout con distinta ruta, diff/check-ignore y comparación de hashes para movimientos. Prueba de restauración para entrega externa, no solo promesa de backup.
**Reversión:** mapa inverso de movimientos propios; no borrar duplicados potenciales.
**No incluye:** renombrar API Graphql, FrontEnd, namespaces o proyectos .NET.

## Spec propuesta 227 — Fuente editorial y paquete de entrega único

**Objetivo:** poder responder cuál documento se entrega y cómo se produjo.
**Hallazgo:** ORG-12. **Riesgo:** bajo sobre producto, medio sobre contenido editorial.
**Depende de:** 221 y 226.
**Archivos:** GUIA_MAQUETACION_FINAL.md, FIGURE_MANIFEST.md, EXPORT_CHECKLIST.md y fuente editable seleccionada; exportaciones en lotes distintos.

### Plan y tareas

- [x] **A — Elegir por procedencia.** Comparar fuente Markdown, plantilla y versiones Word existentes. Registrar diferencias de contenido y seleccionar fuente editable/maestra explícita, conservando las demás como antecedentes.
- [x] **B — Unificar cadena de figuras.** Mapear cada figura a fuente, variante, salida y destino. Regenerar una figura representativa para validar herramienta y legibilidad; después procesar máximo tres figuras por sublote. No fusionar vistas académicas y técnicas por nombre parecido.
- [x] **C — Exportar y revisar.** Producir DOCX/PDF desde la fuente seleccionada, revisar páginas, índices, referencias, español, contraste y A4. Registrar hashes, herramienta y revisión visual; distinguir pendiente de aprobado. Revisar muestra antes de repetir el proceso completo.

**Aceptación:** el índice identifica una única entrega aceptada, sus fuentes y checksum. Cada figura entregada remite a una fuente editable. No se considera vigente un archivo solo por contener FINAL o IMPRENTA en su nombre. Los temporales Word no forman parte del paquete.

**Validación:** comparación de contenido, links, render visual DOCX/PDF, recuento de páginas y reproducibilidad de exportación. Usar skills de documentos/PDF cuando se ejecute; revisión institucional pendiente se declara.
**Reversión:** copia/hash de fuente previa y salidas separadas, nunca sobrescribir el único original.
**No incluye:** otro manual independiente ni nueva fecha de defensa.

## Spec propuesta 228 — Extracción frontend acotada (OPCIONAL)

**Objetivo:** reducir una responsabilidad de Feed preservando comportamiento.
**Hallazgo:** ORG-13. **Riesgo:** medio; requiere levantar expresamente el freeze para ese alcance.
**Depende de:** 221–227 y autorización post-freeze.
**Archivos:** Feed.jsx, un componente de presentación nuevo y pruebas afectadas; no GraphqlProvider ni transporte.

### Plan y tareas

- [x] **A — Elegir una pieza.** Documentar props, estado propietario, eventos y comportamiento actual de una tarjeta/acción visual. Si exige mover cache/auth/upload, reducir alcance.
- [x] **B — Extraer.** Mover únicamente presentación; preservar orden de eventos, identidad de elementos, refs y manejo de foco. Evitar cambiar diseño.
- [x] **C — Validar.** Interacciones de publicación/moderación afectadas, permisos, teclado/Escape y restauración de foco; comparar operaciones GraphQL disparadas.

**Aceptación:** una responsabilidad tiene módulo y contrato claro; no hay nuevas peticiones ni cambios de autorización/cache. Tests de comportamiento existentes se conservan. No se usa un umbral de líneas como prueba de calidad.
**Reversión:** revertir la extracción completa, sin dejar adaptadores transitorios.
**No incluye:** AcademicDashboard, PrivateChat, migración JSX→TS ni rediseño visual. Esos trabajos requerirían nuevas specs independientes si luego se justifican.

## Spec propuesta 229 — Notificación de postulación fuera del resolver (OPCIONAL)

**Objetivo:** retirar composición/envío de correo de Mutation sin rediseñar GraphQL.
**Hallazgo:** ORG-14. **Riesgo:** medio.
**Depende de:** 228 y autorización del alcance; puede omitirse si no aporta valor suficiente.
**Archivos:** Mutation.cs, un servicio de notificación y registro DI, pruebas relevantes.

### Plan y tareas

- [ ] **A — Capturar contrato.** Entrada, destinatario, contenido, ausencia de email, fallo de proveedor y cancelación. Guardar esquema/operación afectada como referencia.
- [ ] **B — Extraer responsabilidad.** Mantener la semántica de actualización persistida y de fallo de email, sin transformar silenciosamente un fallo externo en rollback de negocio.
- [ ] **C — Probar equivalencia.** Éxito, destinatario ausente, proveedor fallido y CancellationToken cancelado; autorización por rol sin cambios y esquema estable.

**Aceptación:** resolver delega notificación; el efecto persistido, payload y errores relevantes coinciden. Cancelación no se traga. No cambian nombres/tipos/nullability GraphQL ni migraciones.
**Reversión:** extracción atómica completa y registro DI asociado.
**No incluye:** dividir todos los resolvers, reestructurar Startup, modificar seeder o crear microservicios.

## Paquete mínimo de salida de cada lote

| Campo | Contenido |
|---|---|
| Identidad | Spec, lote, rama, SHA inicial/final si hubo commit autorizado |
| Alcance | Archivos permitidos y cambiados; invariantes preservados |
| Evidencia | Comando saneado, entorno, resultado, exit code, ubicación original |
| Límites | Lo no ejecutado y su dependencia exacta |
| Estado | Parcial/completo según criterios, nunca por cantidad de texto |
| Siguiente paso | Una única tarea pequeña, con condición de parada |

No producir otra acta extensa por cada sublote: actualizar las tareas/evidencias de la spec correspondiente. La auditoría externa debe revisar deltas concretos de riesgo, no certificar repetidamente el mismo expediente.

## Qué hacer ahora

**Única tarea recomendada para AGY: Spec propuesta 221, lote A, solo lectura.**
Confirmar tag/destino, código candidato, estado documental y cambios locales; entregar la tabla de divergencias y el diff propuesto de los documentos de 221. No activar las nueve specs, mover carpetas, cambiar código, ejecutar reset o recrear tags. La implementación se inicia cuando el usuario autorice el primer alcance.
