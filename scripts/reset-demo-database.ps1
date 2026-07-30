[CmdletBinding()]
param(
    [switch]$ConfirmDatabaseReset
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$projectPath = Join-Path $repositoryRoot "API Graphql\OneITB\GraphQL.csproj"
$dataProjectPath = Join-Path $repositoryRoot "API Graphql\Data\Data.csproj"
$apiDirectory = Join-Path $repositoryRoot "API Graphql\OneITB"
$apiExecutable = Join-Path $apiDirectory "bin\Release\net8.0\GraphQL.exe"
$backupDirectory = Join-Path $repositoryRoot "backups\local-demo"
$containerName = "oneitb23-sql"
$databaseName = "OneItb"
$seedPort = 5096

function Get-UserSecretValue {
    param([Parameter(Mandatory = $true)][string]$Key)

    $lines = & dotnet user-secrets list --project $projectPath
    $prefix = "$Key = "
    $line = $lines | Where-Object { $_ -like "$prefix*" } | Select-Object -First 1
    if (-not $line) {
        throw "Required user-secret '$Key' is missing."
    }

    return $line.Substring($prefix.Length)
}

function Get-ApprovedSqlEnvironment {
    $container = docker inspect $containerName | ConvertFrom-Json
    if (-not $container -or $container[0].Name.TrimStart("/") -ne $containerName) {
        throw "Approved SQL container '$containerName' was not found."
    }
    if (-not $container[0].State.Running -or $container[0].State.Health.Status -ne "healthy") {
        throw "Approved SQL container is not running and healthy."
    }

    $ports = $container[0].NetworkSettings.Ports."1433/tcp"
    if (-not $ports -or $ports[0].HostPort -ne "1433" -or
        $ports[0].HostIp -notin @("0.0.0.0", "127.0.0.1", "::")) {
        throw "SQL container is not published on the approved local port 1433."
    }

    $passwordEntry = $container[0].Config.Env |
        Where-Object { $_ -like "MSSQL_SA_PASSWORD=*" } |
        Select-Object -First 1
    if (-not $passwordEntry) {
        throw "The SQL container does not expose its local administrator secret."
    }

    return [pscustomobject]@{
        Password = $passwordEntry.Substring("MSSQL_SA_PASSWORD=".Length)
        Image = $container[0].Config.Image
    }
}

function Invoke-Sql {
    param(
        [Parameter(Mandatory = $true)][string]$Password,
        [Parameter(Mandatory = $true)][string]$Database,
        [Parameter(Mandatory = $true)][string]$Query,
        [switch]$Scalar
    )

    $arguments = @(
        "exec", $containerName,
        "/opt/mssql-tools18/bin/sqlcmd",
        "-C", "-b", "-S", "localhost", "-U", "sa", "-P", $Password,
        "-d", $Database, "-W"
    )
    if ($Scalar) {
        $arguments += @("-h", "-1")
    }
    $arguments += @("-Q", $Query)

    $output = & docker @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "SQL command failed against the approved local container."
    }
    return $output
}

function Stop-ApprovedApi {
    $listeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -in @(44397, 5000, $seedPort) } |
        Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($processId in $listeners) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
        if (-not $process) {
            continue
        }
        if ($process.CommandLine -notlike "*$repositoryRoot\API Graphql\OneITB*") {
            throw "Port is held by unexpected process $processId; reset aborted."
        }
        Stop-Process -Id $processId -Force
    }
}

