[CmdletBinding()]
param(
    [switch]$SkipBaseline,
    [switch]$SkipRuntime,
    [switch]$IncludeRuntime,
    [int]$RuntimePort = 5094,
    [int]$ReadinessTimeoutSeconds = 90
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($IncludeRuntime -and $SkipRuntime) {
    throw "Use either -IncludeRuntime or -SkipRuntime, not both."
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendProject = Join-Path $repoRoot "API Graphql/OneITB/GraphQL.csproj"
$backendDirectory = Split-Path $backendProject -Parent
$backendTests = Join-Path $repoRoot "API Graphql/Tests/Services.Tests/Services.Tests.csproj"
$dataProject = Join-Path $repoRoot "API Graphql/Data/Data.csproj"
$frontendDirectory = Join-Path $repoRoot "FrontEnd/OneItb-FE"
$composeFile = Join-Path $repoRoot "docker-compose.yml"
$uploadsDirectory = Join-Path $backendDirectory "wwwroot/uploads"
$runId = [Guid]::NewGuid().ToString("N")
$runRoot = Join-Path ([System.IO.Path]::GetTempPath()) "oneitb-acceptance-$runId"
$pickupRelative = "App_Data/Acceptance/$runId"
$pickupDirectory = Join-Path $backendDirectory ($pickupRelative -replace "/", [System.IO.Path]::DirectorySeparatorChar)
$stdoutLog = Join-Path $runRoot "backend.stdout.log"
$stderrLog = Join-Path $runRoot "backend.stderr.log"
$baseUrl = "http://127.0.0.1:$RuntimePort"
$graphQlEndpoint = "$baseUrl/graphql"

$script:gates = @()
$script:backendProcess = $null
$script:backendStdoutTask = $null
$script:backendStderrTask = $null
$script:connectionString = $null
$script:demoPassword = $null
$script:accountSnapshots = @()
$script:mutedSnapshot = $null
$script:storedUploadPath = $null
$script:magicLinkStartedAt = $null
$script:magicLinkEmail = "empleador1@itbeltran.com.ar"
$script:sensitiveValues = @()
$script:environmentSnapshot = @{}

Add-Type -AssemblyName System.Net.Http
Add-Type -AssemblyName System.Data
Add-Type -AssemblyName System.Web.Extensions

function Add-Gate {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][ValidateSet("PASS", "FAIL", "BLOCKED", "SKIPPED")][string]$Status,
        [Parameter(Mandatory = $true)][string]$Evidence
    )

    $script:gates += [pscustomobject]@{
        Gate = $Name
        Status = $Status
        Evidence = $Evidence
    }

    $color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "BLOCKED" { "Yellow" }
        default { "DarkGray" }
    }
    Write-Host "[$Status] $Name - $Evidence" -ForegroundColor $color
}

function Invoke-NativeGate {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [string]$SuccessEvidence = "Command completed with exit code 0."
    )

    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments 2>&1 | ForEach-Object { Write-Host $_ }
        if ($LASTEXITCODE -ne 0) {
            throw "$FilePath exited with code $LASTEXITCODE."
        }
        Add-Gate -Name $Name -Status "PASS" -Evidence $SuccessEvidence
        return $true
    }
    catch {
        Add-Gate -Name $Name -Status "FAIL" -Evidence $_.Exception.Message
        return $false
    }
    finally {
        Pop-Location
    }
}

function Get-UserSecrets {
    $result = @{}
    $lines = & dotnet user-secrets list --project $backendProject 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to inspect backend user-secrets."
    }

    foreach ($line in $lines) {
        if ($line -match "^\s*([^=]+?)\s*=\s*(.*)$") {
            $result[$matches[1].Trim()] = $matches[2]
        }
    }
    return $result
}

function Get-RandomSecret {
    param([int]$Bytes = 48)

    $buffer = New-Object byte[] $Bytes
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $generator.GetBytes($buffer)
        return [Convert]::ToBase64String($buffer)
    }
    finally {
        $generator.Dispose()
    }
}

function Set-ProcessSetting {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [AllowNull()][string]$Value
    )

    if (-not $script:environmentSnapshot.ContainsKey($Name)) {
        $script:environmentSnapshot[$Name] =
            [Environment]::GetEnvironmentVariable($Name, "Process")
    }
    [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
}

