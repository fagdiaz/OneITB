#!/usr/bin/env pwsh
param(
    [Parameter(Position = 0, Mandatory = $true)]
    [string]$EventName
)

$ErrorActionPreference = 'Stop'

# OneITB23 Constitution 1.5.0 requires explicit, reviewed, feature-scoped commits.
# Hooks remain installed for Spec Kit compatibility but can never mutate Git state.
Write-Warning "[specify] Auto-commit disabled by OneITB23 policy for event '$EventName'."
exit 0
