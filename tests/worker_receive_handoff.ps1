# Worker ejecutor independiente para pruebas concurrentes del receptor de Handoff
param(
    [Parameter(Mandatory=$true)][string]$LedgerPath,
    [Parameter(Mandatory=$true)][string]$HandoffId,
    [Parameter(Mandatory=$true)][string]$SourceChannel,
    [Parameter(Mandatory=$true)][string]$PayloadHash,
    [Parameter(Mandatory=$true)][string]$OutputFile
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$classFile = Join-Path $scriptDir '../.agents/skills/agent-orchestrator/scripts/PersistentHandoffLedger.ps1'

if (-not (Test-Path -LiteralPath $classFile)) {
    throw "No se encontro la clase PersistentHandoffLedger en '$classFile'."
}

. $classFile

$ledger = [PersistentHandoffLedger]::new($LedgerPath)
$result = $ledger.ReceiveHandoff($HandoffId, $SourceChannel, $PayloadHash)

$json = $result | ConvertTo-Json -Compress
$outDir = [System.IO.Path]::GetDirectoryName([System.IO.Path]::GetFullPath($OutputFile))
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
    [System.IO.Directory]::CreateDirectory($outDir) | Out-Null
}
[System.IO.File]::WriteAllText($OutputFile, $json, [System.Text.Encoding]::UTF8)
exit 0
