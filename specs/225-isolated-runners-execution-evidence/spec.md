# Spec 225: Runners Aislados y Evidencia por Ejecución

**ID:** Spec 225  
**Tipo:** Automatización UI y Gobernanza de Evidencia  
**Hallazgos Abordados:** ORG-08, ORG-09  
**Estado:** CERRADA Y RATIFICADA (100% PASS)  

## 1. Resumen Ejecutivo
Auditoría y refactorización de los scripts de automatización UI (`scripts/verify-cf05-ui-live.mjs` y `scripts/run-cf05-ui-live-validation.ps1`) para eliminar la dependencia de puertos fijos colisionantes (9230-9233), garantizar un apagado ordenado de procesos Chrome/Kestrel con espera explícita (`wait`), limitar la confianza TLS únicamente a los endpoints locales de prueba y desacoplar la generación de evidencia mediante carpetas exclusivas con `runId` y manifiesto criptográfico de artefactos, protegiendo las actas ratificadas existentes.
