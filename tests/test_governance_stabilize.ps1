# Suite de Verificacion de Gobernanza y Certificacion (GOB-20261108-05 / GOB-20261108-06)
# Invoca preflight_stabilize.ps1 en 8 escenarios aislados y valida:
# 1. Codigo de salida exacto (0 para PASS, 1 para FAIL).
# 2. JSON estructurado y campo Certified ($true/$false).
# 3. Gate especifico responsable del veredicto.
# 4. Mensaje de causa raiz en Summary.
# 5. Invariante de simulaciones: las simulaciones solo pueden producir resultados de prueba, NUNCA Certified=true.
# Falla de inmediato (exit 1) si cualquier asercion no se cumple.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..')).Path
Set-Location $repoRoot

$preflightScript = Join-Path $repoRoot '.agents/skills/speckit-stabilize/scripts/preflight_stabilize.ps1'
$testReport = [ordered]@{}

function Assert-PreflightCase {
    param(
        [string]$CaseId,
        [string]$Description,
        [scriptblock]$Execution,
        [int]$ExpectedExitCode,
        [bool]$ExpectedCertified,
        [string]$ExpectedStatus,
        [string]$ExpectedFailingGate = '',
        [string]$ExpectedSummaryMatch = ''
    )

    Write-Host "Ejecutando [$CaseId]: $Description..." -NoNewline

    $rawOutput = & $Execution 2>&1 | Out-String
    $actualExitCode = $LASTEXITCODE

    # Extract JSON root object reliably by locating '{' immediately preceding '"Status"'
    $json = $null
    $statusIndex = $rawOutput.IndexOf('"Status"')
    if ($statusIndex -gt 0) {
        $firstBrace = $rawOutput.LastIndexOf('{', $statusIndex)
        $lastBrace = $rawOutput.LastIndexOf('}')
        if ($firstBrace -ge 0 -and $lastBrace -gt $firstBrace) {
            $jsonString = $rawOutput.Substring($firstBrace, $lastBrace - $firstBrace + 1)
            try { $json = $jsonString | ConvertFrom-Json } catch {}
        }
    }

    $actualCertified = if ($json) { [bool]$json.Certified } else { $false }
    $actualStatus = if ($json) { $json.Status } else { 'FAIL' }

    # Find failing gate and summary if expected
    $actualFailingGate = ''
    $actualSummary = ''
    if ($json -and $json.Gates) {
        $failedGateObj = @($json.Gates | Where-Object { $_.Status -eq 'FAIL' })
        if ($failedGateObj.Count -gt 0) {
            $actualFailingGate = $failedGateObj[0].Name
            $actualSummary = $failedGateObj[0].Summary
        }
    }

    # Execute strict assertions
    $assertionsPassed = $true
    $failures = @()

    if ($actualExitCode -ne $ExpectedExitCode) {
        $assertionsPassed = $false
        $failures += "ExitCode esperado: $ExpectedExitCode, Obtenido: $actualExitCode"
    }
    if ($actualCertified -ne $ExpectedCertified) {
        $assertionsPassed = $false
        $failures += "Certified esperado: $ExpectedCertified, Obtenido: $actualCertified"
    }
    if ($actualStatus -ne $ExpectedStatus) {
        $assertionsPassed = $false
        $failures += "Status esperado: $ExpectedStatus, Obtenido: $actualStatus"
    }
    if ($ExpectedFailingGate -and ($actualFailingGate -ne $ExpectedFailingGate)) {
        $assertionsPassed = $false
        $failures += "Gate fallido esperado: '$ExpectedFailingGate', Obtenido: '$actualFailingGate'"
    }
    if ($ExpectedSummaryMatch -and ($actualSummary -notmatch $ExpectedSummaryMatch)) {
        $assertionsPassed = $false
        $failures += "Summary no coincide con patron '$ExpectedSummaryMatch'. Summary obtenido: '$actualSummary'"
    }

    if ($assertionsPassed) {
        Write-Host " [PASS]" -ForegroundColor Green
        $testReport[$CaseId] = [ordered]@{
            Description   = $Description
            Result        = 'PASS'
            ExitCode      = $actualExitCode
            Certified     = $actualCertified
            Status        = $actualStatus
            FailingGate   = $actualFailingGate
            SummaryMatch  = $ExpectedSummaryMatch
        }
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
        foreach ($f in $failures) {
            Write-Host "   -> $f" -ForegroundColor Yellow
        }
        Write-Host "--- DEBUG RAW OUTPUT START ---"
        Write-Host $rawOutput
        Write-Host "--- DEBUG RAW OUTPUT END ---"
        $testReport[$CaseId] = [ordered]@{
            Description   = $Description
            Result        = 'FAIL'
            Failures      = $failures
            RawOutput     = $rawOutput
        }
        throw "Assertion failure in ${CaseId}: $($failures -join '; ')"
    }
}

