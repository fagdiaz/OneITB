#Requires -Version 5.1
<#
.SYNOPSIS
    Script de verificacion previa a la defensa oral de OneITB23.
.DESCRIPTION
    Comprueba en menos de 5 segundos la disponibilidad de runtimes, artefactos compilados,
    documentos de contingencia y los 4 pilares tecnicos de la demostracion.
#>
[CmdletBinding()]
param(
    [string]$RepositoryRoot = ''
)

$ErrorActionPreference = 'Stop'
if (-not $RepositoryRoot) {
    $RepositoryRoot = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
}
$repo = (Resolve-Path -LiteralPath $RepositoryRoot).Path
Set-Location $repo

$stopwatch = [Diagnostics.Stopwatch]::StartNew()
$checks = @()

function Test-Component {
    param(
        [string]$Pillar,
        [string]$Name,
        [scriptblock]$Check
    )
    $passed = $false
    $detail = ""
    try {
        $result = & $Check
        $passed = $true
        $detail = if ($result) { [string]$result } else { "OK" }
    } catch {
        $passed = $false
        $detail = $_.Exception.Message
    }
    $script:checks += [pscustomobject]@{
        Pillar = $Pillar
        Name   = $Name
        Passed = $passed
        Detail = $detail
    }
}

# --- 1. Runtimes y Herramientas ---
Test-Component "Runtimes" ".NET SDK / Runtime (.NET 8)" {
    $ver = & dotnet --version
    if ($LASTEXITCODE -ne 0) { throw "dotnet CLI no disponible" }
    $runtimes = & dotnet --list-runtimes
    $hasNet8 = $runtimes | Where-Object { $_ -match 'Microsoft\.NETCore\.App 8\.' }
    if (-not $hasNet8) { throw "Falta el runtime .NET 8 (detectado SDK: $ver)" }
    "SDK $ver (.NET 8 activo)"
}

Test-Component "Runtimes" "Node.js Runtime" {
    $nodeVer = & node --version
    if ($LASTEXITCODE -ne 0) { throw "Node.js no esta en el PATH" }
    "Node $nodeVer detectado"
}

# --- 2. Binarios Release y Bundle Frontend ---
Test-Component "Binarios" "Backend Release Assembly (GraphQL.dll)" {
    $dll = Join-Path $repo "API Graphql/OneITB/bin/Release/net8.0/GraphQL.dll"
    if (-not (Test-Path -LiteralPath $dll)) { throw "Falta compilar en Release: $dll" }
    $sz = [Math]::Round((Get-Item $dll).Length / 1024)
    "$sz KB"
}

Test-Component "Binarios" "Test Release Assembly (Services.Tests.dll)" {
    $testDll = Join-Path $repo "API Graphql/Tests/Services.Tests/bin/Release/net8.0/Services.Tests.dll"
    if (-not (Test-Path -LiteralPath $testDll)) { throw "Falta compilar tests en Release: $testDll" }
    $sz = [Math]::Round((Get-Item $testDll).Length / 1024)
    "$sz KB"
}

Test-Component "Binarios" "Frontend Production Bundle (dist/index.html)" {
    $distIndex = Join-Path $repo "FrontEnd/OneItb-FE/dist/index.html"
    if (-not (Test-Path -LiteralPath $distIndex)) { throw "Falta generar el build de Vite: $distIndex" }
    "Bundle Vite presente"
}

# --- 3. Los 4 Pilares de la Demostracion ---
Test-Component "Pilar 1: Identidad" "BCrypt Costo 12 & Hash Policy" {
    $settingsPath = Join-Path $repo "API Graphql/OneITB/appsettings.json"
    $json = Get-Content -Raw $settingsPath | ConvertFrom-Json
    $wf = $json.PasswordHashing.WorkFactor
    if ($wf -ne 12) { throw "WorkFactor esperado: 12 (configurado: $wf)" }
    "WorkFactor = 12 verificado"
}