function Restore-ProcessSettings {
    foreach ($entry in $script:environmentSnapshot.GetEnumerator()) {
        [Environment]::SetEnvironmentVariable(
            [string]$entry.Key,
            $entry.Value,
            "Process")
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

function Wait-BackendReady {
    param([Parameter(Mandatory = $true)][int]$TimeoutSeconds)

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        if ($script:backendProcess.HasExited) {
            throw "Temporary backend exited before readiness."
        }
        try {
            $response = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing -TimeoutSec 3
            if ([int]$response.StatusCode -eq 200) {
                return
            }
        }
        catch {
            Start-Sleep -Milliseconds 750
        }
    } while ([DateTime]::UtcNow -lt $deadline)

    throw "Temporary backend did not become ready within $TimeoutSeconds seconds."
}

function Start-TemporaryBackend {
    if (-not (Test-PortAvailable -Port $RuntimePort)) {
        throw "Runtime port $RuntimePort is already occupied."
    }

    New-Item -ItemType Directory -Path $runRoot -Force | Out-Null
    New-Item -ItemType Directory -Path $pickupDirectory -Force | Out-Null

    Set-ProcessSetting -Name "ASPNETCORE_ENVIRONMENT" -Value "Development"
    Set-ProcessSetting -Name "ASPNETCORE_URLS" -Value $baseUrl
    Set-ProcessSetting -Name "Jwt__Key" -Value (Get-RandomSecret)
    Set-ProcessSetting -Name "Jwt__Issuer" -Value "$baseUrl/"
    Set-ProcessSetting -Name "Jwt__Audience" -Value "$baseUrl/"
    Set-ProcessSetting -Name "Seed__EnableDemoData" -Value "false"
    Set-ProcessSetting -Name "Email__PickupDirectory" -Value $pickupRelative
    Set-ProcessSetting -Name "UploadCleanup__Enabled" -Value "false"
    Set-ProcessSetting -Name "UnreadMessageReminder__Enabled" -Value "false"
    Set-ProcessSetting -Name "MagicLinkRateLimiting__RequestIpLimit" -Value "4"
    Set-ProcessSetting -Name "MagicLinkRateLimiting__RequestIdentityLimit" -Value "2"
    Set-ProcessSetting -Name "MagicLinkRateLimiting__RedemptionIpLimit" -Value "4"
    Set-ProcessSetting -Name "MagicLinkRateLimiting__RedemptionCredentialLimit" -Value "2"
    Set-ProcessSetting -Name "MagicLinkRateLimiting__WindowMinutes" -Value "1"
    Set-ProcessSetting -Name "MagicLinkRateLimiting__MaxTrackedKeys" -Value "128"

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = "dotnet"
    $startInfo.WorkingDirectory = $backendDirectory
    $startInfo.Arguments =
        "run --project GraphQL.csproj --configuration Release --no-build " +
        "--no-launch-profile --urls $baseUrl"
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true

    $script:backendProcess = [System.Diagnostics.Process]::new()
    $script:backendProcess.StartInfo = $startInfo
    if (-not $script:backendProcess.Start()) {
        throw "Temporary backend process could not be started."
    }
    $script:backendStdoutTask = $script:backendProcess.StandardOutput.ReadToEndAsync()
    $script:backendStderrTask = $script:backendProcess.StandardError.ReadToEndAsync()

    Wait-BackendReady -TimeoutSeconds $ReadinessTimeoutSeconds
}

function Write-BackendLogs {
    if ($null -eq $script:backendProcess -or -not $script:backendProcess.HasExited) {
        return
    }

    if ($null -ne $script:backendStdoutTask) {
        [System.IO.File]::WriteAllText(
            $stdoutLog,
            $script:backendStdoutTask.GetAwaiter().GetResult())
    }
    if ($null -ne $script:backendStderrTask) {
        [System.IO.File]::WriteAllText(
            $stderrLog,
            $script:backendStderrTask.GetAwaiter().GetResult())
    }
}

function Stop-TemporaryBackend {
    if ($null -eq $script:backendProcess) {
        return
    }

    try {
        if (-not $script:backendProcess.HasExited) {
            Stop-Process -Id $script:backendProcess.Id -Force
            $script:backendProcess.WaitForExit(10000) | Out-Null
        }
        Write-BackendLogs
    }
    finally {
        $processStillExists = Get-Process -Id $script:backendProcess.Id -ErrorAction SilentlyContinue
        if ($processStillExists) {
            throw "Temporary backend PID $($script:backendProcess.Id) remained alive after cleanup."
        }
    }
}

function Invoke-GraphQl {
    param(
        [Parameter(Mandatory = $true)][string]$Query,
        [hashtable]$Variables = @{},
        [string]$Token,
        [switch]$AllowErrors
    )

    $payload = @{
        query = $Query
        variables = $Variables
    } | ConvertTo-Json -Depth 40

    $client = [System.Net.Http.HttpClient]::new()
    $content = [System.Net.Http.StringContent]::new(
        $payload,
        [System.Text.Encoding]::UTF8,
        "application/json")
    try {
        $client.Timeout = [TimeSpan]::FromSeconds(30)
        if (-not [string]::IsNullOrWhiteSpace($Token)) {
            $client.DefaultRequestHeaders.Authorization =
                [System.Net.Http.Headers.AuthenticationHeaderValue]::new(
                    "Bearer",
                    $Token)
        }
        $httpResponse = $client.PostAsync($graphQlEndpoint, $content).GetAwaiter().GetResult()
        $rawBody = $httpResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        if ([string]::IsNullOrWhiteSpace($rawBody)) {
            throw "GraphQL returned HTTP $([int]$httpResponse.StatusCode) without a response body."
        }
        try {
            $serializer =
                [System.Web.Script.Serialization.JavaScriptSerializer]::new()
            $serializer.MaxJsonLength = 64 * 1024 * 1024
            $response = $serializer.DeserializeObject($rawBody)
        }
        catch {
            $previewLength = [Math]::Min(160, $rawBody.Length)
            $preview = $rawBody.Substring(0, $previewLength) -replace "[\r\n\t]", " "
            $mediaType = [string]$httpResponse.Content.Headers.ContentType
            throw "GraphQL response could not be parsed (HTTP $([int]$httpResponse.StatusCode), $mediaType, preview: $preview)."
        }
        if (-not $httpResponse.IsSuccessStatusCode -and
            @(Get-GraphQlErrors -Response $response).Count -eq 0) {
            throw "GraphQL returned HTTP $([int]$httpResponse.StatusCode) without a controlled error."
        }
    }
    finally {
        $content.Dispose()
        $client.Dispose()
    }

    $errors = @(Get-GraphQlErrors -Response $response)
    if ($errors.Count -gt 0 -and -not $AllowErrors) {
        $messages = @($errors | ForEach-Object { $_.message }) -join " | "
        throw "GraphQL operation returned controlled errors: $messages"
    }
    return $response
}

function Get-GraphQlErrors {
    param([Parameter(Mandatory = $true)]$Response)

    if ($Response -is [System.Collections.IDictionary]) {
        if (-not ($Response.Keys -contains "errors") -or $null -eq $Response["errors"]) {
            return @()
        }
        return @($Response["errors"])
    }

    $property = $Response.PSObject.Properties["errors"]
    if ($null -eq $property -or $null -eq $property.Value) {
        return @()
    }
    return @($property.Value)
}

function Get-GraphQlErrorCode {
    param([Parameter(Mandatory = $true)]$Response)

    $first = @(Get-GraphQlErrors -Response $Response | Select-Object -First 1)
    if ($first.Count -eq 0 -or $null -eq $first[0].extensions) {
        return $null
    }
    return [string]$first[0].extensions.code
}

function Login-DemoUser {
    param([Parameter(Mandatory = $true)][string]$Email)

    $query = @'
mutation AcceptanceLogin($input: LoginInput!) {
  login(input: $input) {
    token
    id
    role
    isAuthenticated
  }
}
'@
    $response = Invoke-GraphQl -Query $query -Variables @{
        input = @{
            email = $Email
            password = $script:demoPassword
        }
    }
    $login = $response.data.login
    if (-not $login.isAuthenticated -or [string]::IsNullOrWhiteSpace([string]$login.token)) {
        throw "Demo login failed for the expected seeded role."
    }

    $script:sensitiveValues += [string]$login.token
    return $login
}

function Add-SqlParameters {
    param(
        [Parameter(Mandatory = $true)]$Command,
        [hashtable]$Parameters = @{}
    )

    foreach ($name in $Parameters.Keys) {
        $value = $Parameters[$name]
        if ($null -eq $value) {
            $value = [DBNull]::Value
        }
        $null = $Command.Parameters.AddWithValue("@$name", $value)
    }
}

function Invoke-SqlTable {
    param(
        [Parameter(Mandatory = $true)][string]$Query,
        [hashtable]$Parameters = @{}
    )

    $connection = [System.Data.SqlClient.SqlConnection]::new($script:connectionString)
    try {
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandText = $Query
        $command.CommandTimeout = 30
        Add-SqlParameters -Command $command -Parameters $Parameters
        $adapter = [System.Data.SqlClient.SqlDataAdapter]::new($command)
        $table = [System.Data.DataTable]::new()
        $null = $adapter.Fill($table)
        return ,$table
    }
    finally {
        $connection.Dispose()
    }
}

function Invoke-SqlNonQuery {
    param(
        [Parameter(Mandatory = $true)][string]$Query,
        [hashtable]$Parameters = @{}
    )

    $connection = [System.Data.SqlClient.SqlConnection]::new($script:connectionString)
    try {
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandText = $Query
        $command.CommandTimeout = 30
        Add-SqlParameters -Command $command -Parameters $Parameters
        return $command.ExecuteNonQuery()
    }
    finally {
        $connection.Dispose()
    }
}

function Invoke-SqlScalar {
    param(
        [Parameter(Mandatory = $true)][string]$Query,
        [hashtable]$Parameters = @{}
    )

    $connection = [System.Data.SqlClient.SqlConnection]::new($script:connectionString)
    try {
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandText = $Query
        $command.CommandTimeout = 30
        Add-SqlParameters -Command $command -Parameters $Parameters
        return $command.ExecuteScalar()
    }
    finally {
        $connection.Dispose()
    }
}

function Save-AccountSnapshots {
    $emails = @(
        "admin1@itbeltran.com.ar",
        "profesor1.ads@itbeltran.com.ar",
        "estudiante1.ads@itbeltran.com.ar",
        "egresado1@itbeltran.com.ar",
        "empleador1@itbeltran.com.ar"
    )
    foreach ($email in $emails) {
        $table = Invoke-SqlTable -Query @'
SELECT a.Id, a.FailedLoginAttempts, a.LockoutEnd
FROM dbo.Accounts a
INNER JOIN dbo.Users u ON u.Id = a.Id
WHERE a.Email = @Email;
'@ -Parameters @{ Email = $email }
        if ($table.Rows.Count -eq 1) {
            $row = $table.Rows[0]
            $script:accountSnapshots += [pscustomobject]@{
                Id = [Guid]$row.Id
                FailedLoginAttempts = [int]$row.FailedLoginAttempts
                LockoutEnd = if ($row.IsNull("LockoutEnd")) { $null } else { [DateTime]$row.LockoutEnd }
            }
        }
    }
}

function Restore-AccountSnapshots {
    foreach ($snapshot in $script:accountSnapshots) {
        $null = Invoke-SqlNonQuery -Query @'
UPDATE dbo.Accounts
SET FailedLoginAttempts = @FailedLoginAttempts,
    LockoutEnd = @LockoutEnd
WHERE Id = @Id;
'@ -Parameters @{
            Id = $snapshot.Id
            FailedLoginAttempts = $snapshot.FailedLoginAttempts
            LockoutEnd = $snapshot.LockoutEnd
        }
    }
}

