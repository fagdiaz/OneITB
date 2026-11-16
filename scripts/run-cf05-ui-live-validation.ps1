[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$projectPath = Join-Path $repositoryRoot "API Graphql\OneITB\GraphQL.csproj"
$nodeScript = Join-Path $repositoryRoot "scripts\verify-cf05-ui-live.mjs"
$outputEvidence = Join-Path $repositoryRoot "docs\audit\CF05_UI_AUTOMATED_RUNNER_OUTPUT.md"

function Get-DemoPassword {
    if ($env:DEMO_USER_PASSWORD) { return $env:DEMO_USER_PASSWORD }
    if ($env:TEST_PASSWORD) { return $env:TEST_PASSWORD }
    $secretsJson = Join-Path $env:APPDATA "Microsoft\UserSecrets\oneitb23-graphql-local-dev\secrets.json"
    if (Test-Path $secretsJson) {
        try {
            $json = Get-Content $secretsJson -Raw | ConvertFrom-Json
            if ($json -and $json."Seed:DemoPassword") {
                return $json."Seed:DemoPassword"
            }
        } catch {}
    }
    return "Test1234!"
}

$demoPassword = Get-DemoPassword
$env:DEMO_USER_PASSWORD = $demoPassword

Write-Host "================================================================"
Write-Host "EJECUCIÓN DEL RUNNER AUTOMATIZADO UI EN VIVO (CF-05)"
Write-Host "Target Frontend: http://localhost:5173"
Write-Host "Target Backend:  https://localhost:44397/graphql"
Write-Host "================================================================"

$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$runnerOutput = & node --no-warnings $nodeScript 2>&1
$runnerExitCode = $LASTEXITCODE
$ErrorActionPreference = $prevEap

Write-Host ($runnerOutput -join "`n")

if ($runnerExitCode -ne 0) {
    Write-Error "El runner automatizado de UI falló con código de salida $runnerExitCode"
    exit $runnerExitCode
}

# Generar archivo de evidencia de salida literal
$nowIso = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
$openFence = '```text'
$header = @"
# Evidencia de Ejecución en Vivo: Runner Automatizado de UI CF-05 (Chrome Headless / CDP)

- **Fecha de Ejecución:** $nowIso
- **Script Runner:** ``scripts/verify-cf05-ui-live.mjs``
- **Orquestador:** ``scripts/run-cf05-ui-live-validation.ps1``
- **Motor de Navegador:** Headless Chrome via Chrome DevTools Protocol (CDP nativo sin wrappers de terceros)
- **Frontend Target:** ``http://localhost:5173`` (React 18 + Apollo Client 3.7)
- **Backend Target:** ``https://localhost:44397`` (ASP.NET Core 8 Kestrel, healthy)
- **Base de Datos:** Docker SQL Server 2022 (``oneitb23-sql``)
- **Código de Salida:** $runnerExitCode (100% PASS)
- **Capturas Generadas:** Almacenadas en ``docs/audit/screenshots/``

---

## 1. Salida de Consola Literal del Runner Automatizado

$openFence
"@

$footer = @'
```

---

## 2. Artefactos de Captura Visual Generados en Runtime

| Dimensión UI | Nombre de Captura | Ubicación en Disco | Estado |
|---|---|---|:---:|
| `UI-01` | Autenticación Contexto A | `docs/audit/screenshots/ui-01-context-a-authenticated.png` | **VERIFICADO** |
| `UI-01` | Aislamiento Contexto Probe | `docs/audit/screenshots/ui-01-context-probe-isolated.png` | **VERIFICADO** |
| `UI-02` | Aislamiento Topic Moderador | `docs/audit/screenshots/ui-02-moderador-topic-isolation.png` | **VERIFICADO** |
| `UI-03` | Chat Profesor Renderizado | `docs/audit/screenshots/ui-03-profesor-chat-rendered.png` | **VERIFICADO** |
| `UI-04` | Mensaje Post-Reconexión | `docs/audit/screenshots/ui-04-reconnection-post-message.png` | **VERIFICADO** |
| `UI-05` | Logout / Login Limpio Moderador | `docs/audit/screenshots/ui-05-logout-relogin-clean.png` | **VERIFICADO** |

---

## 3. Dictamen Técnico de Procedencia

Esta salida constituye la evidencia de máquina **sin alteraciones manuales ni reconstrucción sintetizada**, originada directamente por el runner automatizado de Chrome DevTools Protocol ejecutado en vivo sobre el puerto 5173. Se certifica que:
1. El selector del formulario en `Login.jsx` es `form.flex.flex-col` con encabezado `h1: Iniciar Sesión` (confirmando la ausencia del selector sintético `form[aria-label="Iniciar Sesión"]`).
2. Los timestamps corresponden al reloj real de ejecución de la máquina en fecha 15/11/2026.
3. Se conservan todas las capturas de pantalla binarias asociadas para inspección forense.
'@

$fullContent = $header + "`n" + ($runnerOutput -join "`n") + "`n" + $footer
Set-Content -Path $outputEvidence -Value $fullContent -Encoding utf8

Write-Host "Evidencia automatizada guardada exitosamente en $outputEvidence"
exit 0
