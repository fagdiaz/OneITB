# Implementation Plan: Async Query and Pagination Hardening

## Summary

Remove synchronous EF work from social query composition, propagate cancellation, migrate all inquiry consumers to the existing bounded page contract and add bounded academic-student paging.

## Technical Context

- Backend: .NET 8, EF Core 8, HotChocolate 14.2.
- Frontend: React 18, Apollo Client 3.7.
- Primary backend paths: `SocialService`, `ISocialService`, `Query`, `AcademicService`, `IAcademicService`.
- Primary frontend paths: inquiry queries, profile/admin consumers, academic query/dashboard, Apollo policies.
- Migration: none by default; index migration only with measured evidence.
- Risk: HIGH (shared query contracts and authorization scope).

## Constitution Check

- **Performance**: PASS; bounded async I/O replaces unbounded/synchronous paths.
- **Authorization**: PASS; visibility predicates remain backend-side.
- **GraphQL compatibility**: CONDITIONAL; legacy field migration/deprecation requires schema and frontend coordination.
- **State**: PASS; Apollo policies and fetch-more behavior must be tested.
- **Evidence**: PASS; SQL, cancellation, schema and browser/runtime checks are required.

## Implementation Phases

1. Add regression tests for current social visibility/order and academic eligibility.
2. Add cancellation tests and a source guard against sync EF terminal calls.
3. Refactor social visibility lookup to async, cancellation-aware pre-computation.
4. Pass `CancellationToken` through `GetInquiriesPage` and EF terminals.
5. Inventory and migrate all `GET_INQUIRIES` frontend consumers to bounded pages.
6. Deprecate/remove the unbounded GraphQL field and update Apollo type policies.
7. Add `AcademicStudentPage`, bounded service method and GraphQL contract.
8. Update AcademicDashboard loading, paging and empty/error states.
9. Inspect generated SQL/index coverage and add no migration without evidence.
10. Run backend/frontend tests, builds, schema and authenticated runtime pagination.

## Planned Touchpoints

- `API Graphql/Services/Social/ISocialService.cs` and `SocialService.cs`: async visibility and page cancellation.
- `API Graphql/OneITB/GraphQL/Query.cs`: bounded social/academic resolver contracts.
- `API Graphql/Services/Academic/IAcademicService.cs` and `AcademicService.cs`: academic page contract/query.
- `API Graphql/Services/Academic/AcademicStudentPage.cs`: new bounded academic page DTO beside its service.
- `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`: retire bounded consumers from `GET_INQUIRIES`.
- `FrontEnd/OneItb-FE/src/data/graphql/queries/academic.js`: academic page operation.
- `PublicationManagement.jsx`, `CommentManagement.jsx`, `UserProfile.tsx` and `AcademicDashboard.jsx`: bounded UI states.
- `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`: cache policy adjustment if schema field shape changes.
- Backend social/academic tests and matching frontend component tests.

## Test Strategy

- Service tests for admin/moderator global visibility and user career intersection.
- Follow/mute/block/search ordering regression.
- Cancellation before and during count/materialization.
- Page-size clamp, cursor validation and stable tie-break tests.
- GraphQL executor tests for both page payloads and authorization.
- Apollo component tests for initial/load-more/final/error states.
- SQL command interception proving bounded `TOP/OFFSET` behavior.

## Definition of Done

No affected request performs sync EF terminal I/O; no active UI consumes an unbounded inquiry/student list; all scopes, order and cancellation contracts are verified.

## Implementation Outcome

- The unbounded inquiry resolver and Apollo policy were removed.
- `inquiriesPage` adds optional server-side `authorId`, stable ID tie-breaking and request cancellation.
- `AcademicStudentPage` bounds pages to 50 and uses `LastName`, `FirstName`, `Id`.
- Profile, publication administration, comment administration and academic selection use explicit incremental loading.
- Existing indexes were retained; no model or migration change was justified without SQL runtime measurements.