try {
    # Caso 1: .specify/feature.json ilegible o corrupto
    $backupJson = Get-Content -Raw '.specify/feature.json'
    try {
        Set-Content -Path '.specify/feature.json' -Value '{ corrupted json content missing closing bracket'
        Assert-PreflightCase `
            -CaseId 'Caso1_FeatureJsonIlegible' `
            -Description '.specify/feature.json corrupto o ilegible' `
            -Execution { powershell -File $preflightScript -RunTests $false -Certify } `
            -ExpectedExitCode 1 `
            -ExpectedCertified $false `
            -ExpectedStatus 'FAIL' `
            -ExpectedFailingGate 'speckit-dod-compliance' `
            -ExpectedSummaryMatch 'Certification rejected: File ''.specify/feature.json'' is corrupted or illegible'
    }
    finally {
        [System.IO.File]::WriteAllText((Join-Path $repoRoot '.specify/feature.json'), $backupJson, [System.Text.Encoding]::UTF8)
    }

    # Caso 2: Rama no autorizada / divergente con mismo SHA
    Assert-PreflightCase `
        -CaseId 'Caso2_RamaNoAutorizada' `
        -Description 'Rama no autorizada (release/candidate-2026-unauthorized-target)' `
        -Execution { powershell -File $preflightScript -RunTests $false -Certify -AuthorizedBranch 'release/candidate-2026-unauthorized-target' } `
        -ExpectedExitCode 1 `
        -ExpectedCertified $false `
        -ExpectedStatus 'FAIL' `
        -ExpectedFailingGate 'speckit-dod-compliance' `
        -ExpectedSummaryMatch 'Branch mismatch during certification'

    # Caso 3: xUnit con 234 pasadas de 235 y 1 omitida (Simulada)
    Assert-PreflightCase `
        -CaseId 'Caso3_xUnitConOmitidas' `
        -Description 'xUnit con 234 pasadas y 1 omitida (Simulada)' `
        -Execution { powershell -File $preflightScript -Certify -MockBackendOutput 'Superado: 234, Con error: 0, Omitido: 1, Total: 235' -MockFrontendOutput 'Tests 258 passed (258)' } `
        -ExpectedExitCode 1 `
        -ExpectedCertified $false `
        -ExpectedStatus 'FAIL' `
        -ExpectedFailingGate 'backend-regression-suite' `
        -ExpectedSummaryMatch 'Backend suite certification rejected: 1 test\(s\) were skipped/omitted'

    # Caso 4: Vitest con 258 pasadas de 259 y 1 omitida (Simulada)
    Assert-PreflightCase `
        -CaseId 'Caso4_VitestConOmitidas' `
        -Description 'Vitest con 258 pasadas y 1 omitida (Simulada)' `
        -Execution { powershell -File $preflightScript -Certify -MockBackendOutput 'Superado: 234, Con error: 0, Omitido: 0, Total: 234' -MockFrontendOutput 'Tests 258 passed | 1 skipped (259)' } `
        -ExpectedExitCode 1 `
        -ExpectedCertified $false `
        -ExpectedStatus 'FAIL' `
        -ExpectedFailingGate 'frontend-regression-suite' `
        -ExpectedSummaryMatch 'Frontend suite certification rejected: 1 test\(s\) were skipped/omitted'

    # Caso 5a: Vitest con Tests 258 passed (0) (Simulada)
    Assert-PreflightCase `
        -CaseId 'Caso5a_VitestTotalCero' `
        -Description 'Vitest con Tests 258 passed (0) (Simulada)' `
        -Execution { powershell -File $preflightScript -Certify -MockBackendOutput 'Superado: 234, Con error: 0, Omitido: 0, Total: 234' -MockFrontendOutput 'Tests 258 passed (0)' } `
        -ExpectedExitCode 1 `
        -ExpectedCertified $false `
        -ExpectedStatus 'FAIL' `
        -ExpectedFailingGate 'frontend-regression-suite' `
        -ExpectedSummaryMatch 'Frontend suite certification rejected: Total test count must be explicitly positive'

    # Caso 5b: Vitest con solo Test Files 258 passed (Simulada)
    Assert-PreflightCase `
        -CaseId 'Caso5b_VitestSoloTestFiles' `
        -Description 'Vitest con solo Test Files 258 passed sin resumen de Tests (Simulada)' `
        -Execution { powershell -File $preflightScript -Certify -MockBackendOutput 'Superado: 234, Con error: 0, Omitido: 0, Total: 234' -MockFrontendOutput 'Test Files 258 passed' } `
        -ExpectedExitCode 1 `
        -ExpectedCertified $false `
        -ExpectedStatus 'FAIL' `
        -ExpectedFailingGate 'frontend-regression-suite' `
        -ExpectedSummaryMatch 'Frontend test runner did not output a valid ''Tests'' summary line'

    # Caso 6a: Invariante de Simulacion: Simulación con 234 BE + 258 FE con -Certify es RECHAZADA
    Assert-PreflightCase `
        -CaseId 'Caso6a_SimulacionRechazadaParaCertificacion' `
        -Description 'Simulacion rechazada para -Certify (requiere ejecucion en vivo)' `
        -Execution { powershell -File $preflightScript -Certify -MockBackendOutput 'Superado: 234, Con error: 0, Omitido: 0, Total: 234' -MockFrontendOutput 'Tests 258 passed (258)' } `
        -ExpectedExitCode 1 `
        -ExpectedCertified $false `
        -ExpectedStatus 'FAIL' `
        -ExpectedFailingGate 'speckit-dod-compliance' `
        -ExpectedSummaryMatch 'Certification rejected: Simulated test outputs cannot grant official candidate certification'

    # Caso 6b: Invariante de Simulacion: Simulación sin -Certify SOLO produce resultados de prueba
    Assert-PreflightCase `
        -CaseId 'Caso6b_SimulacionSoloProduceResultadosDePrueba' `
        -Description 'Simulacion sin -Certify solo produce resultados de prueba (Certified=false, Status=PASS)' `
        -Execution { powershell -File $preflightScript -MockBackendOutput 'Superado: 234, Con error: 0, Omitido: 0, Total: 234' -MockFrontendOutput 'Tests 258 passed (258)' } `
        -ExpectedExitCode 0 `
        -ExpectedCertified $false `
        -ExpectedStatus 'PASS' `
        -ExpectedFailingGate ''

    Write-Host "`nTodas las 8 aserciones de gobernanza se completaron exitosamente con CERO errores." -ForegroundColor Green
    $testReport | ConvertTo-Json -Depth 4
    exit 0
}
catch {
    Write-Host "`nFallo critico en la suite de verificacion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
