# Final Audit: Spec 165 Academic Hub Hardening

## Result

All initial findings were addressed or explicitly bounded.

| Initial finding | Final status |
|---|---|
| Academic upload UI was not a modal | Resolved. `/academic` now opens a resource upload modal and keeps the main grid focused on browsing. |
| Resource search was server-driven | Resolved. The UI performs instant local title filtering with `useMemo`; backend `searchTerm` remains available for API consumers. |
| Resource mutations used broad refetches | Resolved. Create/delete update Apollo cache explicitly through `cache.updateQuery`. |
| GraphQL alias `resourcesBySubject` missing | Resolved. `Query.GetResourcesBySubject` delegates to `IAcademicService.GetAcademicResourcesAsync`. |
| Social feed graph risked query explosion | Resolved. `SocialService.GetInquiries` and `LoadInquiryGraphAsync` now use `AsSplitQuery()` with explicit nested reply/user includes. |
| SDD artifacts incomplete for the gap-closing pass | Resolved. Spec, plan, research, data model, contracts, quickstart, tasks and evidence exist for Spec 165. |

## Additional hardening

- `useForm` now uses functional state updates to avoid stale form-state writes in fast input/change sequences.
- Apollo cache has a dedicated `resourcesBySubject` field policy, matching the existing academic resource replacement semantics.

## Remaining validation boundary

- Browser-level authenticated regression for `/academic` is still pending because this pass did not operate with a user session in the browser. The schema, tests and builds were validated; the roadmap therefore remains `[I]` for academic resources rather than `[V]`.
