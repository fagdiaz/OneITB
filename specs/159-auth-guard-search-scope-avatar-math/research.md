# Research: Spec 159

## Decision: Backend-Enforced Publication Scope

Normal authenticated users only see inquiries whose subject career is in their own `UserCareer` links. This belongs in `SocialService.GetInquiries` so every caller, including profile summaries and search, receives the same restricted data.

**Rationale**: Frontend-only filtering would leak data through GraphQL and fail the security model. Service-level scoping covers feed, search, profile summaries and future clients.

**Alternatives considered**:
- React filtering: rejected because hidden posts would still be delivered by the API.
- Resolver-only filtering in `Query.cs`: rejected because business rules should live in services.

## Decision: Admin/Moderator Global Visibility

Admin and Moderator roles retain unrestricted publication visibility.

**Rationale**: Moderation and institutional management require cross-career visibility. The request is about normal users seeing only their enrolled scope.

**Alternatives considered**:
- Restrict everyone: rejected because it breaks moderation workflows.

## Decision: Subject `Todas` State as Empty Filter

The UI treats `Todas` as the default state. Sending no `subjectIds` means all subjects in the effective career scope. Selecting an individual subject disables `Todas`; reselecting `Todas` clears explicit subjects.

**Rationale**: This keeps GraphQL variables compact and avoids sending large "all subject ids" arrays.

**Alternatives considered**:
- Sending every subject id when `Todas` is checked: rejected because it is noisy and brittle when subject lists change.

## Decision: Shared CV Contact Rendering

The canonical contact row logic stays inside `CVPrintTemplate.tsx`, consumed by both `/profile` and `/profile/edit`.

**Rationale**: Both print flows already render `CVPrintTemplate`; fixing the template and the data mapping eliminates divergence.

## Decision: Canvas Drag-to-Pan via Pointer Events

Use pointer events on the preview canvas wrapper to update `{ x, y }` offset and redraw with `drawImage` after transform/scale.

**Rationale**: Pointer events cover mouse, pen and touch without adding a library. Canvas remains native and lightweight.

**Alternatives considered**:
- Mouse-only events: rejected because touch devices would remain broken.
- Third-party cropper: rejected by spec constraints.
