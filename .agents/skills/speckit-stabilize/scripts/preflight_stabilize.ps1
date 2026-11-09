[CmdletBinding()]
param(
    [string]$FeatureDir = '',
    [object]$RunTests = $true,
    [switch]$Certify = $false,
    [string]$AuthorizedBranch = '',
    [scriptblock]$MockBackendCommand = $null,
    [scriptblock]$MockFrontendCommand = $null,
    [string]$MockBackendOutput = '',
    [string]$MockFrontendOutput = ''
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
Set-Location $repoRoot

$shouldRunTests = ($RunTests -eq $true -or "$RunTests" -eq 'true' -or "$RunTests" -eq '1' -or "$RunTests" -eq '$true')

# Track discovered test metrics
$script:backendTestResults = @{ Total = 0; Passed = 0; Failed = 0; Skipped = 0 }
$script:frontendTestResults = @{ Total = 0; Passed = 0; Failed = 0; Skipped = 0 }

$isSimulated = [bool]($MockBackendCommand -or $MockBackendOutput -or $MockFrontendCommand -or $MockFrontendOutput)

# 1. Resolve Active Feature and Validate Active Pointer
$activePointer = ''
$pointerError = $null

if (Test-Path -LiteralPath '.specify/feature.json') {
    try {
        $rawJson = Get-Content -Raw '.specify/feature.json'
        $featureState = $rawJson | ConvertFrom-Json
        $activePointer = $featureState.feature_directory
        if (-not $activePointer) {
            $pointerError = "File '.specify/feature.json' does not define a valid 'feature_directory'."
        }
    }
    catch {
        $pointerError = "File '.specify/feature.json' is corrupted or illegible: $($_.Exception.Message)"
    }
} else {
    $pointerError = "Required pointer file '.specify/feature.json' is missing."
}

if (-not $FeatureDir) {
    $FeatureDir = if ($activePointer) { $activePointer } else { '' }
}

$resolvedFeature = if ($FeatureDir -and (Test-Path -LiteralPath $FeatureDir)) { (Resolve-Path $FeatureDir).Path } else { $null }

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
    git diff --check
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
        $testOutput = if ($MockBackendCommand) {
            & $MockBackendCommand 2>&1 | Out-String
        } elseif ($MockBackendOutput) {
            $MockBackendOutput
        } else {
            dotnet test 'API Graphql/Tests/Services.Tests/Services.Tests.csproj' -c Release --no-restore --filter 'Category!=GOB12SqlConcurrency&Category!=GOB15BcryptBenchmark&Category!=VendorAdvisoryGHSA' 2>&1 | Out-String
        }
        if ($LASTEXITCODE -ne 0 -and -not $MockBackendCommand -and -not $MockBackendOutput) {
            throw "Backend test failures detected: `n$testOutput"
        }

        $total = 0
        $passed = 0
        $failed = 0
        $skipped = 0

        # Spanish VSTest
        if ($testOutput -match 'Superado:\s*(\d+)') { $passed = [int]$matches[1] }
        if ($testOutput -match 'Con error:\s*(\d+)') { $failed = [int]$matches[1] }
        if ($testOutput -match 'Omitido:\s*(\d+)') { $skipped = [int]$matches[1] }
        if ($testOutput -match 'Total:\s*(\d+)') { $total = [int]$matches[1] }

        # English VSTest
        if ($total -eq 0 -and $testOutput -match 'Total tests:\s*(\d+)') { $total = [int]$matches[1] }
        if ($passed -eq 0 -and $testOutput -match 'Passed:\s*(\d+)') { $passed = [int]$matches[1] }
        if ($failed -eq 0 -and $testOutput -match 'Failed:\s*(\d+)') { $failed = [int]$matches[1] }
        if ($skipped -eq 0 -and $testOutput -match 'Skipped:\s*(\d+)') { $skipped = [int]$matches[1] }

        if ($total -eq 0 -or $passed -eq 0) {
            throw "Backend suite executed 0 tests or failed to discover tests (Discovered Total: $total, Passed: $passed)."
        }
        if ($failed -gt 0) {
            throw "Backend suite reported $failed test failure(s)."
        }
        if ($Certify) {
            if ($skipped -gt 0) {
                throw "Backend suite certification rejected: $skipped test(s) were skipped/omitted. Certification requires 100% execution with 0 skipped."
            }
            if ($total -ne $passed) {
                throw "Backend suite certification rejected: Discrepancy between total ($total) and passed ($passed) tests."
            }
            if ($passed -lt 234) {
                throw "Backend test count ($passed) is below expected certified baseline of 234 tests."
            }
        }

        $script:backendTestResults = @{ Total = $total; Passed = $passed; Failed = $failed; Skipped = $skipped }
        $simTag = if ($MockBackendCommand -or $MockBackendOutput) { " (Simulated)" } else { "" }
        "Backend xUnit${simTag}: $passed passed of $total total tests ($skipped skipped)."
    } -Severity 'P0'
} else {
    $gates += [ordered]@{
        Name     = 'backend-regression-suite'
        Status   = 'SKIPPED'
        Severity = 'P0'
        Summary  = 'SKIPPED: -RunTests is false. Suite not executed (Blocks Certification).'
    }
}

