#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

# This compatibility script intentionally performs no automatic initialization.
# Repository initialization requires an explicit user request and must not stage or commit.
Write-Warning '[specify] Automatic Git initialization is disabled by OneITB23 policy.'
exit 0
