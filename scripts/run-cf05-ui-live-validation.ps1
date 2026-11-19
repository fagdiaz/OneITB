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
$runsBaseDir = Join-Path $repositoryRoot "docs\audit\evidence\runs"

# 1. Validación estricta y previa de RunId (prevención de path traversal antes de cualquier operación)
if (-not [string]::IsNullOrWhiteSpace($RunId)) {
    if ($RunId -notmatch '^[a-zA-Z0-9_-]+$') {
        throw "Invalid RunId '$RunId'. Contains invalid characters, path separators or traversal sequences."
    }
    $env:RUN_ID = $RunId
}

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

if ($env:RUNNER_DRY_RUN -eq 'true' -and [string]::IsNullOrWhiteSpace($env:DEMO_USER_PASSWORD)) {
    $env:DEMO_USER_PASSWORD = "DryRunPassword123!"
} else {
    $demoPassword = Get-DemoPassword
    $env:DEMO_USER_PASSWORD = $demoPassword
}

# 2. Configuración de variables de entorno para el runner de Node
# NOTA DE DISEÑO (CONS-03 / RUN-01): El wrapper NO precrea carpetas.
# Node.js (validateAndReserveEvidenceDir) es el único propietario de la reserva atómica y creación de directorios.
$env:BASE_CDP_PORT = $BaseCdpPort
$env:BASE_URL = $BaseUrl
$env:BACKEND_URL = $BackendUrl

Write-Host "================================================================"
Write-Host "EJECUCIÓN DEL RUNNER AUTOMATIZADO UI EN VIVO (AISLADO)"
if (-not [string]::IsNullOrWhiteSpace($RunId)) {
    Write-Host "Run ID sugerido: $RunId"
} else {
    Write-Host "Run ID:          (será generado automáticamente por el runner)"
}
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

# 3. Si el runner falló (código != 0), salir inmediatamente SIN escribir ni mutar artefactos
if ($runnerExitCode -ne 0) {
    Write-Error "El runner automatizado de UI falló con código de salida $runnerExitCode"
    exit $runnerExitCode
}

# 4. Localizar el directorio reservado a través del manifiesto generado por Node
$matchedRunDir = $null
foreach ($line in $runnerOutput) {
    if ($line -match 'Run manifest written to (.+manifest\.json)') {
        $candidateManifest = $matches[1].Trim()
        if (Test-Path $candidateManifest) {
            $matchedRunDir = Split-Path -Parent $candidateManifest
            break
        }
    }
}

if (-not $matchedRunDir -and -not [string]::IsNullOrWhiteSpace($RunId)) {
    $candidate = Join-Path $runsBaseDir $RunId
    if (Test-Path (Join-Path $candidate "manifest.json")) {
        $matchedRunDir = $candidate
    }
}

# 4. Localizar y validar estrictamente el directorio de evidencia reservado y su manifiesto
if (-not $matchedRunDir -or -not (Test-Path $matchedRunDir)) {
    Write-Error "No se pudo determinar el directorio de evidencia reservado para la corrida."
    exit 1
}

$manifestPath = Join-Path $matchedRunDir "manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Error "Manifiesto requerido ausente en directorio reservado: $manifestPath"
    exit 1
}

try {
    $manifest = Get-Content $manifestPath -Raw -Encoding utf8 | ConvertFrom-Json
} catch {
    Write-Error "El archivo de manifiesto no es JSON válido: $_"
    exit 1
}

# 1. Comprobación de existencia de propiedades requeridas (bajo StrictMode Latest)
$requiredProperties = @('runId', 'status', 'exitCode', 'mode', 'uiExecuted', 'certified')
foreach ($prop in $requiredProperties) {
    if ($null -eq $manifest.PSObject.Properties[$prop]) {
        Write-Error "Contrato de manifiesto inválido: falta la propiedad requerida '$prop' en $manifestPath"
        exit 1
    }
}

# 2. Comprobación estricta de tipos JSON originales (sin coerción previa que altere la semántica)
if (-not ($manifest.runId -is [string]) -or [string]::IsNullOrWhiteSpace($manifest.runId) -or ($manifest.runId -notmatch '^[a-zA-Z0-9_-]+$')) {
    Write-Error "Contrato de manifiesto inválido: 'runId' debe ser string no vacío con caracteres válidos."
    exit 1
}

if (-not ($manifest.mode -is [string]) -or ($manifest.mode -cne 'live' -and $manifest.mode -cne 'dry-run')) {
    Write-Error "Contrato de manifiesto inválido: 'mode' debe ser string 'live' o 'dry-run' (got: $($manifest.mode))."
    exit 1
}

if (-not ($manifest.status -is [string]) -or ($manifest.status -cne 'PASS' -and $manifest.status -cne 'FAIL' -and $manifest.status -cne 'DRY_RUN_OK')) {
    Write-Error "Contrato de manifiesto inválido: 'status' debe ser string 'PASS', 'FAIL' o 'DRY_RUN_OK' (got: $($manifest.status))."
    exit 1
}

if (-not ($manifest.exitCode -is [int] -or $manifest.exitCode -is [long])) {
    Write-Error "Contrato de manifiesto inválido: 'exitCode' debe ser entero numérico."
    exit 1
}