function Invoke-SeedStartup {
    param([Parameter(Mandatory = $true)][int]$RunNumber)

    if (-not (Test-Path -LiteralPath $apiExecutable)) {
        throw "Release API executable is missing. Build the backend before reset."
    }

    $outLog = Join-Path $env:TEMP "oneitb-seed-$RunNumber-$([Guid]::NewGuid().ToString('N')).out.log"
    $errLog = Join-Path $env:TEMP "oneitb-seed-$RunNumber-$([Guid]::NewGuid().ToString('N')).err.log"
    $previousEnvironment = $env:ASPNETCORE_ENVIRONMENT
    $previousUrls = $env:ASPNETCORE_URLS
    $process = $null

    try {
        $env:ASPNETCORE_ENVIRONMENT = "Development"
        $env:ASPNETCORE_URLS = "http://127.0.0.1:$seedPort"
        $process = Start-Process -FilePath $apiExecutable `
            -WorkingDirectory $apiDirectory `
            -RedirectStandardOutput $outLog `
            -RedirectStandardError $errLog `
            -WindowStyle Hidden `
            -PassThru

        $ready = $false
        for ($attempt = 0; $attempt -lt 60; $attempt++) {
            Start-Sleep -Milliseconds 500
            if ($process.HasExited) {
                break
            }
            try {
                $response = Invoke-WebRequest `
                    -Uri "http://127.0.0.1:$seedPort/health" `
                    -UseBasicParsing `
                    -TimeoutSec 2
                if ($response.StatusCode -eq 200) {
                    $ready = $true
                    break
                }
            } catch {
            }
        }

        if (-not $ready) {
            $errorTail = if (Test-Path $errLog) { Get-Content $errLog -Tail 30 } else { @() }
            $outputTail = if (Test-Path $outLog) { Get-Content $outLog -Tail 30 } else { @() }
            throw "Seed startup $RunNumber failed.`n$($errorTail -join [Environment]::NewLine)`n$($outputTail -join [Environment]::NewLine)"
        }
    } finally {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force
            $process.WaitForExit(5000) | Out-Null
        }
        $env:ASPNETCORE_ENVIRONMENT = $previousEnvironment
        $env:ASPNETCORE_URLS = $previousUrls
    }
}

function Get-InventoryFingerprint {
    param([Parameter(Mandatory = $true)][string]$Password)

    $query = @"
SET NOCOUNT ON;
SELECT CONCAT(
    'Accounts=', (SELECT COUNT(*) FROM dbo.Accounts), ';',
    'Users=', (SELECT COUNT(*) FROM dbo.Users), ';',
    'Careers=', (SELECT COUNT(*) FROM dbo.Careers), ';',
    'Subjects=', (SELECT COUNT(*) FROM dbo.Subjects), ';',
    'Prerequisites=', (SELECT COUNT(*) FROM dbo.SubjectPrerequisites), ';',
    'UserCareers=', (SELECT COUNT(*) FROM dbo.UserCareers), ';',
    'Resources=', (SELECT COUNT(*) FROM dbo.AcademicResources), ';',
    'Progress=', (SELECT COUNT(*) FROM dbo.AcademicProgress), ';',
    'Inquiries=', (SELECT COUNT(*) FROM dbo.Inquiries), ';',
    'Comments=', (SELECT COUNT(*) FROM dbo.Comments), ';',
    'Reactions=', (SELECT COUNT(*) FROM dbo.Reactions), ';',
    'Reports=', (SELECT COUNT(*) FROM dbo.CommunityReports), ';',
    'Interactions=', (SELECT COUNT(*) FROM dbo.UserInteractions), ';',
    'Messages=', (SELECT COUNT(*) FROM dbo.Messages), ';',
    'Preferences=', (SELECT COUNT(*) FROM dbo.NotificationPreferences), ';',
    'Notifications=', (SELECT COUNT(*) FROM dbo.Notifications), ';',
    'Offers=', (SELECT COUNT(*) FROM dbo.JobOffers), ';',
    'Applications=', (SELECT COUNT(*) FROM dbo.JobApplications), ';',
    'CvRows=', (
        SELECT
            (SELECT COUNT(*) FROM dbo.UserCvExperiences) +
            (SELECT COUNT(*) FROM dbo.UserCvEducations) +
            (SELECT COUNT(*) FROM dbo.UserCvProjects) +
            (SELECT COUNT(*) FROM dbo.UserCvSkills) +
            (SELECT COUNT(*) FROM dbo.UserCvLanguages)
    )
);
"@
    return ((Invoke-Sql -Password $Password -Database $databaseName -Query $query -Scalar) |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        Select-Object -First 1).Trim()
}

if (-not $ConfirmDatabaseReset) {
    throw "Destructive reset requires -ConfirmDatabaseReset."
}

