# Spec 223: Certificador Ligado al Corte y Validación Dinámica de Gobernanza

**ID:** Spec 223  
**Tipo:** Herramientas de Estabilización y Calidad  
**Hallazgos Abordados:** ORG-02  
**Estado:** CERRADA Y RATIFICADA (100% PASS)  

## 1. Resumen Ejecutivo
Actualización de la herramienta `.agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1` y su suite `tests/test_governance_stabilize.ps1`. Se parametrizaron las líneas base esperadas (396 backend / 389 frontend) con validación estricta de igualdad bajo `-Certify` (rechazando tanto caídas de tests como incrementos silenciosos), y se implementó la resolución dinámica del puntero de especificación activa desde `.specify/feature.json` en Gate 9, eliminando excepciones históricas fijas.
