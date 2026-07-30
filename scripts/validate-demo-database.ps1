[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.Net.Http

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$projectPath = Join-Path $repositoryRoot "API Graphql\OneITB\GraphQL.csproj"
$apiDirectory = Join-Path $repositoryRoot "API Graphql\OneITB"
$apiExecutable = Join-Path $apiDirectory "bin\Release\net8.0\GraphQL.exe"
$containerName = "oneitb23-sql"
$databaseName = "OneItb"
$runtimePort = 5097

function Get-UserSecretValue {
    param([Parameter(Mandatory = $true)][string]$Key)
    $prefix = "$Key = "
    $line = (& dotnet user-secrets list --project $projectPath) |
        Where-Object { $_ -like "$prefix*" } |
        Select-Object -First 1
    if (-not $line) {
        throw "Required user-secret '$Key' is missing."
    }
    return $line.Substring($prefix.Length)
}

function Get-SqlEnvironment {
    $container = docker inspect $containerName | ConvertFrom-Json
    if (-not $container -or $container[0].Name.TrimStart("/") -ne $containerName -or
        -not $container[0].State.Running -or $container[0].State.Health.Status -ne "healthy") {
        throw "Approved local SQL container is unavailable."
    }
    $passwordEntry = $container[0].Config.Env |
        Where-Object { $_ -like "MSSQL_SA_PASSWORD=*" } |
        Select-Object -First 1
    return $passwordEntry.Substring("MSSQL_SA_PASSWORD=".Length)
}

function Invoke-SqlScalar {
    param(
        [Parameter(Mandatory = $true)][string]$Password,
        [Parameter(Mandatory = $true)][string]$Query
    )
    $output = & docker exec $containerName /opt/mssql-tools18/bin/sqlcmd `
        -C -b -S localhost -U sa -P $Password -d $databaseName -W -h -1 -Q $Query
    if ($LASTEXITCODE -ne 0) {
        throw "SQL validation query failed."
    }
    return ($output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        Select-Object -First 1).Trim()
}

function Invoke-GraphQl {
    param(
        [Parameter(Mandatory = $true)][string]$Query,
        [hashtable]$Variables = @{},
        [string]$Token
    )

    $headers = @{}
    if ($Token) {
        $headers.Authorization = "Bearer $Token"
    }
    $body = @{ query = $Query; variables = $Variables } | ConvertTo-Json -Depth 12
    try {
        $response = Invoke-RestMethod `
            -Uri "http://127.0.0.1:$runtimePort/graphql" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $body `
            -TimeoutSec 15
    } catch {
        $responseBody = $null
        if ($_.Exception.Response) {
            $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
            try {
                $responseBody = $reader.ReadToEnd()
            } finally {
                $reader.Dispose()
            }
        }
        throw "GraphQL HTTP request failed: $responseBody"
    }
    if ($response.PSObject.Properties.Name -contains "errors" -and $response.errors) {
        $messages = $response.errors | ForEach-Object { $_.message }
        throw "GraphQL validation failed: $($messages -join '; ')"
    }
    return $response.data
}

function Invoke-Login {
    param(
        [Parameter(Mandatory = $true)][string]$Email,
        [Parameter(Mandatory = $true)][string]$ExpectedRole,
        [Parameter(Mandatory = $true)][string]$Password
    )
    $data = Invoke-GraphQl `
        -Query "mutation Login(`$input: LoginInput!) { login(input: `$input) { token id role isAuthenticated } }" `
        -Variables @{ input = @{ email = $Email; password = $Password } }
    if (-not $data.login.isAuthenticated -or -not $data.login.token -or
        $data.login.role -ne $ExpectedRole) {
        throw "Canonical login failed for expected role $ExpectedRole."
    }
    return [pscustomobject]@{
        Id = [string]$data.login.id
        Role = [string]$data.login.role
        Token = [string]$data.login.token
    }
}

function Invoke-UploadSmoke {
    param([Parameter(Mandatory = $true)][string]$Token)

    $pngBytes = [Convert]::FromBase64String(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=")
    $tempFile = Join-Path $env:TEMP "oneitb-upload-smoke-$([Guid]::NewGuid().ToString('N')).png"
    [IO.File]::WriteAllBytes($tempFile, $pngBytes)
    $client = New-Object System.Net.Http.HttpClient
    $client.DefaultRequestHeaders.Authorization =
        New-Object System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $Token)
    $content = New-Object System.Net.Http.MultipartFormDataContent
    $stream = [IO.File]::OpenRead($tempFile)
    $fileContent = New-Object System.Net.Http.StreamContent($stream)
    $fileContent.Headers.ContentType =
        New-Object System.Net.Http.Headers.MediaTypeHeaderValue("image/png")
    $content.Add($fileContent, "file", "demo-smoke.png")

    try {
        $response = $client.PostAsync(
            "http://127.0.0.1:$runtimePort/api/upload",
            $content).GetAwaiter().GetResult()
        if (-not $response.IsSuccessStatusCode) {
            throw "Authenticated upload returned HTTP $([int]$response.StatusCode)."
        }
        $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() |
            ConvertFrom-Json
        if (-not $payload.fileUrl -or $payload.fileUrl -notlike "/uploads/*") {
            throw "Upload response did not return a safe local URL."
        }
        return [string]$payload.fileUrl
    } finally {
        $stream.Dispose()
        $content.Dispose()
        $client.Dispose()
        Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
    }
}

$process = $null
$uploadedFilePath = $null
$previousEnvironment = $env:ASPNETCORE_ENVIRONMENT
$previousUrls = $env:ASPNETCORE_URLS

Push-Location $repositoryRoot
try {
    $sqlPassword = Get-SqlEnvironment
    $demoPassword = Get-UserSecretValue -Key "Seed:DemoPassword"
    $connection = Get-UserSecretValue -Key "ConnectionStrings:DefaultConnection"
    $serverMatch = [regex]::Match($connection, "(?i)(Server|Data Source)\s*=\s*([^;]+)")
    $databaseMatch = [regex]::Match($connection, "(?i)(Database|Initial Catalog)\s*=\s*([^;]+)")
    if ($serverMatch.Groups[2].Value.Trim() -ne "localhost,1433" -or
        $databaseMatch.Groups[2].Value.Trim() -ne $databaseName) {
        throw "Runtime validation target is not the approved local database."
    }

    $violationsQuery = @"
SET NOCOUNT ON;
SELECT
    (SELECT COUNT(*) FROM dbo.Users u LEFT JOIN dbo.Accounts a ON a.Id = u.Id WHERE a.Id IS NULL) +
    (SELECT COUNT(*) FROM dbo.UserCareers uc LEFT JOIN dbo.Users u ON u.Id = uc.UserId LEFT JOIN dbo.Careers c ON c.Id = uc.CareerId WHERE u.Id IS NULL OR c.Id IS NULL) +
    (SELECT COUNT(*) FROM dbo.Inquiries i LEFT JOIN dbo.Users u ON u.Id = i.UserId LEFT JOIN dbo.Subjects s ON s.Id = i.SubjectId WHERE u.Id IS NULL OR s.Id IS NULL) +
    (SELECT COUNT(*) FROM dbo.Comments c LEFT JOIN dbo.Inquiries i ON i.Id = c.InquiryId LEFT JOIN dbo.Users u ON u.Id = c.UserId WHERE i.Id IS NULL OR u.Id IS NULL) +
    (SELECT COUNT(*) FROM dbo.SocialAttachments WHERE (CASE WHEN InquiryId IS NULL THEN 0 ELSE 1 END + CASE WHEN CommentId IS NULL THEN 0 ELSE 1 END) <> 1) +
    (SELECT COUNT(*) FROM dbo.Comments child JOIN dbo.Comments parent ON parent.Id = child.ParentCommentId WHERE parent.ParentCommentId IS NOT NULL) +
    (SELECT COUNT(*) FROM dbo.UserInteractions WHERE ObserverId = TargetId) +
    (SELECT COUNT(*) FROM (SELECT JobOfferId, ApplicantId FROM dbo.JobApplications GROUP BY JobOfferId, ApplicantId HAVING COUNT(*) > 1) duplicates) +
    (SELECT COUNT(*) FROM (SELECT UserId, SubjectId FROM dbo.AcademicProgress GROUP BY UserId, SubjectId HAVING COUNT(*) > 1) duplicates) +
    (SELECT COUNT(*)
     FROM dbo.Accounts
     WHERE Email IN (
         'admin1@itbeltran.com.ar',
         'moderador1@itbeltran.com.ar',
         'profesor1.ads@itbeltran.com.ar',
         'estudiante1.ads@itbeltran.com.ar',
         'egresado1@itbeltran.com.ar',
         'empleador1@itbeltran.com.ar')
       AND (FailedLoginAttempts <> 0 OR LockoutEnd IS NOT NULL))
    AS Violations;
"@
    $violations = [int](Invoke-SqlScalar -Password $sqlPassword -Query $violationsQuery)
    if ($violations -ne 0) {
        throw "Relational integrity audit found $violations violation(s)."
    }

    $subjectId = [int](Invoke-SqlScalar -Password $sqlPassword -Query @"
SET NOCOUNT ON;
SELECT TOP (1) s.Id
FROM dbo.Subjects s
JOIN dbo.Careers c ON c.Id = s.CareerId
WHERE c.Code = 'ADS'
ORDER BY s.[Year], s.Name;
"@)

    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "http://127.0.0.1:$runtimePort"
    $outLog = Join-Path $env:TEMP "oneitb-demo-validation-$([Guid]::NewGuid().ToString('N')).out.log"
    $errLog = Join-Path $env:TEMP "oneitb-demo-validation-$([Guid]::NewGuid().ToString('N')).err.log"
    $process = Start-Process -FilePath $apiExecutable `
        -WorkingDirectory $apiDirectory `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog `
        -WindowStyle Hidden `
        -PassThru

    $ready = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        Start-Sleep -Milliseconds 500
        if ($process.HasExited) { break }
        try {
            $health = Invoke-WebRequest `
                -Uri "http://127.0.0.1:$runtimePort/health" `
                -UseBasicParsing `
                -TimeoutSec 2
            if ($health.StatusCode -eq 200) {
                $ready = $true
                break
            }
        } catch {
        }
    }
    if (-not $ready) {
        throw "Finite API validation host did not become healthy."
    }

    $accounts = @(
        @{ Email = "admin1@itbeltran.com.ar"; Role = "Administrador" },
        @{ Email = "moderador1@itbeltran.com.ar"; Role = "Moderador" },
        @{ Email = "profesor1.ads@itbeltran.com.ar"; Role = "Profesor" },
        @{ Email = "estudiante1.ads@itbeltran.com.ar"; Role = "Estudiante" },
        @{ Email = "egresado1@itbeltran.com.ar"; Role = "Egresado" },
        @{ Email = "empleador1@itbeltran.com.ar"; Role = "Empleador" }
    )
    $sessions = @{}
    foreach ($account in $accounts) {
        $sessions[$account.Role] = Invoke-Login `
            -Email $account.Email `
            -ExpectedRole $account.Role `
            -Password $demoPassword
    }

    $student = $sessions["Estudiante"]
    $moderator = $sessions["Moderador"]
    $admin = $sessions["Administrador"]
    $employer = $sessions["Empleador"]

    $studentMe = Invoke-GraphQl -Token $student.Token -Query "{ me { id role } }"
    $moderatorMe = Invoke-GraphQl -Token $moderator.Token -Query "{ me { id role } }"
    if ($studentMe.me.id -eq $moderatorMe.me.id -or
        $studentMe.me.role -ne "Estudiante" -or $moderatorMe.me.role -ne "Moderador") {
        throw "JWT identity isolation check failed."
    }

    $null = Invoke-GraphQl -Token $student.Token `
        -Query "query Feed(`$first: Int!) { inquiriesPage(first: `$first) { items { id } hasNextPage nextCursor totalCount } }" `
        -Variables @{ first = 1 }
    $null = Invoke-GraphQl -Token $student.Token `
        -Query "query Academic(`$subjectId: Int!) { academicResources(subjectId: `$subjectId) { id } myAcademicProgress { id } }" `
        -Variables @{ subjectId = $subjectId }
    $null = Invoke-GraphQl -Token $student.Token `
        -Query "query Messaging(`$first: Int) { messagingContacts(first: `$first) { nodes { userId } } }" `
        -Variables @{ first = 1 }
    $null = Invoke-GraphQl -Token $student.Token `
        -Query "query Notifications(`$first: Int!) { myNotifications(first: `$first) { id } unreadNotificationCount }" `
        -Variables @{ first = 1 }
    $null = Invoke-GraphQl -Token $student.Token `
        -Query "query Jobs(`$first: Int) { jobOffers(onlyActive: true, first: `$first) { nodes { id } } }" `
        -Variables @{ first = 1 }
    $null = Invoke-GraphQl -Token $admin.Token -Query "{ users { id role } communityReports { id } }"
    $null = Invoke-GraphQl -Token $moderator.Token -Query "{ communityReports { id } }"
    $null = Invoke-GraphQl -Token $employer.Token `
        -Query "query EmployerJobs(`$first: Int) { myJobOffers(first: `$first) { nodes { id } } }" `
        -Variables @{ first = 1 }

    $uploadedFileUrl = Invoke-UploadSmoke -Token $student.Token
    $uploadedFilePath = Join-Path $apiDirectory ("wwwroot" + $uploadedFileUrl.Replace("/", "\"))
    if (-not (Test-Path -LiteralPath $uploadedFilePath)) {
        throw "Uploaded smoke fixture was not persisted to local storage."
    }

    [pscustomobject]@{
        Status = "PASS"
        IntegrityViolations = $violations
        RoleLogins = $sessions.Count
        RoleSet = (($sessions.Keys | Sort-Object) -join ", ")
        IdentityIsolation = "PASS"
        Feed = "PASS"
        Academic = "PASS"
        Messaging = "PASS"
        Notifications = "PASS"
        Jobs = "PASS"
        Administration = "PASS"
        Moderation = "PASS"
        Upload = "PASS"
    } | Format-List
} finally {
    if ($uploadedFilePath -and (Test-Path -LiteralPath $uploadedFilePath)) {
        $resolvedUpload = (Resolve-Path -LiteralPath $uploadedFilePath).Path
        $uploadsRoot = (Resolve-Path (Join-Path $apiDirectory "wwwroot\uploads")).Path
        if ($resolvedUpload.StartsWith(
            $uploadsRoot + [IO.Path]::DirectorySeparatorChar,
            [StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $resolvedUpload -Force
        }
    }
    if ($process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
        $process.WaitForExit(5000) | Out-Null
    }
    $env:ASPNETCORE_ENVIRONMENT = $previousEnvironment
    $env:ASPNETCORE_URLS = $previousUrls
    Pop-Location
}
