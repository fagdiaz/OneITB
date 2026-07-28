[CmdletBinding()]
param(
    [int]$RedisPort = 16379,
    [int]$SmtpPort = 11025,
    [int]$MailpitHttpPort = 18025,
    [int]$HealthTimeoutSeconds = 60,
    [switch]$SkipContainerStartup,
    [switch]$KeepContainers
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$composeFile = Join-Path $repoRoot "docker-compose.acceptance.yml"
$backendProject = Join-Path $repoRoot "API Graphql/OneITB/GraphQL.csproj"
$backendTests = Join-Path $repoRoot "API Graphql/Tests/Services.Tests/Services.Tests.csproj"
$dataProject = Join-Path $repoRoot "API Graphql/Data/Data.csproj"
$frontendDirectory = Join-Path $repoRoot "FrontEnd/OneItb-FE"
$composeProject = "oneitb195acceptance"
$redisContainer = "oneitb23-acceptance-redis"
$mailpitContainer = "oneitb23-acceptance-mailpit"
$startedByScript = $false
$environmentSnapshot = @{}
$failure = $null

function Set-ProcessEnvironment {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [AllowNull()][string]$Value
    )

    if (-not $environmentSnapshot.ContainsKey($Name)) {
        $environmentSnapshot[$Name] =
            [Environment]::GetEnvironmentVariable($Name, "Process")
    }
    [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
}

function Restore-ProcessEnvironment {
    foreach ($entry in $environmentSnapshot.GetEnumerator()) {
        [Environment]::SetEnvironmentVariable(
            [string]$entry.Key,
            $entry.Value,
            "Process")
    }
}

function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory
    )

    Write-Host "[RUN] $Name" -ForegroundColor Cyan
    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$Name failed with exit code $LASTEXITCODE."
        }
        Write-Host "[PASS] $Name" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

function Test-PortAvailable {
    param([Parameter(Mandatory = $true)][int]$Port)

    $listener = [System.Net.Sockets.TcpListener]::new(
        [System.Net.IPAddress]::Loopback,
        $Port)
    try {
        $listener.Start()
        return $true
    }
    catch {
        return $false
    }
    finally {
        try { $listener.Stop() } catch { }
    }
}

function Assert-ValidPort {
    param([Parameter(Mandatory = $true)][int]$Port)

    if ($Port -lt 1 -or $Port -gt 65535) {
        throw "Port $Port is outside the valid TCP range."
    }
}

function Get-ContainerFingerprint {
    param([Parameter(Mandatory = $true)][string]$Name)

    $fingerprint = & docker inspect `
        --format "{{.Id}}|{{.State.Running}}|{{.State.StartedAt}}" `
        $Name 2>$null
    if ($LASTEXITCODE -ne 0) {
        return "<absent>"
    }
    return ($fingerprint -join "").Trim()
}

function Wait-ContainerHealthy {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][int]$TimeoutSeconds
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        $status = & docker inspect `
            --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" `
            $Name 2>$null
        if ($LASTEXITCODE -eq 0 -and ($status -join "").Trim() -eq "healthy") {
            return
        }
        Start-Sleep -Milliseconds 500
    } while ([DateTime]::UtcNow -lt $deadline)

    $details = & docker inspect `
        --format "{{json .State.Health}}" `
        $Name 2>$null
    throw "Container $Name did not become healthy: $($details -join ' ')"
}

function New-EphemeralSecret {
    $bytes = New-Object byte[] 32
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $generator.GetBytes($bytes)
        return [Convert]::ToBase64String($bytes)
    }
    finally {
        $generator.Dispose()
    }
}

foreach ($port in @($RedisPort, $SmtpPort, $MailpitHttpPort)) {
    Assert-ValidPort -Port $port
}
$uniquePorts = @(@($RedisPort, $SmtpPort, $MailpitHttpPort) | Select-Object -Unique)
if ($uniquePorts.Count -ne 3) {
    throw "Redis, SMTP and Mailpit HTTP ports must be different."
}

$sqlFingerprintBefore = Get-ContainerFingerprint -Name "oneitb23-sql"