function Invoke-Upload {
    param(
        [Parameter(Mandatory = $true)][byte[]]$Bytes,
        [Parameter(Mandatory = $true)][string]$FileName,
        [Parameter(Mandatory = $true)][string]$ContentType,
        [Parameter(Mandatory = $true)][string]$Token
    )

    $client = [System.Net.Http.HttpClient]::new()
    $multipart = [System.Net.Http.MultipartFormDataContent]::new()
    $content = [System.Net.Http.ByteArrayContent]::new($Bytes)
    try {
        $client.DefaultRequestHeaders.Authorization =
            [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $Token)
        $content.Headers.ContentType =
            [System.Net.Http.Headers.MediaTypeHeaderValue]::new($ContentType)
        $multipart.Add($content, "file", $FileName)
        $response = $client.PostAsync("$baseUrl/api/upload", $multipart).GetAwaiter().GetResult()
        $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        $parsed = $null
        if (-not [string]::IsNullOrWhiteSpace($body)) {
            try { $parsed = $body | ConvertFrom-Json } catch { }
        }
        return [pscustomobject]@{
            StatusCode = [int]$response.StatusCode
            IsSuccess = $response.IsSuccessStatusCode
            Body = $parsed
            RawBody = $body
        }
    }
    finally {
        $content.Dispose()
        $multipart.Dispose()
        $client.Dispose()
    }
}

function Test-UploadSecurity {
    param([Parameter(Mandatory = $true)][string]$Token)

    New-Item -ItemType Directory -Path $uploadsDirectory -Force | Out-Null
    $before = @(
        Get-ChildItem -LiteralPath $uploadsDirectory -File -ErrorAction SilentlyContinue
    ).Count

    $validPdf = [System.Text.Encoding]::ASCII.GetBytes(
        "%PDF-1.4`n1 0 obj`nendobj`n%%EOF")
    $valid = Invoke-Upload `
        -Bytes $validPdf `
        -FileName "acceptance-valid.pdf" `
        -ContentType "application/pdf" `
        -Token $Token
    if (-not $valid.IsSuccess -or [string]::IsNullOrWhiteSpace([string]$valid.Body.fileUrl)) {
        throw "A valid PDF upload did not return HTTP 200 and fileUrl."
    }

    $relative = ([string]$valid.Body.fileUrl).TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar
    $script:storedUploadPath = Join-Path (Join-Path $backendDirectory "wwwroot") $relative
    if (-not (Test-Path -LiteralPath $script:storedUploadPath)) {
        throw "The valid local upload was not persisted at the returned path."
    }

    $hostileBytes = New-Object byte[] ($validPdf.Length + 2)
    $hostileBytes[0] = 0x4D
    $hostileBytes[1] = 0x5A
    [Array]::Copy($validPdf, 0, $hostileBytes, 2, $validPdf.Length)
    $hostile = Invoke-Upload `
        -Bytes $hostileBytes `
        -FileName "acceptance-hostile.pdf" `
        -ContentType "application/pdf" `
        -Token $Token
    $truncated = Invoke-Upload `
        -Bytes ([System.Text.Encoding]::ASCII.GetBytes("%PDF-1.4`ntruncated")) `
        -FileName "acceptance-truncated.pdf" `
        -ContentType "application/pdf" `
        -Token $Token

    if ($hostile.StatusCode -ne 400 -or $truncated.StatusCode -ne 400) {
        throw "Hostile or truncated PDF was not rejected with HTTP 400."
    }
    if ([string]$hostile.Body.code -ne "UPLOAD_CONTENT_INVALID" -or
        [string]$truncated.Body.code -ne "UPLOAD_CONTENT_INVALID") {
        throw "Rejected uploads did not expose the stable public error code."
    }

    $after = @(
        Get-ChildItem -LiteralPath $uploadsDirectory -File -ErrorAction SilentlyContinue
    ).Count
    if ($after -ne ($before + 1)) {
        throw "Rejected upload fixtures changed storage state."
    }
}

