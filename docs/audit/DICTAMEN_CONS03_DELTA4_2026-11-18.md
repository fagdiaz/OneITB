# CONS-03 · Revisión del contrato de manifiesto · 18/11/2026

**Requiere un ajuste acotado.** RUN-04 sigue cerrado. La suite Node del árbol de trabajo sobre `6cd5295` terminó con 13/13 PASS y salida 0. El diff de producto contra HEAD resultó vacío. La rama PowerShell comprueba ahora el tipo booleano antes de evaluar `uiExecuted`. La verificación dinámica del consumidor sigue pendiente. Windows PowerShell y pwsh agotaron el plazo incluso al consultar su disponibilidad.

| ID | Severidad | Componente | Condición | Efecto |
|---|---|---|---|---|
| RUN-03 | P2 | Procedencia de los siete casos | El JSON aportado contiene `matrixTable` y `psWrapper`. PowerShell escribe un array de registros y Node escribe un objeto con `powershellDynamicExecution`. Tras publicar el primer ID, ambas suites lo conservan para el caso siguiente. El documento vuelve a `baseline_run_id`. | El archivo entregado no acredita la salida original de ninguna suite en esta revisión. |
| RUN-03 | P2 | Aislamiento de fixtures | El wrapper admite sustituir el productor mediante `NODE_RUNNER_SCRIPT`. Las dos suites leen y escriben el puntero del repositorio y lo restauran al salir. | Un éxito sintético se publica temporalmente como última UI real. Una interrupción puede dejar el puntero sintético publicado. |
| RUN-03 | P2 | Paridad del contrato | Node compara los literales de modo y estado con distinción de mayúsculas. PowerShell usa `-eq` y `-ne`, que ignoran mayúsculas por defecto. | El consumidor puede aceptar variantes de capitalización que el productor rechaza, por ejemplo estado `pass`. |

## Cierre en un solo lote

1. Fijar el productor canónico en el wrapper operativo. En el test, copiar el wrapper intacto a una raíz temporal y colocar allí el productor de fixtures en la ubicación esperada. Toda publicación y limpieza debe ocurrir dentro de esa raíz.
2. Igualar las comparaciones de literales en ambos motores. El test debe comprobar también la decisión de Node. Si PowerShell está indisponible, registrar BLOCKED y dejar sin valor el código del proceso. El fallback actual asigna el código esperado a `actualExit`.
3. En una única corrida, cubrir los siete escenarios existentes y una variante de capitalización. Capturar el resultado original, los códigos reales y el SHA-256 del puntero antes y después. Para el éxito live comprobar además que el ID publicado coincide con el de la corrida. El dry-run válido y los rechazos deben preservar los bytes anteriores. Una causa de rechazo inesperada debe hacer fallar el control negativo. Si se usa Node para leer los resultados de Windows PowerShell 5.1, contemplar el BOM que escribe `Set-Content -Encoding utf8`.

La validación cabe en fixtures locales. CF-05 y la regresión de producto quedan fuera del alcance de este ajuste. DF continúa habilitada.