# Gate 6: Frontend Vitest Regression Suite
if ($shouldRunTests) {
    $gates += Invoke-StabilizationGate 'frontend-regression-suite' {
        $feOutput = if ($MockFrontendCommand) {
            & $MockFrontendCommand 2>&1 | Out-String
        } elseif ($MockFrontendOutput) {
            $MockFrontendOutput
        } else {
            Push-Location 'FrontEnd/OneItb-FE'
            try {
                npm.cmd test -- --run 2>&1 | Out-String
            }
            finally {
                Pop-Location
            }
        }
        if ($LASTEXITCODE -ne 0 -and -not $MockFrontendCommand -and -not $MockFrontendOutput) {
            throw "Frontend test failures detected: `n$feOutput"
        }

        $cleanFe = $feOutput -replace '\u001b\[[0-9;]*[a-zA-Z]', ''
        $fePassed = 0
        $feSkipped = 0
        $feFailed = 0
        $feTotal = 0

        # Match strictly line starting with "Tests" (not "Test Files"):
        if ($cleanFe -match '(?m)^\s*Tests\s+(.*?)$') {
            $testsLine = $matches[1]
            if ($testsLine -match '(\d+)\s+passed') { $fePassed = [int]$matches[1] }
            if ($testsLine -match '(\d+)\s+failed') { $feFailed = [int]$matches[1] }
            if ($testsLine -match '(\d+)\s+skipped') { $feSkipped = [int]$matches[1] }
            if ($testsLine -match '\((\d+)\)') { $feTotal = [int]$matches[1] }
        }

        if ($fePassed -eq 0) {
            throw "Frontend test runner did not output a valid 'Tests' summary line (Test Files count is not accepted as Tests count)."
        }
        if ($feFailed -gt 0) {
            throw "Frontend suite reported $feFailed test failure(s)."
        }
        if ($Certify) {
            if ($feSkipped -gt 0) {
                throw "Frontend suite certification rejected: $feSkipped test(s) were skipped/omitted. Certification requires 100% execution with 0 skipped."
            }
            if ($feTotal -le 0) {
                throw "Frontend suite certification rejected: Total test count must be explicitly positive (got Total: $feTotal)."
            }
            if ($feTotal -ne $fePassed) {
                throw "Frontend suite certification rejected: Discrepancy between total ($feTotal) and passed ($fePassed) tests."
            }
            if ($fePassed -lt 258) {
                throw "Frontend test count ($fePassed) is below expected certified baseline of 258 tests."
            }
        }

        $script:frontendTestResults = @{ Total = $feTotal; Passed = $fePassed; Failed = $feFailed; Skipped = $feSkipped }
        $feSimTag = if ($MockFrontendCommand -or $MockFrontendOutput) { " (Simulated)" } else { "" }
        "Frontend Vitest${feSimTag}: $fePassed tests passed of $feTotal total tests ($feSkipped skipped)."
    } -Severity 'P0'
} else {
    $gates += [ordered]@{
        Name     = 'frontend-regression-suite'
        Status   = 'SKIPPED'
        Severity = 'P0'
        Summary  = 'SKIPPED: -RunTests is false. Suite not executed (Blocks Certification).'
    }
}

# Gate 7: Frontend Static Analysis (oxlint)
$gates += Invoke-StabilizationGate 'frontend-oxlint-check' {
    $lintOutput = npx --yes oxlint FrontEnd/OneItb-FE/src 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0 -or $lintOutput -match '([1-9]\d*\s+error|[1-9]\d*\s+warning)') {
        throw "oxlint detected lint errors/warnings: `n$lintOutput"
    }
} -Severity 'P1'

# Gate 8: Entity Framework Pending Model Changes
$gates += Invoke-StabilizationGate 'ef-pending-model-changes' {
    dotnet ef migrations has-pending-model-changes --configuration Release `
        --project 'API Graphql/Data/Data.csproj' `
        --startup-project 'API Graphql/OneITB/GraphQL.csproj'
    if ($LASTEXITCODE -ne 0) { throw "Pending EF Core model changes detected" }
} -Severity 'P1'