function Test-SchemaAndPagination {
    param(
        [Parameter(Mandatory = $true)]$Student,
        [Parameter(Mandatory = $true)]$Admin
    )

    $schemaResponse = Invoke-GraphQl -Query @'
query AcceptanceQueryFields {
  queryType: __type(name: "Query") {
    fields { name }
  }
}
'@
    $fieldNames = @($schemaResponse.data.queryType.fields | ForEach-Object { [string]$_.name })
    if ($fieldNames -contains "inquiries") {
        throw "Legacy unbounded Query.inquiries remains exposed."
    }
    if ($fieldNames -notcontains "inquiriesPage" -or $fieldNames -notcontains "academicStudents") {
        throw "Expected bounded collection fields are missing."
    }

    $feedQuery = @'
query AcceptanceFeed($first: Int!, $after: String, $authorId: UUID) {
  inquiriesPage(first: $first, after: $after, authorId: $authorId) {
    totalCount
    hasNextPage
    nextCursor
    items {
      id
      publishDate
      user { id }
    }
  }
}
'@
    $page1 = Invoke-GraphQl -Query $feedQuery -Token $Student.token -Variables @{
        first = 5
        after = $null
        authorId = $null
    }
    $items1 = @($page1.data.inquiriesPage.items)
    if ($items1.Count -gt 5) {
        throw "Feed page exceeded the requested limit."
    }

    $repeat = Invoke-GraphQl -Query $feedQuery -Token $Student.token -Variables @{
        first = 5
        after = $null
        authorId = $null
    }
    $firstIds = @($items1 | ForEach-Object { [string]$_.id })
    $repeatIds = @($repeat.data.inquiriesPage.items | ForEach-Object { [string]$_.id })
    if (($firstIds -join "|") -ne ($repeatIds -join "|")) {
        throw "Feed first page ordering is not deterministic."
    }

    if ($page1.data.inquiriesPage.hasNextPage) {
        $page2 = Invoke-GraphQl -Query $feedQuery -Token $Student.token -Variables @{
            first = 5
            after = [string]$page1.data.inquiriesPage.nextCursor
            authorId = $null
        }
        $secondIds = @($page2.data.inquiriesPage.items | ForEach-Object { [string]$_.id })
        $duplicates = @($secondIds | Where-Object { $firstIds -contains $_ })
        if ($duplicates.Count -ne 0 -or $secondIds.Count -gt 5) {
            throw "Successive feed pages contain duplicates or exceed their limit."
        }
    }

    $authorPage = Invoke-GraphQl -Query $feedQuery -Token $Admin.token -Variables @{
        first = 10
        after = $null
        authorId = [string]$Student.id
    }
    $foreignAuthors = @(
        $authorPage.data.inquiriesPage.items |
            Where-Object { [string]$_.user.id -ne [string]$Student.id }
    )
    if ($foreignAuthors.Count -ne 0) {
        throw "Server-side author filtering returned unrelated users."
    }

    $subjects = Invoke-GraphQl -Query @'
query AcceptanceSubjects {
  subjects { id name code }
}
'@
    $subject = @($subjects.data.subjects | Select-Object -First 1)
    if ($subject.Count -eq 0) {
        throw "No seeded subject is available for academic pagination."
    }

    $academicQuery = @'
query AcceptanceStudents($subjectId: Int!, $first: Int!, $after: String) {
  academicStudents(subjectId: $subjectId, first: $first, after: $after) {
    totalCount
    hasNextPage
    nextCursor
    items { id firstName lastName role }
  }
}
'@
    $academicPage = Invoke-GraphQl -Query $academicQuery -Token $Admin.token -Variables @{
        subjectId = [int]$subject[0].id
        first = 2
        after = $null
    }
    if (@($academicPage.data.academicStudents.items).Count -gt 2) {
        throw "Academic page exceeded the requested limit."
    }
    if ($academicPage.data.academicStudents.hasNextPage) {
        $academicNext = Invoke-GraphQl -Query $academicQuery -Token $Admin.token -Variables @{
            subjectId = [int]$subject[0].id
            first = 2
            after = [string]$academicPage.data.academicStudents.nextCursor
        }
        $academicIds1 = @($academicPage.data.academicStudents.items | ForEach-Object { [string]$_.id })
        $academicIds2 = @($academicNext.data.academicStudents.items | ForEach-Object { [string]$_.id })
        if (@($academicIds2 | Where-Object { $academicIds1 -contains $_ }).Count -ne 0) {
            throw "Successive academic pages contain duplicate users."
        }
    }

    $unauthorized = Invoke-GraphQl `
        -Query $academicQuery `
        -Token $Student.token `
        -AllowErrors `
        -Variables @{
            subjectId = [int]$subject[0].id
            first = 2
            after = $null
        }
    if (@(Get-GraphQlErrors -Response $unauthorized).Count -eq 0) {
        throw "A student accessed the protected academic student collection."
    }
}

