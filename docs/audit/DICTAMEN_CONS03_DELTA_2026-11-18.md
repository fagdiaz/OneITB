# CONS-03 — Revisión de remediación RUN-01 a RUN-04 — 18/11/2026

**Dictamen: REQUIERE AJUSTES, limitados a tres puntos de integración/seguridad del instrumento.** Se reconocen las correcciones del runner individual; no se ratifica la suite completa de 12 casos.

Base HEAD 6cd5295d7768c34c32d37d54e0aad3d01f4749f6; rama feature/2026-11-01-debugger-cv-builder; puntero activo 220. Delta local sin commit identificado por hashes adjuntos. CONS-02, Lote 1 y CF-05 permanecen ratificados en sus alcances anteriores.

## Mejoras comprobadas

- validateAndReserveEvidenceDir rechaza ../escaped y caracteres inválidos. Segunda reserva de unique se rechaza y conserva el centinela. Ejecutado directamente contra la función real en raíz temporal propia.
- Inspección: RUN_ID generado si falta, sin fallback histórico; dry-run con DRY_RUN_OK/mode/uiExecuted/certified; writeManifest ya propaga errores de I/O.
- Inspección: cleanup principal usa Promise.allSettled y escribe PASS después de esperar cleanup. El defecto original de orden secuencial está corregido en el código.
- Chrome override inexistente ahora rechaza explícitamente; wrapper de tests delega en Node, eliminando implementación paralela PowerShell.
- Informe histórico y todos los archivos regulares inventariados de screenshots conservan exactamente sus hashes durante esta auditoría.

## Tres puntos pendientes

| ID previo | Severidad | Hallazgo actual | Evidencia |
|---|---|---|---|
| RUN-01 / RUN-03 | P1 | Wrapper de ejecución incompatible con reserva exclusiva y todavía capaz de sobrescribir artefactos | run-cf05-ui-live-validation.ps1 conserva New-Item -Force de run/screenshots antes de invocar Node. El Node nuevo rechaza esa carpeta existente. Luego el wrapper escribe RUN_OUTPUT.md y LATEST_RUN.json incluso con exit no cero; un ID previamente usado puede perder su salida anterior. |
| RUN-02 | P1 | stop pierde la identidad del recurso que no logró liberar y una repetición da éxito falso | this.proc=null aun con proceso vivo/EPERM; this.started=false aun con puerto retenido. Contra stop real, terminación interceptada y liveness EPERM: primera llamada RESOURCE_LEAK_DETECTED, handle perdido, segunda llamada PASS. |
| RUN-04 / RUN-02 | P1 para ejecución de suite | Caso 6 intenta terminar el propio proceso; aserciones salen sin finally; caso 5 prueba una copia del cleanup | instProc.proc={pid:process.pid}; stop invoca taskkill /F /T /PID sobre ese PID. Se interceptó la llamada, sin ejecutarla, y coincidía con el PID del driver. assertTest usa process.exit(1), que no desenrolla finally. aggregateCleanup está redefinido dentro del test y no invoca el cleanup del runner. |

### 1. Coordinar el wrapper de ejecución con el propietario de evidencia

El wrapper relevante es scripts/run-cf05-ui-live-validation.ps1, distinto del wrapper de tests que sí fue simplificado. Al precrear screenshots también crea su padre; se reprodujo esa condición en sandbox y la función real lanzó RUN_ID_ALREADY_EXISTS. No fue necesario ejecutar PowerShell ni leer secretos.

Definir UN propietario de reserva y escritura. El wrapper no debe precrear la carpeta que Node reservará, ni escribir artefactos de una corrida que no pudo reservar. Usar únicamente el destino validado y reservado; no recomponer rutas desde RunId crudo. Propagar el modo/estado del manifiesto: no convertir dry-run en PASS de UI en LATEST_RUN.

Aceptación fija: wrapper + runner con ID nuevo puede terminar dry-run de instrumento sin browser; mismo ID rechaza y conserva hashes de TODOS los artefactos anteriores; traversal se rechaza antes de cualquier escritura del wrapper; dos reservas concurrentes tienen exactamente un ganador. Mantener resultados previos de validación del ID, no rediseñar esa función salvo lo necesario.

