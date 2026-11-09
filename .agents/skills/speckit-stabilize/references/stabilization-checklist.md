# OneITB23 Stabilization Checklist

## 1. Dual-Stack Integrity
- [ ] Backend solution compiles in Release mode with 0 errors and 0 warnings (`dotnet build`).
- [ ] Every required xUnit case runs and passes. Record ordinary regression and SQL concurrency separately on the candidate SHA.
- [ ] Frontend React 18 production build completes with 0 errors (`npm run build`).
- [ ] Every required Vitest case runs and passes. Reconcile observed totals with the candidate manifest.
- [ ] EF Core model has no unmigrated model changes (`dotnet ef migrations has-pending-model-changes`).

## 2. Secrets & Security Hygiene
- [ ] `.env` and `FrontEnd/OneItb-FE/.env` are not tracked in git.
- [ ] `Credenciales Oneitb.txt` remains excluded from git.
- [ ] No hardcoded passwords, JWT keys or connection strings in git diff.

## 3. SpecKit DoD Compliance
- [ ] All tasks in active `tasks.md` are completed (`[x]`).
- [ ] `docs/audit/DEVELOPMENT_LOG.md` includes newest entry at the top.
- [ ] `docs/project_docs/ROADMAP.md` reflects current status.
