# DOC-09 · Ronda 2 · RATIFICADO CON OBSERVACIONES

Fecha: 2026-11-19. HEAD comprobado: `582e2c9043eda5a168ff81a3950c5d63ec3d8c4b`.
Alcance: cierre de la reorganización documental y de la sobreescritura involuntaria de evidencia histórica. No certifica producción ni nuevas corridas de la línea base core.

## Conformidades

| Punto | Resultado |
| --- | --- |
| Actas finales | Las ratificaciones DOC-03, DOC-04 y DOC-05 se recuperaron en ratificaciones/. En la revisión del delta se comprobó equivalencia textual con HEAD anterior. |
| Navegación | Los nueve enlaces de capturas inspeccionados resuelven desde evidencias/ a ../screenshots/. |
| Evidencia CONS-03 | SHA-256 restaurado y comprobado antes y después de la ejecución independiente: `94ff18259af1ec21115cd3fef76820cb1c8d4b45e13c369c70b9cf4b3e541a35`, coincidente con la ratificación histórica. |
| Productores | Ambos productores utilizan por defecto scratch/EVIDENCIA_WRAPPER_FIXTURES_RUN.json, separado del archivo histórico. Admiten CONTRACT_EVIDENCE_PATH. |
| Contrato dinámico | `node tests/test_wrapper_contract.mjs`: 8/8 PASS, exit 0, PowerShell disponible; éxitos exit 0, seis rechazos exit 1 y conservación del puntero en los escenarios correspondientes. Salida de esta revisión: scratch/DOC09_AUDITOR_NODE.json. |
| Aislamiento | Suite de aislamiento ejecutada en la revisión precedente de este delta: 13/13 PASS, exit 0; no se atribuye una nueva corrida a este HEAD. |
| Estructura | Antes de agregar este dictamen: cinco archivos canónicos en raíz, 16 actas/dictámenes y 19 evidencias. Este dictamen incrementa el inventario de actas a 17. |
| Code Freeze | Diff entre 4629ba737722d81526a2ffa1a22f90198ec4cee9 y HEAD vacío para API Graphql, FrontEnd y specs. |

## Observaciones y límites de aceptación

1. **SHA del handoff:** el SHA completo informado no coincide con HEAD; utilizar el registrado al comienzo de este dictamen y en el acuse actualizado. El prefijo 582e2c9 sí coincide.
2. **Procedencia de resultados nuevos:** los productores conservan fecha 2026-11-18 y base 6cd5295 fijas. Sus JSON nuevos son resultados diagnósticos, no evidencia certificada de ese corte histórico. Antes de reutilizarlos como certificación, registrar fecha, SHA y estado del worktree reales. Este dictamen identifica por separado la ejecución actual.
3. **Aislamiento limitado:** el destino por defecto es compartido entre productores y CONTRACT_EVIDENCE_PATH permite elegir otra ruta. No afirmar aislamiento multi-run universal ni protección contra configuraciones que apunten deliberadamente al archivo histórico. En auditoría se usaron destinos separados para evitar colisiones.
4. **Prueba PowerShell directa:** `powershell.exe -NoProfile -File tests/test_wrapper_consumer_fixtures.ps1` terminó con código 1 por política de firmas (UnauthorizedAccess). No se modificó esa política. Su 8/8 directo permanece informado por AGY, no ejecutado por este auditor. La suite Node sí ejecutó el consumidor PowerShell real en sus ocho escenarios.
5. **Preservación semántica:** los otros tres JSON restaurados son semánticamente iguales, no byte a byte según la comparación anterior. No presentarlos como huellas idénticas. El soporte cuyo hash está fijado en CONS-03 sí es idéntico al original.
6. **Inventario de bajas:** PREFLIGHT_CERTIFIED_9a61e73.json contenía Certified:true con WorkingTreeClean:false; es preflight histórico de árbol modificado, no «no certificado». Su versión se conserva en Git en 4629ba737722d81526a2ffa1a22f90198ec4cee9:docs/audit/PREFLIGHT_CERTIFIED_9a61e73.json. La baja del árbol actual no revoca esa procedencia.

Estas observaciones no reabren la reorganización ni requieren otra ronda técnica de DOC-09. El defecto de sobreescritura involuntaria por los destinos predeterminados está resuelto y el soporte histórico restaurado. Mantener las limitaciones al describir el cierre.

## Higiene y entrega

Diff-check staged y unstaged sin errores, con aviso LF/CRLF en prompt.txt. No se encontraron directorios scratch/test_contract_isolated_* después de la corrida. El JSON diagnóstico permanece separado en scratch como soporte de esta ejecución; sus campos históricos fijos no sustituyen la procedencia consignada aquí.

No se repitieron CI, readiness, regresión de producto, revisión visual ni consultas remotas. No se verificó publicación remota de los commits. No se realizaron commits, pushes, staging ni cambios de tags durante esta auditoría. La conformidad se limita al estado local identificado.

Destino: Local AGY · Modelo: Gemini 3.8 Flash High · Razonamiento: Nativo.
