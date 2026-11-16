# Data Model: Spec 165 Academic Hub Hardening

## AcademicResource

Existing entity from Spec 164.

- `Id: Guid`
- `SubjectId: int`
- `UploaderId: Guid`
- `Title: string`
- `Description: string?`
- `FileUrl: string?`
- `ExternalUrl: string?`
- `ResourceType: string`
- `Category: AcademicResourceCategory`
- `Version: int`
- `CreatedAt: DateTime`
- `UpdatedAt: DateTime?`
- `IsActive: bool`

State transitions:

- Create: active resource with file URL and/or external URL.
- Delete: `IsActive = false`, `UpdatedAt = UtcNow`.

## Inquiry Graph

Existing social feed aggregate.

- `Inquiry` includes `User`, `Subject.Career`, `Reactions`, `Comments.User`, `Comments.Replies.User`.
- Query graph is read-only and must use `AsNoTracking()` plus `AsSplitQuery()`.

## Frontend State

- `isResourceModalOpen: bool`
- `resourceSearch: string` used only for local filtering.
- `resourceCategory: string` used for server-side category filtering.
- `resourceForm` retains title, description, URL, category and version.
