<!-- SPECKIT START -->
# OneITB23 Agent Instructions

**Operational cut-off:** 2026-08-08  
**Project state:** academic Release Candidate; functional scope 117/117, with final
technical, documentary, visual, and external-provider acceptance gates still open.

The defense planned for 2026-08-07 at 09:00 did not occur because the final
documentation, code refinement/closure, and coordinated manual audit were not completed
in time. Preserve that date as history, do not describe a commit or version as presented,
and do not invent a replacement date.

## 1. Mandatory Context And Precedence

Before planning or editing:

1. Read `.specify/feature.json` to discover the active feature directory. Never
   hardcode an active spec in this file.
2. Read the active feature's `spec.md`, `plan.md`, `tasks.md`, contracts, and evidence
   when they exist.
3. Read `.specify/memory/constitution.md`.
4. Read `docs/project_docs/ROADMAP.md`, the single source for progress, priorities,
   closure gates, and estimates.
5. Read the canonical document for the affected concern:
   - product contracts: `docs/project_docs/scope-and-requirements.md`;
   - architecture and decisions: `docs/project_docs/architecture-and-design.md`;
   - execution and recovery: `docs/audit/RUNBOOK_DEV.md`;
   - current risks and release recommendation: `docs/audit/FINAL_AUDIT_REPORT.md`;
   - document governance: `docs/audit/DOCUMENTATION_STATUS.md`.

When sources conflict, use this order:

1. executable code, EF model/migrations, and runtime schema;
2. evidence produced on the relevant commit;
3. project constitution;
4. roadmap and canonical contracts;
5. audit and operational documentation;
6. development history, academic summaries, specs, and external-AI packages.

Checked tasks or historical log entries do not prove runtime behavior. Never promote
`[I]` to `[V]` without proportional execution evidence.

## 2. Current Technical Baseline

- Backend: .NET 8, Entity Framework Core 8.0.6, HotChocolate 14.2.0, SQL Server 2022.
- Frontend: React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4.
- Business contracts use `/graphql` over HTTP or WebSocket.
- Binary transfer uses authenticated `POST /api/upload`; `/uploads/{file}` remains a
  documented authorization gap until delivery is made object-aware.
- Local database runtime is Docker SQL with SQL authentication and secrets outside Git.
- Microsoft Entra uses redirect + PKCE and `/auth/microsoft/callback`; real Microsoft
  365 tenant acceptance remains an external gate.
- Code and GraphQL identifiers are English. User-facing UI is Spanish.
- Roles persisted by the application are Spanish: `Administrador`, `Moderador`,
  `Profesor`, `Estudiante`, `Egresado`, and `Empleador`.

Use `docs/project_docs/ROADMAP.md` for the latest recorded suite counts. For
certification, apply Constitution §IX and record the results for the candidate SHA
in its manifest. Report SQL Server concurrency separately from ordinary regression.

## Single-Spec Execution Invariant & Deep Analysis Rule

1. **Máximo Una Spec a la Vez en Implementación**: Está terminantemente prohibido implementar código o alterar archivos de producción de más de una spec de manera concurrente. Aunque múltiples specs futuras pueden ser diseñadas y planificadas en paralelo (`spec.md`, `plan.md`, `tasks.md`), la ejecución de código es estrictamente secuencial y atómica: cada spec debe completar su ciclo completo (Diseño -> Código -> Tests -> speckit-stabilize -> Release) antes de activar la siguiente en `.specify/feature.json`. La rama Git debe coincidir con la especificación activa para evitar derivas.
2. **Análisis Profundo Pre-Implementación**: Antes de escribir una sola línea de código, el agente debe analizar a fondo la arquitectura, variables compartidas, contratos de EF Core, resolvers GraphQL, estado de Apollo Client y contratos de prueba. Quedan prohibidos los refactors a medias o parches superficiales: toda extracción debe ser limpia, modular, tipada y con retrocompatibilidad garantizada.

## Model Workload & Scaled Delegation Protocol

