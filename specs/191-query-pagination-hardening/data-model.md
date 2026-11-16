# Data Model: Async Query and Pagination Hardening

## Existing Inquiry Page

`InquiryPage` remains the canonical social page payload:

| Field | Type | Rule |
|---|---|---|
| Items | list of Inquiry | bounded by 25 |
| TotalCount | int | authorized filtered total |
| HasNextPage | bool | true only when another page exists |
| NextCursor | string | opaque; empty on final page |

## New Academic Student Page

`AcademicStudentPage` is a non-persistent GraphQL/service DTO:

| Field | Type | Rule |
|---|---|---|
| Items | list of User | bounded by configured maximum |
| TotalCount | int | eligible students after authorization/scope |
| HasNextPage | bool | derived from one extra row or count |
| NextCursor | string | opaque; empty on final page |

## Cursor Invariants

1. Clients do not parse or construct cursors.
2. Invalid cursors produce a controlled user error.
3. Page size is clamped server-side.
4. Ordering includes a unique final tie-breaker.
5. Total count and items apply the identical authorization/filter predicate.
6. Optional inquiry author filtering is applied before count, offset and limit.

## Persistent Model

No persistent model changed. Existing indexes cover inquiry author/subject/date, active moderation filters, career links and social interactions. No migration was generated because no SQL runtime measurement justified additional index churn.
