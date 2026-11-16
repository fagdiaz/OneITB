# Operational Contract: Local Demo Rebaseline

## Invocation

```powershell
powershell -ExecutionPolicy Bypass -File scripts/reset-demo-database.ps1 `
  -ConfirmDatabaseReset
```

## Preconditions

- Current directory is the OneITB23 repository.
- Docker container name is exactly `oneitb23-sql`.
- Published SQL endpoint is exactly local port 1433.
- Target database is exactly `OneItb`.
- `ConnectionStrings:DefaultConnection`, `Jwt:Key`, and `Seed:DemoPassword` exist in
  user-secrets.
- Baseline tests/build and EF drift check pass.

## Guaranteed Behavior

- Creates and verifies a timestamped backup before dropping the database.
- Drops only `OneItb`; Docker volume and uploads remain intact.
- Applies all migrations and invokes the canonical seed.
- Runs a second seed and proves stable counts.
- Emits sanitized evidence without credentials or hashes.
- Returns non-zero and stops on any failed guard or validation.

## Recovery

The script reports the generated backup name, checksum verification result, and the
canonical recovery section in `RUNBOOK_DEV.md`. Recovery first sets `OneItb` to
single-user, restores with replace/checksum from the verified local backup, and returns
it to multi-user.

## Non-goals

- Production resets
- Provider credential validation
- Resetting arbitrary user passwords
- Replacing EF migrations with schema scripts