Push-Location $repositoryRoot
try {
    $sqlEnvironment = Get-ApprovedSqlEnvironment
    $connection = Get-UserSecretValue -Key "ConnectionStrings:DefaultConnection"
    $null = Get-UserSecretValue -Key "Jwt:Key"
    $null = Get-UserSecretValue -Key "Seed:DemoPassword"

    $serverMatch = [regex]::Match($connection, "(?i)(Server|Data Source)\s*=\s*([^;]+)")
    $databaseMatch = [regex]::Match($connection, "(?i)(Database|Initial Catalog)\s*=\s*([^;]+)")
    if ($serverMatch.Groups[2].Value.Trim() -ne "localhost,1433" -or
        $databaseMatch.Groups[2].Value.Trim() -ne $databaseName) {
        throw "DefaultConnection is not the approved localhost,1433 / OneItb target."
    }

    Stop-ApprovedApi

    & dotnet build $projectPath -c Release --no-restore
    if ($LASTEXITCODE -ne 0) {
        throw "Backend Release build failed."
    }

    & dotnet ef migrations has-pending-model-changes --no-build --configuration Release `
        --project $dataProjectPath --startup-project $projectPath
    if ($LASTEXITCODE -ne 0) {
        throw "EF model drift check failed."
    }

    New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
    $resolvedBackupDirectory = (Resolve-Path $backupDirectory).Path
    if (-not $resolvedBackupDirectory.StartsWith(
        $repositoryRoot + [IO.Path]::DirectorySeparatorChar,
        [StringComparison]::OrdinalIgnoreCase)) {
        throw "Backup path escaped the repository."
    }

    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupName = "OneItb-before-rebaseline-$stamp.bak"
    $containerBackup = "/var/opt/mssql/backup/$backupName"
    $hostBackup = Join-Path $resolvedBackupDirectory $backupName
    & docker exec $containerName mkdir -p /var/opt/mssql/backup | Out-Null

    $backupQuery = @"
IF DB_ID(N'$databaseName') IS NULL THROW 51000, 'Approved database does not exist.', 1;
BACKUP DATABASE [$databaseName]
TO DISK = N'$containerBackup'
WITH COPY_ONLY, INIT, CHECKSUM, COMPRESSION, STATS = 10;
RESTORE VERIFYONLY FROM DISK = N'$containerBackup' WITH CHECKSUM;
"@
    Invoke-Sql -Password $sqlEnvironment.Password -Database "master" -Query $backupQuery | Out-Host
    & docker cp "${containerName}:$containerBackup" $hostBackup | Out-Null
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $hostBackup)) {
        throw "Verified backup could not be copied to ignored host storage."
    }
    $backupFile = Get-Item -LiteralPath $hostBackup
    if ($backupFile.Length -le 0) {
        throw "Copied backup is empty."
    }
    $backupHash = (Get-FileHash -LiteralPath $hostBackup -Algorithm SHA256).Hash

    $dropQuery = @"
IF DB_ID(N'$databaseName') IS NULL THROW 51001, 'Approved database disappeared before reset.', 1;
ALTER DATABASE [$databaseName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [$databaseName];
"@
    Invoke-Sql -Password $sqlEnvironment.Password -Database "master" -Query $dropQuery | Out-Null

    & dotnet ef database update --no-build --configuration Release `
        --project $dataProjectPath --startup-project $projectPath
    if ($LASTEXITCODE -ne 0) {
        throw "Database migration failed after reset."
    }

    Invoke-SeedStartup -RunNumber 1
    $firstFingerprint = Get-InventoryFingerprint -Password $sqlEnvironment.Password
    Invoke-SeedStartup -RunNumber 2
    $secondFingerprint = Get-InventoryFingerprint -Password $sqlEnvironment.Password

    if ($firstFingerprint -ne $secondFingerprint) {
        throw "Canonical seed is not idempotent.`nFirst: $firstFingerprint`nSecond: $secondFingerprint"
    }

    [pscustomobject]@{
        Status = "PASS"
        Container = $containerName
        Database = $databaseName
        BackupFile = $backupName
        BackupSizeBytes = $backupFile.Length
        BackupSha256 = $backupHash
        RestoreVerifyOnly = "PASS"
        RecoveryRunbook = "docs/audit/RUNBOOK_DEV.md#restauracion-de-la-base-demo"
        LatestInventory = $secondFingerprint
        SeedRuns = 2
        Idempotent = $true
    } | Format-List
} finally {
    Pop-Location
}
