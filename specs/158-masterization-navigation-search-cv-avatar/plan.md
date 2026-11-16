# Plan: Spec 158

## Technical Approach

### Header and Popovers

- Remove focus-driven glow classes from real navigation controls.
- Keep route activity centralized in `Nav.jsx` through `useLocation().pathname`.
- Keep outside-click behavior through `mousedown` listeners already present in `GlobalSearch` and `NotificationBell`; correct search icon behavior to toggle.

### Omni-Search

- Reuse `GET_USER_PROFILE` to infer the user's base careers.
- Reuse `GET_SUBJECTS` and filter the loaded subjects client-side by code/name for immediate subject discovery inside the popover.
- Convert career and subject filters from chip clusters to compact multi-select dropdowns.
- Reuse `SEARCH_PUBLIC_PROFILES` in both header popover and `/feed` result page.
- Treat paginated inquiries as the publication result block.
- Extend paginated inquiry search with optional `careerIds` while preserving `careerId`.
- Search inquiries by title/content, subject/career, author name/email, comment content, and comment author.
- Use 15-item pages for search and chronological ordering while a search term is active.

### CV Contact Layout

- Render direct contact (`phone`, `email`) in the first row and social links in the second row.
- Keep deterministic weight balancing only as fallback when one category is empty.

### Avatar Editor

- Add `AvatarEditorModal.jsx` near profile components.
- Use `FileReader` to preview local image data.
- Draw the edited image into a square canvas with native transformations and `CanvasRenderingContext2D.filter`.
- Export the result as a JPEG `File`, then call the existing `uploadAttachment(file, token)` flow from `CvEditorProfile.tsx`.

## Validation

- Backend build: `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`.
- Frontend build: `npm.cmd run build`.
- Runtime/browser checks are recommended after build, especially avatar upload and search against a running backend.

## Risks

- Canvas filter support depends on modern browsers; the feature targets the same browser baseline as the current React app.
- Visual crop is square and avatar rendering remains rounded by existing UI classes.