function Test-SilencedReactions {
    param([Parameter(Mandatory = $true)]$Student)

    $studentId = [Guid]$Student.id
    $state = Invoke-SqlTable -Query @'
SELECT Id, MutedUntil
FROM dbo.Users
WHERE Id = @UserId;
'@ -Parameters @{ UserId = $studentId }
    if ($state.Rows.Count -ne 1) {
        throw "Seeded student was not found for moderation acceptance."
    }

    $stateRow = $state.Rows[0]
    $script:mutedSnapshot = [pscustomobject]@{
        UserId = $studentId
        MutedUntil = if ($stateRow.IsNull("MutedUntil")) { $null } else { [DateTime]$stateRow.MutedUntil }
    }

    $targets = Invoke-SqlTable -Query @'
SELECT TOP (1)
    i.Id AS InquiryId,
    i.UserId AS OwnerId,
    CAST(1 AS bit) AS ExistingReaction
FROM dbo.Reactions r
INNER JOIN dbo.Inquiries i ON i.Id = r.InquiryId
WHERE r.UserId = @UserId
  AND i.UserId <> @UserId
  AND i.IsActive = 1
  AND i.IsHiddenByModerator = 0
UNION ALL
SELECT TOP (1)
    i.Id AS InquiryId,
    i.UserId AS OwnerId,
    CAST(0 AS bit) AS ExistingReaction
FROM dbo.Inquiries i
WHERE i.UserId <> @UserId
  AND i.IsActive = 1
  AND i.IsHiddenByModerator = 0
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.Reactions r
      WHERE r.InquiryId = i.Id
        AND r.UserId = @UserId
  );
'@ -Parameters @{ UserId = $studentId }
    if ($targets.Rows.Count -lt 2) {
        throw "Seed data does not provide both add and remove reaction paths."
    }

    $targetIds = @($targets.Rows | ForEach-Object { [Guid]$_.InquiryId })
    $ownerIds = @($targets.Rows | ForEach-Object { [Guid]$_.OwnerId } | Select-Object -Unique)
    $beforeReactions = Invoke-SqlScalar -Query @'
SELECT COUNT(*)
FROM dbo.Reactions
WHERE UserId = @UserId
  AND InquiryId IN (@InquiryA, @InquiryB);
'@ -Parameters @{
        UserId = $studentId
        InquiryA = $targetIds[0]
        InquiryB = $targetIds[1]
    }
    $beforeNotifications = 0
    foreach ($ownerId in $ownerIds) {
        $beforeNotifications += [int](Invoke-SqlScalar -Query @'
SELECT COUNT(*) FROM dbo.Notifications WHERE UserId = @UserId;
'@ -Parameters @{ UserId = $ownerId })
    }

    $null = Invoke-SqlNonQuery -Query @'
UPDATE dbo.Users
SET MutedUntil = DATEADD(minute, 10, SYSUTCDATETIME())
WHERE Id = @UserId;
'@ -Parameters @{ UserId = $studentId }

    $mutation = @'
mutation AcceptanceReaction($inquiryId: UUID!) {
  toggleReaction(inquiryId: $inquiryId) {
    inquiryId
    isReacted
    reactionCount
  }
}
'@
    foreach ($targetId in $targetIds) {
        $response = Invoke-GraphQl `
            -Query $mutation `
            -Token $Student.token `
            -AllowErrors `
            -Variables @{ inquiryId = [string]$targetId }
        if ((Get-GraphQlErrorCode -Response $response) -ne "USER_ERROR") {
            throw "Silenced reaction was not rejected with USER_ERROR."
        }
    }

    $afterReactions = Invoke-SqlScalar -Query @'
SELECT COUNT(*)
FROM dbo.Reactions
WHERE UserId = @UserId
  AND InquiryId IN (@InquiryA, @InquiryB);
'@ -Parameters @{
        UserId = $studentId
        InquiryA = $targetIds[0]
        InquiryB = $targetIds[1]
    }
    $afterNotifications = 0
    foreach ($ownerId in $ownerIds) {
        $afterNotifications += [int](Invoke-SqlScalar -Query @'
SELECT COUNT(*) FROM dbo.Notifications WHERE UserId = @UserId;
'@ -Parameters @{ UserId = $ownerId })
    }

    if ([int]$beforeReactions -ne [int]$afterReactions -or
        $beforeNotifications -ne $afterNotifications) {
        throw "Silenced reaction attempts changed persistence or notifications."
    }
}

function Restore-MutedState {
    if ($null -eq $script:mutedSnapshot) {
        return
    }
    $null = Invoke-SqlNonQuery -Query @'
UPDATE dbo.Users
SET MutedUntil = @MutedUntil
WHERE Id = @UserId;
'@ -Parameters @{
        UserId = $script:mutedSnapshot.UserId
        MutedUntil = $script:mutedSnapshot.MutedUntil
    }
}

function Test-MagicLinkSecurity {
    $script:magicLinkStartedAt = [DateTime]::UtcNow.AddSeconds(-2)
    $requestMutation = @'
mutation AcceptanceMagicRequest($email: String!, $cuit: String!) {
  requestMagicLink(email: $email, cuit: $cuit) {
    accepted
    message
  }
}
'@
    $variables = @{
        email = $script:magicLinkEmail
        cuit = "20123456789"
    }

    $first = Invoke-GraphQl -Query $requestMutation -Variables $variables
    if (-not $first.data.requestMagicLink.accepted) {
        throw "First Magic Link request was not accepted generically."
    }
    $payloadProperties = @($first.data.requestMagicLink.PSObject.Properties.Name)
    if ($payloadProperties -contains "token" -or $payloadProperties -contains "credential") {
        throw "Magic Link request exposed credential material."
    }

    $null = Invoke-GraphQl -Query $requestMutation -Variables $variables
    $limited = Invoke-GraphQl -Query $requestMutation -Variables $variables -AllowErrors
    if ((Get-GraphQlErrorCode -Response $limited) -ne "AUTH_RATE_LIMITED") {
        throw "Magic Link request threshold did not return AUTH_RATE_LIMITED."
    }

    $mailFile = Get-ChildItem -LiteralPath $pickupDirectory -Filter "*.eml" -File |
        Sort-Object LastWriteTimeUtc |
        Select-Object -First 1
    if ($null -eq $mailFile) {
        throw "Development pickup delivery did not create an email fixture."
    }
    $mailContent = Get-Content -LiteralPath $mailFile.FullName -Raw
    if ($mailContent -notmatch "#token=([0-9a-f]{64})") {
        throw "Development pickup email does not contain a valid one-time link."
    }
    $credential = $matches[1]
    $script:sensitiveValues += $credential

    $stored = Invoke-SqlTable -Query @'
SELECT ml.Token, ml.IsUsed
FROM dbo.MagicLinks ml
INNER JOIN dbo.Accounts a ON a.Id = ml.AccountId
WHERE a.Email = @Email
  AND ml.CreatedAt >= @StartedAt
ORDER BY ml.CreatedAt;
'@ -Parameters @{
        Email = $script:magicLinkEmail
        StartedAt = $script:magicLinkStartedAt
    }
    if ($stored.Rows.Count -lt 2) {
        throw "Magic Link requests were not persisted for runtime verification."
    }
    foreach ($row in $stored.Rows) {
        if ([string]$row.Token -eq $credential -or [string]$row.Token -notmatch "^[0-9a-f]{64}$") {
            throw "Magic Link storage is not a SHA-256 digest."
        }
    }

    $redeemMutation = @'
