# Feature Specification: Media and Notification Polish

**Feature Branch**: `185-media-notification-polish`

**Created**: 2026-07-13

**Status**: Ready

**Input**: Resolve media layout, PDF preview, YouTube limits, dark-theme legibility, global texture visibility, notification preferences clipping and unread badge regressions.

## User Scenarios & Testing

### User Story 1 - Dense media remains understandable (Priority: P1)

A user can preview and publish mixed media without oversized players, wasted cover space or opaque PDF placeholders. A landscape cover spans the card width, secondary media remains bounded below it and hidden items remain reachable.

**Independent Test**: Render landscape and portrait covers with PDF, images and two YouTube links at mobile and desktop widths, then open each viewer.

**Acceptance Scenarios**:

1. **Given** a PDF attachment, **When** its tile becomes visible, **Then** the upper portion of page one appears above the original file name and the view/download actions remain available.
2. **Given** a landscape image selected as cover, **When** dimensions are known, **Then** it spans the full grid width without artificial side padding and secondary media moves below it.
3. **Given** a portrait or unknown cover, **When** the grid renders, **Then** the bounded half-width layout remains stable.
4. **Given** YouTube media in a tile or viewer, **When** it renders, **Then** it cannot exceed its container or viewport.
5. **Given** more media than visible slots, **When** the overflow tile appears, **Then** its `+X` count is accurate and opens the complete gallery.

---

### User Story 2 - Publication limits are clear and enforceable (Priority: P1)

An author can include up to two valid YouTube links in one publication, sees a friendly limit notice at two and cannot submit a third link through either the interface or a direct API request.

**Independent Test**: Paste zero, one, two and three valid YouTube URLs, including supported URL forms, and attempt both creation and editing.

**Acceptance Scenarios**:

1. **Given** two valid links, **When** composing, **Then** both videos are represented and a non-blocking limit notice appears.
2. **Given** three valid links, **When** submitting, **Then** publication is blocked with a friendly message.
3. **Given** a direct request containing three valid links, **When** the server validates creation or editing, **Then** it rejects the operation without persisting changes.
4. **Given** duplicate or malformed text, **When** links are parsed, **Then** only syntactically valid YouTube URLs count toward the limit and rendering stays deterministic.

---

### User Story 3 - Theme remains legible and deliberate (Priority: P2)

Logos, author names and the institutional texture remain visible in dark mode, while switching themes uses a slower but bounded transition that respects reduced-motion preferences.

**Independent Test**: Compare Home, private Footer and feed cards in both themes, toggle twice and inspect reduced-motion behavior.

**Acceptance Scenarios**:

1. **Given** dark mode, **When** a transparent OneITB logo renders, **Then** a subtle light edge preserves legibility without changing the source asset.
2. **Given** a feed author name in dark mode, **When** the card renders, **Then** it uses a role-distinct, readable tone; directed comment mentions remain unchanged.
3. **Given** a theme toggle, **When** motion is allowed, **Then** color/background/filter transitions last approximately 800 ms and do not animate layout transforms.
4. **Given** reduced-motion preference, **When** theme changes, **Then** the extended transition is disabled.
5. **Given** the global texture, **When** public or private layout renders, **Then** it is perceptible but pointer-inert and does not obstruct content or print output.

---

### User Story 4 - Notification controls and counts are reliable (Priority: P1)

The preferences panel is fully interactive above the Header and the badge represents unread notification records, not the historical aggregate count inside grouped notifications.

**Independent Test**: Open preferences from a transformed/sticky Header, toggle an option, close by button/backdrop/Escape, then execute a grouped notification read/new-event cycle.

**Acceptance Scenarios**:

1. **Given** notification preferences opened from the Header, **When** the panel renders, **Then** it is mounted outside the transformed Header, is not clipped and all controls are clickable.
2. **Given** a grouped notification with historical count two but only one unread record, **When** the badge renders, **Then** it displays one.
3. **Given** a grouped notification marked read, **When** a new event reopens it, **Then** the unread count is exactly one while the notification message may retain its historical aggregate.
4. **Given** a read mutation, **When** it succeeds, **Then** the badge updates immediately and is reconciled with the authoritative server count.

