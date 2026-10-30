[CmdletBinding()]
param(
    [string]$FeatureDir,
    [switch]$RunBuilds,
    [switch]$CheckEf
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
Set-Location $repoRoot

if (-not $FeatureDir) {
    $featureState = Get-Content -Raw '.specify/feature.json' | ConvertFrom-Json
    $FeatureDir = $featureState.feature_directory
}

$resolvedFeature = (Resolve-Path $FeatureDir).Path
$repoPrefix = $repoRoot.TrimEnd([char[]]@('\', '/')) + [System.IO.Path]::DirectorySeparatorChar
if ($resolvedFeature -ne $repoRoot -and
    -not $resolvedFeature.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Feature directory is outside repository: $resolvedFeature"
}

$requiredFiles = @('spec.md', 'plan.md', 'tasks.md')
$missingFiles = @($requiredFiles | Where-Object {
    -not (Test-Path -LiteralPath (Join-Path $resolvedFeature $_))
})

$tasksPath = Join-Path $resolvedFeature 'tasks.md'
$tasks = if (Test-Path -LiteralPath $tasksPath) { Get-Content -Raw $tasksPath } else { '' }
$scope = [ordered]@{
    Backend  = [bool]($tasks -match '(?i)API Graphql/|\.cs\b|backend|GraphQL|HotChocolate')
    Frontend = [bool]($tasks -match '(?i)FrontEnd/|\.jsx?\b|React|Apollo|frontend')
    Data     = [bool]($tasks -match '(?i)OneItbContext|Entities/|entidad|contexto|migration|migraci[oó]n|EF Core|foreign key|\bFK\b|database|base de datos|columna|DeleteBehavior')
    Security = [bool]($tasks -match '(?i)auth|password|token|JWT|CORS|role|permission|admin|moder|upload|file|secret')
    Realtime = [bool]($tasks -match '(?i)subscription|WebSocket|realtime|real-time|topic')
}

$checklistTotal = 0
$checklistOpen = 0
$checklistDirectory = Join-Path $resolvedFeature 'checklists'
if (Test-Path -LiteralPath $checklistDirectory) {
    Get-ChildItem $checklistDirectory -File -Filter '*.md' | ForEach-Object {
        $lines = Get-Content $_.FullName
        $checklistTotal += @($lines | Where-Object { $_ -match '^- \[[ xX]\]' }).Count
        $checklistOpen += @($lines | Where-Object { $_ -match '^- \[ \]' }).Count
    }
}

function Invoke-Gate {
    param([string]$Name, [scriptblock]$Command)
    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $output = (& $Command 2>&1 | Out-String).Trim()
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorAction
    }
    $gateStatus = if ($exitCode -eq 0) {
        'PASS'
    }
    elseif ($output -match '(?i)NU1301|api\.nuget\.org|socket|network|Unable to retrieve project metadata') {
        'BLOCKED'
    }
    else {
        'FAIL'
    }
    [ordered]@{
        Name = $Name
        Status = $gateStatus
        ExitCode = $exitCode
        Summary = (($output -split "`r?`n") | Select-Object -Last 6) -join "`n"
    }
}

$gates = @()
$gates += Invoke-Gate 'git-diff-check' { git diff --check }

if ($RunBuilds -and $scope.Backend) {
    $backendGate = Invoke-Gate 'backend-release-build' {
        dotnet build 'API Graphql/OneITB/GraphQL.csproj' -c Release --no-restore
    }
    $gates += $backendGate
}

if ($RunBuilds -and $scope.Frontend) {
    $frontendPath = Join-Path $repoRoot 'FrontEnd/OneItb-FE'
    $gates += Invoke-Gate 'frontend-vite-build' {
        Push-Location $frontendPath
        try { npm.cmd run build } finally { Pop-Location }
    }
}

if ($CheckEf -and $scope.Data) {
    if ($RunBuilds -and $scope.Backend -and $backendGate.Status -ne 'PASS') {
        $gates += [ordered]@{
            Name = 'ef-pending-model-changes'
            Status = 'SKIPPED'
            ExitCode = $null
            Summary = 'Skipped because the backend build did not pass.'
        }
    }
    else {
        $gates += Invoke-Gate 'ef-pending-model-changes' {
            dotnet ef migrations has-pending-model-changes --configuration Release `
                --no-build `
                --project 'API Graphql/Data/Data.csproj' `
                --startup-project 'API Graphql/OneITB/GraphQL.csproj'
        }
    }
}

$dirtyCount = @(git status --short).Count
$failedGates = @($gates | Where-Object { $_.Status -eq 'FAIL' }).Count
$blockedGates = @($gates | Where-Object { $_.Status -eq 'BLOCKED' }).Count
$status = if ($missingFiles.Count -or $checklistOpen -or $failedGates) {
    'FAIL'
}
elseif ($blockedGates) {
    'BLOCKED'
}
else {
    'PASS'
}

$result = [ordered]@{
    Status = $status
    FeatureDir = $resolvedFeature
    MissingRequiredFiles = $missingFiles
    Checklist = [ordered]@{ Total = $checklistTotal; Open = $checklistOpen }
    Scope = $scope
    DirtyPathCount = $dirtyCount
    Gates = $gates
}

$result | ConvertTo-Json -Depth 6 -Compress
if ($status -eq 'FAIL') { exit 1 }
if ($status -eq 'BLOCKED') { exit 2 }
