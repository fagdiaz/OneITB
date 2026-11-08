# Suite de Verificacion de Protocolo de Handoff (GOB-20261108-06 / GOB-20261108-07)
# Demuestra formalmente los requerimientos de recepcion y despacho del marco multi-agente:
# 1. Comprobacion previa de material de salida (Pre-dispatch secret scan).
# 2. Diferenciacion por hash SHA-256 de dos propuestas con contenido distinto sobre el mismo Git HEAD.
# 3. Proteccion contra condiciones de carrera: exclusion mutua atomica inter-proceso para el mismo ID.
# 4. Conservacion de multiples entregas concurrentes con IDs distintos.
# 5. Bloqueo estricto y conservacion del archivo si el ledger historico es ilegible o corrupto.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..')).Path
Set-Location $repoRoot

$classFile = Join-Path $repoRoot '.agents/skills/agent-orchestrator/scripts/PersistentHandoffLedger.ps1'
$workerScript = Join-Path $repoRoot 'tests/worker_receive_handoff.ps1'

if (-not (Test-Path -LiteralPath $classFile)) {
    throw "No se encontro la implementacion canonica de PersistentHandoffLedger en '$classFile'."
}
. $classFile

$testLedgerFile = Join-Path $repoRoot 'tests/temp_test_handoff_ledger.json'
$testLockFile   = Join-Path $repoRoot 'tests/temp_test_handoff_ledger.json.lock'
$out1File       = Join-Path $repoRoot 'tests/temp_worker_out1.json'
$out2File       = Join-Path $repoRoot 'tests/temp_worker_out2.json'

function Clean-TempTestFiles {
    Remove-Item -Force -ErrorAction SilentlyContinue $testLedgerFile, $testLockFile, $out1File, $out2File
}

function Start-WorkerProcess {
    param(
        [string]$LedgerPath,
        [string]$HandoffId,
        [string]$SourceChannel,
        [string]$PayloadHash,
        [string]$OutputFile
    )
    $args = "-ExecutionPolicy Bypass -NoProfile -File `"$workerScript`" -LedgerPath `"$LedgerPath`" -HandoffId `"$HandoffId`" -SourceChannel `"$SourceChannel`" -PayloadHash `"$PayloadHash`" -OutputFile `"$OutputFile`""
    $psi = [System.Diagnostics.ProcessStartInfo]::new('powershell.exe', $args)
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    return [System.Diagnostics.Process]::Start($psi)
}

# Helper: Escaneo de secretos en material de salida antes del despacho
function Test-OutboundPreDispatchScan {
    param([string]$Content)

    $secretPatterns = @(
        '(?i)ghp_[a-zA-Z0-9]{36}',
        '(?i)gho_[a-zA-Z0-9]{36}',
        '(?i)glpat-[a-zA-Z0-9\-]{20,}',
        '(?i)sk-[a-zA-Z0-9]{20,}',
        '(?i)sk-ant-api[a-zA-Z0-9\-]{20,}',
        '(?i)AKIA[0-9A-Z]{16}',
        '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----',
        '(?i)(password|secret|pwd)\s*=\s*[''"][^''"]{8,}[''"]',
        'eyJ[A-Za-z0-9-_]{10,}\.eyJ[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}'
    )

    $detected = @()
    foreach ($pattern in $secretPatterns) {
        if ($Content -match $pattern) {
            $detected += $pattern
        }
    }

    if ($detected.Count -gt 0) {
        return @{ Allowed = $false; Reason = "Secret pattern detected: $($detected -join ', ')" }
    }
    return @{ Allowed = $true; Reason = 'Content is sanitized and clean for outbound dispatch' }
}

# Helper: Diferenciador criptografico de propuestas concurrentes sobre el mismo HEAD
function Get-ProposalSignature {
    param(
        [string]$GitCommitSha,
        [string]$ProposalContent
    )
    $hasher = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($ProposalContent)
    $contentHash = -join ($hasher.ComputeHash($bytes) | ForEach-Object { '{0:x2}' -f $_ })
    return [ordered]@{
        GitCommitSha = $GitCommitSha
        ContentHash  = $contentHash
        CompositeKey = "${GitCommitSha}:${contentHash}"
    }
}