# Gate 9: SpecKit DoD Compliance, Branch Authorization & Pointer Verification
$gates += Invoke-StabilizationGate 'speckit-dod-compliance' {
    $errors = @()

    if ($Certify) {
        if ($isSimulated) {
            $errors += "Certification rejected: Simulated test outputs cannot grant official candidate certification. Live runner execution of xUnit and Vitest is strictly required."
        }
        if ($pointerError) {
            $errors += "Certification rejected: $pointerError"
        } else {
            $normRequested = ($FeatureDir -replace '\\', '/').Trim().TrimEnd('/')
            $normActive = ($activePointer -replace '\\', '/').Trim().TrimEnd('/')
            if ($normRequested -ne $normActive) {
                $errors += "Feature pointer mismatch during certification: Requested '$FeatureDir' diverges from active pointer in .specify/feature.json ('$activePointer')"
            }
        }

        # Exact branch verification
        $currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
        if ($currentBranch -eq 'main' -or $currentBranch -eq 'master') {
            $errors += "Certification blocked: Direct certification on protected branch '$currentBranch' is strictly prohibited by Constitution Principle IX."
        } elseif ($AuthorizedBranch) {
            if ($currentBranch -ne $AuthorizedBranch) {
                $errors += "Branch mismatch during certification: Current branch '$currentBranch' does not match the exact authorized branch '$AuthorizedBranch' for this delivery."
            }
        } else {
            # Default allowed candidate branches
            $approvedBranches = @('release/candidate-2026', 'feature/2026-11-01-debugger-cv-builder')
            if ($approvedBranches -notcontains $currentBranch) {
                $errors += "Branch mismatch during certification: Current branch '$currentBranch' is not among approved candidate branches ($($approvedBranches -join ', '))."
            }
        }
    }

    if (-not $resolvedFeature -or -not (Test-Path $resolvedFeature)) {
        $errors += "Feature directory does not exist or cannot be resolved: '$FeatureDir'"
    } else {
        $tasksPath = Join-Path $resolvedFeature 'tasks.md'
        if (-not (Test-Path $tasksPath)) {
            $errors += "Active feature directory is missing tasks.md: '$tasksPath'"
        } else {
            $taskLines = Get-Content $tasksPath
            $openTasks = @($taskLines | Where-Object { $_ -match '^- \[ \]' }).Count
            if ($openTasks -gt 0) {
                $errors += "Feature has $openTasks open incomplete task(s) in tasks.md"
            }
        }
    }

    if (Test-Path 'docs/audit/DEVELOPMENT_LOG.md') {
        $topLog = (Get-Content 'docs/audit/DEVELOPMENT_LOG.md' -TotalCount 75) -join "`n"
        $todayDate = (Get-Date).ToString('yyyy-MM-dd')
        if ($topLog -notmatch [regex]::Escape($todayDate) -and $topLog -notmatch 'Spec 219' -and $topLog -notmatch 'Spec 218') {
            $errors += "DEVELOPMENT_LOG.md lacks an entry referencing today ($todayDate) or the active spec"
        }
    } else {
        $errors += "DEVELOPMENT_LOG.md not found at expected path"
    }

    if ($errors.Count -gt 0) {
        throw ($errors -join '; ')
    }
} -Severity 'P0'

# Final Assessment
$failedGates  = @($gates | Where-Object { $_.Status -eq 'FAIL' })
$skippedGates = @($gates | Where-Object { $_.Status -eq 'SKIPPED' })
$passedGates  = @($gates | Where-Object { $_.Status -eq 'PASS' })

$overallStatus = 'PASS'
if ($failedGates.Count -gt 0) {
    $overallStatus = 'FAIL'
} elseif ($Certify -and $skippedGates.Count -gt 0) {
    $overallStatus = 'FAIL'
} elseif ($skippedGates.Count -gt 0) {
    $overallStatus = 'PARTIAL'
}

$currentSha = (git rev-parse HEAD).Trim()
$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
$porcelain = (git status --porcelain).Trim()
$stagedFiles = @(git diff --name-only --cached)
$unstagedFiles = @(git diff --name-only)

$report = [ordered]@{
    Status             = $overallStatus
    Certified          = ($Certify -and $overallStatus -eq 'PASS' -and -not $isSimulated)
    IsSimulated        = $isSimulated
    Timestamp          = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    GitCommitSha       = $currentSha
    GitBranch          = $currentBranch
    ActivePointer      = $activePointer
    FeatureDir         = $resolvedFeature
    WorkingTreeClean   = ($porcelain.Length -eq 0)
    StagedFilesCount   = $stagedFiles.Count
    UnstagedFilesCount = $unstagedFiles.Count
    BackendMetrics     = $script:backendTestResults
    FrontendMetrics    = $script:frontendTestResults
    TotalGates         = $gates.Count
    PassedCount        = $passedGates.Count
    FailedCount        = $failedGates.Count
    SkippedCount       = $skippedGates.Count
    Gates              = $gates
}

$report | ConvertTo-Json -Depth 6
if ($overallStatus -ne 'PASS') {
    exit 1
}
exit 0
