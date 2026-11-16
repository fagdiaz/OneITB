# Research: Jobs Module and Enterprise Seeder

## Decisions

### Role naming

Use existing Spanish role names (`Empleador`, `Administrador`) instead of introducing `Employer`.

**Rationale**: JWT claims, frontend auth state and admin tooling already use Spanish roles. A new role string would fragment authorization.

### Job offer query shape

Expose `jobOffers(onlyActive: Boolean = true)` as a paginated HotChocolate field with projection/filter/sort and service-level `Include` of employer/account.

**Rationale**: The Nav and board need bounded lists; `Employer.email` is resolved from `Account`, so eager graph loading avoids lazy-loading/N+1 assumptions.

### Seeder strategy

Keep `DbInitializer.Initialize` as startup entrypoint and delegate the actual demo graph to `EnterpriseDemoSeeder.SeedAsync`.

**Rationale**: `Program.cs` already calls `DbInitializer.Initialize`; replacing the entrypoint would be unnecessary blast radius. The new seeder can still be async internally and clear the tracker between phases.

### Idempotency keys

Use deterministic GUIDs from stable text keys for enterprise users, inquiries, comments, reactions, messages, notifications and job offers.

**Rationale**: Startup can run repeatedly without duplicate rows or destructive resets.

### Notifications

Add `NotificationType.JobOffer` and create persistent notifications for employer offers in both mutation and seeder.

**Rationale**: The project already has a notification provider; this connects the jobs feature to the real-time UX without new infrastructure.

## Risks

- Existing databases may already contain old seed data. The enterprise seeder adds/completes deterministic rows and does not delete legacy rows.
- A running schema must be refreshed after migration; frontend build only proves static GraphQL documents compile, not runtime schema execution.
