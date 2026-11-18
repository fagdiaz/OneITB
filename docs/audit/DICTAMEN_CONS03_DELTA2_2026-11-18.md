# CONS-03 — Delta 2: suite ejecutada y dos pendientes — 18/11/2026

**DICTAMEN: REQUIERE AJUSTES ACOTADOS.** La suite canónica ahora se pudo ejecutar de forma segura: **12/12 PASS, exit 0, stderr vacío**. Los defectos de reserva previa del wrapper, pérdida de ownership, auto-taskkill y process.exit dentro de aserciones están corregidos en el alcance revisado. No reabrirlos. Quedan los dos puntos siguientes para cerrar el contrato completo.

Base HEAD 6cd5295d7768c34c32d37d54e0aad3d01f4749f6; delta de trabajo sin commit. Rama feature/2026-11-01-debugger-cv-builder, spec220/sub-lote225. Hashes de fuentes y salida literal en el archivo checks.json adjunto.

## Correcciones aceptadas

- Node es propietario de reserva: wrapper ya no precrea carpetas y sale sin escribir ante fallo de Node. Dry-run no promueve LATEST_RUN como UI.
- stop conserva proc tras EPERM/proceso vivo y started tras puerto retenido. La suite prueba dos fallos consecutivos y éxito después de liberar, usando PID sintético y terminador inyectado.
- createRunnerCleanup real compartido: todas las instancias reciben stop y llamadas concurrentes comparten promesa; la suite importa esta implementación.
- aserciones lanzan excepción y llegan a finally; los listeners usan puertos efímeros. Histórico y capturas invariantes.
- git diff --check PASS; producto respecto a HEAD sin cambios.

## Pendientes (mismo lote)

| ID | Severidad | Evidencia | Efecto |
|---|---|---|---|
| RUN-03/INTEGRACIÓN | P2 | writeManifest construye status/exitCode/etc., pero mode/uiExecuted/certified solo se añaden en dry-run. La ruta real llama writeManifest('PASS', 0) sin esos campos. El wrapper tiene Set-StrictMode Latest y lee manifest.mode/manifest.uiExecuted. | Un éxito de UI no cumple el contrato del consumidor: propiedades ausentes provocan error bajo StrictMode, por lo que RUN_OUTPUT y LATEST_RUN no se generan por la ruta prevista. Diagnóstico por inspección productor/consumidor; no se ejecutó UI ni PowerShell para simular un éxito real. |
| RUN-04/RESIDUO | P2 | El caso 10 lanza Node sin RUN_ID. Node genera un run_* que no se añade a createdRuns. Después del 12/12 quedó run_1795032376316_addc476f con manifest FAIL por puerto ocupado y screenshots vacío. | La suite informa éxito, pero deja una carpeta no registrada. Reproducido con inventario antes/después; eliminada exclusivamente por auditoría tras capturar evidencia y verificar propiedad/ruta. |

## Correcciones exactas, sin ampliar alcance

1. **Contrato único del manifiesto real.** Definir mode y uiExecuted en todas las rutas que consume el wrapper; el éxito real emitido después del cleanup debe identificar mode live y uiExecuted true. No marcar certified true por inferencia: su semántica debe ser explícita o mantenerse false si solo representa validación del runner. El wrapper debe validar existencia/tipos/status/exitCode y reconocer explícitamente live y dry-run. Manifiesto ausente, ilegible o desconocido => error no cero, no salida silenciosa exit 0. Actualizar LATEST_RUN solo para live/PASS/exitCode0 con evidencia obligatoria válida.

   Añadir una prueba de contrato productor-consumidor con fixtures aislados, sin navegador: usar el mismo constructor/serializador real del manifiesto y el mismo validador que usa el wrapper. Cubrir live/PASS, dry-run, campos faltantes y estado inválido. No escribir una copia de la política exclusivamente para el test, ni presentar el fixture como corrida UI real. Si PowerShell no está disponible, dejar esa ejecución explícitamente pendiente y conservar la verificación de contrato disponible.

2. **Registrar el run del caso 10.** Asignarle RUN_ID único previamente registrado en createdRuns, tal como los casos 3/4/11. Al final comprobar que no queda ningún directorio propio y que los listeners se cerraron; un error de borrado de un recurso propio debe hacer fallar la suite, no quedar absorbido por catch vacío. No borrar carpetas históricas/preexistentes. Conservar la prueba de aserción fallida/finally.

   Aceptación: correr la suite y comparar inventario de runs antes/después; cero carpetas propias residuales tanto en éxito como ante fallo inducido, y hashes históricos idénticos. Esto no obliga a ejecutar CF-05 en navegador ni repetir regresión del producto.

## Evidencia ejecutada

- node tests/test_runner_isolation.mjs, Node v22.13.0: 12/12 PASS, exit 0. Ejecución con entorno del hijo vacío para evitar heredar credenciales/flags; fixtures y autodetección local del binario usados por la suite. No se inició Chrome: la única ruta no dry-run con credencial válida se bloqueó por puerto ocupado antes de spawn.
- Caso de puerto ocupado dejó un manifiesto FAIL con screenshots=[]; se conserva su contenido en checks.json. Inventario inicial runs vacío; inventario posterior contenía una carpeta. Después de cleanup de auditoría, cero nuevas carpetas.
- Hash histórico intacto: 0f95fed4217591cb999aa0b0c3030fc2885036255ff0e1bbfb924490da5b8e5e. Todos los archivos de screenshots inventariados conservaron su hash.
- git diff --check exit0 (avisos LF/CRLF aparte); diff de API Graphql/FrontEnd respecto a HEAD vacío; HEAD confirmado.
- No se ejecutó wrapper PowerShell ni runtime UI/API/SQL; no commits/push/tag. Auditoría no modifica runner, workflows ni tests. Escribe dictamen/evidencia/prompt y elimina únicamente sus temporales/residuo identificado.

## Continuidad

Local AGY · Gemini 3.8 Flash High · Nativo. Resolver únicamente contrato del manifiesto y registro/validación del residuo del caso10. Los 12 casos y las correcciones aceptadas quedan preservados. CONS-03 pendiente de esos dos ajustes; CONS-02/CF-05/Lote1 no se reabren. Preflight803 pendiente; DF habilitado; Spec229 diferida.
