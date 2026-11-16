# Research: Demo Database Rebaseline

## Finding 1 - Credential drift is expected under current semantics

`EnterpriseDemoSeeder.SeedAccountsAsync` inserts only missing accounts. Tests explicitly
prove that an existing password hash is preserved. Therefore changing
`Seed:DemoPassword` cannot standardize an already populated database.

**Decision**: Preserve this production-safe idempotency. Standardization occurs by
recreating the disposable demo database, not by silently overwriting credentials.

## Finding 2 - Docker SQL is the only approved local database

The Runbook rejects LocalDB and Windows-authenticated SQLEXPRESS. The compose service
maps `oneitb23-sql` to `localhost:1433`.

**Decision**: Reset tooling requires exact container/database/host identity and an
explicit confirmation switch.

## Finding 3 - Current seed does not cover the full presented domain

The existing seed covers accounts, users, careers, subjects, user-career links,
inquiries, jobs, applications, comments, replies, reactions, messages, and
notifications. It does not create CV rows, academic resources/progress,
notification preferences, reports, or representative social interactions.

**Decision**: Add deterministic phases for the missing demonstrable modules without
inventing production integrations or binary upload fixtures.

## Finding 4 - Backup must cross the container boundary

SQL Server writes `.bak` files inside `/var/opt/mssql`. A host-side artifact is needed
for recovery if the container is replaced.

**Decision**: `BACKUP DATABASE ... WITH CHECKSUM`, `RESTORE VERIFYONLY`, then
`docker cp` to `backups/local-demo/`; record only filename, size, and SHA-256.

## Finding 5 - Documentation must derive from executable evidence

The architecture files list the current entities, but the Runbook lacks a guarded
rebaseline command and some academic status prose predates Specs 194-195.

**Decision**: Reconcile only after runtime inventory and keep external provider gates
unchanged.

## Finding 6 - Institutional catalog is migration-owned

The migration history creates nine institutional careers. The enterprise seed initially
declared only the two careers with complete subject content, causing InMemory tests and
fresh SQL runtime to report different catalog sizes.

**Decision**: The canonical seed declares all nine careers and assigns stable codes to
them. Six demonstration subjects remain concentrated in ADS and CDIA.
