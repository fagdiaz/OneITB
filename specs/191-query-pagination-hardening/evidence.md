# Evidence: Async Query and Pagination Hardening

## Planning Baseline (2026-07-27)

- Confirmed: `_context.Users.Any(...)` executes synchronously in `SocialService.GetInquiries`.
- Confirmed: `GetInquiriesPageAsync` exists, clamps pages to 25 and is used by the main feed.
- Confirmed: page count/materialization and GraphQL resolver currently omit request cancellation.
- Confirmed: `PublicationManagement`, `CommentManagement` and `UserProfile` still consume unbounded `GET_INQUIRIES`.
- Confirmed: `GetAcademicStudentsAsync` returns the full eligible career cohort.
- Confirmed: academic resolver/service already enforce Admin/Professor and active-user/subject scope; these checks must remain.

## Audit Correction

The original A-3 wording is partially obsolete: the primary feed is paginated. The real residual issue is the still-public unbounded inquiry field and its remaining consumers. Spec 191 is scoped to that verified condition rather than adding a redundant paging middleware.

## Implementation Evidence

### Backend query boundary

- `SocialService` resolves global moderator/admin visibility through `AnyAsync` with the request token.
- `BuildInquiriesQuery` performs no terminal I/O and preserves career, mute/block, follow, search and deep-link predicates.
- `inquiriesPage` is the sole inquiry collection field. It clamps `first` to 25, adds deterministic ID tie-breaking and supports server-side `authorId`.
- Count and page materialization execute sequentially on the scoped DbContext with cancellation.
- `AcademicStudentPage` clamps `first` to 50 and orders by last name, first name and ID after actor/subject authorization.
- `OffsetCursor` centralizes opaque cursor validation for social and academic pages.

### Frontend boundary

- `PublicationManagement`, `CommentManagement` and `UserProfile` no longer import an unbounded inquiry operation.
- `useInquiryPage` centralizes bounded fetch-more and normalized-ID deduplication.
- `AcademicDashboard` renders an explicit bounded selector with loading, empty, error and next-page states.
- Apollo cache keys include inquiry `authorId`; the removed `inquiries` policy was deleted.

### Automated tests

```text
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
PASS: 126/126
```

Coverage includes career visibility, follow priority, mute/block exclusion, search, stable page boundaries, server-side author filtering, invalid cursors, pre-cancelled requests, academic authorization/order/paging and HotChocolate SDL assertions that reject the legacy unbounded field.

```text
npm.cmd run test -- --run
PASS: 26 files / 59 tests
```

New component/unit coverage verifies bounded inquiry merging, publication-admin load-more and academic loading/empty/error/load-more states.

### Builds and model drift

```text
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
PASS: 0 warnings, 0 errors

npm.cmd run build
PASS: 376 modules; production build completed in 1.06 s

dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build
PASS: No changes have been made to the model since the last migration.
```

### Index review

Existing mappings cover inquiry user/subject/date, active/hidden/date, user-career joins and observer/type social interactions. The academic query starts from the indexed career side of `UserCareers` and uses the user primary key for the join. No new migration was created because runtime SQL/plan evidence was intentionally not collected and therefore did not justify an index change.

### Runtime boundary

No `dotnet run`, browser smoke or authenticated SQL Docker pagination flow was executed. This follows the operator directive to avoid blocking web-server processes. Runtime pagination and cancellation-log observation remain explicit gates before `[V]`.

## Status

**Implemented (`[I]`)**. Tests, real schema construction, builds and EF drift pass. Runtime/browser validation remains deferred, so this spec is not labeled `[V]`.
