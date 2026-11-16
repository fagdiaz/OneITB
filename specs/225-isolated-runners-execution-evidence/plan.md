# Plan de Implementación: Spec 225

## Lotes de Ejecución:
- **Lote A — Relevamiento de procesos y parámetros:** Identificar puertos, ChromeUserDataDir, kill por PID, relajación TLS y rutas de salida. Demostrar colisiones en ejecuciones consecutivas.
- **Lote B — Implementar aislamiento:** Parámetros de puerto/directorio; cierre ordenado con wait y verificación de puerto libre; scoping de TLS solo a endpoints de prueba; captura en carpeta de ejecución con `runId` y hashes.
- **Lote C — Validación sin sobreescritura:** Ejecución local en modo prueba; verificar que la evidencia ratificada anterior permanece idéntica en hash y que la nueva corrida produce su propio manifiesto sin procesos residuales.
