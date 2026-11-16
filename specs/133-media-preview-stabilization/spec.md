# Feature Specification: Media Preview Stabilization

**Feature Branch**: `133-media-preview-stabilization`

**Created**: 2026-06-23

**Status**: Implemented

**Input**: Restore useful rich media previews after console cleanup: YouTube cards must show a thumbnail before playback and uploaded image attachments must render inline instead of broken alt text.

## User Scenarios & Testing

### User Story 1 - YouTube preview remains visual (Priority: P1)

A user viewing the feed can identify a YouTube video from a real visual thumbnail before choosing to load the external player.

**Why this priority**: The click-to-load behavior solved console noise but degraded the feed into generic cards.

**Independent Test**: Open a post containing a YouTube link. The card shows a thumbnail and a play affordance without loading the iframe until click.

**Acceptance Scenarios**:

1. **Given** a valid YouTube link, **When** the post renders, **Then** the user sees a video thumbnail and play action.
2. **Given** the thumbnail cannot load, **When** the post renders, **Then** the user sees the existing stable fallback card and can still play the video.
3. **Given** the user clicks play, **When** the iframe loads, **Then** playback uses the privacy-conscious embed.

### User Story 2 - Uploaded images render inline (Priority: P1)

A user viewing posts or comments with uploaded image files sees the image preview in the card instead of the literal alt text or a broken attachment.

**Why this priority**: File uploads are a presentation-critical feed feature.

**Independent Test**: Open a post with a relative `/uploads/...jpg` or `/uploads/...png` file URL. The image loads from the configured backend base URL and appears inline.

**Acceptance Scenarios**:

1. **Given** an uploaded image URL returned by the backend, **When** the feed renders, **Then** the frontend resolves it against the API origin and displays the image.
2. **Given** a document URL, **When** the feed renders, **Then** it keeps the existing file-card behavior.
3. **Given** an image fails to load, **When** the browser reports an image error, **Then** the UI falls back to a file card instead of showing only alt text.

## Requirements

- **FR-001**: YouTube previews MUST show a thumbnail before mounting the iframe.
- **FR-002**: YouTube iframes MUST remain click-to-load and use `youtube-nocookie.com`.
- **FR-003**: Uploaded image URLs MUST resolve correctly when stored as relative `/uploads/...` paths.
- **FR-004**: Media rendering MUST reuse the shared attachment resolver rather than duplicate URL logic.
- **FR-005**: Broken image previews MUST degrade to a usable file card or fallback.
- **FR-006**: The implementation MUST NOT add console filters, browser-specific suppression, or relaxed CORS.

## Success Criteria

- **SC-001**: A feed item with a YouTube link displays a visual thumbnail before playback.
- **SC-002**: A feed item with an uploaded image displays inline from the backend origin.
- **SC-003**: Initial render still avoids mounting YouTube iframes.
- **SC-004**: Frontend build completes with zero errors.

## Assumptions

- Loading a static YouTube thumbnail image is acceptable because it does not execute the provider iframe or player scripts.
- Residual third-party warnings after explicit playback remain external provider/browser behavior.
- Backend upload URLs remain either absolute URLs or relative `/uploads/...` paths.
