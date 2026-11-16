# Evidence: P2 Closure QA

## Status

Closed.

## Scope

- Active feature: `specs/138-p2-closure-qa`.
- Branch policy: kept current branch `137-siu-notifications` because the worktree already contains uncommitted spec 137 implementation files. Creating/switching a branch at this point would mix the closure changes with the already-open feature state.
- Test runtime: EF Core InMemory for unit tests. SQL Server Docker is not required for this suite because the target is service authorization/state behavior, not migration/runtime validation.

## Architecture Documentation

- Replaced `docs/academic/04-design-diagrams.md` with Mermaid diagrams for:
  - Current ER model including academic, notification, moderation, social, messaging and magic-link entities.
  - `syncSiuGrades(subjectId)` sequence through GraphQL, `AcademicService`, `MockSiuIntegrationService`, EF Core and `NotificationService`.
  - Notification Pub/Sub architecture from Apollo HTTP/WebSocket links through HotChocolate subscriptions and persisted notification tables.
- Mermaid block/entity scan: PASS for requested entities and flows (`ACCOUNT`, `NOTIFICATION`, `syncSiuGrades`, `NotificationService`, `Apollo GraphQLWsLink`).

## Unit Test Coverage Added

- Created `API Graphql/Tests/Services.Tests/Services.Tests.csproj` with xUnit, Moq and EF Core InMemory.
- Added shared test data helper `ServiceTestData`.
- Added `AcademicServiceTests`:
  - Rejects non-manager role before saving academic progress.
  - Rejects non-student targets.
  - Rejects students outside the subject career.
  - Creates manager-assigned progress and emits an academic-progress notification.
  - Rejects SIU sync for non-admin role before calling the adapter.
  - Creates and then updates SIU-imported progress without duplicate rows.
- Added `NotificationServiceTests`:
  - Creates default preferences for every `NotificationType`.
  - Suppresses disabled preferences and inactive users.
  - Persists and publishes to the private notification topic for active users.
  - Keeps persisted notifications when `ITopicEventSender.SendAsync` fails.
  - Enforces owner-scoped `MarkReadAsync`.
  - Marks all read only for the current user.

## Commands Executed

```powershell
dotnet sln "API Graphql/OneITB/OneITB.sln" add "API Graphql/Tests/Services.Tests/Services.Tests.csproj"
```

Result: PASS. Test project added to the solution.

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
```

Result: PASS. `12` passed, `0` failed, `0` skipped.

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
```

Result: PASS. `0` warnings, `0` errors.

```powershell
dotnet test "API Graphql/OneITB/OneITB.sln" -c Release --no-restore
```

Result: PASS. `12` passed, `0` failed, `0` skipped.

```powershell
npm.cmd run build
```

Result: PASS. Vite built `338` modules. Warnings remain known/non-blocking:
- `vite:react-babel` deprecated `esbuild` option.
- Main chunk larger than `500 kB`.

```powershell
git diff --check
```

Result: PASS. Only Windows LF-to-CRLF normalization warnings, no whitespace errors.

```powershell
rg -n "TODO|FIXME|debugger|console\.log|NotImplemented" "API Graphql/Tests/Services.Tests" "docs/academic/04-design-diagrams.md"
```

Result: PASS. No matches.

```powershell
rg -n -i "(password\s*=|pwd\s*=|sa_password|api[_-]?key|secret)" "API Graphql/Tests/Services.Tests" "docs/academic/04-design-diagrams.md"
```

Result: PASS. No matches.

## Roadmap Impact

- `Modulo 8 - Calidad, operacion y escalabilidad` now marks the backend unit-test foundation as implemented for `AcademicService` and `NotificationService`.
- Global roadmap count moves from `64/76` to `65/76`.

## Residual Risk

- This spec adds unit tests only. It does not replace the pending authentication/feed automated suites or GraphQL integration tests against SQL Server.
- Mermaid syntax was reviewed structurally in markdown; no external Mermaid renderer was executed in this environment.
- Existing spec 137 implementation remains uncommitted and should be committed with this closure work in a deliberate feature-scoped commit.
