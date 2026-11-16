# Research: Async Query and Pagination Hardening

## Audited Baseline

- `SocialService.GetInquiries` calls `_context.Users.Any(...)` synchronously to determine global career visibility.
- The same method builds an otherwise deferred `IQueryable` with `AsNoTracking`, `AsSplitQuery`, filters and includes.
- `GetInquiriesPageAsync` already clamps `first` to 1..25 and returns `InquiryPage`, but its EF `CountAsync`/`ToListAsync` calls do not receive a `CancellationToken`.
- `Query.GetInquiriesPage` also has no `CancellationToken`.
- `Feed.jsx` uses `GET_INQUIRIES_PAGE`, so the audit statement that the main feed has no pagination is obsolete.
- `GET_INQUIRIES` remains used by `PublicationManagement`, `CommentManagement` and `UserProfile`; therefore an unbounded graph is still publicly reachable.
- `AcademicService.GetAcademicStudentsAsync` materializes every active student linked to the subject career.
- `Query.GetAcademicStudents` returns `IReadOnlyList<User>` with no paging arguments and no cancellation token.

## Decisions

### D1 - Preserve the working inquiry page contract

Do not replace proven custom pagination merely to add `[UsePaging]`. `InquiryPage` already supports `items`, `totalCount`, `hasNextPage` and `nextCursor`, and Apollo has a policy for it. The hardening target is full adoption, cancellation and removal of synchronous pre-work.

### D2 - Split async authorization state from query composition

Refactor the social service so role/global-visibility state is obtained asynchronously with cancellation before composing the deferred query. The query builder itself must perform no terminal I/O.

### D3 - Migrate all unbounded consumers

Profile and admin screens must use bounded page variables. The legacy `inquiries` field should be removed if no external compatibility requirement exists; otherwise mark it deprecated and apply a hard cap until removal.

### D4 - Use a dedicated academic page payload

`AcademicStudentPage` mirrors the existing page semantics and keeps service authorization explicit. A stable tie-breaker by user ID prevents duplicates/reordering for equal names.

### D5 - Keep DbContext operations sequential

`CountAsync` and `ToListAsync` on the same scoped context are not executed in parallel. Cancellation is passed to both. This avoids unsupported concurrent operations on one EF Core context.

## Rejected Alternatives

- Add `[UsePaging]` to `GetInquiries` without migrating clients: duplicates pagination systems and retains sync pre-I/O.
- Call `Task.Run` around `.Any()`: consumes more threads and does not make database I/O asynchronous.
- Return all rows then paginate in memory: preserves the risk.
- Fire count/list concurrently on one DbContext: EF Core does not support parallel operations on one context.
- Remove total count without checking UI contracts: breaks admin/profile pagination expectations.

## Index Review Gate

Implementation must inspect execution plans or generated SQL for:

- `Inquiry.PublishDate`, `Inquiry.SubjectId`, `Inquiry.UserId`;
- `UserCareer.UserId/CareerId`;
- `UserInteraction.ObserverId/Type/TargetId`;
- academic student ordering/filter path.

Add indexes only with measured evidence and a reviewed migration.

