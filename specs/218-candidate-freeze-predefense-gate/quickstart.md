# Quickstart: Candidate Freeze and Pre-Defense Gate

## Preconditions

1. Read `docs/audit/RUNBOOK_DEV.md` and this spec's evidence contract.
2. Confirm the intended branch and active feature.
3. Do not reset the demo database.
4. Do not include secret values in copied output.
5. Do not start persistent development servers from this procedure.

## Phase A - Worktree preflight

```powershell
git branch --show-current
git status --short
git diff --check
git remote -v
```

Classify every path in the candidate manifest. A dirty worktree may proceed to preflight
automation but cannot be frozen.

## Phase B - Canonical automated gates

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

From `FrontEnd/OneItb-FE`:

```powershell
npm.cmd run test -- --run
npm.cmd run build
npm.cmd audit --omit=dev
```

Alternatively, use the finite default pre-defense script after reviewing its current
content:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-predefense.ps1
```

## Phase C - Local acceptance

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-local-infrastructure.ps1
powershell -ExecutionPolicy Bypass -File scripts/validate-demo-database.ps1
```

Both scripts must return control and clean only resources they created. If a dependency is
missing, record BLOCKED; do not alter secrets or database state to manufacture a PASS.

## Phase D - Manual matrices

Use separate browser profiles for distinct identities. Complete:

- visitor/public route;
- Administrador, Moderador, Profesor, Estudiante, Egresado, Empleador;
- allowed flow and protected denial for each role;
- two-session chat and notifications;
- logout/account replacement/reconnect;
- desktop, narrow responsive view, both themes, keyboard and console;
- primary upload/download and profile/CV paths.

Record results in `evidence/evidence.md` without tokens or passwords.

## Phase E - Freeze review

Do not create a commit or tag automatically. Once the worktree is clean and every mandatory
gate passes on the intended content, request explicit Git authorization and bind the final
evidence to the resulting full SHA.
