# RUN-03 · Ronda 7 · RATIFICADO

Se ratifica RUN-03 y se cierra técnicamente el lote CONS-03 / Spec 225 sobre el árbol de trabajo revisado, con base 6cd5295d7768c34c32d37d54e0aad3d01f4749f6. RUN-04 y las conformidades previas conservan su cierre.

## Fundamento

La ejecución local aportada por AGY registra ocho escenarios reales del consumidor PowerShell conformes, con dos salidas 0 y seis salidas 1, causas de rechazo esperadas y cero bloqueos. Se contrastó el JSON con la salida aportada y el código productor/consumidor. Las comprobaciones independientes de consistencia verificaron la cadena de hashes entre escenarios, publicación del ID live y preservación del puntero en los siete casos restantes.

El wrapper mantiene el productor fijo, los tipos JSON estrictos y las comparaciones sensibles a mayúsculas. Los fixtures operan en una copia temporal. La expectativa de rechazo de estado incoherente usa un fragmento específico que coincide con el diagnóstico emitido.

La auditoría de esta ronda verificó la evidencia aportada por AGY; la ejecución PowerShell corresponde a su estación local. El archivo EVIDENCIA_WRAPPER_FIXTURES_CONS03.json revisado tiene SHA-256 94ff18259af1ec21115cd3fef76820cb1c8d4b45e13c369c70b9cf4b3e541a35.

El histórico CF05_UI_AUTOMATED_RUNNER_OUTPUT.md conserva SHA-256 0f95fed4217591cb999aa0b0c3030fc2885036255ff0e1bbfb924490da5b8e5e. La inspección actual encontró cero directorios residuales de fixtures con los prefijos usados por las suites. git diff --check terminó con código 0 y avisos LF/CRLF. El diff de producto respecto a HEAD está vacío. La suite 13/13 de aislamiento tiene respaldo en rondas previas y en la corrida informada por AGY.

## Continuidad

El siguiente punto es ejecutar el preflight oficial con ExpectedBackendBaseline 396 y ExpectedFrontendBaseline 407, registrando el SHA y el estado real del árbol de trabajo. Ese resultado acreditará la línea base de 803 pruebas y las compuertas integrales del corte. Mantener por separado la evidencia SQL histórica y el tag histórico. DF continúa habilitada. La publicación Git requiere la autorización explícita de Fran.

Local AGY · Gemini 3.8 Flash High · Nativo.
