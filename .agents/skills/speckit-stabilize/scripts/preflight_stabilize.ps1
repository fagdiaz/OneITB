[CmdletBinding()]
param(
    [string]$FeatureDir = '',
    [object]$RunTests = $true
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
Set-Location $repoRoot

$shouldRunTests = ($RunTests -eq $true -or "$RunTests" -eq 'true' -or "$RunTests" -eq '1' -or "$RunTests" -eq '$true')

# 1. Resolve Active Feature
if (-not $FeatureDir) {
    if (Test-Path -LiteralPath '.specify/feature.json') {
        try {
            $featureState = Get-Content -Raw '.specify/feature.json' | ConvertFrom-Json
            $FeatureDir = $featureState.feature_directory
        }
        catch {
            $FeatureDir = 'specs/218-candidate-freeze-predefense-gate'
        }
    }
    else {
        $FeatureDir = 'specs/218-candidate-freeze-predefense-gate'
    }
}

$resolvedFeature = if (Test-Path -LiteralPath $FeatureDir) { (Resolve-Path $FeatureDir).Path } else { $null }

# 2. Gate Runner Helper
function Invoke-StabilizationGate {
    param(
        [string]$Name,
        [scriptblock]$Command,
        [string]$Severity = 'P0'
    )
    $output = ''
    $isFail = $false
    try {
        $res = & $Command 2>&1
        $output = ($res | Out-String).Trim()
        if ($LASTEXITCODE -ne 0) {
            $isFail = $true
        }
    }
    catch {
        $output = $_.Exception.Message
        $isFail = $true
    }

    $gateStatus = if ($isFail) { 'FAIL' } else { 'PASS' }
    [ordered]@{
        Name     = $Name
        Status   = $gateStatus
        Severity = $Severity
        Summary  = (($output -split "`r?`n") | Where-Object { $_.Trim() } | Select-Object -Last 4) -join "`n"
    }
}

$gates = @()

# Gate 1: Git Diff & Cleanliness Check
$gates += Invoke-StabilizationGate 'git-diff-check' {
    git -c core.autocrlf=false diff --check
} -Severity 'P1'

# Gate 2: Local Runtime Secrets & Untracked Config Gate
$gates += Invoke-StabilizationGate 'secret-leak-and-untracked-configs' {
    $trackedFiles = git ls-files
    $leaks = @()
    if ($trackedFiles -contains '.env') { $leaks += '.env is tracked in git!' }
    if ($trackedFiles -contains 'FrontEnd/OneItb-FE/.env') { $leaks += 'FrontEnd/OneItb-FE/.env is tracked in git!' }
    if ($trackedFiles -contains 'Credenciales Oneitb.txt') { $leaks += 'Credenciales Oneitb.txt is tracked in git!' }
    
    # Check git diff for hardcoded JWT secrets or raw passwords
    $diffText = git diff HEAD
    if ($diffText -match '(?i)(password|secret|jwt_key)["\s:=]+["''][a-zA-Z0-9_-]{20,}["'']') {
        $leaks += 'Potential raw secret or password detected in git diff!'
    }
    if ($leaks.Count -gt 0) {
        throw ($leaks -join '; ')
    }
} -Severity 'P0'

# Gate 3: Backend .NET 8 Release Build
$gates += Invoke-StabilizationGate 'backend-dotnet-build' {
    dotnet build 'API Graphql/OneITB/GraphQL.csproj' -c Release
    if ($LASTEXITCODE -ne 0) { throw "Backend .NET build failed" }
} -Severity 'P0'

# Gate 4: Frontend React 18 / Vite Build
$gates += Invoke-StabilizationGate 'frontend-vite-build' {
    Push-Location 'FrontEnd/OneItb-FE'
    try {
        npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend Vite build failed" }
    }
    finally {
        Pop-Location
    }
} -Severity 'P0'

# Gate 5: Backend xUnit Regression Suite
if ($shouldRunTests) {
    $gates += Invoke-StabilizationGate 'backend-regression-suite' {
        dotnet test 'API Graphql/Tests/Services.Tests/Services.Tests.csproj' -c Release --no-build
        if ($LASTEXITCODE -ne 0) { throw "Backend test failures detected" }
    } -Severity 'P0'
}

# Gate 6: Frontend Vitest Regression Suite
if ($shouldRunTests) {
    $gates += Invoke-StabilizationGate 'frontend-regression-suite' {
        Push-Location 'FrontEnd/OneItb-FE'
        try {
            npm.cmd test -- --run
            if ($LASTEXITCODE -ne 0) { throw "Frontend test failures detected" }
        }
        finally {
            Pop-Location
        }
    } -Severity 'P0'
}

# Gate 7: Entity Framework Pending Model Changes
$gates += Invoke-StabilizationGate 'ef-pending-model-changes' {
    dotnet ef migrations has-pending-model-changes --configuration Release `
        --no-build `
        --project 'API Graphql/Data/Data.csproj' `
        --startup-project 'API Graphql/OneITB/GraphQL.csproj'
    if ($LASTEXITCODE -ne 0) { throw "Pending EF Core model changes detected" }
} -Severity 'P1'

# Gate 8: SpecKit DoD Compliance (Tasks & Development Log)
$gates += Invoke-StabilizationGate 'speckit-dod-compliance' {
    $errors = @()
    if ($resolvedFeature -and (Test-Path (Join-Path $resolvedFeature 'tasks.md'))) {
        $taskLines = Get-Content (Join-Path $resolvedFeature 'tasks.md')
        $openTasks = @($taskLines | Where-Object { $_ -match '^- \[ \]' }).Count
        if ($openTasks -gt 0) {
            $errors += "Feature has $openTasks open incomplete task(s) in tasks.md"
        }
    }
    
    if (Test-Path 'docs/audit/DEVELOPMENT_LOG.md') {
        $topLog = (Get-Content 'docs/audit/DEVELOPMENT_LOG.md' -TotalCount 75) -join "`n"
        $todayDate = (Get-Date).ToString('yyyy-MM-dd')
        if ($topLog -notmatch [regex]::Escape($todayDate) -and $topLog -notmatch 'Spec 218') {
            $errors += "DEVELOPMENT_LOG.md lacks an entry referencing today's date or active spec in top lines"
        }
    }
    
    if ($errors.Count -gt 0) {
        throw ($errors -join '; ')
    }
} -Severity 'P2'

# Final Assessment
$failedGates = @($gates | Where-Object { $_.Status -eq 'FAIL' })
$overallStatus = if ($failedGates.Count -eq 0) { 'PASS' } else { 'FAIL' }

$report = [ordered]@{
    Status       = $overallStatus
    Timestamp    = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    FeatureDir   = $resolvedFeature
    TotalGates   = $gates.Count
    FailedCount  = $failedGates.Count
    Gates        = $gates
}

$report | ConvertTo-Json -Depth 6
if ($overallStatus -eq 'FAIL') {
    exit 1
}
exit 0