### 2. Mantener ownership y error hasta liberar realmente el recurso

Conservar proc/PID mientras no se confirme ESRCH; conservar started/puerto mientras no se confirme liberación. Un segundo stop debe reintentar o reportar que el recurso sigue vivo, nunca olvidar el fallo y devolver éxito. No confundir permisos/desconocimiento con desaparición.

Centralizar finalización idempotente para éxito, error y señales, compartiendo una promesa de cleanup cuando haya llamadas simultáneas. Agregar errores al terminar todas las instancias; no emitir PASS si quedan recursos. Acotar taskkill con timeout y terminar exclusivamente procesos de propiedad comprobada.

Aceptación fija: dos stop consecutivos con proceso vivo/EPERM y puerto retenido devuelven fallo ambas veces; si luego desaparecen, la siguiente llamada confirma liberación. Fallo en A no evita stop de B/C/Probe, probado invocando la función que usa main y no una recreación en el test. Falla de cleanup o escritura => resultado no PASS y exit no cero.

### 3. Hacer segura y falsable la suite canónica

No ejecutar el caso 6 actual con taskkill habilitado: está dirigido al proceso de la propia suite y su árbol. El comentario de que ese PID no morirá no refleja la operación real.

Inyectar terminador/sonda de liveness/remoción/puerto o interceptarlos explícitamente en un proceso descartable. Para simular proceso retenido no usar ningún PID real con un terminador activo. Probar el mismo código de stop/cleanup del runner. Un mock local de Promise.allSettled no valida la integración.

assertTest debe lanzar excepción; finally debe limpiar y calcular hashes antes de establecer el exit code final. Cambiar process.exit dentro de aserciones por propagación hasta el punto de salida único. Usar directorios propios registrados en finally y puertos efímeros, no 9296/9297 fijos. Hoy tempAuditRoot en os.tmpdir solo sirve al fixture Chrome ausente; las corridas se crean realmente bajo docs/audit/evidence/runs del repositorio y varias se limpian solo en el camino feliz. No afirmar sandbox universal hasta corregir ese circuito.

Aceptación fija: fallo deliberado de aserción llega al finally, conserva los hashes históricos y borra todos los recursos propios; ningún taskkill real apunta al PID de la suite, padre o proceso ajeno; timeout/spawn error no cuenta como negativo PASS (validar exit esperado y mensaje específico). La suite final debe informar su salida real, sin anticipar 12/12.

## Evidencia ejecutada y límites

- Driver Node acotado contra módulo real: validación de IDs/duplicado, precreación equivalente al wrapper y dos llamadas de stop con terminador/liveness interceptados. Código y stdout íntegros en DICTAMEN_CONS03_DELTA_2026-11-18.checks.json.
- Terminación real: NINGUNA. El stub capturó taskkill /F /T /PID <PID propio> y devolvió fallo sintético; no ejecutó taskkill. Sandbox propio eliminado tras comprobar ruta absoluta, padre y prefijo de propiedad.
- Hash del acta histórica conservado: 0f95fed4217591cb999aa0b0c3030fc2885036255ff0e1bbfb924490da5b8e5e. Inventario/hash de screenshots antes/después también idéntico.
- Producto respecto a HEAD: diff vacío. HEAD confirmado.
- git diff --check: FAIL exit 2 por espacios finales en DEVELOPMENT_LOG.md líneas 26 y 27 del delta actual. Corregir formato del agregado actual sin reescribir historia. No es un cuarto hallazgo funcional.
- No se ejecutó la suite completa por el auto-taskkill detectado; tampoco wrapper con credenciales, navegador, Kestrel, SQL, red, commits, pushes o tags. No se atribuye fallo de suite ejecutada ni 12/12 PASS.

## Continuidad

Local AGY · Gemini 3.8 Flash High · Nativo. Corregir en orden: wrapper de ejecución; retención/idempotencia de cleanup; fixtures y finally. Entregar un solo delta con pruebas de los tres puntos y git diff --check. CONS-03 permanece pendiente; no reabrir CONS-02, CF-05 o Lote 1. Preflight803 pendiente; DF habilitado; Spec229 diferida.