### Edge Cases

- PDF worker import, first-page rendering or CORS fails: a bounded PDF fallback remains usable and no unhandled rejection escapes.
- Image dimensions are unavailable or load fails: the grid keeps the bounded default layout.
- A landscape cover changes after editing: layout metadata resets by media identity.
- A YouTube URL has trailing punctuation, is duplicated, uses shorts/embed/youtu.be or is malformed.
- The preferences portal runs in tests or server rendering without `document.body`: it fails closed without crashing.
- A subscription arrives while mark-read is in flight: final unread count is reconciled from the server.

## Requirements

### Functional Requirements

- **FR-001**: PDF tiles MUST show a bounded crop of the first page above the original file name and retain view/download actions.
- **FR-002**: YouTube tiles and viewers MUST remain inside explicit aspect-ratio and viewport bounds.
- **FR-003**: The media grid MUST detect primary image orientation from loaded dimensions without persisting redundant metadata.
- **FR-004**: A landscape image cover MUST span the full grid width with natural proportional height and no artificial filler.
- **FR-005**: Secondary media MUST occupy a bounded row/grid below a landscape cover; portrait/unknown covers MUST preserve the existing bounded layout.
- **FR-006**: Overflow count and gallery contents MUST remain accurate after dynamic layout selection.
- **FR-007**: Publications MUST support at most two syntactically valid YouTube URLs in create and edit flows.
- **FR-008**: The two-link limit MUST be enforced by both client feedback and backend validation using bounded parsing.
- **FR-009**: Both accepted YouTube links MUST be renderable; link preview fetching MUST not compete with accepted video URLs.
- **FR-010**: Transparent brand logos MUST gain a subtle dark-theme-only legibility treatment without source-image duplication.
- **FR-011**: Feed author role colors MUST include readable dark variants; comment mention styling MUST remain unchanged.
- **FR-012**: Theme transitions MUST last about 800 ms only during theme changes, cover visual color properties rather than layout transforms and honor reduced motion.
- **FR-013**: The global texture MUST be visible across public/private layouts, remain pointer-inert and be excluded from printing.
- **FR-014**: Notification preferences MUST render through a body-level portal with stable z-index, outside-click, Escape, focus restoration and pending-save protection.
- **FR-015**: The unread badge MUST derive exclusively from notification records where `IsRead` is false, never from `AggregateCount`.
- **FR-016**: Mark-read and subscription flows MUST update/reconcile Apollo state without cumulative local arithmetic based on historical aggregate counts.
- **FR-017**: Backend regression coverage MUST prove a read grouped notification reopened by one new event yields unread count one.
- **FR-018**: Added listeners, timers, observers, rendering tasks and object resources MUST clean up deterministically.
- **FR-019**: Existing anti-framing headers, upload rules, grouping history and notification preferences MUST remain intact.
- **FR-020**: No new runtime dependency or database migration MUST be introduced.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Mixed media remains within its card at 320 px through desktop widths with zero vertical iframe overflow.
- **SC-002**: A landscape cover uses the full available card width and all secondary media remains reachable.
- **SC-003**: Create/edit attempts with three valid YouTube URLs fail before persistence; zero to two succeed subject to existing validation.
- **SC-004**: Notification badge equals the number of unread records in all tested grouped-notification transitions.
- **SC-005**: Preferences can be toggled and dismissed through button, backdrop and keyboard without clipping.
- **SC-006**: Theme transition and texture introduce no pointer blocking, print contamination or reduced-motion violation.
- **SC-007**: Frontend/backend tests, builds, EF drift check and affected runtime schema/operations pass or are explicitly blocked.

## Assumptions

- The stored publication text remains the source of YouTube URLs; no schema expansion is required.
- Historical grouped `AggregateCount` remains valid message context and is intentionally independent from unread badge count.
- `pdfjs-dist` and its local worker remain the approved PDF preview implementation.
- Existing media attachment ordering continues to identify the selected attachment cover.
