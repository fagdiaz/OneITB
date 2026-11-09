#Requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet(10, 11, 12)]
    [int] $EffectiveWorkFactor,
    [string] $RepositoryRoot = (Split-Path -Parent $PSScriptRoot),
    [string] $ResultsRoot = (Join-Path ([IO.Path]::GetTempPath()) 'OneITB-GOB15')
)
$ErrorActionPreference = 'Stop'
$repository = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$project = Join-Path $repository 'API Graphql/Tests/Services.Tests/Services.Tests.csproj'
$source = Join-Path $repository 'API Graphql/Tests/Services.Tests/Security/BCryptWorkFactorBenchmarkTests.cs'
if (!(Test-Path -LiteralPath $project) -or !(Test-Path -LiteralPath $source)) {
    throw 'Apply GOB-20261109-15 to the declared checkout before running this script.'
}
$revision = (& git -C $repository rev-parse HEAD)
if ($LASTEXITCODE -ne 0) { throw 'Cannot identify the candidate revision.' }
$tree = @(& git -C $repository status --porcelain=v1)
if ($LASTEXITCODE -ne 0) { throw 'Cannot identify the candidate tree state.' }
$dotnet = (Get-Command dotnet -CommandType Application -ErrorAction Stop).Source
$runDirectory = Join-Path ([IO.Path]::GetFullPath($ResultsRoot)) (
    (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($runDirectory) | Out-Null
$reportPath = Join-Path $runDirectory 'bcrypt-report.json'
$manifestPath = Join-Path $runDirectory 'execution.json'
$manifest = [ordered]@{
    Handoff = 'GOB-20261109-15'
    Revision = $revision
    Tree = $tree
    SourceSha256 = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
    EffectiveWorkFactor = $EffectiveWorkFactor
    CpuIdentifier = $env:PROCESSOR_IDENTIFIER
    ConfigurationSource = 'Declared by operator after resolving deployment overrides/user-secrets.'
    BenchmarkProcessLimitSeconds = 20
    BuildProcessLimitSeconds = 120
    Status = 'INCOMPLETE'
    StartedUtc = [DateTimeOffset]::UtcNow
    Runs = @()
}
function Invoke-FiniteDotnet {
    param([string] $Phase, [string[]] $Arguments, [int] $LimitSeconds, [hashtable] $Environment = @{})
    $info = [Diagnostics.ProcessStartInfo]::new()
    $info.FileName = $dotnet
    $info.WorkingDirectory = $repository
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $hasArgList = [Diagnostics.ProcessStartInfo].GetProperty("ArgumentList") -ne $null
    if ($hasArgList) {
        foreach ($argument in $Arguments) { $info.ArgumentList.Add($argument) }
    } else {
        $escaped = @()
        foreach ($arg in $Arguments) {
            if ($arg -match '\s' -or $arg -eq '') {
                $escaped += '"' + ($arg -replace '(\\*)(")', '$1$1\"') + '"'
            } else {
                $escaped += $arg
            }
        }
        $info.Arguments = $escaped -join ' '
    }
    foreach ($key in $Environment.Keys) { $info.Environment[$key] = [string]$Environment[$key] }
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $info
    $watch = [Diagnostics.Stopwatch]::StartNew()
    $timedOut = $false
    $exitCode = $null
    $started = $false
    try {
        if (!$process.Start()) { throw "Cannot start $Phase." }
        $started = $true
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        if (!$process.WaitForExit($LimitSeconds * 1000)) {
            $timedOut = $true
            # Kill only this owned dotnet process and its descendant testhost/MSBuild tree.
            try {
                $killTreeMethod = [Diagnostics.Process].GetMethod("Kill", [type[]]@([bool]))
                if ($killTreeMethod) {
                    $killTreeMethod.Invoke($process, @($true))
                } else {
                    & taskkill.exe /PID $process.Id /T /F | Out-Null
                }
            } catch {
                if (!$process.HasExited) { $process.Kill() }
            }
            if (!$process.WaitForExit(5000)) { throw "$Phase process-tree cleanup could not be confirmed." }
        }
        $exitCode = $process.ExitCode
        $drain = [Threading.Tasks.Task]::WhenAll([Threading.Tasks.Task[]]@($stdout, $stderr))
        if (!$drain.Wait(5000)) { throw "$Phase output drain exceeded its cleanup limit." }
        [IO.File]::WriteAllText((Join-Path $runDirectory "$Phase.stdout.log"), $stdout.Result)
        [IO.File]::WriteAllText((Join-Path $runDirectory "$Phase.stderr.log"), $stderr.Result)
        return [pscustomobject]@{
            Phase = $Phase; Arguments = $Arguments; ExitCode = $exitCode
            TimedOut = $timedOut; ElapsedMs = $watch.Elapsed.TotalMilliseconds
        }
    }
    finally {
        # Also covers an interrupted/exceptional parent while an owned child is alive.
        if ($started -and !$process.HasExited) {
            try {
                $killTreeMethod = [Diagnostics.Process].GetMethod("Kill", [type[]]@([bool]))
                if ($killTreeMethod) {
                    $killTreeMethod.Invoke($process, @($true))
                } else {
                    & taskkill.exe /PID $process.Id /T /F | Out-Null
                }
            } catch {
                if (!$process.HasExited) { $process.Kill() }
            }
            if (!$process.WaitForExit(5000)) { Write-Warning "Unconfirmed cleanup of owned PID $($process.Id)." }
        }
        $process.Dispose()
    }
}
try {
    $build = Invoke-FiniteDotnet -Phase build -LimitSeconds 120 -Arguments @(
        'build', $project, '-c', 'Release', '--no-restore', '--nologo', '-m:1', '-warnaserror',
        '-p:UseSharedCompilation=false', '-nodeReuse:false'
    )
    $manifest.Runs += $build
    if ($build.TimedOut -or $build.ExitCode -ne 0) {
        $manifest.Status = 'BUILD_FAILED_OR_TIMEOUT'
        throw 'Release compilation did not pass. Inspect build logs.'
    }
    $dll = Join-Path $repository 'API Graphql/Tests/Services.Tests/bin/Release/net8.0/Services.Tests.dll'
    $manifest.AssemblySha256 = (Get-FileHash -LiteralPath $dll -Algorithm SHA256).Hash
    $run = Invoke-FiniteDotnet -Phase benchmark -LimitSeconds 20 -Environment @{
        ONEITB_RUN_GOB15_BCRYPT = 'true'
        ONEITB_BCRYPT_EFFECTIVE_WORK_FACTOR = [string]$EffectiveWorkFactor
        ONEITB_BCRYPT_REPOSITORY = $repository
        ONEITB_BCRYPT_REPORT_PATH = $reportPath
        ONEITB_BCRYPT_REVISION = $revision
    } -Arguments @(
        'test', $project, '-c', 'Release', '--no-build', '--no-restore', '--nologo',
        '--filter', 'Category=GOB15BcryptBenchmark',
        '--logger', 'trx;LogFileName=benchmark.trx',
        '--results-directory', $runDirectory
    )
    $manifest.Runs += $run
    if ($run.TimedOut) {
        $manifest.Status = 'TIMEOUT_NOT_PASS'
        throw 'The 20-second process deadline expired. No calibration or PR-05 acceptance is granted.'
    }
    if ($run.ExitCode -ne 0 -or !(Test-Path -LiteralPath $reportPath)) {
        $manifest.Status = 'BENCHMARK_FAILED_OR_INCOMPLETE'
        throw 'Benchmark failed or produced no evidence. Inspect JSON/TRX/logs.'
    }
    $report = Get-Content -Raw -LiteralPath $reportPath | ConvertFrom-Json
    $trxPath = Join-Path $runDirectory 'benchmark.trx'
    [xml]$trx = Get-Content -Raw -LiteralPath $trxPath
    $counters = $trx.TestRun.ResultSummary.Counters
    if ($report.Status -ne 'PASS_SCREENING' -or [int]$counters.total -ne 1 -or
        [int]$counters.executed -ne 1 -or [int]$counters.passed -ne 1 -or [int]$counters.failed -ne 0) {
        $manifest.Status = 'BENCHMARK_FAILED_OR_INCOMPLETE'
        throw 'Expected one executed/passed xUnit test and a complete screening report.'
    }
    $manifest.Status = 'PASS_SCREENING_ONLY'
    Write-Output "GOB-20261109-15 evidence: $runDirectory"
    Write-Output "Candidate factor: $($report.CalibrationCandidate); accepted recommendation: $($report.RecommendedWorkFactor)"
}
finally {
    $manifest.CompletedUtc = [DateTimeOffset]::UtcNow
    $manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $manifestPath -Encoding utf8
    Write-Output "Execution manifest: $manifestPath"
}
