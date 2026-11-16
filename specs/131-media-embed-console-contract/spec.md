# Feature Specification: Media Embed Console Contract

**Feature Branch**: `131-media-embed-console-contract`

**Created**: 2026-06-23

**Status**: Implemented

**Input**: Harden rich media rendering so YouTube, link previews, images, and file cards behave cleanly without browser-specific console suppression.

## User Scenarios & Testing

### User Story 1 - Safe media rendering (Priority: P1)

A user can view posts containing YouTube links, images, and documents without application-owned console errors.

**Why this priority**: Rich media is presentation-visible and currently appears in the captured warning set.

**Independent Test**: Open a feed item containing each media type and inspect clean-browser console output.

**Acceptance Scenarios**:

1. **Given** a valid YouTube URL, **When** the post renders, **Then** the feed shows a stable local preview and does not mount a third-party iframe until the user explicitly requests playback.
2. **Given** an unsupported or blocked media URL, **When** the post renders, **Then** the UI shows a stable fallback without repeated failed requests.

### User Story 2 - Explicit external-warning boundary (Priority: P2)

A developer can identify which remaining warnings are caused by third-party embed behavior and not by application code.

**Why this priority**: Presentation quality depends on honest evidence rather than local filters.

**Independent Test**: Compare media rendering in a clean profile and a privacy-hardened profile and document differences.

**Acceptance Scenarios**:

1. **Given** a third-party iframe emits cookie or storage warnings, **When** the app integration is otherwise valid, **Then** the warning is documented as external.

### Edge Cases

- The video provider blocks embedding.
- The browser blocks third-party cookies or storage.
- The post text contains multiple video URLs.
- A link preview request fails or times out.

## Requirements

### Functional Requirements

- **FR-001**: Media rendering MUST use a stable fallback for unsupported, blocked, or failed media.
- **FR-002**: YouTube embeds MUST use a click-to-load preview before mounting the provider iframe.
- **FR-003**: Link previews MUST not create repeated failed requests or console loops.
- **FR-004**: Remaining third-party warnings MUST be documented with source evidence rather than hidden.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Feed media cards produce zero application-owned console errors in a clean browser profile.
- **SC-002**: Failed media or preview loads degrade visually within five seconds.
- **SC-003**: Third-party residual warnings have source evidence and no required application fix.

## Assumptions

- Spec 130 removed application-owned CORS/link-preview failures; the updated `errores.txt` shows remaining noise is caused by auto-mounted YouTube iframes and third-party/browser privacy scripts.
