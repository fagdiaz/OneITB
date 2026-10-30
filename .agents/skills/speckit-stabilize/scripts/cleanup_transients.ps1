[CmdletBinding()]
param(
    [int]$LogRetentionHours = 48
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
Set-Location $repoRoot

$deletedItems = @()

# 1. Clean Stale Logs
if (Test-Path 'logs') {
    $cutoff = (Get-Date).AddHours(-$LogRetentionHours)
    Get-ChildItem -Path 'logs' -Filter '*.log' -File | ForEach-Object {
        if ($_.LastWriteTime -lt $cutoff) {
            $sz = $_.Length
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
            $deletedItems += [ordered]@{
                Type = 'StaleLogFile'
                Path = "logs\$($_.Name)"
                SizeBytes = $sz
            }
        }
    }
}

# 2. Clean .tmp directory contents
if (Test-Path '.tmp') {
    Get-ChildItem -Path '.tmp' -Recurse | ForEach-Object {
        $sz = if ($_.PSIsContainer) { 0 } else { $_.Length }
        Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        $deletedItems += [ordered]@{
            Type = 'TemporaryFile'
            Path = $_.FullName.Replace($repoRoot, '').TrimStart('\', '/')
            SizeBytes = $sz
        }
    }
}

# 3. Clean Frontend Vite Cache
$viteCache = 'FrontEnd/OneItb-FE/node_modules/.vite'
if (Test-Path $viteCache) {
    Remove-Item -Path $viteCache -Recurse -Force -ErrorAction SilentlyContinue
    $deletedItems += [ordered]@{
        Type = 'FrontendViteCache'
        Path = $viteCache
        SizeBytes = 0
    }
}

$summary = [ordered]@{
    Status = 'COMPLETED'
    Timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    ItemsCleanedCount = $deletedItems.Count
    DeletedItems = $deletedItems
    ProtectedIntegrity = [ordered]@{
        DevelopmentLogPreserved = Test-Path 'docs/audit/DEVELOPMENT_LOG.md'
        LocalEnvPreserved = Test-Path '.env'
        CredentialsPreserved = Test-Path 'Credenciales Oneitb.txt'
    }
}

$summary | ConvertTo-Json -Depth 5
