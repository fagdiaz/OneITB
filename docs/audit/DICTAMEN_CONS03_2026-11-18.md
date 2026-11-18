# Dictamen CONS-03 — 18/11/2026

**REQUIERE AJUSTES.** No se ratifica 7/7 ni el cierre de CONS-03 con el delta actual. Sí se reconoce la incorporación de hash antes/después, importación sin lanzar main y detección explícita de recursos persistentes en stop(). Los siguientes contraejemplos se reprodujeron contra el runner real sin abrir Chrome ni acceder a la aplicación.

Base HEAD: 6cd5295d7768c34c32d37d54e0aad3d01f4749f6; rama feature/2026-11-01-debugger-cv-builder; puntero 220. Spec 225 es el sublote afectado. Cambios sin commit, identificados por hashes en el archivo de evidencia adjunto. CONS-02 y CF-05 conservan sus ratificaciones previas; se revisa el instrumento nuevo, no la aceptación funcional histórica.

## Matriz de hallazgos

| ID | Severidad | Componente | Evidencia / riesgo |
|---|---|---|---|
| RUN-01 | P1 | verify-cf05-ui-live.mjs:52-59,421-437; wrapper PS1 crea carpetas con Force | RUN_ID repetido termina exit 0 y sobrescribe manifest.json. RUN_ID ../escaped termina exit 0 y escribe fuera de runs. No hay reserva exclusiva ni confinamiento validado. |
| RUN-02 | P1 | Runner:255-315,451-456,1098-1107 | cleanup secuencial abandona B/C/Probe si A.stop falla. Reproducido stopCalls=[ui_profile_a], con rechazo por fuga. La nueva excepción puede dejar vivos recursos del mismo runner. |
| RUN-03 | P2 | Runner:387-407,415-440; wrapper LATEST_RUN | Dry-run escribe manifest status PASS/exitCode 0 sin campo machine-readable de simulación. Además, una falla al escribir manifest se reduce a WARN. Riesgo de confundir prueba de instrumento con aceptación UI. |
| RUN-04 | P2 | Ambas suites; resolver Chrome:14-44 | Caso 2 supone que CHROME_BIN inexistente se rechaza, pero el resolver recurre al Chrome instalado: reproducido devuelve ruta real. Caso 6 borra directorios fijos preexistentes y no prueba ID repetido/traversal. Caso 7 PS1 genera en scratch un módulo que importa ./scripts/... relativo a scratch, ruta incorrecta. El lock de archivo Node no garantiza bloqueo de borrado en todas las plataformas. |

## Reproducciones ejecutadas (sin recursos pesados)

Se creó un directorio exclusivo bajo .tmp/cons03-audit-* y se ejecutó el runner por ruta absoluta con cwd dentro de ese sandbox. CHROME_BIN apuntó a un ejecutable existente de prueba; RUNNER_DRY_RUN=true evitó toda ejecución de navegador. No se presentan estas corridas como UI en vivo.

1. Primera corrida same-run: exit 0. Se sustituyó SU manifest temporal por un centinela; segunda corrida same-run: exit 0, centinela destruido. El manifiesto previo puede sobrescribirse.
2. RUN_ID ../escaped: exit 0, manifest creado bajo docs/audit/evidence/escaped, fuera de runs, pero dentro del sandbox descartable. Ninguna ruta del proyecto fue usada como destino de este contraejemplo.
3. Se importó el módulo real en proceso Node y se sustituyeron en memoria start/stop por fixtures: start falla sin arrancar Chrome, A.stop lanza RESOURCE_LEAK_DETECTED. main solo invoca stop de A; B/C/Probe no reciben cleanup. No se modificó el archivo fuente.
4. CHROME_BIN explícito inexistente: resolveChromePath devuelve el Chrome instalado en Program Files. No se lanzó ese navegador. El caso de precondición de las suites no es determinista respecto al equipo.
5. Cleanup del sandbox: ruta absoluta y propiedad comprobadas antes de remover exclusivamente el directorio creado por auditoría; eliminación confirmada.

Hash histórico antes/después: 0f95fed4217591cb999aa0b0c3030fc2885036255ff0e1bbfb924490da5b8e5e. La evidencia histórica permanece idéntica. Este hash demuestra invariancia durante esta revisión, no autenticidad retrospectiva universal del contenido.

## Correcciones mínimas y criterios de cierre

### Paso 1 — Artefactos exclusivos y procedencia (RUN-01/03)

