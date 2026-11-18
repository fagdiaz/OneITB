# Wrapper PowerShell para Suite de Verificacion de Aislamiento de Runners (Spec 225 / CONS-03)
# Ejecuta el motor unico y suite canonica: tests/test_runner_isolation.mjs
# Propaga la salida estandar, los errores y el codigo de salida exacto sin divergencias.

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path
$mjsSuite = Join-Path $repoRoot "tests\test_runner_isolation.mjs"

if (-not (Test-Path $mjsSuite)) {
    Write-Error "No se encontro la suite de pruebas canonica: $mjsSuite"
    exit 1
}

Write-Host "Invocando suite canonica de aislamiento de runners via Node.js..."
$nodeProcess = Start-Process -FilePath "node" -ArgumentList "`"$mjsSuite`"" -NoNewWindow -Wait -PassThru

exit $nodeProcess.ExitCode
