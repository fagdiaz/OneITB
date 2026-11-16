# Evidence: Demo Database Rebaseline

**Date**: 2026-07-29

## Baseline

- Branch created: `codex/196-demo-database-rebaseline`.
- Existing user/hotfix changes and untracked `prompt_modulo1.txt` were preserved.
- Docker target confirmed as healthy `oneitb23-sql`, SQL Server 2022, published only
  for this workflow on local port 1433.
- Required connection, JWT, and demo-password configuration was present in
  user-secrets; values were not printed or copied.
- Baseline before seeder extension: backend 152/152 tests, frontend 80/80 tests,
  Release/Vite builds PASS, EF without pending model changes.

## Backup

- Command: `scripts/reset-demo-database.ps1 -ConfirmDatabaseReset`.
- Verified artifact:
  `backups/local-demo/OneItb-before-rebaseline-20260729-234830.bak`.
- Size: 888832 bytes.
- SHA-256:
  `E9E9B6F24C28A1A064C7C977786F3AA63A9093D31C9DBDCF201A3F42AB2CAF8F`.
- SQL result: `RESTORE VERIFYONLY ... WITH CHECKSUM` PASS before destructive work.
- `git check-ignore` maps the artifact to the `backups/` rule.

## Rebuild and idempotency

- Only database `OneItb` was dropped. The Docker volume and `wwwroot/uploads` were
  preserved.
- 32 reviewed EF Core migrations were applied from an empty database.
- The compiled Development host executed the canonical seed twice on temporary port
  5096 and terminated after each health check.
- Both runs produced the same inventory:

```text
Accounts=15;Users=15;Careers=9;Subjects=6;Prerequisites=4;
UserCareers=10;Resources=12;Progress=18;Inquiries=60;Comments=80;
Reactions=240;Reports=2;Interactions=10;Messages=280;Preferences=120;
Notifications=127;Offers=4;Applications=6;CvRows=60
```

- Existing-account password preservation remains covered separately; standardization
  was achieved by reconstructing the disposable demo database, not by overwriting
  hashes during ordinary startup.

## Integrity

- SQL audit result: `IntegrityViolations = 0`.
- Covered missing Account/User, UserCareer, Inquiry, Comment, and related FK rows;
  attachment owner XOR; reply depth; self-interactions; duplicate application and
  academic-progress pairs; and lockout state of canonical identities.
- EF result: 32 migrations listed/applied and
  `has-pending-model-changes` reported no model drift.

## Runtime role acceptance

- Finite runner: `scripts/validate-demo-database.ps1`.
- Six of six identities authenticated with the expected role:
  `Administrador`, `Moderador`, `Profesor`, `Estudiante`, `Egresado`, `Empleador`.
- JWT isolation compared Student and Moderator identities and returned distinct IDs and
  correct role claims.
- PASS: feed pagination, academic resources/progress, messaging contacts,
  notifications/unread count, job offers, employer offers, admin users/reports,
  moderator reports, authenticated PNG upload and fixture cleanup.
- Frontend session-boundary tests cover store/cache/WebSocket termination; no real
  credential or token was written to this evidence.
- Ports 5096, 5097, 44397, and 5173 had no listener after acceptance. The healthy SQL
  container intentionally remains available.

## Quality gates

- Backend tests: 153/153 PASS.
- Backend Release build: 0 warnings, 0 errors.
- Frontend tests: 31 files, 80/80 PASS.
- Vite build: 380 modules, 0 errors, 1.25 seconds.
- EF Core: no pending model changes.
- `git diff --check`: PASS; only platform line-ending notices were emitted.
- Tracked-document scan found no historical demo password after redaction. Remaining
  password strings are synthetic test fixtures, placeholders, or environment-variable
  interpolation, not operational secrets.
- Backups, build outputs, runtime keys, uploads, `.env`, specs, and local agent tooling
  remain ignored. Unrelated `prompt_modulo1.txt` remains untouched and untracked.

## Documentation reconciliation

- Updated canonical Runbook with six role identities, reset, validation, inventory, and
  restore procedures.
- Updated architecture, scope, academic diagrams, Roadmap, final audit, documentation
  status, final technical report, and layout/defense guide.
- Roadmap remains 115/116 (99%): Spec 196 is operational stabilization, not feature
  expansion. Google SSO remains the sole functional external blocker.
- Cross-artifact analysis covered 14 functional requirements and 28 tasks with no
  critical/high inconsistency, constitutional conflict, or unmapped requirement.
- `DEVELOPMENT_LOG.md` contains one Spec 196 entry at the top and remains in reverse
  chronological order.