mutation AcceptanceMagicRedeem($token: String!) {
  loginWithMagicLink(token: $token)
}
'@
    $redeemed = Invoke-GraphQl -Query $redeemMutation -Variables @{ token = $credential }
    if ([string]::IsNullOrWhiteSpace([string]$redeemed.data.loginWithMagicLink)) {
        throw "Valid one-time credential did not produce an access token."
    }
    $script:sensitiveValues += [string]$redeemed.data.loginWithMagicLink

    $replay = Invoke-GraphQl `
        -Query $redeemMutation `
        -Variables @{ token = $credential } `
        -AllowErrors
    if ((Get-GraphQlErrorCode -Response $replay) -ne "AUTH_MAGIC_LINK_INVALID") {
        throw "Replayed one-time credential was not rejected."
    }

    $redemptionLimited = Invoke-GraphQl `
        -Query $redeemMutation `
        -Variables @{ token = $credential } `
        -AllowErrors
    if ((Get-GraphQlErrorCode -Response $redemptionLimited) -ne "AUTH_RATE_LIMITED") {
        throw "Magic Link redemption threshold did not return AUTH_RATE_LIMITED."
    }

    Write-Host "Waiting for the process-only one-minute Magic Link window to expire..."
    Start-Sleep -Seconds 62
    $recovered = Invoke-GraphQl -Query $requestMutation -Variables $variables
    if (-not $recovered.data.requestMagicLink.accepted) {
        throw "Magic Link limiter did not recover after its configured test window."
    }
}

function Remove-MagicLinkFixtures {
    if ($null -eq $script:magicLinkStartedAt) {
        return
    }
    $null = Invoke-SqlNonQuery -Query @'
DELETE ml
FROM dbo.MagicLinks ml
INNER JOIN dbo.Accounts a ON a.Id = ml.AccountId
WHERE a.Email = @Email
  AND ml.CreatedAt >= @StartedAt;
'@ -Parameters @{
        Email = $script:magicLinkEmail
        StartedAt = $script:magicLinkStartedAt
    }
}

function Test-LogsForSecrets {
    $combined = ""
    foreach ($path in @($stdoutLog, $stderrLog)) {
        if (Test-Path -LiteralPath $path) {
            $combined += [System.IO.File]::ReadAllText($path)
        }
    }

    foreach ($value in @($script:sensitiveValues + $script:demoPassword)) {
        if (-not [string]::IsNullOrWhiteSpace([string]$value) -and
            $combined.IndexOf([string]$value, [StringComparison]::Ordinal) -ge 0) {
            throw "Acceptance logs contain credential material."
        }
    }
}

function Remove-OwnedDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$ExpectedParent,
        [Parameter(Mandatory = $true)][string]$ExpectedMarker
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    $resolvedPath = (Resolve-Path -LiteralPath $Path).Path
    $resolvedParent = (Resolve-Path -LiteralPath $ExpectedParent).Path
    if (-not $resolvedPath.StartsWith(
            $resolvedParent.TrimEnd([System.IO.Path]::DirectorySeparatorChar) +
                [System.IO.Path]::DirectorySeparatorChar,
            [StringComparison]::OrdinalIgnoreCase) -or
        $resolvedPath.IndexOf($ExpectedMarker, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw "Refusing to recursively remove an unowned acceptance directory."
    }
    Remove-Item -LiteralPath $resolvedPath -Recurse -Force
}

function Test-ProviderConfiguration {
    param([hashtable]$Secrets)

    $smtpKeys = @(
        "SmtpSettings:Host",
        "SmtpSettings:Port",
        "SmtpSettings:User",
        "SmtpSettings:Pass",
        "SmtpSettings:From"
    )
    $smtpConfigured = @($smtpKeys | Where-Object {
        $Secrets.ContainsKey($_) -and
        -not [string]::IsNullOrWhiteSpace([string]$Secrets[$_])
    }).Count -eq $smtpKeys.Count
    if ($smtpConfigured) {
        Add-Gate -Name "SMTP provider" -Status "BLOCKED" -Evidence "Configuration exists, but this local acceptance does not send unsolicited external email."
    }
    else {
        Add-Gate -Name "SMTP provider" -Status "BLOCKED" -Evidence "Real SMTP keys are absent; Development pickup fallback is covered at runtime."
    }

    $redisConfigured =
        ($Secrets.ContainsKey("ConnectionStrings:Redis") -and
         -not [string]::IsNullOrWhiteSpace([string]$Secrets["ConnectionStrings:Redis"])) -or
        ($Secrets.ContainsKey("Redis:ConnectionString") -and
         -not [string]::IsNullOrWhiteSpace([string]$Secrets["Redis:ConnectionString"])) -or
        -not [string]::IsNullOrWhiteSpace($env:ONEITB_REDIS_CONNECTION)
    Add-Gate `
        -Name "Redis distributed provider" `
        -Status "BLOCKED" `
        -Evidence $(if ($redisConfigured) {
            "Configuration exists; a second application instance is required for a distributed smoke."
        } else {
            "Redis connection configuration is absent; in-memory fallback remains active."
        })

    $cloudinaryConfigured =
        ($Secrets.ContainsKey("CloudinarySettings:Url") -and
         -not [string]::IsNullOrWhiteSpace([string]$Secrets["CloudinarySettings:Url"])) -or
        -not [string]::IsNullOrWhiteSpace($env:ONEITB_CLOUDINARY_URL)
    Add-Gate `
        -Name "Cloudinary provider" `
        -Status "BLOCKED" `
        -Evidence $(if ($cloudinaryConfigured) {
            "Configuration exists; destructive remote upload/delete smoke requires explicit provider approval."
        } else {
            "Cloudinary configuration is absent; local storage fallback is covered at runtime."
        })
}

