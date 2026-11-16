# Feature Specification: Spec 164 Academic Hub Resources

**Feature Branch**: `164-academic-hub-resources`  
**Created**: 2026-07-05  
**Status**: Draft  
**Input**: Implement the pending Academic Resources Hub roadmap item: search, categories and versioning for resources organized by subject.

## User Scenarios & Testing

### Scenario 1 - Student Finds Subject Resources

A logged-in user selects one of their careers, selects a subject, filters resources by title and category, and opens a file or link they are authorized to access.

**Acceptance Criteria**

1. Only subjects from the user's enrolled careers are selectable unless the user is an administrator.
2. Resources can be filtered by search term and category without mixing cached results from other subjects.
3. Each resource shows title, description, category, version, uploader, date and available file/link actions.

### Scenario 2 - Authorized User Publishes Resource

A professor, administrator or enrolled user uploads a file or adds a link, assigns a category and version, and the resource appears in the selected subject hub.

**Acceptance Criteria**

1. Binary upload continues to use authenticated `POST /api/upload`.
2. GraphQL persists the resource metadata with explicit `SubjectId`, `UploaderId`, `Category` and `Version`.
3. Upload requires at least one content pointer: file URL or external URL.
4. The viewer scope remains restricted to users that can access the subject's career.

### Scenario 3 - Resource Is Soft-Removed

An authorized manager or resource owner removes an obsolete resource from the hub without physically deleting the record.

**Acceptance Criteria**

1. `deleteResource(resourceId)` marks the resource inactive.
2. Existing `toggleAcademicResourceStatus` remains available for manager workflows.
3. EF Core keeps restrictive relationships to `Subject` and `User`.

## Requirements

- **REQ-001**: `AcademicResource` must expose `Category` (`Libro`, `Apunte`, `Examen`, `Otro`) and `Version`.
- **REQ-002**: EF Core must map category/version explicitly and add indexes that support subject/category/date filtering.
- **REQ-003**: `academicResources(subjectId, searchTerm, category)` must validate subject access and filter server-side.
- **REQ-004**: `uploadAcademicResource(...)` must create resource metadata after optional REST upload has returned a URL.
- **REQ-005**: `deleteResource(resourceId)` must soft-delete without physical row removal.
- **REQ-006**: The React `/academic` view must provide sidebar subject selection, central resource grid, local title search, category filter and upload modal/form.
- **REQ-007**: New GraphQL fields must remain backward-compatible with the existing `addAcademicResource` mutation.

## Constraints

- Preserve the authenticated REST upload exception; do not introduce GraphQL Upload.
- Keep `DeleteBehavior.Restrict` on `AcademicResource` relationships.
- Do not install component libraries.
- Use Tailwind v4 classes and preserve Clean Tech / Tech Noir styling.
- Do not commit or push.

## Assumptions

- Existing `AcademicResource` base table is valid and will be migrated in-place.
- Existing `ResourceType` is retained for backward compatibility and file/link UI behavior.
- Resource creation may be performed by administrators, professors, or active users enrolled in the selected subject career; deletion is limited to administrators, professors and the uploader.