try {
    Set-ProcessEnvironment -Name "ONEITB_ACCEPTANCE_REDIS_PORT" -Value "$RedisPort"
    Set-ProcessEnvironment -Name "ONEITB_ACCEPTANCE_SMTP_PORT" -Value "$SmtpPort"
    Set-ProcessEnvironment -Name "ONEITB_ACCEPTANCE_MAILPIT_HTTP_PORT" -Value "$MailpitHttpPort"

    if (-not $SkipContainerStartup) {
        Invoke-Native `
            -Name "Acceptance Compose configuration" `
            -FilePath "docker" `
            -Arguments @("compose", "-f", $composeFile, "-p", $composeProject, "config", "--quiet") `
            -WorkingDirectory $repoRoot

        & docker compose -f $composeFile -p $composeProject down --remove-orphans 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Unable to clean a previous acceptance Compose project."
        }

        foreach ($port in @($RedisPort, $SmtpPort, $MailpitHttpPort)) {
            if (-not (Test-PortAvailable -Port $port)) {
                throw "Acceptance port $port is already in use."
            }
        }

        $startedByScript = $true
        Invoke-Native `
            -Name "Detached Redis and Mailpit startup" `
            -FilePath "docker" `
            -Arguments @(
                "compose", "-f", $composeFile, "-p", $composeProject,
                "up", "-d", "oneitb-redis", "oneitb-mailpit") `
            -WorkingDirectory $repoRoot
    }

    Wait-ContainerHealthy -Name $redisContainer -TimeoutSeconds $HealthTimeoutSeconds
    Wait-ContainerHealthy -Name $mailpitContainer -TimeoutSeconds $HealthTimeoutSeconds
    Write-Host "[PASS] Redis and Mailpit report healthy." -ForegroundColor Green

    Set-ProcessEnvironment -Name "ONEITB_RUN_INFRA_TESTS" -Value "true"
    Set-ProcessEnvironment `
        -Name "ONEITB_TEST_REDIS_CONNECTION" `
        -Value "127.0.0.1:$RedisPort,abortConnect=false,connectTimeout=5000"
    Set-ProcessEnvironment -Name "ONEITB_TEST_SMTP_HOST" -Value "127.0.0.1"
    Set-ProcessEnvironment -Name "ONEITB_TEST_SMTP_PORT" -Value "$SmtpPort"
    Set-ProcessEnvironment -Name "ONEITB_TEST_SMTP_USER" -Value "oneitb-acceptance"
    Set-ProcessEnvironment -Name "ONEITB_TEST_SMTP_PASS" -Value (New-EphemeralSecret)
    Set-ProcessEnvironment `
        -Name "ONEITB_TEST_MAILPIT_BASE_URL" `
        -Value "http://127.0.0.1:$MailpitHttpPort"

    Invoke-Native `
        -Name "Real Redis and SMTP integration tests" `
        -FilePath "dotnet" `
        -Arguments @(
            "test", $backendTests, "-c", "Release", "--no-restore",
            "--filter", "Category=Infrastructure") `
        -WorkingDirectory $repoRoot

    Set-ProcessEnvironment -Name "ONEITB_RUN_INFRA_TESTS" -Value "false"

    Invoke-Native `
        -Name "Student-to-Moderator session isolation regression" `
        -FilePath "npm.cmd" `
        -Arguments @(
            "run", "test", "--", "--run",
            "src/context/AuthContext.test.jsx",
            "src/data/graphql/GraphqlProvider.test.js") `
        -WorkingDirectory $frontendDirectory
    Invoke-Native `
        -Name "Backend automated suite" `
        -FilePath "dotnet" `
        -Arguments @("test", $backendTests, "-c", "Release", "--no-restore") `
        -WorkingDirectory $repoRoot
    Invoke-Native `
        -Name "Frontend automated suite" `
        -FilePath "npm.cmd" `
        -Arguments @("run", "test", "--", "--run") `
        -WorkingDirectory $frontendDirectory
    Invoke-Native `
        -Name "Backend Release build" `
        -FilePath "dotnet" `
        -Arguments @("build", $backendProject, "-c", "Release", "--no-restore") `
        -WorkingDirectory $repoRoot
    Invoke-Native `
        -Name "Frontend production build" `
        -FilePath "npm.cmd" `
        -Arguments @("run", "build") `
        -WorkingDirectory $frontendDirectory

    Set-ProcessEnvironment -Name "ASPNETCORE_ENVIRONMENT" -Value "Development"
    Set-ProcessEnvironment -Name "Jwt__Key" -Value (New-EphemeralSecret)
    Invoke-Native `
        -Name "EF Core pending model changes" `
        -FilePath "dotnet" `
        -Arguments @(
            "ef", "migrations", "has-pending-model-changes",
            "--configuration", "Release",
            "--project", $dataProject,
            "--startup-project", $backendProject,
            "--no-build") `
        -WorkingDirectory $repoRoot
    Invoke-Native `
        -Name "Patch whitespace integrity" `
        -FilePath "git" `
        -Arguments @("diff", "--check") `
        -WorkingDirectory $repoRoot

    $sqlFingerprintAfter = Get-ContainerFingerprint -Name "oneitb23-sql"
    if ($sqlFingerprintAfter -ne $sqlFingerprintBefore) {
        throw "The SQL container changed during acceptance validation."
    }
    Write-Host "[PASS] Existing SQL container fingerprint remained unchanged." -ForegroundColor Green
}
catch {
    $failure = $_
}
finally {
    Set-ProcessEnvironment -Name "ONEITB_RUN_INFRA_TESTS" -Value "false"
    Set-ProcessEnvironment -Name "ONEITB_TEST_REDIS_CONNECTION" -Value $null
    Set-ProcessEnvironment -Name "ONEITB_TEST_SMTP_HOST" -Value $null
    Set-ProcessEnvironment -Name "ONEITB_TEST_SMTP_PORT" -Value $null
    Set-ProcessEnvironment -Name "ONEITB_TEST_SMTP_USER" -Value $null
    Set-ProcessEnvironment -Name "ONEITB_TEST_SMTP_PASS" -Value $null
    Set-ProcessEnvironment -Name "ONEITB_TEST_MAILPIT_BASE_URL" -Value $null

    if ($startedByScript -and -not $KeepContainers) {
        try {
            Invoke-Native `
                -Name "Acceptance container cleanup" `
                -FilePath "docker" `
                -Arguments @(
                    "compose", "-f", $composeFile, "-p", $composeProject,
                    "down", "--remove-orphans") `
                -WorkingDirectory $repoRoot
        }
        catch {
            if ($null -eq $failure) {
                $failure = $_
            }
        }

        foreach ($port in @($RedisPort, $SmtpPort, $MailpitHttpPort)) {
            if (-not (Test-PortAvailable -Port $port) -and $null -eq $failure) {
                $failure = [InvalidOperationException]::new(
                    "Acceptance port $port remained occupied after cleanup.")
            }
        }
    }

    Restore-ProcessEnvironment
}

if ($null -ne $failure) {
    Write-Error $failure.Exception.Message
    exit 1
}

Write-Host ""
Write-Host "Spec 195 local infrastructure acceptance: PASS" -ForegroundColor Green
Write-Host "External SMTP, Cloudinary, Google SSO and network WebSocket handshakes remain unverified."
exit 0
