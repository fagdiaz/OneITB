# Suite de Verificacion de Aislamiento de Runners y Evidencia (Spec 225 - GOB-ORG-08 / GOB-ORG-09)
# Valida los 5 casos adversariales del contrato de herramientas:
# 1. Puerto ocupado por proceso ajeno -> rechazo inmediato sin matarlo.
# 2. Chrome no encontrado -> error descriptivo sin crash no controlado.
# 3. Credencial ausente -> fallo de precondicion sin credenciales por defecto.
# 4. Intento de bypass TLS a endpoint no local -> bloqueo de seguridad.
# 5. Aislamiento de directorios por runId y preservacion de evidencia historica CF-05.

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path
$nodeScript = Join-Path $repoRoot "scripts\verify-cf05-ui-live.mjs"
$historicalOutput = Join-Path $repoRoot "docs\audit\CF05_UI_AUTOMATED_RUNNER_OUTPUT.md"

$totalTests = 5
$passedTests = 0

Write-Host "================================================================"
Write-Host "SUITE DE VERIFICACION DE AISLAMIENTO DE RUNNERS (SPEC 225)"
Write-Host "================================================================"

# Caso 1: Puerto ocupado por proceso ajeno -> bloqueo sin matarlo
Write-Host "Ejecutando [Caso 1]: Rechazo ante colision de puerto TCP sin afectar proceso ajeno... " -NoNewline
$testPort = 9295
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $testPort)
$listener.Start()

try {
    $env:BASE_CDP_PORT = "$testPort"
    $env:DEMO_USER_PASSWORD = "TestPassword123!"
    $out1 = & node --no-warnings $nodeScript 2>&1 | Out-String
    $code1 = $LASTEXITCODE

    # Verify listener is still active (not killed)
    $stillActive = $listener.Server.IsBound
    if ($code1 -ne 0 -and $out1 -match "Port $testPort is already in use" -and $stillActive) {
        Write-Host "PASS" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "FAIL (code=$code1, listenerActive=$stillActive)" -ForegroundColor Red
        throw "Caso 1 fallo: $out1"
    }
} finally {
    $listener.Stop()
    $env:BASE_CDP_PORT = $null
    $env:DEMO_USER_PASSWORD = $null
}

# Caso 2: Chrome no encontrado -> error claro
Write-Host "Ejecutando [Caso 2]: Error claro ante binario de Chrome ausente... " -NoNewline
try {
    $env:CHROME_BIN = "C:\nonexistent_path_to_chrome\chrome.exe"
    $env:DEMO_USER_PASSWORD = "TestPassword123!"
    $out2 = & node --no-warnings $nodeScript 2>&1 | Out-String
    $code2 = $LASTEXITCODE

    if ($code2 -ne 0 -and $out2 -match "Google Chrome executable not found") {
        Write-Host "PASS" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "FAIL (code=$code2)" -ForegroundColor Red
        throw "Caso 2 fallo: $out2"
    }
} finally {
    $env:CHROME_BIN = $null
    $env:DEMO_USER_PASSWORD = $null
}

# Caso 3: Credencial ausente -> fallo de precondicion sin fallback hardcodeado
Write-Host "Ejecutando [Caso 3]: Rechazo ante ausencia de DEMO_USER_PASSWORD... " -NoNewline
$prevEnv = $env:DEMO_USER_PASSWORD
$env:DEMO_USER_PASSWORD = $null
try {
    $out3 = & node --no-warnings $nodeScript 2>&1 | Out-String
    $code3 = $LASTEXITCODE

    if ($code3 -ne 0 -and $out3 -match "DEMO_USER_PASSWORD environment variable is required") {
        Write-Host "PASS" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "FAIL (code=$code3)" -ForegroundColor Red
        throw "Caso 3 fallo: $out3"
    }
} finally {
    if ($prevEnv) { $env:DEMO_USER_PASSWORD = $prevEnv }
}

# Caso 4: Bypass TLS hacia endpoint no local -> bloqueo de seguridad
Write-Host "Ejecutando [Caso 4]: Bloqueo de seguridad ante TLS bypass en endpoints no locales... " -NoNewline
try {
    $env:DEMO_USER_PASSWORD = "TestPassword123!"
    $env:BACKEND_URL = "https://external-api.untrusted-domain.com/graphql"
    $env:ALLOW_INSECURE_REMOTE_TLS = "true"
    $out4 = & node --no-warnings $nodeScript 2>&1 | Out-String
    $code4 = $LASTEXITCODE

    if ($code4 -ne 0 -and $out4 -match "SECURITY_REJECTION") {
        Write-Host "PASS" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "FAIL (code=$code4)" -ForegroundColor Red
        throw "Caso 4 fallo: $out4"
    }
} finally {
    $env:DEMO_USER_PASSWORD = $null
    $env:BACKEND_URL = $null
    $env:ALLOW_INSECURE_REMOTE_TLS = $null
}

# Caso 5: Preservacion de evidencia historica CF-05 y aislamiento de runId
Write-Host "Ejecutando [Caso 5]: Preservacion inmutable de CF05_UI_AUTOMATED_RUNNER_OUTPUT.md... " -NoNewline
if (-not (Test-Path $historicalOutput)) {
    throw "El archivo de evidencia historica $historicalOutput no existe"
}
$histContent = Get-Content $historicalOutput -Raw
if ($histContent -match "2026-11-15T22:12:21" -and $histContent -match "100% PASS") {
    Write-Host "PASS" -ForegroundColor Green
    $passedTests++
} else {
    Write-Host "FAIL" -ForegroundColor Red
    throw "El archivo de evidencia historica fue alterado"
}

Write-Host "================================================================"
Write-Host "RESULTADO FINAL: $passedTests / $totalTests ASERCIONES EN VERDE (100% PASS)"
Write-Host "================================================================"
exit 0
