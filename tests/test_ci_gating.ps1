# Wrapper PowerShell para Suite de Verificacion de Gating de CI/CD (Spec 224 / CONS-02)
# Ejecuta el motor unico de politica y suite canonica: tests/test_ci_gating.mjs
# Propaga la salida estandar, los errores y el codigo de salida exacto.

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path
$mjsSuite = Join-Path $repoRoot "tests\test_ci_gating.mjs"

if (-not (Test-Path $mjsSuite)) {
    Write-Error "No se encontro la suite de pruebas canonica: $mjsSuite"
    exit 1
}

Write-Host "Invocando suite canonica de compuertas CI/CD via Node.js..."
$nodeProcess = Start-Process -FilePath "node" -ArgumentList "`"$mjsSuite`"" -NoNewWindow -Wait -PassThru

exit $nodeProcess.ExitCode
