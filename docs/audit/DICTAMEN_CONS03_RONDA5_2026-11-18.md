# RUN-03 · Ronda 5 · REQUIERE AJUSTE

Revisión del árbol de trabajo sobre `6cd5295`. RUN-04 conserva su ratificación. El wrapper fija el productor canónico y compara los estados y modos con distinción de mayúsculas. La suite de aislamiento dio 13/13 PASS. En una copia temporal independiente, el validador Node acertó las ocho decisiones previstas (dos aceptaciones y seis rechazos).

| Comprobación | Resultado observado |
|---|---|
| Wrapper real de PowerShell | Ocho escenarios BLOCKED, cero códigos de salida observados. La sonda independiente agotó 25 segundos. La repetición del test fuera del sandbox también registró ocho bloqueos. |
| Interpretación del exit 0 | La suite devuelve 0 con los ocho escenarios BLOCKED si Node se comporta como esperaba. El hash idéntico en estas filas refleja un puntero que el wrapper nunca llegó a operar. |
| Producto | Git informó un árbol de producto sin cambios respecto a HEAD en `API Graphql` y `FrontEnd`. |

## Único punto de trabajo para AGY

Completar la prueba del consumidor real, en la raíz temporal. Ajustar las expectativas de los dos diagnósticos: los mensajes emitidos incluyen comillas simples alrededor de `'certified'` y `'uiExecuted'`, pero los dos tests buscan esos nombres sin comillas. En el test Node comparar `actualExit === sc.expectedExit` también al rechazar: el código actual admite cualquier salida distinta de cero si encuentra el texto esperado. Derivar la raíz de fixtures de la copia temporal; actualmente el mock prioriza `REPO_ROOT` heredado, que podría redirigir las escrituras.

Ejecutar una vez en un host con Windows PowerShell operativo y conservar el resultado original. Cierre: ocho códigos reales iguales a los esperados, motivo correcto en los seis rechazos y puntero actualizado solo en el éxito live. Si continúa indisponible el intérprete, conservar BLOCKED y esperar un cambio de entorno antes de repetir. No se requiere otra ejecución de CF-05 ni de la regresión del producto.

## Continuidad

El acuse de esta ronda corresponde al handoff pegado por Fran. El error de escritor activo informado por AGY es independiente del resultado de las pruebas y de la cuota. AGY puede leer el dictamen ya guardado. Para otra ronda automática en el mismo hilo, reintentar una vez cuando se haya liberado el escritor de forma normal y validar el ID de la respuesta. Conservar el archivo de bloqueo bajo gestión de Codex.