- Validar RUN_ID con una lista permitida simple, rechazar separadores, .., rutas absolutas y valores inválidos; resolver contra una raíz del repositorio, no cwd incidental. Comprobar confinamiento final, incluidos enlaces/reparse points si existen.
- Reservar atómicamente la carpeta o lock de cada corrida; rechazar un ID existente sin escribir. Coordinar Node y wrapper para que no creen/reescriban por separado el mismo destino. Si falta RUN_ID, generar uno único o rechazar: no usar screenshots históricos como fallback del modo real.
- Dry-run debe registrar explícitamente mode: dry-run, uiExecuted: false, certified: false y un estado de instrumento distinto de la aceptación UI (por ejemplo DRY_RUN_OK). Exit 0 puede significar éxito de aislamiento; no debe promover LATEST_RUN como PASS de UI en vivo.
- Fallar si no se puede persistir evidencia obligatoria. Publicar estado final solo después de conocer el resultado del cleanup; no emitir PASS provisional.
- Regresiones fijas: A y B conservan hashes separados; repetir A rechaza y conserva bytes; dos reservas concurrentes del mismo ID producen un ganador y un rechazo; ../, ruta absoluta e ID inválido no crean archivos; ejecución sin ID no altera histórico ni capturas históricas; dry-run no produce certificación UI.

### Paso 2 — Cleanup exhaustivo aun con fallos (RUN-02)

- Intentar detener TODAS las instancias mediante allSettled o acumulación de errores por instancia y lanzar el agregado al terminar. Dentro de stop, comprobar los recursos restantes aunque una operación falle; conservar PID/handle hasta confirmar terminación. No confundir error de permisos al consultar liveness con proceso inexistente.
- Una única finalización idempotente, con plazos explícitos, debe servir a éxito/error/señales. Si hay fuga, resultado final FAIL y exit no cero, sin saltar cleanup del resto. Acotar taskkill y esperas; no matar procesos ajenos.
- Regresiones fijas: A falla y B/C/Probe reciben stop igualmente; fallos combinados de PID/perfil/puerto se reportan; control positivo limpia recursos propios y preserva un listener ajeno. Un error de escritura de manifiesto tampoco produce PASS.

### Paso 3 — Suite reproducible y segura (RUN-04)

- Una suite Node canónica y wrapper PowerShell sencillo que propague salida/código evita divergencias. No escribir otra implementación de los mismos escenarios.
- Si CHROME_BIN/CHROME_PATH fue solicitado explícitamente y no existe, rechazarlo; usar autodetección solo sin override. El negativo no debe terminar ejecutando Chrome instalado.
- Directorios mkdtemp/runId únicos de propiedad de la suite; no borrar test-iso-alpha/test-iso-beta preexistentes. Reservar puertos efímeros, aplicar timeout a cada hijo y cerrar listeners/directorios en finally incluso ante aserción fallida.
- Pruebas de cleanup mediante dependencias inyectadas o fixtures deterministas para PID/rm/puerto. No depender de que openSync('r') prohíba borrar un archivo. Si se mantiene el PS1 actual, corregir además la ruta de import relativa al archivo scratch y el here-string expansible que contiene sintaxis JavaScript.
- Hash histórico antes/después en finally; incluir inventario/hash de capturas históricas, ya que el runner conserva un fallback que apunta a ellas. Preservar los datos incluso cuando un negativo falle.

Con estos tres pasos en el mismo lote se cubren los defectos observados; no se exige repetir CF-05 ni arrancar el runtime del producto.

## Verificaciones y límites

- Reproducciones anteriores: ejecutadas, salida literal y código del driver en DICTAMEN_CONS03_2026-11-18.checks.json.
- git diff --check: PASS exit 0. Producto respecto a HEAD: diff vacío. HEAD confirmado.
- Suite 7 casos completa NO ejecutada: el caso Chrome ausente puede caer al navegador real, sus hijos no tienen timeout y el caso 6 borra rutas fijas existentes. Se eligió reproducción aislada y finita; no se atribuye resultado 7/7 ni fallo ejecutado global a esa suite.
- No procesos Chrome, servidores, SQL ni llamadas a aplicación; tampoco commits, pushes o tags. Evidencia histórica preservada y temporales propios eliminados.
- Revisados skill de auditoría ya aplicado, contexto activo, constitución/roadmap conservados y spec/plan/tasks225. El estado CERRADA Y RATIFICADA de spec225 no acredita este delta CONS-03: añadir estado actual pendiente y evidencia de la revisión, conservando entradas históricas.

## Continuidad

Local AGY · Gemini 3.8 Flash High · Nativo. Ejecutar los tres pasos de forma secuencial, entregar un solo delta con stdout/exit codes y los criterios anteriores. CONS-02 permanece ratificado localmente con sus salvedades. CF-05/Lote 1 no se reabren; Spec229 diferida; preflight803 pendiente; DF habilitado.
