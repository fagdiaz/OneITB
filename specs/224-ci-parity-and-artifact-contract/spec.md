# Spec 224: Paridad de CI, Fijación de Herramientas, Desacoplamiento de Despliegue y Gating Estricto

**ID:** Spec 224  
**Tipo:** Integración Continua y Despliegue  
**Hallazgos Abordados:** ORG-04, ORG-05, ORG-15, CONS-02
**Estado:** RATIFICADO LOCALMENTE CON OBSERVACIONES (CONS-02 CERRADO EN CONFIGURACIÓN Y TESTS)

## 1. Resumen Ejecutivo
Alineación total entre los flujos remotos de GitHub Actions y la certificación local. En `quality-gates.yml`, se restauró explícitamente `Services.Tests.csproj`, se replicaron los filtros canónicos de categorías de xUnit y se aisló el canario upstream (`VendorAdvisoryGHSA`). Se fijó la versión de `oxlint@1.94.0` tanto en CI como en preflight local.

Para resolver integralmente el hallazgo **CONS-02**, se implementó un contrato de gating estricto en todas las vías de entrada de los workflows de despliegue (`main_oneitbapi.yml` y `azure-static-web-apps-agreeable-moss-01ccbda10.yml`):
1. **Gating de Producción en Backend (`main_oneitbapi.yml`):** El job `verify_quality_gate` valida la conclusión exitosa (`conclusion == 'success'`) en rama `main` para eventos `workflow_run`. En eventos `workflow_dispatch`, consulta la API de GitHub Actions para verificar que el commit SHA especificado cuente con una ejecución completada y exitosa de `Quality Gates`. De lo contrario, la ejecución se bloquea inmediatamente con código 1.
2. **Segregación Estricta de Entornos en Frontend (`azure-static-web-apps...`):** Se separaron los despliegues en dos jobs independientes: `deploy_production` (restringido a rama `main` y vinculado al entorno `Production`) y `deploy_preview` (restringido a `pull_request` y vinculado al entorno efímero `Preview`).
3. **Gating de PR Preview y Manual Dispatch:** Tanto los despliegues de preview en PR como los dispatches manuales exigen la validación exitosa de `Quality Gates` para el commit SHA destino antes de compilar o cargar artefactos a Azure Static Web Apps.
4. **Aislamiento de Cierre de PR:** El job `close_pull_request_job` queda estrictamente restringido a eventos `pull_request` con acción `closed`, cerrando el entorno de staging sin compilar ni tocar producción.
5. **Falsabilidad Demostrada:** Se cumple la cuádruple aserción de seguridad: fallo de QG bloquea producción; QG exitoso en commit Y no autoriza commit X; dispatch manual no verificado se bloquea; y los previews de PR se identifican como tales y no pueden promoverse a producción fuera del flujo de `main`.