1. **Gemini 3.8 Flash High Maximization (Primary Engine)**: Prioritize Gemini 3.8 Flash High (or Gemini 3.7 Flash High) for all tasks within its reasoning scope: code reading, architecture analysis, pure domain logic, data models, schemas, comprehensive test suites (xUnit, Vitest, integration, benchmarks), documentation, SpecKit tracking, and bounded implementations with established contracts. Execute in iterative, bounded turns to prevent overload.
2. **Dedicated External Channels (Codex / ChatGPT Plus)**: Escalate to dedicated high-reasoning external channels ONLY for tasks exceeding Flash reasoning capacity:
   - **Canal 1: `[OneITB] Auditoría & Arquitectura` (Modelo: `6 Astra`)**:
     - *Razonamiento `Muy Alto`*: Auditoría de seguridad profunda de tokens/roles, análisis de vectores de ataque en resolvers GraphQL y autorización institucional.
     - *Razonamiento `Alto`*: Diseño arquitectónico mayor o arbitraje de contratos y migraciones complejas.
     - *Razonamiento `Ultra`*: Reservado estrictamente como opción terminal ante bugs circulares o vulnerabilidades que sobrevivan a `Muy Alto`.
   - **Canal 2: `[OneITB] Hardening & Testing` (Modelo: `6.1 Sol`)**:
     - *Razonamiento `Alto`*: Concurrencia en tiempo real, WebSockets, sincronización multi-pestaña de Apollo Cache y fallos de estado por desconexión.
     - *Razonamiento `Medio`*: Generación de suites de pruebas unitarias exhaustivas, mocks y casos de borde de dominio.
   - **Canal 3: `[OneITB] Implementador Core`** (6.1 Sol, Alto o Muy Alto): prepara propuestas de implementación acotadas; Local AGY integra y valida en disco.
3. **Model & Effort Prohibitions**:
   - The use of sub-optimal models (`6 Luna`, `6.1 Terra`, and all `5.6` models) is strictly PROHIBITED: they are either inferior to Gemini 3.8 Flash High or budget compromises.
   - The reasoning level `Bajo` is strictly PROHIBITED: never degrade reasoning effort to save minor token quantities.
4. **Handoff Prompt Protocol (`prompt.txt`)**: Every model at the end of its session MUST leave an updated, ready-to-run prompt in `prompt.txt` configured with the exact directives for the targeted channel.
5. **Mandatory Console Notification Block**: At the end of EVERY response, the agent MUST explicitly inform the user:
   - Canal de destino (`Local AGY`, `Canal 1 [OneITB] Auditoría & Arquitectura`, `Canal 2 [OneITB] Hardening & Testing` o `Canal 3 [OneITB] Implementador Core`).
   - Modelo a seleccionar (`Gemini 3.8 Flash High`, `6 Astra`, o `6.1 Sol`).
   - Nivel de razonamiento requerido (`Nativo`, `Medio`, `Alto`, `Muy Alto` o `Ultra` solo bajo la condición de crisis del Canal 1).

## 3. Active Priorities And Code Freeze

The project is under functional Code Freeze. Do not add scope unless the user explicitly
authorizes it. Prefer the smallest change that removes a reproducible defect and add a
regression check proportional to its risk.

Work in this order:

1. **Postponed documentary delivery:** finish diagrams, DOCX/PDF, visual/APA review,
   presentation inputs, and print-ready evidence (`DF-*` and `LG-*` in the roadmap),
   without treating the missed 2026-08-04 target as current.
2. **Release-candidate closure:** integrate the intended branch, remove repository
   residue, execute finite gates, complete six-role/manual QA and two-session realtime,
   then identify and freeze the candidate SHA (`CF-*`).
3. **Readiness for a future defense with no documented date:** presentation, 20-30 minute
   rehearsal, notebook/HDMI, pendrive, offline snapshot, and one color printed copy.
4. **External production acceptance:** SMTP, managed Redis, Cloudinary, Microsoft Entra,
   BCrypt benchmark, observability, and malware scanning (`PR-*`). These do not block a
   controlled academic defense but do block a claim of full public-production readiness.

The following gap identifiers must remain explicit; do not infer final release acceptance
from implementation alone:

- `GAP-AUTH-01`: remediated by Spec 201 with Student-only institutional public
  registration, anti-enumeration, and rate limiting; final same-SHA gate remains pending.
- `GAP-AUTH-02`: remediated by Spec 201 with tested `UserCareer`-based Professor scope as
  the freeze-safe equivalent policy; finer Professor-to-Subject modeling is future scope,
  while final same-SHA acceptance remains pending.
- `GAP-PRIV-01`: remediated by Spec 201; unilateral Follow no longer grants private
  profile access. Final same-SHA acceptance remains pending.
- `GAP-FILE-01`: open; static upload delivery lacks per-object authorization.
- `GAP-INFRA-01`: tracked production template remediated; real destination TLS/certificate
  acceptance remains open.
- `GAP-OPS-01`: open; no accepted centralized production observability platform.

## 4. Engineering Constraints

- Preserve the decoupled React/Apollo and .NET/HotChocolate architecture.
- Keep non-trivial business rules in services, not GraphQL resolver bodies.
- Require backend authorization for every protected action; frontend visibility is not
  a security boundary.
