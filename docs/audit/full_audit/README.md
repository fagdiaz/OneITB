# OneITB23 - Suite de Auditoría Autónoma Integral

Este directorio contiene los reportes, estado y métricas de la **Auditoría de Código y Funcionamiento Exhaustiva** de OneITB23, ejecutada por el motor autónomo `speckit-code-audit`.

## Estructura de la Auditoría

1. **Estado en Tiempo Real:** [`audit_state.json`](./audit_state.json) - Registra el progreso modular, el puntero del módulo activo y las métricas acumuladas.
2. **Módulos de Inspección:**
   * `MODULE_01_AUTH_RBAC.md`: Autenticación, Identidad, Roles y Onboarding.
   * `MODULE_02_ACADEMIC.md`: Dominio Académico (Materias, Correlatividades, SIU).
   * `MODULE_03_SOCIAL_FEED.md`: Dominio Social, Publicaciones y Multimedia.
   * `MODULE_04_MESSAGING_REALTIME.md`: Chat en tiempo real, Notificaciones y WebSockets.
   * `MODULE_05_EMPLOYMENT_CV.md`: Bolsa de Empleos y CV Builder.
   * `MODULE_06_ADMIN_MODERATION.md`: Panel de Administración y Moderación.
3. **Reporte Maestro:**
   * `MASTER_AUDIT_REPORT.md`: Consolidación global de hallazgos, matriz de riesgos y oportunidades de reducción de código.

## Reglas Operativas
- **Solo Lectura en Código:** La auditoría nunca modifica código fuente de la aplicación; solo genera documentación técnica y diagnósticos en este directorio.
- **Trazabilidad 360°:** Cada elemento interactivo en UI se triangula:
  `UI / Botón ➔ Hook Apollo ➔ Resolver HotChocolate ➔ Servicio .NET ➔ EF Core / SQL`
- **Optimizaciones Detectadas:** Se identifican líneas huérfanas, boilerplate redundante y oportunidades de simplificación de código.
