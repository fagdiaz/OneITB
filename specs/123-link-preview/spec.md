# Feature Specification: Automatic Link Preview & Unified Media Component

**Feature Branch**: `123-link-preview`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Implementar un sistema de Previsualización Automática de Enlaces (Link Preview vía Open Graph) en tiempo real al redactar publicaciones, y unificar el renderizado de medios (imágenes, videos, documentos y links) mediante un nuevo componente MediaComponent que soporte tanto las publicaciones principales como los comentarios. CONTEXT & ANALYSIS: El usuario identificó que intentar extraer metadata de URLs directamente desde el frontend de React genera bloqueos por políticas CORS del navegador. La solución requiere: Backend: Un endpoint REST GET /api/metadata?url=... en .NET que actúe como proxy. Descargará el HTML de la URL objetivo, extraerá las etiquetas <meta property=\"og:title/description/image\"> usando Regex, y retornará un JSON."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Link Preview Creation (Priority: P1)

As a user creating a post, I want to see an automatic preview of any link I type so that my post is more engaging and informative.

**Why this priority**: Link previews significantly improve user engagement and visual appeal of the feed.

**Independent Test**: Can be fully tested by pasting a valid public URL (e.g., a news article) into the post creation box and observing the preview card rendering before submission.

**Acceptance Scenarios**:

1. **Given** the user is drafting a new post, **When** they paste or type a valid URL containing Open Graph tags, **Then** a preview card showing the title, description, and image appears below the text.
2. **Given** a URL without Open Graph tags, **When** the proxy endpoint fetches it, **Then** it gracefully falls back to basic HTML tags (title) or a generic placeholder.
3. **Given** an invalid or unreachable URL, **When** the proxy endpoint fails to fetch it, **Then** no preview is shown and no application-breaking errors occur.

---

### User Story 2 - Unified Media Rendering in Posts and Comments (Priority: P2)

As a user browsing the feed, I want all media (images, videos, documents, and links) to be displayed consistently whether they are in a main post or a comment.

**Why this priority**: Unifying media rendering reduces code duplication, ensures a consistent UX, and makes future media enhancements easier to maintain.

**Independent Test**: Can be fully tested by viewing an existing post with an image and a comment with a link preview, ensuring both use the same underlying `MediaComponent` and look visually cohesive.

**Acceptance Scenarios**:

1. **Given** a post with a video and an image, **When** rendered in the feed, **Then** they are displayed correctly through the unified `MediaComponent`.
2. **Given** a comment containing a document attachment, **When** rendered in the comment thread, **Then** it is displayed correctly through the unified `MediaComponent`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a backend proxy endpoint (`GET /api/metadata?url=...`) to avoid CORS restrictions when fetching external metadata.
- **FR-002**: System MUST extract `og:title`, `og:description`, and `og:image` from the target URL's HTML payload.
- **FR-003**: System MUST fall back to standard HTML `<title>` and `<meta name="description">` if Open Graph tags are missing.
- **FR-004**: System MUST parse the content of a post during drafting to detect URLs and trigger the metadata fetch automatically.
- **FR-005**: System MUST provide a reusable frontend component (`MediaComponent`) capable of rendering images, videos, document attachments, and link previews.
- **FR-006**: System MUST integrate `MediaComponent` into both the main Feed posts and the Comment threads.
- **FR-007**: System MUST NOT require new database columns for metadata. The frontend will dynamically parse URLs from the post/comment text and fetch the metadata on-the-fly via the proxy endpoint when rendering.

### Key Entities

- **LinkMetadata**: Represents the extracted Open Graph data (Title, Description, ImageUrl, OriginalUrl, Domain).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Link previews load and render in the UI in under 2 seconds for standard websites.
- **SC-002**: Zero CORS errors occur in the browser console when generating link previews.
- **SC-003**: The new `MediaComponent` successfully replaces all legacy media rendering blocks in both Post and Comment UI without visual regression.
- **SC-004**: Metadata fetching fails gracefully (without disrupting the user experience) 100% of the time when URLs are unreachable.

## Assumptions

- Target URLs are public and do not require authentication to read `<meta>` tags.
- The `.NET` backend has outbound internet access to fetch external HTML.
- The regex or HTML parsing library used in the backend can handle malformed HTML gracefully.
