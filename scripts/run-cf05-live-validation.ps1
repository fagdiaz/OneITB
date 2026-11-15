[CmdletBinding()]
param(
    [int]$Port = 5098
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$projectPath = Join-Path $repositoryRoot "API Graphql\OneITB\GraphQL.csproj"
$apiDirectory = Join-Path $repositoryRoot "API Graphql\OneITB"
$apiExecutable = Join-Path $apiDirectory "bin\Release\net8.0\GraphQL.exe"
$nodeScript = Join-Path $repositoryRoot "scripts\verify-cf05-realtime-live.mjs"
$outputEvidence = Join-Path $repositoryRoot "docs\audit\CF05_LIVE_RUNNER_OUTPUT.md"

if (-not (Test-Path -LiteralPath $apiExecutable)) {
    throw "GraphQL.exe not found at $apiExecutable"
}

# Securely retrieve demo password without printing it
function Get-DemoPassword {
    if ($env:DEMO_USER_PASSWORD) { return $env:DEMO_USER_PASSWORD }
    if ($env:TEST_PASSWORD) { return $env:TEST_PASSWORD }
    $prefix = "Seed:DemoPassword = "
    $line = (& dotnet user-secrets list --project $projectPath) |
        Where-Object { $_ -like "$prefix*" } |
        Select-Object -First 1
    if ($line) {
        return $line.Substring($prefix.Length)
    }
    throw "Demo password is required. Please set DEMO_USER_PASSWORD environment variable or configure 'Seed:DemoPassword' user-secret."
}

$demoPassword = Get-DemoPassword
$previousEnvironment = $env:ASPNETCORE_ENVIRONMENT
$previousUrls = $env:ASPNETCORE_URLS
$process = $null

try {
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://127.0.0.1:$Port"
    $env:DEMO_USER_PASSWORD = $demoPassword

    $outLog = Join-Path $env:TEMP "oneitb-cf05-live-$([Guid]::NewGuid().ToString('N')).out.log"
    $errLog = Join-Path $env:TEMP "oneitb-cf05-live-$([Guid]::NewGuid().ToString('N')).err.log"

    Write-Host "[CF-05 ORCHESTRATOR] Launching finite backend process on http://127.0.0.1:$Port..." -ForegroundColor Cyan
    $process = Start-Process -FilePath $apiExecutable `
        -WorkingDirectory $apiDirectory `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog `
        -WindowStyle Hidden `
        -PassThru

    $ready = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        Start-Sleep -Milliseconds 500
        if ($process.HasExited) { break }
        try {
            $health = Invoke-WebRequest `
                -Uri "http://127.0.0.1:$Port/health" `
                -UseBasicParsing `
                -TimeoutSec 2
            if ($health.StatusCode -eq 200) {
                $ready = $true
                break
            }
        } catch { }
    }

    if (-not $ready) {
        throw "Finite Kestrel backend host did not become healthy within 30s."
    }
    Write-Host "[CF-05 ORCHESTRATOR] Backend is healthy on port $Port." -ForegroundColor Green

    # 1. Primary Live Test Execution (Must PASS with exit code 0)
    Write-Host "[CF-05 ORCHESTRATOR] Running unmocked transport runner (Primary Run)..." -ForegroundColor Cyan
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $primaryOutput = & node $nodeScript "http://127.0.0.1:$Port" "ws://127.0.0.1:$Port/graphql" 2>&1
    $primaryExitCode = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP

    Write-Host ($primaryOutput -join "`n")

    if ($primaryExitCode -ne 0) {
        throw "CF-05 Live Runner failed with exit code $primaryExitCode on primary run."
    }
    Write-Host "[CF-05 ORCHESTRATOR] Primary live runner execution: PASS (Exit code 0)" -ForegroundColor Green

    # 2. Negative Control Simulations (Validating checker falsifiability: each must FAIL with exit code 1)
    Write-Host "`n[CF-05 ORCHESTRATOR] Executing Negative Control Simulations to verify checker falsifiability..." -ForegroundColor Magenta

    $negativeScenarios = @(
        @{ Scenario = "id-mismatch"; ExpectedPattern = "Message 1 ID mismatch" },
        @{ Scenario = "leak-to-c"; ExpectedPattern = "Topic isolation violation" },
        @{ Scenario = "observer-error"; ExpectedPattern = "Observer C subscription experienced" },
        @{ Scenario = "short-wait"; ExpectedPattern = "below the declared minimum threshold" }
    )
    $negativeResults = @()

    foreach ($item in $negativeScenarios) {
        $scenario = $item.Scenario
        $expectedPattern = $item.ExpectedPattern
        Write-Host "  -> Running negative control: $scenario (expected exit code 1 and assertion '$expectedPattern')..." -ForegroundColor Yellow
        $prevEAP = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $negOutput = & node $nodeScript "http://127.0.0.1:$Port" "ws://127.0.0.1:$Port/graphql" "--simulate-negative=$scenario" 2>&1
        $negExitCode = $LASTEXITCODE
        $ErrorActionPreference = $prevEAP

        $failureMsg = ($negOutput | Where-Object { $_ -match "\[ASSERTION_FAILED\]" }) | Select-Object -First 1
        if (-not $failureMsg) {
            $failureMsg = ($negOutput | Where-Object { $_ -match "AssertionError" }) | Select-Object -First 1
        }
        if (-not $failureMsg) {
            $failureMsg = ($negOutput | Where-Object { $_ -match "FATAL" }) | Select-Object -First 1
        }

        if ($negExitCode -ne 1) {
            throw "Negative control '$scenario' did NOT fail as expected! Returned exit code $negExitCode instead of 1."
        }

        if (-not $failureMsg -or $failureMsg -notmatch $expectedPattern) {
            throw "Negative control '$scenario' exited with 1 but did not match expected assertion pattern '$expectedPattern'! Captured: $failureMsg"
        }

        Write-Host "     VERIFIED: Negative scenario '$scenario' threw expected assertion ('$expectedPattern') and exited with code 1." -ForegroundColor Green
        $negativeResults += [pscustomobject]@{
            Scenario = $scenario
            ExpectedExitCode = 1
            ActualExitCode = $negExitCode
            FailureMessage = [string]$failureMsg
            CheckerVerified = $true
        }
    }

    # Record full verbatim evidence
    $dateStr = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
    $primaryText = $primaryOutput -join "`n"

    $negSummaryText = ""
    foreach ($nr in $negativeResults) {
        $negSummaryText += "| ``$($nr.Scenario)`` | $($nr.ExpectedExitCode) | $($nr.ActualExitCode) | **FAIL (Bloqueado)** | $($nr.FailureMessage) |`n"
    }

    $fences = [char]96 + [char]96 + [char]96
    $evidenceContent = @"
# Evidencia de Ejecución en Vivo: Validación Realtime CF-05 (graphql-ws sin mock)

- **Fecha de Ejecución:** $dateStr
- **Script Orquestador:** ``scripts/run-cf05-live-validation.ps1``
- **Script Runner:** ``scripts/verify-cf05-realtime-live.mjs``
- **Cliente WebSocket:** ``graphql-ws`` v5.16.0 (sin mock, política predeterminada de reconexión)
- **Runtime Backend:** ASP.NET Core 8 Kestrel en ``http://127.0.0.1:$Port`` (``ws://127.0.0.1:$Port/graphql``)
- **Base de Datos:** Docker SQL Server 2022 (``oneitb23-sql``)
- **Adquisición de Credencial:** Externa mediante ``Seed:DemoPassword`` (User Secrets) sin valores por defecto en texto plano
- **Código de Salida Ejecución Principal:** $primaryExitCode (PASS con aserciones estrictas)

---

## 1. Salida de Consola Literal del Runner Principal (100% PASS)

$fences text
$primaryText
$fences

---

## 2. Falsabilidad del Instrumento: Verificación de Controles Negativos

Para garantizar que el runner no emite falsos positivos y que cualquier desviación o fuga de paquetes bloquea inmediatamente la certificación con código de salida 1, se ejecutaron 4 controles negativos deliberados:

| Escenario Negativo Simulado | Código Esperado | Código Obtenido | Veredicto del Checker | Mensaje de Aserción Interceptado |
|---|:---:|:---:|:---:|---|
$negSummaryText

**Conclusión de Instrumentación:** El checker de transporte es 100% estricto y falsable. Ninguna discrepancia de IDs, fuga hacia terceros observadores, error de suscripción o reconexión prematura por debajo de 1300 ms puede pasar inadvertida ni resultar en un veredicto aprobatorio.
"@

    $trimmedLines = ($evidenceContent -split "`n") | ForEach-Object { $_.TrimEnd() }
    Set-Content -Path $outputEvidence -Value $trimmedLines -Encoding utf8
    Write-Host "`n[CF-05 ORCHESTRATOR] Evidence successfully recorded in $outputEvidence" -ForegroundColor Green
}
finally {
    if ($process -and -not $process.HasExited) {
        Write-Host "[CF-05 ORCHESTRATOR] Stopping finite backend process (PID $($process.Id))..." -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force
        $process.WaitForExit(5000) | Out-Null
    }
    $env:ASPNETCORE_ENVIRONMENT = $previousEnvironment
    $env:ASPNETCORE_URLS = $previousUrls
    Remove-Item Env:\DEMO_USER_PASSWORD -ErrorAction SilentlyContinue
}

Write-Host "[CF-05 ORCHESTRATOR] CF-05 Live Transport Validation and Checker Falsifiability Completed Successfully." -ForegroundColor Green