# Comprobación de tipo booleano nativo: si en JSON era "false" (string), -is [bool] evalúa a $false
if (-not ($manifest.uiExecuted -is [bool])) {
    Write-Error "Contrato de manifiesto inválido: 'uiExecuted' debe ser booleano estricto JSON (true/false), no string u otro tipo."
    exit 1
}

if (-not ($manifest.certified -is [bool]) -or ($manifest.certified -ne $false)) {
    Write-Error "Contrato de manifiesto inválido: 'certified' debe ser booleano estricto JSON y exclusivamente false."
    exit 1
}

# 3. Matriz unificada de combinaciones válidas (Tabla única productor-consumidor)
$isLiveSuccess = ($manifest.mode -ceq 'live') -and ($manifest.status -ceq 'PASS') -and ($manifest.exitCode -eq 0) -and ($manifest.uiExecuted -eq $true) -and ($manifest.certified -eq $false)

$isDryRunSuccess = ($manifest.mode -ceq 'dry-run') -and ($manifest.status -ceq 'DRY_RUN_OK') -and ($manifest.exitCode -eq 0) -and ($manifest.uiExecuted -eq $false) -and ($manifest.certified -eq $false)

$isDocumentedFailure = ($manifest.status -ceq 'FAIL') -and ($manifest.exitCode -ne 0) -and ($manifest.uiExecuted -eq $false) -and ($manifest.certified -eq $false)

if (-not ($isLiveSuccess -or $isDryRunSuccess -or $isDocumentedFailure)) {
    Write-Error "Combinación incoherente de estado en manifiesto: mode=$($manifest.mode), status=$($manifest.status), exitCode=$($manifest.exitCode), uiExecuted=$($manifest.uiExecuted), certified=$($manifest.certified)"
    exit 1
}

$effectiveId = [string]$manifest.runId

if ($isLiveSuccess) {
    $outputEvidence = Join-Path $matchedRunDir "RUN_OUTPUT.md"
    $nowIso = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
    $openFence = '```text'
    $header = @"
# Evidencia de Ejecución en Vivo: Runner Automatizado de UI (Chrome Headless / CDP)

- **Run ID:** $effectiveId
- **Fecha de Ejecución:** $nowIso
- **Script Runner:** ``scripts/verify-cf05-ui-live.mjs``
- **Orquestador:** ``scripts/run-cf05-ui-live-validation.ps1``
- **Motor de Navegador:** Headless Chrome via Chrome DevTools Protocol (CDP nativo sin wrappers de terceros)
- **Frontend Target:** ``$BaseUrl`` (React 18 + Apollo Client 3.7)
- **Backend Target:** ``$BackendUrl`` (ASP.NET Core 8 Kestrel, healthy)
- **Base CDP Port:** $BaseCdpPort
- **Código de Salida:** $runnerExitCode
- **Directorio de Capturas:** ``docs/audit/evidence/runs/$effectiveId/screenshots/``

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

Esta salida constituye la evidencia de máquina **sin alteraciones manuales ni reconstrucción sintetizada**, originada directamente por el runner automatizado de Chrome DevTools Protocol ejecutado en su directorio aislado `docs/audit/evidence/runs/`. Se preserva intacta el acta histórica de ratificación CF-05 (`docs/audit/evidencias/CF05_UI_AUTOMATED_RUNNER_OUTPUT.md`).
'@
    $fullContent = $header + "`n" + ($runnerOutput -join "`n") + "`n" + $footer
    Set-Content -Path $outputEvidence -Value $fullContent -Encoding utf8

    if (-not (Test-Path $outputEvidence) -or (Get-Item $outputEvidence).Length -eq 0) {
        Write-Error "Fallo fatal al escribir evidencia requerida: $outputEvidence"
        exit 1
    }

    # Actualizar puntero simbólico LATEST_RUN.json ÚNICAMENTE para corridas de UI reales y certificadas
    $latestManifest = [ordered]@{
        LatestRunId = $effectiveId
        Timestamp   = $nowIso
        ExitCode    = $runnerExitCode
        Status      = "PASS"
        Path        = "docs/audit/evidence/runs/$effectiveId/RUN_OUTPUT.md"
    }
    $latestJsonPath = Join-Path $runsBaseDir "LATEST_RUN.json"
    $latestManifest | ConvertTo-Json -Depth 4 | Set-Content -Path $latestJsonPath -Encoding utf8
    Write-Host "Ejecución completada con éxito. Evidencias preservadas en: $matchedRunDir"
    exit 0
} elseif ($isDryRunSuccess) {
    $dryRunOutput = Join-Path $matchedRunDir "RUN_OUTPUT.md"
    if (-not (Test-Path $dryRunOutput)) {
        Write-Error "RUN_OUTPUT.md requerido ausente en corrida dry-run: $dryRunOutput"
        exit 1
    }
    Write-Host "Ejecución en modo dry-run completada con éxito. Evidencia registrada en: $matchedRunDir (sin actualizar LATEST_RUN.json de UI)"
    exit 0
} else {
    Write-Error "Corrida no completada con éxito: status=$($manifest.status), exitCode=$($manifest.exitCode)"
    exit 1
}
