# PREFLIGHT-803 · Ronda 1 · RATIFICADO

Se acredita la línea base core de 803 pruebas mediante el preflight local aportado por AGY, con HEAD 6cd5295d7768c34c32d37d54e0aad3d01f4749f6 y árbol de trabajo modificado. La revisión independiente contrastó las métricas, las nueve compuertas, el script disponible y el estado actual de Git.

| Verificación | Resultado |
|---|---|
| Backend | 396 de 396 pasadas, cero fallidas y cero omitidas |
| Frontend | 407 de 407 pasadas, cero fallidas y cero omitidas |
| Compuertas | 9 de 9 PASS, Certified true, IsSimulated false |
| Árbol registrado | WorkingTreeClean false, 17 archivos rastreados modificados, cero staged |
| Correspondencia actual de producto | Diff de API Graphql y FrontEnd contra HEAD vacío y cero archivos nuevos no rastreados en esos directorios |

La ejecución de suites y compilaciones corresponde a la estación local de AGY. Esta ronda verificó sus artefactos sin repetir la regresión. El preflight acredita el código de producto de la revisión 6cd5295 ejecutado con el tooling local presente durante la corrida. El repositorio completo sigue pendiente de consolidación y autorización de publicación. Los archivos nuevos de tooling y auditoría deben figurar en el inventario del lote, además de los 17 cambios rastreados.

SHA-256 del artefacto PREFLIGHT_CERTIFIED_6cd5295.json revisado: 70fd9d160531929845e43bae1eff694073a3cd14a3a747837db427f4e3236ab8.

SHA-256 del script preflight disponible al revisar: 48dc1b22caea437eeaa1b0de8be5a5d0859153e2985ec4cbfd503efc05c505aa. Este hash identifica el archivo observado durante la auditoría.

## Precisiones para la consolidación

- EVIDENCIA_PREFLIGHT_CERTIFICADO_803_2026-11-18.json contiene resúmenes abreviados de algunas compuertas. Catalogarlo como resumen derivado y conservar separado el artefacto principal.
- Mantener explícito el árbol modificado al describir este preflight en el manifiesto y roadmap. Unificar las referencias todavía rotuladas como línea base informada con la acreditación de esta ronda.
- La compuerta EF compara el modelo con el snapshot de migraciones compilado. La comprobación del esquema desplegado y las migraciones aplicadas requiere evidencia propia.
- La suite core excluye GOB12SqlConcurrency, GOB15BcryptBenchmark y VendorAdvisoryGHSA según el filtro del script. Conservar su seguimiento separado, incluida la limitación upstream conocida.

CONS-03 conserva su cierre. El siguiente punto acotado es verificar en origin el objeto y el commit destino del tag histórico v1.0.0-rc, preservando la distinción con la revisión 6cd5295. Al consolidar el paquete, presentar a Fran el inventario exacto de archivos para autorización de commit/push. DF continúa habilitada.

Local AGY · Gemini 3.8 Flash High · Nativo.
