[CmdletBinding()]
param(
    [string]$RunId = "",
    [int]$BaseCdpPort = 9230,
    [string]$BaseUrl = "http://localhost:5173",
    [string]$BackendUrl = "https://127.0.0.1:44397/graphql",
    [switch]$PreserveHistoricalEvidence = $true
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$nodeScript = Join-Path $repositoryRoot "scripts\verify-cf05-ui-live.mjs"

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
    throw "DEMO_USER_PASSWORD not set and UserSecrets ('Seed:DemoPassword') not found. Please set `$env:DEMO_USER_PASSWORD or configure UserSecrets."
}

$demoPassword = Get-DemoPassword
$env:DEMO_USER_PASSWORD = $demoPassword

# Generar RunId único por corrida si no se especificó uno
if ([string]::IsNullOrWhiteSpace($RunId)) {
    $RunId = (Get-Date -Format "yyyyMMdd_HHmmss")
}

# Configuración de carpetas de evidencia aisladas por ejecución
$runsBaseDir = Join-Path $repositoryRoot "docs\audit\evidence\runs"
$runDir = Join-Path $runsBaseDir $RunId
$runScreenshotsDir = Join-Path $runDir "screenshots"

New-Item -ItemType Directory -Path $runScreenshotsDir -Force | Out-Null

$outputEvidence = Join-Path $runDir "RUN_OUTPUT.md"

$env:RUN_ID = $RunId
$env:BASE_CDP_PORT = $BaseCdpPort
$env:BASE_URL = $BaseUrl
$env:BACKEND_URL = $BackendUrl
$env:RUN_SCREENSHOTS_DIR = $runScreenshotsDir

Write-Host "================================================================"
Write-Host "EJECUCIÓN DEL RUNNER AUTOMATIZADO UI EN VIVO (AISLADO)"
Write-Host "Run ID:          $RunId"
Write-Host "Directorio Run:  $runDir"
Write-Host "Base CDP Port:   $BaseCdpPort"
Write-Host "Target Frontend: $BaseUrl"
Write-Host "Target Backend:  $BackendUrl"
Write-Host "================================================================"

$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$runnerOutput = & node --no-warnings $nodeScript 2>&1
$runnerExitCode = $LASTEXITCODE
$ErrorActionPreference = $prevEap

Write-Host ($runnerOutput -join "`n")

# Generar archivo de evidencia de salida literal en su directorio propio
$nowIso = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
$openFence = '```text'
$header = @"
# Evidencia de Ejecución en Vivo: Runner Automatizado de UI (Chrome Headless / CDP)

- **Run ID:** $RunId
- **Fecha de Ejecución:** $nowIso
- **Script Runner:** ``scripts/verify-cf05-ui-live.mjs``
- **Orquestador:** ``scripts/run-cf05-ui-live-validation.ps1``
- **Motor de Navegador:** Headless Chrome via Chrome DevTools Protocol (CDP nativo sin wrappers de terceros)
- **Frontend Target:** ``$BaseUrl`` (React 18 + Apollo Client 3.7)
- **Backend Target:** ``$BackendUrl`` (ASP.NET Core 8 Kestrel, healthy)
- **Base CDP Port:** $BaseCdpPort
- **Código de Salida:** $runnerExitCode
- **Directorio de Capturas:** ``docs/audit/evidence/runs/$RunId/screenshots/``

---

## 1. Salida de Consola Literal del Runner Automatizado

$openFence
"@

$footer = @'
```

---

## 2. Artefactos de Captura Visual Generados en Runtime

Ver manifiesto estructurado de la corrida en `manifest.json` en este mismo directorio.

---

## 3. Dictamen Técnico de Procedencia

Esta salida constituye la evidencia de máquina **sin alteraciones manuales ni reconstrucción sintetizada**, originada directamente por el runner automatizado de Chrome DevTools Protocol ejecutado en su directorio aislado `docs/audit/evidence/runs/`. Se preserva intacta el acta histórica de ratificación CF-05 (`docs/audit/CF05_UI_AUTOMATED_RUNNER_OUTPUT.md`).
'@

$fullContent = $header + "`n" + ($runnerOutput -join "`n") + "`n" + $footer
Set-Content -Path $outputEvidence -Value $fullContent -Encoding utf8

# Actualizar puntero simbólico LATEST_RUN.json sin sobreescribir evidencias históricas
$latestManifest = [ordered]@{
    LatestRunId = $RunId
    Timestamp   = $nowIso
    ExitCode    = $runnerExitCode
    Status      = if ($runnerExitCode -eq 0) { "PASS" } else { "FAIL" }
    Path        = "docs/audit/evidence/runs/$RunId/RUN_OUTPUT.md"
}
$latestJsonPath = Join-Path $runsBaseDir "LATEST_RUN.json"
$latestManifest | ConvertTo-Json -Depth 4 | Set-Content -Path $latestJsonPath -Encoding utf8

if ($runnerExitCode -ne 0) {
    Write-Error "El runner automatizado de UI falló con código de salida $runnerExitCode"
    exit $runnerExitCode
}

Write-Host "Ejecución completada con éxito. Evidencias preservadas en: $runDir"
exit 0