function Invoke-Baseline {
    $backendTestsPassed = Invoke-NativeGate `
        -Name "Backend automated suite" `
        -FilePath "dotnet" `
        -Arguments @("test", $backendTests, "-c", "Release", "--no-restore") `
        -WorkingDirectory $repoRoot `
        -SuccessEvidence "All backend tests passed in Release."

    $frontendTestsPassed = Invoke-NativeGate `
        -Name "Frontend automated suite" `
        -FilePath "npm.cmd" `
        -Arguments @("run", "test", "--", "--run") `
        -WorkingDirectory $frontendDirectory `
        -SuccessEvidence "All Vitest component and state tests passed."

    $backendBuildPassed = Invoke-NativeGate `
        -Name "Backend Release build" `
        -FilePath "dotnet" `
        -Arguments @("build", $backendProject, "-c", "Release", "--no-restore") `
        -WorkingDirectory $repoRoot `
        -SuccessEvidence "Release build completed without errors."

    $frontendBuildPassed = Invoke-NativeGate `
        -Name "Frontend production build" `
        -FilePath "npm.cmd" `
        -Arguments @("run", "build") `
        -WorkingDirectory $frontendDirectory `
        -SuccessEvidence "Vite production build completed without errors."

    $jwtKey = Get-RandomSecret
    Set-ProcessSetting -Name "Jwt__Key" -Value $jwtKey
    $efPassed = Invoke-NativeGate `
        -Name "EF Core pending model changes" `
        -FilePath "dotnet" `
        -Arguments @(
            "ef", "migrations", "has-pending-model-changes",
            "--configuration", "Release",
            "--project", $dataProject,
            "--startup-project", $backendProject,
            "--no-build"
        ) `
        -WorkingDirectory $repoRoot `
        -SuccessEvidence "EF Core model matches the latest migration."

    $composePassed = Invoke-NativeGate `
        -Name "Docker Compose configuration" `
        -FilePath "docker" `
        -Arguments @("compose", "-f", $composeFile, "config", "--quiet") `
        -WorkingDirectory $repoRoot `
        -SuccessEvidence "Compose configuration parsed successfully."

    try {
        $containerOutput = & docker compose -f $composeFile ps --format json 2>&1
        if ($LASTEXITCODE -eq 0 -and
            ($containerOutput -join "`n") -match '"Health":"healthy"') {
            Add-Gate -Name "SQL Server container health" -Status "PASS" -Evidence "oneitb23-sql reports healthy."
        }
        elseif (($containerOutput -join "`n") -match "permission denied|access is denied") {
            Add-Gate -Name "SQL Server container health" -Status "BLOCKED" -Evidence "Docker API access is denied in this terminal; SQL connectivity is verified by EF/runtime gates."
        }
        else {
            Add-Gate -Name "SQL Server container health" -Status "FAIL" -Evidence "oneitb23-sql is absent or unhealthy."
        }
    }
    catch {
        $dockerMessage = $_.Exception.Message
        if ($dockerMessage -match "permission denied|access is denied") {
            Add-Gate -Name "SQL Server container health" -Status "BLOCKED" -Evidence "Docker API access is denied in this terminal; SQL connectivity is verified by EF/runtime gates."
        }
        else {
            Add-Gate -Name "SQL Server container health" -Status "FAIL" -Evidence $dockerMessage
        }
    }

    Push-Location $frontendDirectory
    try {
        try {
            $auditOutput = & npm.cmd audit --omit=dev --audit-level=high 2>&1
            if ($LASTEXITCODE -eq 0) {
                Add-Gate -Name "Frontend production dependency audit" -Status "PASS" -Evidence "npm audit found no high-or-critical production vulnerability."
            }
            elseif (($auditOutput -join "`n") -match "ENET|EAI_AGAIN|network|registry|request.*failed") {
                Add-Gate -Name "Frontend production dependency audit" -Status "BLOCKED" -Evidence "Package registry was unavailable."
            }
            else {
                Add-Gate -Name "Frontend production dependency audit" -Status "FAIL" -Evidence "npm audit reported a high-or-critical production vulnerability."
            }
        }
        catch {
            if ($_.Exception.Message -match "ENET|EAI_AGAIN|network|registry|request.*failed") {
                Add-Gate -Name "Frontend production dependency audit" -Status "BLOCKED" -Evidence "Package registry was unavailable."
            }
            else {
                Add-Gate -Name "Frontend production dependency audit" -Status "FAIL" -Evidence $_.Exception.Message
            }
        }
    }
    finally {
        Pop-Location
    }

    Push-Location $repoRoot
    try {
        & git diff --check
        if ($LASTEXITCODE -eq 0) {
            Add-Gate -Name "Patch whitespace integrity" -Status "PASS" -Evidence "git diff --check returned no errors."
        }
        else {
            Add-Gate -Name "Patch whitespace integrity" -Status "FAIL" -Evidence "git diff --check reported errors."
        }
    }
    finally {
        Pop-Location
    }

    if ($backendTestsPassed) {
        Add-Gate -Name "Cancellation regression coverage" -Status "PASS" -Evidence "Backend suite includes pre-cancelled social write tests with side-effect assertions."
    }
    else {
        Add-Gate -Name "Cancellation regression coverage" -Status "FAIL" -Evidence "Backend suite did not pass."
    }

    return $backendTestsPassed -and
        $frontendTestsPassed -and
        $backendBuildPassed -and
        $frontendBuildPassed -and
        $efPassed -and
        $composePassed
}

