[CmdletBinding()]
param(
    [int]$Port = 5098
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$apiDirectory = Join-Path $repositoryRoot "API Graphql\OneITB"
$apiExecutable = Join-Path $apiDirectory "bin\Release\net8.0\GraphQL.exe"
$nodeScript = Join-Path $repositoryRoot "scripts\verify-cf05-realtime-live.mjs"
$outputEvidence = Join-Path $repositoryRoot "docs\audit\CF05_LIVE_RUNNER_OUTPUT.md"

if (-not (Test-Path -LiteralPath $apiExecutable)) {
    throw "GraphQL.exe not found at $apiExecutable"
}

$previousEnvironment = $env:ASPNETCORE_ENVIRONMENT
$previousUrls = $env:ASPNETCORE_URLS
$process = $null

try {
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://127.0.0.1:$Port"

    $outLog = Join-Path $env:TEMP "oneitb-cf05-live-$([Guid]::NewGuid().ToString('N')).out.log"
    $errLog = Join-Path $env:TEMP "oneitb-cf05-live-$([Guid]::NewGuid().ToString('N')).err.log"

    Write-Host "[CF-05 RUNNER] Launching finite backend process on http://127.0.0.1:$Port..." -ForegroundColor Cyan
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
    Write-Host "[CF-05 RUNNER] Backend is healthy on port $Port. Running Node.js unmocked runner..." -ForegroundColor Green

    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $runnerOutput = & node $nodeScript "http://127.0.0.1:$Port" "ws://127.0.0.1:$Port/graphql" 2>&1
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP

    Write-Host ($runnerOutput -join "`n")

    if ($exitCode -ne 0) {
        throw "CF-05 Live Runner failed with exit code $exitCode."
    }

    # Save output to evidence artifact
    $outputText = $runnerOutput -join "`n"
    $dateStr = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
    $evidenceContent = "# Evidencia de Ejecución en Vivo: Validación Realtime CF-05 (graphql-ws sin mock)`n`n" +
        "- **Fecha de Ejecución:** $dateStr`n" +
        "- **Script Runner:** ``scripts/run-cf05-live-validation.ps1```n" +
        "- **Script Node:** ``scripts/verify-cf05-realtime-live.mjs```n" +
        "- **Cliente WebSocket:** ``graphql-ws`` v5.16.0 (sin mock, temporización natural de retryWait)`n" +
        "- **Runtime Backend:** ASP.NET Core 8 Kestrel en ``http://127.0.0.1:$Port`` (``ws://127.0.0.1:$Port/graphql``)`n" +
        "- **Base de Datos:** Docker SQL Server 2022 (``oneitb23-sql``)`n" +
        "- **Código de Salida:** $exitCode (PASS)`n`n" +
        "---`n`n" +
        "## Salida de Consola Literal del Runner`n`n" +
        "``````text`n" +
        $outputText + "`n" +
        "``````"
    Set-Content -Path $outputEvidence -Value $evidenceContent -Encoding utf8
    Write-Host "[CF-05 RUNNER] Evidence recorded in $outputEvidence" -ForegroundColor Green
}
finally {
    if ($process -and -not $process.HasExited) {
        Write-Host "[CF-05 RUNNER] Stopping finite backend process (PID $($process.Id))..." -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force
        $process.WaitForExit(5000) | Out-Null
    }
    $env:ASPNETCORE_ENVIRONMENT = $previousEnvironment
    $env:ASPNETCORE_URLS = $previousUrls
}

Write-Host "[CF-05 RUNNER] CF-05 Live Validation Finished Successfully: PASS" -ForegroundColor Green
exit 0
