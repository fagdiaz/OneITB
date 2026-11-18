# Dictamen CONS-03 · 18 de noviembre de 2026

**RUN-04 ratificado. RUN-03 requiere un ajuste acotado.** Revisión del árbol de trabajo sobre HEAD 6cd5295d7768c34c32d37d54e0aad3d01f4749f6.

| ID | Severidad | Componente | Condición evaluada | Resultado |
|---|---|---|---|---|
| RUN-04 | Cerrado | Caso 10 | Puerto ocupado, salida normal y salida excepcional | Suite 13/13. Un fallo inducido después del caso 10 en una copia temporal terminó con código 1 y cero carpetas de corrida residuales. |
| RUN-03 | P2 | Manifiesto Node y consumidor PowerShell | Estados y tipos incompatibles | Node aceptó tres fixtures inválidos. PowerShell convierte valores antes de comprobarlos. El caso 13 solo ejercita Node. |

## Evidencia independiente

- La suite canónica terminó con código 0. Coincidieron el inventario de corridas y los hashes del informe histórico y de las nueve capturas antes y después. El SHA-256 del informe fue 0f95fed4217591cb999aa0b0c3030fc2885036255ff0e1bbfb924490da5b8e5e.
- El constructor real produjo un manifiesto live/PASS válido utilizando los argumentos por defecto. En pruebas directas, validateManifestContract también aceptó dry-run/PASS con uiExecuted falso, status UNKNOWN y live/PASS con certified verdadero. El contrato del runner fija certified en falso.
- En el wrapper, las líneas 130–134 convierten valores antes de evaluarlos. La cadena JSON `"false"` se convierte en verdadero al aplicar [bool]. La rama dry-run tampoco exige uiExecuted falso. Los intérpretes PowerShell agotaron su plazo de arranque incluso al consultar la versión. El comportamiento del consumidor se evaluó por inspección. La publicación de un puntero incorrecto queda sin verificación dinámica.
- El diff de producto contra HEAD resultó vacío. La auditoría se limitó al tooling de la Spec 225.

## Criterio de cierre para Local AGY

Aplicar la misma tabla de combinaciones válidas al producir y consumir el manifiesto. Comprobar los tipos JSON originales y exigir certified falso. Los éxitos válidos son live/PASS/0/true y dry-run/DRY_RUN_OK/0/false para mode/status/exitCode/uiExecuted. Para fallos aplicar FAIL, código distinto de cero y uiExecuted falso conforme al contrato declarado.

Ejecutar el wrapper PowerShell real con manifiestos de prueba en un directorio temporal y registrar el código de salida y el puntero antes y después. Un éxito live debe publicar su ID. Un dry-run válido debe conservar el puntero. Las combinaciones incoherentes y los tipos incorrectos deben terminar con error y conservar el puntero previo. Se puede usar un productor de fixtures sin navegador.

DF sigue habilitada. El preflight de 803 pruebas sigue pendiente por separado.
