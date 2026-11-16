# Spec 158: Masterization Navigation, Search, CV and Avatar

## Objective

Stabilize the final UX layer for OneITB23 by making header navigation state deterministic, improving the global academic search experience, balancing CV contact layout for screen and print, and adding an advanced avatar editor that uploads the edited image through the existing authenticated REST upload endpoint.

## Scope

- Frontend plus a backward-compatible GraphQL query extension for paginated inquiries.
- Uses existing GraphQL contracts: `me`, `subjects`, `searchPublicProfiles`, and paginated inquiries; adds optional `careerIds` to inquiry search while preserving legacy `careerId`.
- Uses existing authenticated `POST /api/upload` for avatar persistence.
- No third-party image editing libraries.

## Requirements

1. Header navigation active glow must depend only on `useLocation().pathname`.
2. Header navigation controls must not rely on `focus`, `focus-within`, or `focus:ring` classes for persistent active state.
3. Search and notification popovers must support real toggle behavior and close on outside click.
4. Global search must include subjects by code or name, expose compact dropdown filters, and submit with the label `Realizar busqueda`.
5. Global search filters must support multiple careers and multiple subjects.
6. Feed search results must clearly partition profile results and publication results.
7. Publication search must match title, content, subject, career, author identity, email, comments, and comment author identity.
8. Publication search must return 15 results per page, ordered chronologically while search is active, with incremental `Buscar mas` pagination.
9. CV print contact data must render in two semantic rows: direct contact first, social links second.
10. Avatar upload in profile edit must open a canvas-based editor before uploading.
11. The avatar editor must support zoom, rotation, horizontal/vertical flip, preset filters, brightness, contrast, saturation, and vignette.
12. The edited avatar must upload as multipart form data with the existing JWT flow and persist through `updateProfile`.

## Non-Goals

- No backend schema changes.
- No new REST endpoint.
- No npm dependency changes.
- No redesign outside the affected Header, Feed search result, CV template, and profile edit/avatar flow.
- No database migration.

## Acceptance Criteria

- `npm.cmd run build` succeeds from `FrontEnd/OneItb-FE`.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` succeeds because inquiry search contracts were extended.
- The active header glow remains after page interaction and route changes.
- Clicking the search icon toggles the popover open/closed; clicking outside closes it.
- Search results on `/feed?q=...` show `Resultados de Perfiles` above `Resultados de Publicaciones`.
- CV print/template contact rows render direct contact first and social links second, with fallback balancing only when one group is empty.
- Avatar editing produces a new uploaded file URL and sends that URL in the existing profile mutation.
