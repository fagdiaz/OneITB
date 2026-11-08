# Gestor atomico y persistente de recepcion de entregas multi-agente (Handoff Ledger)
# Protege la decision completa de consultar, reservar y persistir el ID frente a otros procesos
# Bloquea la recepcion si el registro historico esta corrupto y lo conserva intacto para recuperacion

class PersistentHandoffLedger {
    [string]$FilePath
    [string]$LockFilePath
    [int]$MaxLockRetries = 100
    [int]$RetryDelayMs = 50

    PersistentHandoffLedger([string]$Path) {
        if (-not $Path) {
            throw "El path del ledger no puede ser nulo o vacio."
        }
        $this.FilePath = [System.IO.Path]::GetFullPath($Path)
        $this.LockFilePath = $this.FilePath + ".lock"

        $dir = [System.IO.Path]::GetDirectoryName($this.FilePath)
        if ($dir -and -not (Test-Path -LiteralPath $dir)) {
            [System.IO.Directory]::CreateDirectory($dir) | Out-Null
        }
    }

    [System.Collections.Generic.List[psobject]] ReadLedgerEntries() {
        $list = [System.Collections.Generic.List[psobject]]::new()
        if (Test-Path -LiteralPath $this.FilePath) {
            $raw = [System.IO.File]::ReadAllText($this.FilePath, [System.Text.Encoding]::UTF8)
            if ([string]::IsNullOrWhiteSpace($raw)) {
                throw "Handoff blocked: Ledger file '$($this.FilePath)' is corrupted or illegible: empty JSON."
            }
            try {
                $items = $raw | ConvertFrom-Json -ErrorAction Stop
                if ($null -ne $items) {
                    if ($items -is [System.Collections.IEnumerable] -and -not ($items -is [string])) {
                        foreach ($it in $items) { $list.Add($it) }
                    } else {
                        $list.Add($items)
                    }
                }
            } catch {
                # Si el archivo esta corrupto o es ilegible, BLOQUEAR sin sobrescribir ni vaciar el archivo
                throw "Handoff blocked: Ledger file '$($this.FilePath)' is corrupted or illegible: $($_.Exception.Message)"
            }
        }
        return $list
    }

    [psobject] ReceiveHandoff([string]$HandoffId, [string]$SourceChannel, [string]$PayloadHash) {
        if ([string]::IsNullOrWhiteSpace($HandoffId)) {
            throw "HandoffId no puede ser nulo o vacio."
        }

        # Seccion Critica Atomica Multi-Proceso: Adquirir bloqueo exclusivo sobre $this.LockFilePath
        $lockStream = $null
        $acquired = $false
        for ($i = 0; $i -lt $this.MaxLockRetries; $i++) {
            try {
                $lockStream = [System.IO.FileStream]::new(
                    $this.LockFilePath,
                    [System.IO.FileMode]::OpenOrCreate,
                    [System.IO.FileAccess]::ReadWrite,
                    [System.IO.FileShare]::None
                )
                $acquired = $true
                break
            } catch [System.IO.IOException] {
                Start-Sleep -Milliseconds $this.RetryDelayMs
            }
        }

        if (-not $acquired -or $null -eq $lockStream) {
            throw "Handoff blocked: No se pudo adquirir el bloqueo atomico exclusivo sobre '$($this.LockFilePath)' tras $($this.MaxLockRetries * $this.RetryDelayMs)ms."
        }

        try {
            # 1. Leer el historial del ledger en disco de manera indivisible
            $entries = $this.ReadLedgerEntries()

            # 2. Consultar si el ID ya fue previamente aceptado y aplicado
            $alreadyApplied = @($entries | Where-Object { $_.HandoffId -eq $HandoffId -and $_.ActionApplied -eq $true })

            if ($alreadyApplied.Count -gt 0) {
                $duplicateEntry = [ordered]@{
                    HandoffId     = $HandoffId
                    SourceChannel = $SourceChannel
                    PayloadHash   = $PayloadHash
                    Status        = 'REJECTED_DUPLICATE'
                    ActionApplied = $false
                    Message       = "Handoff ID '$HandoffId' was already processed and applied in persistent ledger. Duplicate rejected across processes (idempotent no-op)."
                    Timestamp     = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
                }
                $entries.Add([pscustomobject]$duplicateEntry)
                $json = $entries | ConvertTo-Json -Depth 5
                [System.IO.File]::WriteAllText($this.FilePath, $json, [System.Text.Encoding]::UTF8)
                return [pscustomobject]$duplicateEntry
            }

            # 3. Reservar y Persistir la nueva entrega de forma atomica
            $newEntry = [ordered]@{
                HandoffId     = $HandoffId
                SourceChannel = $SourceChannel
                PayloadHash   = $PayloadHash
                Status        = 'ACCEPTED_AND_APPLIED'
                ActionApplied = $true
                Message       = "Handoff ID '$HandoffId' accepted and applied cleanly."
                Timestamp     = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
            }
            $entries.Add([pscustomobject]$newEntry)
            $json = $entries | ConvertTo-Json -Depth 5
            [System.IO.File]::WriteAllText($this.FilePath, $json, [System.Text.Encoding]::UTF8)
            return [pscustomobject]$newEntry
        }
        finally {
            if ($lockStream) {
                $lockStream.Dispose()
            }
        }
    }
}
