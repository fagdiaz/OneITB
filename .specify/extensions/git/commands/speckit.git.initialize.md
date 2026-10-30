---
description: "Initialize a Git repository only after an explicit user request"
---

# Initialize Git Repository

This operation is never automatic in OneITB23. Run it only after an explicit user request and initialize repository metadata only; staging and committing are separate operations.

## Execution

The bundled compatibility scripts intentionally return without mutating Git. For an explicitly approved initialization, run `git init` directly from the verified repository root.

- **Bash**: `.specify/extensions/git/scripts/bash/initialize-repo.sh`
- **PowerShell**: `.specify/extensions/git/scripts/powershell/initialize-repo.ps1`

Never stage or commit as part of initialization. Inspect status and sensitive files before any separately requested commit.

## Customization

Replace the script to add project-specific Git initialization steps:
- Custom `.gitignore` templates
- Default branch naming (`git config init.defaultBranch`)
- Git LFS setup
- Git hooks installation
- Commit signing configuration
- Git Flow initialization

## Output

On success:
- `[OK] Git repository initialized`

## Graceful Degradation

If Git is not installed:
- Warn the user
- Skip repository initialization
- The project continues to function without Git (specs can still be created under `specs/`)

If `git init` fails:
- Surface the error to the user
- Stop this command rather than continuing with a partially initialized repository
