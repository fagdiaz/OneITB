# DOC-01 · Ronda 1 · REQUIERE AJUSTE

## Alcance y evidencia

Revisión documental y de código del verificador. HEAD real es 5c0bbb6b2ffebc659a7bd490b2c2a53790d56bae. El SHA completo 5c0bbb68565fe260c6c06a33845ff103328e30b0 del handoff no se resuelve como objeto local. El diff de producto entre 6cd5295 y HEAD está vacío, al igual que el diff de producto del árbol actual. DEVELOPMENT_LOG.md conserva su contenido respecto a HEAD.

El JSON de defensa parsea correctamente y contiene 20 preguntas. Su hash actual es 52f8635d5e21528081e3c8fc73e6260d90315ff2ab201e333d44f76e05b7e7c6. Se inspeccionó el script de readiness. La ejecución 10/10 procede del informe de AGY.

## Matriz de ajustes

| ID | Severidad | Ubicación y evidencia | Corrección mínima |
|---|---|---|---|
| DOC-01/A | P2 | Handoff con SHA completo incorrecto. Pregunta 12 adjudica certificación a 5c0bbb6 y mezcla el candidato histórico 37ed360 con la revisión actual. | Usar HEAD completo real. Citar las 803 pruebas del preflight sobre 6cd5295 con árbol modificado y la posterior consolidación 5c0bbb6 con producto idéntico. Mantener las 11 SQL como evidencia histórica separada. |
| DOC-01/B | P2 | MULTI_AGENT_FRAMEWORK.md, diagrama y tabla, asigna Alto/Muy Alto a Canal 2. AGENTS.md y Constitución asignan Alto/Medio. La skill hardening permite Astra como selección principal. | Alinear Canal 2 a 6.2 Sol, Alto para concurrencia y Medio para tests de dominio. Expresar cualquier excepción únicamente si existe autorización vigente. |
| DOC-01/C | P2 | MULTI_AGENT_FRAMEWORK.md atribuye a 6.2 un umbral API de 272k y multiplicadores de tarifa mediante reemplazo de nombres. | Documentar una fuente oficial vigente por modelo para esas cifras o dejar las condiciones del proveedor pendientes de verificación. El umbral operativo interno de continuidad puede conservarse como decisión del proyecto. |
| DOC-01/D | P2 | EXPORT_CHECKLIST.md conserva el hash f505cdf... del JSON. Los PPTX/PDF siguen asociados a una exportación anterior. | Actualizar el hash de la fuente y su procedencia. Conservar DF-07 pendiente de regeneración y revisión visual de los binarios. |
| DOC-01/E | P2 | Test-DefenseDemoReadiness.ps1 comprueba existencia de DLL, bundle y diapositivas, configuración y cadenas en fuentes, pero concluye ENTORNO 100% OPERATIVO. Rotula HEAD como SHA candidato y fija la rama en una cadena. | Rotular el resultado como comprobación estática de prerrequisitos, identificar HEAD consultado y obtener la rama real. Ajustar las frases HTTP 206 activo, RowVersion activo y material listo al alcance realmente comprobado. Mantener pendientes el runtime y la sincronización editorial que requieren otras evidencias. |

git diff --check dio salida 2 por espacios al final de prompt.txt, línea 56. Corregir ese detalle al preparar el nuevo handoff.

## Secuencia acotada para AGY

Atender primero DOC-01/A, trazabilidad del corte y redacción de la pregunta 12. Devolver solo ese delta para revisión. Después avanzar por B/C (gobernanza), D (integridad editorial) y E (alcance del readiness), manteniendo el mismo criterio de cambios pequeños. Los hallazgos anteriores constituyen la lista completa de esta revisión. La actualización de nombres de modelos, la nueva cifra aritmética 396 + 407 = 803 y la conservación de logs históricos son conformes dentro del alcance inspeccionado.

Local AGY · Gemini 3.8 Flash High · Nativo. Revisión Canal 1 · 6.2 Astra · Alto.