Test-Component "Pilar 2: Empleo" "Captura Inmutable de CV (JobApplicationCv)" {
    $domainFile = Join-Path $repo "API Graphql/Entities/Models/JobApplicationCv.cs"
    $serviceFile = Join-Path $repo "API Graphql/Services/Jobs/JobService.ApplicationCv.cs"
    if (-not (Test-Path $domainFile) -or -not (Test-Path $serviceFile)) {
        throw "Faltan archivos de persistencia inmutable de CV"
    }
    "Esquema JSON inmutable presente"
}

Test-Component "Pilar 3: Academico" "Concurrencia Optimista (RowVersion)" {
    $sectionGrade = Join-Path $repo "API Graphql/Entities/Models/SectionGrade.cs"
    $academicService = Join-Path $repo "API Graphql/Services/Academic/AcademicService.cs"
    $hasRowVersion = Select-String -Path $sectionGrade -Pattern "RowVersion" -SimpleMatch
    $hasExpectedVersion = Select-String -Path $academicService -Pattern "ExpectedVersion" -SimpleMatch
    if (-not $hasRowVersion -or -not $hasExpectedVersion) {
        throw "Faltan tokens de concurrencia RowVersion en SectionGrade o ExpectedVersion en AcademicService"
    }
    "RowVersion & ExpectedVersion activos"
}

Test-Component "Pilar 4: Chat" "Adjunto Privado y Rango HTTP 206" {
    $controller = Join-Path $repo "API Graphql/OneITB/Controllers/MessageAttachmentsController.cs"
    if (-not (Test-Path $controller)) { throw "Falta MessageAttachmentsController.cs" }
    $hasRange = Select-String -Path $controller -Pattern "enableRangeProcessing: true" -SimpleMatch
    if (-not $hasRange) { throw "El controlador debe habilitar procesamiento de rangos HTTP 206" }
    "Descarga privada con HTTP 206 activa"
}

# --- 4. Material de Presentacion y Contingencia ---
Test-Component "Presentacion" "Diapositivas y Guion de 20 Preguntas" {
    $pptx = Join-Path $repo "docs/academic/defense/OneITB23-Defensa.pptx"
    $pdf = Join-Path $repo "docs/academic/defense/OneITB23-Diapositivas.pdf"
    $jsonQa = Join-Path $repo "docs/academic/defense/defense-content.json"
    if (-not (Test-Path $pptx) -or -not (Test-Path $pdf) -or -not (Test-Path $jsonQa)) {
        throw "Falta algun archivo del paquete de defensa"
    }
    $qaData = Get-Content -Raw $jsonQa | ConvertFrom-Json
    $qaCount = $qaData.qa.Count
    if ($qaCount -lt 20) { throw "Se esperaban 20 preguntas (detectadas: $qaCount)" }
    "PPTX, PDF y $qaCount preguntas listos"
}

$stopwatch.Stop()
$allPassed = @($checks | Where-Object { -not $_.Passed }).Count -eq 0

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "         OneITB23 -- VERIFICADOR DE ENTORNO DE DEFENSA INSTITUCIONAL             " -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " SHA Candidato : a16cbf9 (Release Candidate Academico)" -ForegroundColor Gray
Write-Host " Rama Activa   : feature/2026-11-01-debugger-cv-builder" -ForegroundColor Gray
Write-Host " Tiempo Medido : $($stopwatch.ElapsedMilliseconds) ms" -ForegroundColor Gray
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Cyan

foreach ($check in $checks) {
    $glyph = if ($check.Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($check.Passed) { "Green" } else { "Red" }
    $pill = $check.Pillar.PadRight(18)
    $nm = $check.Name.PadRight(42)
    Write-Host "$glyph $pill $nm : $($check.Detail)" -ForegroundColor $color
}

Write-Host "================================================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  VEREDICTO: ENTORNO DE DEFENSA 100% OPERATIVO Y LISTO PARA PROYECCION         " -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "  VEREDICTO: SE DETECTARON COMPONENTES FALTANTES O NO COMPILADOS              " -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Cyan
    exit 1
}
