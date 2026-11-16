# Spec 224: Paridad de CI, Fijación de Herramientas y Desacoplamiento de Despliegue

**ID:** Spec 224  
**Tipo:** Integración Continua y Despliegue  
**Hallazgos Abordados:** ORG-04, ORG-05, ORG-15  
**Estado:** CERRADA Y RATIFICADA (100% PASS)  

## 1. Resumen Ejecutivo
Alineación total entre los flujos remotos de GitHub Actions y la certificación local. En `quality-gates.yml`, se restauró explícitamente `Services.Tests.csproj`, se replicaron los filtros canónicos de categorías de xUnit y se aisló el canario upstream (`VendorAdvisoryGHSA`). Se fijó la versión de `oxlint@0.15.11` tanto en CI como en preflight local. Se desacoplaron los despliegues de Azure en `main_oneitbapi.yml` y `azure-static-web-apps...` de disparadores directos de `push`, encadenándolos a la finalización exitosa de `Quality Gates` sobre el mismo SHA verificado.