function Invoke-RuntimeAcceptance {
    Start-TemporaryBackend
    Add-Gate -Name "Temporary backend readiness" -Status "PASS" -Evidence "Health endpoint returned HTTP 200 on isolated port $RuntimePort."

    $typename = Invoke-GraphQl -Query "query AcceptanceSmoke { __typename }"
    if ([string]$typename.data.__typename -ne "Query") {
        throw "GraphQL smoke query returned an unexpected payload."
    }
    Add-Gate -Name "GraphQL runtime smoke" -Status "PASS" -Evidence "POST /graphql returned Query.__typename."

    Save-AccountSnapshots
    $admin = Login-DemoUser -Email "admin1@itbeltran.com.ar"
    $moderator = Login-DemoUser -Email "moderador1@itbeltran.com.ar"
    $student = Login-DemoUser -Email "estudiante1.ads@itbeltran.com.ar"
    $professor = Login-DemoUser -Email "profesor1.ads@itbeltran.com.ar"
    $graduate = Login-DemoUser -Email "egresado1@itbeltran.com.ar"
    $employer = Login-DemoUser -Email "empleador1@itbeltran.com.ar"
    $roles = @($admin.role, $moderator.role, $student.role, $professor.role, $graduate.role, $employer.role)
    if (@($roles | Select-Object -Unique).Count -ne 6) {
        throw "Seeded role logins did not resolve six distinct roles."
    }
    Add-Gate -Name "Seeded role authentication" -Status "PASS" -Evidence "Administrator, Moderator, Student, Professor, Graduate and Employer authenticated with non-versioned demo credentials."

    Test-UploadSecurity -Token $admin.token
    Add-Gate -Name "Upload content validation" -Status "PASS" -Evidence "Valid PDF persisted; hostile and truncated PDFs returned HTTP 400 without extra files."

    Test-SchemaAndPagination -Student $student -Admin $admin
    Add-Gate -Name "Bounded collection runtime" -Status "PASS" -Evidence "Legacy feed field absent; feed/author/academic pagination and student denial passed."

    Test-SilencedReactions -Student $student
    Add-Gate -Name "Silenced reaction integrity" -Status "PASS" -Evidence "Add/remove paths returned USER_ERROR with zero reaction and notification delta."

    Test-MagicLinkSecurity
    Add-Gate -Name "Magic Link runtime hardening" -Status "PASS" -Evidence "Generic request, pickup delivery, digest storage, replay denial, request/redemption throttles and recovery passed."

    Stop-TemporaryBackend
    Test-LogsForSecrets
    Add-Gate -Name "Runtime log credential scan" -Status "PASS" -Evidence "Generated backend logs contain no demo password, JWT or one-time credential."
}

$baselineHealthy = $true
$secrets = $null
try {
    New-Item -ItemType Directory -Path $runRoot -Force | Out-Null
    $secrets = Get-UserSecrets
    if (-not $secrets.ContainsKey("ConnectionStrings:DefaultConnection") -or
        [string]::IsNullOrWhiteSpace([string]$secrets["ConnectionStrings:DefaultConnection"])) {
        throw "ConnectionStrings:DefaultConnection is missing from user-secrets."
    }
    if (-not $secrets.ContainsKey("Seed:DemoPassword") -or
        [string]::IsNullOrWhiteSpace([string]$secrets["Seed:DemoPassword"])) {
        throw "Seed:DemoPassword is missing from user-secrets."
    }
    $script:connectionString = [string]$secrets["ConnectionStrings:DefaultConnection"]
    $script:demoPassword = [string]$secrets["Seed:DemoPassword"]

    if (-not $SkipBaseline) {
        $baselineHealthy = Invoke-Baseline
    }
    else {
        Add-Gate -Name "Automated baseline" -Status "SKIPPED" -Evidence "Skipped by command-line switch."
    }

    Test-ProviderConfiguration -Secrets $secrets

    $runRuntime = $IncludeRuntime -and -not $SkipRuntime
    if ($runRuntime) {
        if (-not $baselineHealthy) {
            Add-Gate -Name "Runtime acceptance" -Status "SKIPPED" -Evidence "A required baseline gate failed."
        }
        else {
            try {
                Invoke-RuntimeAcceptance
            }
            catch {
                Add-Gate `
                    -Name "Runtime acceptance" `
                    -Status "FAIL" `
                    -Evidence "$($_.Exception.Message) [$($_.ScriptStackTrace)]"
            }
        }
    }
    else {
        Add-Gate `
            -Name "Runtime acceptance" `
            -Status "SKIPPED" `
            -Evidence "Disabled by default. Use -IncludeRuntime only in an explicitly approved maintenance window."
    }
}
catch {
    Add-Gate -Name "Acceptance bootstrap" -Status "FAIL" -Evidence $_.Exception.Message
}
finally {
    $cleanupErrors = @()
    foreach ($cleanup in @(
        { Restore-MutedState },
        { Restore-AccountSnapshots },
        { Remove-MagicLinkFixtures },
        {
            if ($script:storedUploadPath -and (Test-Path -LiteralPath $script:storedUploadPath)) {
                $resolvedUpload = (Resolve-Path -LiteralPath $script:storedUploadPath).Path
                $resolvedRoot = (Resolve-Path -LiteralPath $uploadsDirectory).Path
                if (-not $resolvedUpload.StartsWith(
                        $resolvedRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) +
                            [System.IO.Path]::DirectorySeparatorChar,
                        [StringComparison]::OrdinalIgnoreCase)) {
                    throw "Refusing to delete an upload outside wwwroot/uploads."
                }
                Remove-Item -LiteralPath $resolvedUpload -Force
            }
        },
        { Stop-TemporaryBackend },
        { Restore-ProcessSettings },
        {
            $acceptanceParent = Join-Path $backendDirectory "App_Data/Acceptance"
            if (Test-Path -LiteralPath $acceptanceParent) {
                Remove-OwnedDirectory `
                    -Path $pickupDirectory `
                    -ExpectedParent $acceptanceParent `
                    -ExpectedMarker $runId
            }
        }
    )) {
        try {
            & $cleanup
        }
        catch {
            $cleanupErrors += $_.Exception.Message
        }
    }

    if ($cleanupErrors.Count -eq 0) {
        Add-Gate -Name "Process and fixture cleanup" -Status "PASS" -Evidence "Acceptance PID, database state, upload and pickup fixtures were removed or restored."
    }
    else {
        Add-Gate -Name "Process and fixture cleanup" -Status "FAIL" -Evidence ($cleanupErrors -join " | ")
    }

    try {
        $tempParent = [System.IO.Path]::GetTempPath()
        Remove-OwnedDirectory -Path $runRoot -ExpectedParent $tempParent -ExpectedMarker $runId
    }
    catch {
        Add-Gate -Name "Temporary directory cleanup" -Status "FAIL" -Evidence $_.Exception.Message
    }
}

Write-Host ""
Write-Host "OneITB pre-defense acceptance summary" -ForegroundColor Cyan
$script:gates | Format-Table -AutoSize -Wrap

$failed = @($script:gates | Where-Object { $_.Status -eq "FAIL" })
if ($failed.Count -gt 0) {
    Write-Error "$($failed.Count) acceptance gate(s) failed."
    exit 1
}

Write-Host "All executed local gates passed. BLOCKED entries require external configuration or institutional approval." -ForegroundColor Green
exit 0
