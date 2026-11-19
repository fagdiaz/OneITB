# Test Dinámico del Consumidor PowerShell (run-cf05-ui-live-validation.ps1) con Fixtures Aislados
# Verifica la matriz unificada de estados, paridad de mayúsculas y preservación de puntero sin tocar el repositorio.

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$canonicalWrapperScript = Join-Path $repoRoot "scripts\run-cf05-ui-live-validation.ps1"
$mockScriptSource = Join-Path $repoRoot "tests\fixtures\mock_runner.mjs"

Write-Host "================================================================"
Write-Host "VERIFICACIÓN DINÁMICA DE CONTRATO DEL WRAPPER POWERSHELL"
Write-Host "Aislamiento en Raíz Temporal + SHA-256 + Paridad de Mayúsculas"
Write-Host "================================================================"

# 1. Configurar raíz temporal aislada
$tempId = [Guid]::NewGuid().ToString("N").Substring(0, 8)
$isolatedRoot = Join-Path $repoRoot "scratch\temp_ps_fixtures_$tempId"
$isolatedScriptsDir = Join-Path $isolatedRoot "scripts"
$isolatedRunsDir = Join-Path $isolatedRoot "docs\audit\evidence\runs"
$isolatedWrapperScript = Join-Path $isolatedScriptsDir "run-cf05-ui-live-validation.ps1"
$isolatedNodeScript = Join-Path $isolatedScriptsDir "verify-cf05-ui-live.mjs"
$isolatedLatestJsonPath = Join-Path $isolatedRunsDir "LATEST_RUN.json"

New-Item -ItemType Directory -Path $isolatedScriptsDir -Force | Out-Null
New-Item -ItemType Directory -Path $isolatedRunsDir -Force | Out-Null

Copy-Item -Path $canonicalWrapperScript -Destination $isolatedWrapperScript -Force
Copy-Item -Path $mockScriptSource -Destination $isolatedNodeScript -Force

# Inicializar puntero baseline LATEST_RUN.json exclusivamente en la raíz temporal
$baselineRunId = "baseline_run_id"
$initialBaselineObj = [ordered]@{
    LatestRunId = $baselineRunId
    Timestamp   = "2026-11-18T12:00:00Z"
    ExitCode    = 0
    Status      = "PASS"
    Path        = "docs/audit/evidence/runs/$baselineRunId/RUN_OUTPUT.md"
}
$initialBaselineObj | ConvertTo-Json -Depth 4 | Set-Content -Path $isolatedLatestJsonPath -Encoding utf8

function Get-PointerSha256 {
    param([string]$Path)
    if (Test-Path $Path) {
        return (Get-FileHash -Path $Path -Algorithm SHA256).Hash.ToLowerInvariant()
    }
    return $null
}

# 2. Definición exhaustiva de los 8 escenarios
$scenarios = @(
    @{ Name = "live_success"; ExpectedExit = 0; ExpectsPointerUpdate = $true; ExpectedRejection = $null; Desc = "Live PASS válido (mode: live, status: PASS, exitCode: 0, uiExecuted: true, certified: false)" },
    @{ Name = "dry_run_success"; ExpectedExit = 0; ExpectsPointerUpdate = $false; ExpectedRejection = $null; Desc = "Dry-run válido (mode: dry-run, status: DRY_RUN_OK, exitCode: 0, uiExecuted: false, certified: false)" },
    @{ Name = "incoherent_dry_run_pass"; ExpectedExit = 1; ExpectsPointerUpdate = $false; ExpectedRejection = "estado en manifiesto"; Desc = "Combinación incoherente: dry-run con status PASS" },
    @{ Name = "certified_true"; ExpectedExit = 1; ExpectsPointerUpdate = $false; ExpectedRejection = "'certified' debe ser booleano estricto JSON y exclusivamente false"; Desc = "Combinación inválida: certified true" },
    @{ Name = "string_ui_executed"; ExpectedExit = 1; ExpectsPointerUpdate = $false; ExpectedRejection = "'uiExecuted' debe ser booleano estricto JSON"; Desc = "Tipo JSON incorrecto: uiExecuted como string 'false' (sin coerción)" },
    @{ Name = "status_unknown"; ExpectedExit = 1; ExpectsPointerUpdate = $false; ExpectedRejection = "status' debe ser string 'PASS', 'FAIL' o 'DRY_RUN_OK'"; Desc = "Status desconocido: status UNKNOWN" },
    @{ Name = "missing_mode"; ExpectedExit = 1; ExpectsPointerUpdate = $false; ExpectedRejection = "falta la propiedad requerida 'mode'"; Desc = "Propiedad requerida ausente: falta mode" },
    @{ Name = "lowercase_status_pass"; ExpectedExit = 1; ExpectsPointerUpdate = $false; ExpectedRejection = "status' debe ser string 'PASS', 'FAIL' o 'DRY_RUN_OK'"; Desc = "Variante de capitalización: status en minúsculas 'pass' (paridad de capitalización)" }
)

$results = [System.Collections.Generic.List[PSObject]]::new()
$allPassed = $true

