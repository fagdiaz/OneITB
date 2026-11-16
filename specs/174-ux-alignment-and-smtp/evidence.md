# Evidence: UX Alignment and SMTP

## Context

- Active canonical docs read: `.specify/memory/constitution.md`, `docs/project_docs/ROADMAP.md`, `docs/project_docs/scope-and-requirements.md`, `docs/project_docs/architecture-and-design.md`.
- Legacy plan-template docs `docs/project_docs/REQUERIMIENTOS.md` and `docs/project_docs/PLAN_DE_MITIGACION_EVALUACION.md` are not present; current canonical replacements were used.

## Commands

- `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & ".agents/skills/speckit-qa/scripts/preflight.ps1"`: BLOCKED by `git -c core.autocrlf=false diff --check` reporting CRLF/line-ending whitespace in the already-dirty Spec 173 diff. Checklist was complete and no missing spec files were reported.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errors.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 38/38.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS, 352 modules, built in 3.99s.
- `npm.cmd test -- --run` from `FrontEnd/OneItb-FE`: BLOCKED by `EPERM` writing `node_modules/.vite-temp/vite.config.js.timestamp-*.mjs`.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errors after documentation closeout.
- `git diff --check`: PASS; only LF/CRLF warnings were emitted.
- `git -c core.autocrlf=false diff --check -- "API Graphql/OneITB/Services/Email" "API Graphql/OneITB/Startup.cs" "API Graphql/OneITB/GraphQL/Mutation.cs" "FrontEnd/OneItb-FE/src/Components/jobs/EmployerJobOffers.jsx" "FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx" "specs/174-ux-alignment-and-smtp"`: PASS for files affected by Spec 174.
- `rg -n "SmtpSettings|SmtpEmail|IEmailSender|ConsoleEmailService|Pass" "API Graphql/OneITB" specs/174-ux-alignment-and-smtp`: PASS. Only configuration keys, placeholders and existing password-related symbols were found; no real SMTP secret is tracked.
- `rg -n "ATS|CV del postulante|CV del Postulante" FrontEnd/OneItb-FE/src/Components/jobs FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`: PASS, no visible stale terminology remains in affected components.

## Runtime Notes

- No EF migration was generated; this spec does not change persisted schema.
- SMTP runtime smoke with real provider was not executed because no real SMTP variables/secrets are present in this environment.
- Local fallback is configured by absence of complete `SmtpSettings`; backend build confirms DI registration compiles.

## QA Notes

- `updateApplicationStatus` still delegates role and ownership validation to `JobService.UpdateApplicationStatusAsync`.
- Email is attempted only after the status update and notification persistence path returns a loaded `JobApplication`.
- SMTP failures are caught and logged as warning, so the persisted status update is not rolled back by external email-provider failures.
- `/empleos/mis-ofertas` copy was aligned from visible ATS wording to "Gestor de Postulaciones" and "Perfil Academico"; Nav uses "Postulaciones".
