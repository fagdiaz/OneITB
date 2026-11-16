# Initial Audit: Spec 165 Academic Hub Hardening

## Findings

1. **Academic upload UI is not a modal**: `/academic` renders an always-visible side panel when a subject is selected.
2. **Resource search is server-driven**: `resourceSearch` is sent as `searchTerm`; this does not satisfy the requested instant local search.
3. **Resource mutations refetch**: create/delete calls use `refetchResources()` instead of explicit Apollo cache updates.
4. **GraphQL alias missing**: `academicResources` exists, but the explicit `resourcesBySubject` alias requested by the prompt is absent.
5. **Social feed graph needs split-query hardening**: `SocialService.GetInquiries()` includes multiple collections without `AsSplitQuery()` and does not explicitly include nested replies/reply users.
6. **Spec artifacts incomplete for hardening scope**: Specs 163/164 did not include a full `research.md`, `data-model.md` and `quickstart.md` set for the gap-closing iteration.

## Priority

All findings are in scope for Spec 165.