- Use explicit foreign keys and `DeleteBehavior.Restrict`; preserve social soft delete
  and the prohibition on EF shadow properties.
- Use asynchronous EF Core APIs with `CancellationToken` in request paths and
  `AsNoTracking()` for read-only queries where identity tracking is unnecessary.
- Bound external input, set regex timeouts, and validate upload authentication, total
  size, extension, magic bytes, generated names, and persisted URL prefixes.
- Keep JWTs, passwords, provider credentials, connection strings, and local helper
  secrets out of tracked files, logs, screenshots, and documentation.
- Preserve Apollo session boundaries: logout/account replacement must stop transports,
  clear subscriptions, purge cache, and hydrate only the new identity.
- Do not silence browser, compiler, GraphQL, or infrastructure errors to obtain a clean
  result. Fix owned failures; classify third-party noise honestly.

## 5. Required Validation

Select checks by blast radius and record exactly what ran.

### Backend

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

### Frontend

From `FrontEnd/OneItb-FE`:

```powershell
npm.cmd run test -- --run
npm.cmd run build
npm.cmd audit --omit=dev
```

### Contracts And Runtime

- GraphQL changes: inspect the actual schema and execute the affected operation with
  the required role, including denial cases.
- EF model changes: review the generated migration, apply it only to the intended
  environment, and check for model drift.
- User-facing changes: perform browser QA when the runtime is available, including
  loading, empty, error, keyboard, responsive, theme, and authorization states.
- Realtime/session changes: use two isolated browser profiles or clients and prove
  identity/topic isolation, logout cleanup, reconnect behavior, and unread state.
- Documentation changes: validate links, Mermaid syntax/fences, terminology, metrics,
  source precedence, and `git diff --check`.

Compilation alone is not proof that GraphQL, persistence, authorization, browser flows,
or external integrations work.

## 6. Process And Server Safety

- Prefer finite commands. Do not run `dotnet run`, `npm run dev`, or another blocking
  server unless runtime validation is explicitly required and the user has not forbidden
  it.
- When a temporary server is necessary, launch it with a bounded lifecycle, capture PID
  and logs, perform the smoke, stop only that process, and record cleanup evidence.
- Never leave a required execution session running when returning control to the user.
- Do not reset or rebuild the demo database without explicit approval and a verified
  backup/target. Use the guarded scripts documented in the runbook.
- Do not turn an unavailable provider, credential, browser, or network into a PASS.
  Record the check as blocked with its exact dependency.

## 7. Spec Definition Of Done

Every implemented spec must:

1. Complete the agreed scope with no placeholders.
2. Check every completed item in `tasks.md`; leave blocked work visibly blocked.
3. Store commands, environment, results, deviations, and cleanup in evidence.
4. Run risk-proportional tests and negative authorization/security cases.
5. Update `docs/project_docs/ROADMAP.md` only from evidence.
6. Add exactly one entry to `docs/audit/DEVELOPMENT_LOG.md` immediately below its
   introductory block; keep entries newest to oldest.
7. Update `docs/audit/DOCUMENTATION_STATUS.md` when canonical documents or status change.
8. Synchronize scope, architecture, runbook, audit, academic summaries, and final memory
   when their owned contracts change.
9. State what was not run and why. Do not use “complete”, “verified”, “production-ready”,
   or “zero debt” beyond the evidence actually obtained.
10. Leave the worktree understandable without reverting unrelated user changes.
11. Execute `speckit-stabilize` as the authoritative quality, dual-stack compilation (.NET 8 Release + Vite React 18), full test regression bound to the candidate SHA under Constitution §IX, and safe release closeout gate before final commit/push. If any gate fails, address findings before proceeding.

## 8. Git And Documentation Hygiene

- Do not create automatic commits or pushes. Perform them only when the user explicitly
  requests them, and keep each commit feature-scoped.
- Do not commit secrets, `.env` files, runtime uploads, generated logs, temporary audit
  notes, local specs/tooling, or external-AI context packages excluded by `.gitignore`.
- Before committing, inspect staged files, run `git diff --check`, and identify unrelated
  worktree changes without reverting them.
- `docs/project_docs/ROADMAP.md` is the only roadmap.
- `docs/audit/DEVELOPMENT_LOG.md` is historical, not a status source.
- `core-web/` is derived context for external AI and must be regenerated after canonical
  changes; it is not part of the institutional deliverable.
- The user manual remains integrated into the final memory; do not create a separate
  deliverable unless the institution changes its requirement.

<!-- SPECKIT END -->