try {
    foreach ($sc in $scenarios) {
        $scName = $sc.Name
        $expectedExit = $sc.ExpectedExit
        $expectsUpdate = $sc.ExpectsPointerUpdate
        $expectedRejection = $sc.ExpectedRejection
        $testRunId = "suite_wrap_$scName`_" + (Get-Date -Format "yyyyMMddHHmmssfff")

        # Registrar estado y hash del puntero antes de la ejecución
        $shaBefore = Get-PointerSha256 -Path $isolatedLatestJsonPath
        $pointerBefore = if (Test-Path $isolatedLatestJsonPath) {
            (Get-Content $isolatedLatestJsonPath -Raw -Encoding utf8 | ConvertFrom-Json).LatestRunId
        } else { "NONE" }

        # Configurar entorno para el mock runner
        $env:MOCK_SCENARIO = $scName
        $env:DEMO_USER_PASSWORD = "MockPassword123!"

        $prevEap = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $procOutput = & powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $isolatedWrapperScript -RunId $testRunId 2>&1
        $actualExit = $LASTEXITCODE
        $ErrorActionPreference = $prevEap

        $outputText = ($procOutput | Out-String)

        # Registrar estado y hash del puntero después de la ejecución
        $shaAfter = Get-PointerSha256 -Path $isolatedLatestJsonPath
        $pointerAfter = if (Test-Path $isolatedLatestJsonPath) {
            (Get-Content $isolatedLatestJsonPath -Raw -Encoding utf8 | ConvertFrom-Json).LatestRunId
        } else { "NONE" }

        # Verificación estricta de puntero y bytes SHA-256
        $pointerCorrect = if ($expectsUpdate) {
            ($pointerAfter -ceq $testRunId) -and ($shaBefore -cne $shaAfter)
        } else {
            ($pointerAfter -ceq $pointerBefore) -and ($shaBefore -ceq $shaAfter)
        }

        # Verificación de código de salida y motivo de rechazo esperado
        $exitCorrect = ($actualExit -eq $expectedExit)
        $normalizedOutput = $outputText -replace '\s+', ' '
        $rejectionCorrect = if ($null -ne $expectedRejection) {
            $normalizedOutput.Contains($expectedRejection)
        } else {
            $true
        }

        $scenarioSuccess = $exitCorrect -and $pointerCorrect -and $rejectionCorrect
        if (-not $scenarioSuccess) {
            $allPassed = $false
        }

        $statusStr = if ($scenarioSuccess) { "PASS" } else { "FAIL" }
        Write-Host "[$statusStr] Escenario: $scName | Exit: $actualExit (esperado: $expectedExit) | Puntero: $pointerBefore -> $pointerAfter | SHA match: $($shaBefore -ceq $shaAfter)"

        $results.Add([PSCustomObject]@{
            Scenario = $scName
            Description = $sc.Desc
            ExpectedExit = $expectedExit
            ActualExit = $actualExit
            Sha256Before = $shaBefore
            Sha256After = $shaAfter
            PointerBefore = $pointerBefore
            PointerAfter = $pointerAfter
            PointerBehaviorConforms = $pointerCorrect
            RejectionReasonConforms = $rejectionCorrect
            Status = $statusStr
        })
    }
} finally {
    # Restaurar variables de entorno
    Remove-Item Env:MOCK_SCENARIO -ErrorAction SilentlyContinue
    Remove-Item Env:DEMO_USER_PASSWORD -ErrorAction SilentlyContinue

    # Limpieza exhaustiva de la raíz temporal aislada
    if (Test-Path $isolatedRoot) {
        Remove-Item $isolatedRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "================================================================"
if ($allPassed) {
    Write-Host "TODOS LOS 8 ESCENARIOS DEL CONSUMIDOR POWERSHELL SUPERADOS EXITOSAMENTE (100% PASS)"
} else {
    Write-Error "Fallo en verificación de contrato del consumidor PowerShell"
    exit 1
}
Write-Host "================================================================"

# Guardar evidencia estructurada
$evidencePath = if ($env:CONTRACT_EVIDENCE_PATH) { $env:CONTRACT_EVIDENCE_PATH } else { Join-Path $repoRoot "scratch\EVIDENCIA_WRAPPER_FIXTURES_RUN.json" }
$evidenceDir = Split-Path $evidencePath -Parent
if (-not (Test-Path $evidenceDir)) { New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null }
$evidencePayload = [ordered]@{
    date = "2026-11-18"
    base = "6cd5295d7768c34c32d37d54e0aad3d01f4749f6"
    spec = "Spec 225 / Lote CONS-03 (Delta 4)"
    producer = "scripts/verify-cf05-ui-live.mjs (validateManifestContract)"
    consumer = "scripts/run-cf05-ui-live-validation.ps1"
    isolationRoot = $isolatedRoot
    powershellAvailable = $true
    scenarios = $results
    summary = [ordered]@{
        totalScenarios = $results.Count
        passedCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
    }
}
$evidencePayload | ConvertTo-Json -Depth 6 | Set-Content -Path $evidencePath -Encoding utf8
Write-Host "Evidencia registrada en: $evidencePath"
exit 0
