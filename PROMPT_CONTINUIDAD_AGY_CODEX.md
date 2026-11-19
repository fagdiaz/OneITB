# Continuidad de OneITB23 · Local AGY y Canal 1

AGY, al terminar la corrida actual, conservá su resultado y retomá desde el último punto abierto. Tu objetivo es llevar los pendientes autorizados de OneITB23 hasta lotes pequeños, verificados y listos para commit. Usá el roadmap para ordenar el trabajo y el último dictamen para identificar qué sigue abierto. Empezá por el primer punto pendiente de RUN-03, salvo que la corrida actual ya lo haya acreditado. Respetá AGENTS.md, la Constitución, la spec activa y el Code Freeze.

## Ciclo de trabajo

1. **Elegí un solo punto verificable.** Indicá el ID, el SHA base, el resultado esperado y la prueba que permitiría declararlo resuelto. Proponé ese alcance a Codex en el mismo hilo. Si el dictamen vigente ya establece ese criterio, tomalo como acuerdo y avanzá.
2. **Hacé el cambio mínimo.** AGY es responsable de integrar en disco y ejecutar la comprobación acordada. Conservá los cambios ajenos del worktree. Si aparece un hallazgo independiente, anotá su ID para después. Si es indispensable para resolver el punto actual, acordá con Codex el ajuste de alcance antes de tocarlo.
3. **Pedí revisión independiente a este chat.** Usá el ID fijo `01a1b8c1-3efa-7bc2-b17a-202bd56244e3` con `codex exec resume`. Enviá el handoff de `prompt.txt` por entrada estándar y guardá la respuesta por separado. Incluí ID de punto y de ronda, SHA base, archivos y diff del cambio, comando ejecutado, resultado observado y ruta de evidencia saneada. Pedí que Codex responda con el mismo ID y uno de estos estados: `RATIFICADO`, `REQUIERE AJUSTE` o `BLOQUEADO`, con el motivo. Permití una sola revisión en curso. Comprobá la primera ida y vuelta antes de depender del enlace automático.
4. **Iterá hasta resolver.** Ante `REQUIERE AJUSTE`, atendé la observación concreta, verificá el cambio y devolvé nueva evidencia al mismo hilo. Las rondas son ilimitadas mientras haya progreso. Si se repite una observación, investigá la causa o la evidencia faltante. Ante un fallo transitorio de comunicación, guardá el estado de la ronda y reanudá desde ahí. Si el bloqueo requiere una decisión, acceso o intervención humana, informá exactamente cuál. Una respuesta ausente o un timeout dejan la revisión pendiente.
5. **Cerrá el lote más pequeño que tenga sentido publicar.** Cuando el punto esté ratificado y constituya por sí solo un cambio coherente, presentalo para commit. Si requiere otro paso inseparable, completalo con el mismo ciclo. Aplicá las compuertas de estabilización exigidas por el proyecto sobre el corte exacto. Informame **«Listo para commit/push»** con el alcance, archivos que entrarían, pruebas y salvedades. Esperá mi autorización explícita para las operaciones Git correspondientes. Después de la decisión, retomá el siguiente pendiente.

## Pausa por cuota de Codex

Si Codex informa que se agotó la cuota de 5 horas o la semanal, esta regla tiene prioridad sobre los reintentos del paso 4. Suspendé las rondas y estabilizá el punto en curso. Llevá la operación ya iniciada hasta un punto seguro, preservá los cambios y su evidencia, y cerrá los procesos temporales propios. Registrá en `prompt.txt` el estado `PAUSADO_POR_CUOTA`, el ID del punto y la ronda, el SHA base, las comprobaciones terminadas, la revisión pendiente y la próxima acción exacta. Avisale a Fran una sola vez.

Mantené ambos agentes en pausa, incluso después de que se renueve la cuota. **Esperá la señal explícita de Fran para retomar** (por ejemplo, «retomen»). Con esa señal, comprobá que Codex esté disponible en el mismo hilo y continuá desde la ronda registrada. Si la cuota sigue agotada, conservá la pausa y esperá una nueva señal. La autorización para commit, push o tag sigue siendo independiente.

## Orden y límites

Completá primero el cierre técnico pendiente (RUN-03, preflight de 803 pruebas del corte y trazabilidad del tag histórico). Después seguí por las tareas documentales y de defensa DF/LG que sigan abiertas. Verificá el estado real antes de repetir trabajo. Registrá las aceptaciones externas de producción con sus dependencias. Mantené cerrado lo ya ratificado salvo que un cambio lo afecte o aparezca evidencia concreta de regresión.

AGY trabaja en local. Codex audita y devuelve el dictamen por el mismo hilo. Fran interviene cuando hay un lote estable para publicar o una decisión que realmente le corresponde.

**Canal de destino** Local AGY · **Modelo** Gemini 3.8 Flash High · **Razonamiento** Nativo. Para la revisión, Canal 1 [OneITB] Auditoría & Arquitectura · 6.2 Astra · Alto (o Canal 2 [OneITB] Hardening & Testing · 6.2 Sol · Alto).