try {
    Clean-TempTestFiles

    Write-Host "--- Verificando Requerimiento 1: Escaneo de material saliente (Pre-dispatch) ---"

    # Caso 1.1: Material saliente con secreto sintetico sk-ant (debe ser bloqueado)
    $payloadConSecreto = @"
Hola Astra, aqui envio el diff:
Token: sk-ant-api03-FAKEsecretKeyForTestingLeakDetection998877
Fin del mensaje.
"@
    $scanResultFail = Test-OutboundPreDispatchScan -Content $payloadConSecreto
    if ($scanResultFail.Allowed -ne $false) {
        throw "Assertion failure: El escaneo saliente debio bloquear el payload con secreto sintetico."
    }
    Write-Host " [PASS] 1.1: Payload con secreto sintetico bloqueado exitosamente." -ForegroundColor Green

    # Caso 1.2: Material saliente limpio y sanitizado (debe ser aprobado)
    $payloadLimpio = @"
Hola Astra, aqui envio el informe de gobernanza GOB-20261108-06 con 8/8 casos en PASS.
Sin tokens, sin contrasenas.
"@
    $scanResultPass = Test-OutboundPreDispatchScan -Content $payloadLimpio
    if ($scanResultPass.Allowed -ne $true) {
        throw "Assertion failure: El escaneo saliente debio autorizar el payload limpio."
    }
    Write-Host " [PASS] 1.2: Payload limpio aprobado exitosamente." -ForegroundColor Green

    Write-Host "`n--- Verificando Requerimiento 2: Diferenciacion de propuestas sobre el mismo Git HEAD ---"
    $headSha = (git rev-parse HEAD).Trim()
    $propuestaA = "Propuesta de arquitectura A: Usar canal 1 para auditoria de identidad con Astra."
    $propuestaB = "Propuesta de arquitectura B: Usar canal 2 para estres de WebSockets con Sol."

    $sigA = Get-ProposalSignature -GitCommitSha $headSha -ProposalContent $propuestaA
    $sigB = Get-ProposalSignature -GitCommitSha $headSha -ProposalContent $propuestaB

    Write-Host " HEAD SHA compartido: $headSha"
    Write-Host " Propuesta A Hash:   $($sigA.ContentHash)"
    Write-Host " Propuesta B Hash:   $($sigB.ContentHash)"

    if ($sigA.ContentHash -eq $sigB.ContentHash) {
        throw "Assertion failure: Dos contenidos distintos sobre el mismo HEAD produjeron el mismo hash."
    }
    if ($sigA.CompositeKey -eq $sigB.CompositeKey) {
        throw "Assertion failure: Las claves compuestas colisionaron."
    }
    Write-Host " [PASS] 2.1: Dos propuestas distintas sobre el mismo Git HEAD son distinguidas inequivocamente por hash." -ForegroundColor Green

    Write-Host "`n--- Verificando Requerimiento 3: Condicion de carrera entre procesos para el MISMO Handoff ID ---"
    Clean-TempTestFiles
    $raceHandoffId = 'GOB-RACE-SAME-ID'

    # Iniciar dos procesos independientes de PowerShell en paralelo que compiten por el mismo ID
    $p1 = Start-WorkerProcess -LedgerPath $testLedgerFile -HandoffId $raceHandoffId -SourceChannel 'Canal 1' -PayloadHash $sigA.ContentHash -OutputFile $out1File
    $p2 = Start-WorkerProcess -LedgerPath $testLedgerFile -HandoffId $raceHandoffId -SourceChannel 'Canal 2' -PayloadHash $sigA.ContentHash -OutputFile $out2File

    $finished1 = $p1.WaitForExit(15000)
    $finished2 = $p2.WaitForExit(15000)

    if (-not $finished1 -or -not $finished2) {
        if (-not $finished1) { Stop-Process -Id $p1.Id -Force -ErrorAction SilentlyContinue }
        if (-not $finished2) { Stop-Process -Id $p2.Id -Force -ErrorAction SilentlyContinue }
        throw "Assertion failure: Al menos un subproceso concurrente no finalizo dentro del tiempo limite."
    }

    if ($p1.ExitCode -ne 0 -or $p2.ExitCode -ne 0) {
        throw "Assertion failure: Fallo en la ejecucion del proceso hijo (P1 Exit: $($p1.ExitCode), P2 Exit: $($p2.ExitCode))."
    }

    if (-not (Test-Path $out1File) -or -not (Test-Path $out2File)) {
        throw "Assertion failure: Alguno de los subprocesos no produjo su archivo de salida."
    }

    $res1 = (Get-Content -Raw $out1File) | ConvertFrom-Json
    $res2 = (Get-Content -Raw $out2File) | ConvertFrom-Json

    Write-Host " Proceso 1 Salida: Status = '$($res1.Status)', Applied = $($res1.ActionApplied)"
    Write-Host " Proceso 2 Salida: Status = '$($res2.Status)', Applied = $($res2.ActionApplied)"

    $appliedCountAcrossProcesses = @($res1, $res2 | Where-Object { $_.ActionApplied -eq $true }).Count
    $duplicateCountAcrossProcesses = @($res1, $res2 | Where-Object { $_.ActionApplied -eq $false -and $_.Status -eq 'REJECTED_DUPLICATE' }).Count

    if ($appliedCountAcrossProcesses -ne 1) {
        throw "Assertion failure: Se esperaba exactamente 1 sola aceptacion entre los procesos en competencia (obtenido: $appliedCountAcrossProcesses)."
    }
    if ($duplicateCountAcrossProcesses -ne 1) {
        throw "Assertion failure: Se esperaba exactamente 1 rechazo de duplicado entre los procesos (obtenido: $duplicateCountAcrossProcesses)."
    }

    $diskEntries = (Get-Content -Raw $testLedgerFile) | ConvertFrom-Json
    $diskApplied = @($diskEntries | Where-Object { $_.ActionApplied -eq $true }).Count
    if ($diskApplied -ne 1) {
        throw "Assertion failure: En el archivo del ledger solo debe constar 1 aplicacion real (obtenido: $diskApplied)."
    }
    Write-Host " [PASS] 3.1: Condicion de carrera resuelta: exactamente 1 aceptacion y 1 rechazo de duplicado entre procesos concurrentes." -ForegroundColor Green

    Write-Host "`n--- Verificando Requerimiento 4: Concurrencia entre procesos para IDs DISTINTOS ---"
    Clean-TempTestFiles
    $idA = 'GOB-CONCURRENT-DIFF-A'
    $idB = 'GOB-CONCURRENT-DIFF-B'

    $p3 = Start-WorkerProcess -LedgerPath $testLedgerFile -HandoffId $idA -SourceChannel 'Canal 1' -PayloadHash $sigA.ContentHash -OutputFile $out1File
    $p4 = Start-WorkerProcess -LedgerPath $testLedgerFile -HandoffId $idB -SourceChannel 'Canal 2' -PayloadHash $sigB.ContentHash -OutputFile $out2File

    $finished3 = $p3.WaitForExit(15000)
    $finished4 = $p4.WaitForExit(15000)

    if (-not $finished3 -or -not $finished4) {
        if (-not $finished3) { Stop-Process -Id $p3.Id -Force -ErrorAction SilentlyContinue }
        if (-not $finished4) { Stop-Process -Id $p4.Id -Force -ErrorAction SilentlyContinue }
        throw "Assertion failure: Subprocesos con IDs distintos no finalizaron a tiempo."
    }
    if ($p3.ExitCode -ne 0 -or $p4.ExitCode -ne 0) {
        throw "Assertion failure: Error en la ejecucion concurrente de IDs distintos (P3 Exit: $($p3.ExitCode), P4 Exit: $($p4.ExitCode))."
    }

    $res3 = (Get-Content -Raw $out1File) | ConvertFrom-Json
    $res4 = (Get-Content -Raw $out2File) | ConvertFrom-Json

    if ($res3.Status -ne 'ACCEPTED_AND_APPLIED' -or $res3.ActionApplied -ne $true) {
        throw "Assertion failure: ID A debio ser aceptado."
    }
    if ($res4.Status -ne 'ACCEPTED_AND_APPLIED' -or $res4.ActionApplied -ne $true) {
        throw "Assertion failure: ID B debio ser aceptado."
    }

    $diskDiffEntries = (Get-Content -Raw $testLedgerFile) | ConvertFrom-Json
    $hasIdA = @($diskDiffEntries | Where-Object { $_.HandoffId -eq $idA -and $_.ActionApplied -eq $true }).Count -eq 1
    $hasIdB = @($diskDiffEntries | Where-Object { $_.HandoffId -eq $idB -and $_.ActionApplied -eq $true }).Count -eq 1

    if (-not $hasIdA -or -not $hasIdB) {
        throw "Assertion failure: El ledger en disco debe conservar ambas entregas distintas ($idA y $idB)."
    }
    Write-Host " [PASS] 4.1: Entregas concurrentes con IDs distintos conservadas integralmente en el ledger persistente." -ForegroundColor Green

    Write-Host "`n--- Verificando Requerimiento 5: Bloqueo estricto ante ledger ILEGIBLE o CORRUPTO ---"
    Clean-TempTestFiles
    foreach ($invalid in @('{ invalid json', '', '   ')) {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($invalid)
        [System.IO.File]::WriteAllBytes($testLedgerFile, $bytes)
        $ledger = [PersistentHandoffLedger]::new($testLedgerFile)
        try {
            $ledger.ReceiveHandoff('GOB-TEST-CORRUPT', 'Canal 1', 'fakehash')
            throw 'Assertion failure: Se acepto un ledger ilegible.'
        } catch {
            if ($_.Exception.Message -notmatch 'Handoff blocked: Ledger file .* is corrupted or illegible') { throw }
        }
        $after = [System.IO.File]::ReadAllBytes($testLedgerFile)
        if ([Convert]::ToBase64String($after) -cne [Convert]::ToBase64String($bytes)) {
            throw 'Assertion failure: Se modificaron los bytes del ledger ilegible.'
        }
    }
    Write-Host " [PASS] 5.1: Recepcion bloqueada ante ledger corrupto y archivo original preservado para recuperacion forense." -ForegroundColor Green

    Write-Host "`nTodas las 5 garantias del protocolo de handoff (escaneo saliente, hashing univoco, exclusion mutua atomica, conservacion concurrente y resiliencia ante corrupcion) se verificaron exitosamente con CERO errores." -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "`nFallo critico en test_handoff_protocol: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Clean-TempTestFiles
}
